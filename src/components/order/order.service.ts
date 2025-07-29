import db from "../../drizzle/db";
import { Orders, OrderInsert, OrderItems, OrderItemInsert, TicketTypes, Tickets, TicketInsert} from "../../drizzle/schema";
import {eq, inArray, sql} from "drizzle-orm";
import { v4 as uuidv4 } from 'uuid'; // For generating unique ticket codes

export class OrderService {

    async getAllOrders() {
        try {
            return await db.select().from(Orders);
        } catch (error) {
            console.error("Error fetching all orders:", error);
            throw new Error("Failed to fetch all orders");
        }
    }

    async getOrderById(id: number) {
        if (isNaN(id)) throw new Error("Invalid order ID provided.");

        try {
            // Fetch the order
            const [order] = await db.select().from(Orders).where(eq(Orders.id, id));

            if (!order) return null;

            // Fetch associated order items
            const items = await db.select().from(OrderItems).where(eq(OrderItems.orderId, id));

            // Fetch associated tickets for this order
            const tickets = await db.select().from(Tickets).where(eq(Tickets.orderItemId, sql`ANY(SELECT id FROM ${OrderItems} WHERE ${OrderItems.orderId} = ${id})`));


            return { order, items, tickets };
        } catch (error) {
            console.error(`Error fetching order with ID ${id}:`, error);
            throw new Error("Failed to fetch order details");
        }
    }

    async createOrder(userId: number, orderItemsData: Omit<OrderItemInsert, 'orderId' | 'unitPrice' | 'subtotal'>[]) {
        if (!userId || !orderItemsData || !Array.isArray(orderItemsData) || orderItemsData.length === 0) {
            throw new Error("User ID and order items are required to create an order.");
        }

        let totalOrderAmount: number = 0;
        const ticketsToGenerate: Omit<TicketInsert, 'orderItemId'>[] = [];
        const processedOrderItems: Omit<OrderItemInsert, 'orderId'>[] = [];
        const ticketTypeUpdates: { id: number; quantityRequested: number }[] = [];

        try {
            // 1. Validate ticket types, calculate subtotals, and prepare data
            for (const item of orderItemsData) {
                if (!item.ticketTypeId || !item.quantity || item.quantity <= 0) {
                    throw new Error("Each order item must have a valid ticketTypeId and a positive quantity.");
                }

                // Fetch ticket type details to get price and current availability
                const [ticketType] = await db.select().from(TicketTypes).where(eq(TicketTypes.id, item.ticketTypeId));

                if (!ticketType) {
                    throw new Error(`Ticket type with ID ${item.ticketTypeId} not found.`);
                }

                // Check if enough tickets are available
                if (ticketType.quantityAvailable === null || ticketType.quantityAvailable < item.quantity) {
                    throw new Error(`Not enough tickets available for type '${ticketType.typeName}'. Available: ${ticketType.quantityAvailable || 0}, Requested: ${item.quantity}`);
                }

                const unitPrice = ticketType.price || 0;
                const subtotal = item.quantity * unitPrice;
                totalOrderAmount += subtotal;

                // Store processed item data for later insertion into OrderItems
                processedOrderItems.push({
                    ticketTypeId: item.ticketTypeId,
                    quantity: item.quantity,
                    unitPrice: unitPrice,
                    subtotal: subtotal,
                });

                // Store ticket type updates for later execution
                ticketTypeUpdates.push({
                    id: item.ticketTypeId,
                    quantityRequested: item.quantity
                });

                // Prepare tickets to be generated after order items are inserted
                for (let i = 0; i < item.quantity; i++) {
                    ticketsToGenerate.push({
                        userId: userId,
                        eventId: ticketType.eventId!, // EventId is crucial for a ticket
                        ticketTypeId: ticketType.id,
                        uniqueCode: this.generateUniqueTicketCode(), // Generate a unique code for each ticket
                        isScanned: false,
                        // orderItemId will be set after OrderItems are inserted
                    });
                }
            }

            // 2. Update ticket type quantities first (most critical operation)
            for (const update of ticketTypeUpdates) {
                await db.update(TicketTypes)
                    .set({
                        quantityAvailable: sql`${TicketTypes.quantityAvailable} - ${update.quantityRequested}`,
                        quantitySold: sql`${TicketTypes.quantitySold} + ${update.quantityRequested}`,
                        // updatedAt: new Date(), // Assuming TicketTypes has an updatedAt field
                    })
                    .where(eq(TicketTypes.id, update.id));
            }

            // 3. Create the main order entry
            const [newOrder] = await db.insert(Orders).values({
                userId: userId,
                totalAmount: totalOrderAmount,
                status: 'pending_payment', // Initial status is pending payment
                paymentMethod: 'mpesa', // Default, can be updated during payment
                createdAt: new Date(),
                updatedAt: new Date(),
            }).returning();

            if (!newOrder) {
                // Rollback ticket quantities if order creation fails
                await this.rollbackTicketQuantities(ticketTypeUpdates);
                throw new Error("Failed to create the main order entry.");
            }

            // 4. Insert order items, linking them to the newly created order
            const itemsToInsert = processedOrderItems.map(item => ({
                ...item,
                orderId: newOrder.id,
            }));

            let insertedOrderItems;
            try {
                insertedOrderItems = await db.insert(OrderItems).values(itemsToInsert).returning();
            } catch (error) {
                // Rollback: Delete the order and restore ticket quantities
                await this.rollbackOrder(newOrder.id, ticketTypeUpdates);
                throw new Error("Failed to create order items.");
            }

            // 5. Insert generated tickets, linking them to their specific order items
            try {
                for (const ticket of ticketsToGenerate) {
                    // Find the corresponding order item to link the ticket
                    const correspondingOrderItem = insertedOrderItems.find(oi =>
                        oi.ticketTypeId === ticket.ticketTypeId &&
                        oi.orderId === newOrder.id
                    );

                    if (correspondingOrderItem) {
                        await db.insert(Tickets).values({
                            ...ticket,
                            orderItemId: correspondingOrderItem.id,
                            createdAt: new Date(),
                        });
                    } else {
                        // This scenario indicates a logic error if it occurs
                        console.warn(`Could not find corresponding order item for ticket type ${ticket.ticketTypeId} during ticket generation.`);
                        throw new Error("Internal error: Failed to link tickets to order items.");
                    }
                }
            } catch (error) {
                // Rollback: Delete the order, order items, and restore ticket quantities
                await this.rollbackOrder(newOrder.id, ticketTypeUpdates);
                throw new Error("Failed to create tickets.");
            }

            // Return the complete order details
            return await this.getOrderById(newOrder.id);

        } catch (error) {
            // If we haven't started making changes yet, just re-throw
            if (ticketTypeUpdates.length === 0) {
                throw error;
            }

            // If error occurred during validation phase, re-throw without rollback
            throw error;
        }
    }

// Helper method to rollback ticket quantities
    private async rollbackTicketQuantities(ticketTypeUpdates: { id: number; quantityRequested: number }[]) {
        try {
            for (const update of ticketTypeUpdates) {
                await db.update(TicketTypes)
                    .set({
                        quantityAvailable: sql`${TicketTypes.quantityAvailable} + ${update.quantityRequested}`,
                        quantitySold: sql`${TicketTypes.quantitySold} - ${update.quantityRequested}`,
                    })
                    .where(eq(TicketTypes.id, update.id));
            }
        } catch (rollbackError) {
            console.error('Failed to rollback ticket quantities:', rollbackError);
            // You might want to log this to a monitoring system or queue for manual review
        }
    }

// Helper method to rollback the entire order
    private async rollbackOrder(orderId: number, ticketTypeUpdates: { id: number; quantityRequested: number }[]) {
        try {
            // Delete tickets first (due to foreign key constraints)
            await db.delete(Tickets).where(
                inArray(Tickets.orderItemId,
                    db.select({ id: OrderItems.id }).from(OrderItems).where(eq(OrderItems.orderId, orderId))
                )
            );

            // Delete order items
            await db.delete(OrderItems).where(eq(OrderItems.orderId, orderId));

            // Delete the order
            await db.delete(Orders).where(eq(Orders.id, orderId));

            // Restore ticket quantities
            await this.rollbackTicketQuantities(ticketTypeUpdates);

        } catch (rollbackError) {
            console.error('Failed to rollback order:', rollbackError);
            // You might want to log this to a monitoring system or queue for manual review
            // Consider marking the order as "failed" instead of deleting it for audit purposes
        }
    }

    async updateOrder(id: number, updateData: Partial<OrderInsert>) {
        if (!updateData || Object.keys(updateData).length === 0) {
            console.warn(`No fields provided for update on order ID ${id}`);
            throw new Error("No fields provided for update.");
        }
        if (isNaN(id)) throw new Error("Invalid order ID provided for update.");

        try {
            const [result] = await db.update(Orders)
                .set({ ...updateData, updatedAt: new Date() }) // Ensure updatedAt is updated
                .where(eq(Orders.id, id))
                .returning();

            return result || null; // Return the updated order or null if not found
        } catch (error: any) {
            console.error(`Error updating order with ID ${id}:`, error);
            throw new Error("Failed to update order.");
        }
    }

    async deleteOrder(id: number) {
        if (isNaN(id)) throw new Error("Invalid order ID provided for deletion.");

        try {
            const [orderToDelete] = await db.select().from(Orders).where(eq(Orders.id, id));
            if (!orderToDelete) return null; // Order not found

            // Use a transaction for atomic deletion
            await db.transaction(async (tx) => {
                // First, delete related tickets (if any, though orderItemId is nullable, it's good practice)
                // This query needs to be more robust if tickets are directly linked to orders, not just order items
                // For now, assuming tickets are linked via orderItemId which is deleted with order items.
                // If tickets need to be explicitly deleted, add logic here.

                // Delete order items associated with the order
                await tx.delete(OrderItems).where(eq(OrderItems.orderId, id));

                // Then, delete the order itself
                await tx.delete(Orders).where(eq(Orders.id, id));
            });

            return orderToDelete; // Return the order that was deleted
        } catch (error: any) {
            console.error(`Error deleting order with ID ${id}:`, error);
            throw new Error("Failed to delete order.");
        }
    }

    private generateUniqueTicketCode(): string {
        return uuidv4(); // Using uuid library for robust unique ID generation
    }
}

export const orderService = new OrderService();
