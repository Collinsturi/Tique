import db from "../../drizzle/db";
import { Orders, OrderInsert, OrderItems, OrderItemInsert } from "../../drizzle/schema";
import { eq, sql } from "drizzle-orm";

export class OrderService {
    async getAllOrders() {
        try {
            return await db.select().from(Orders);
        } catch (error) {
            console.error("Error fetching orders:", error);
            throw new Error("Failed to fetch orders");
        }
    }

    async getOrderById(id: number) {
        if (isNaN(id)) throw new Error("Invalid order ID");

        try {
            const order = await db.select().from(Orders).where(eq(Orders.id, id));
            if (order.length === 0) return null;

            const items = await db.select().from(OrderItems).where(eq(OrderItems.orderId, id));
            return { order: order[0], items };
        } catch (error) {
            console.error(`Error fetching order with ID ${id}:`, error);
            throw new Error("Failed to fetch order");
        }
    }

    async createOrder(orderData: OrderInsert, orderItems: OrderItemInsert[]) {
        if (!orderData || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            throw new Error("Order and order items are required");
        }

        try {
            // Create the order first
            const [newOrder] = await db.insert(Orders).values(orderData).returning();

            // Prepare order items with the correct orderId
            const itemsWithOrderId = orderItems.map(item => ({
                ...item,
                orderId: newOrder.id,
            }));

            // Insert order items
            await db.insert(OrderItems).values(itemsWithOrderId);

            // Return the created order with items
            return await this.getOrderById(newOrder.id);
        } catch (error) {
            console.error("Error creating order:", error);
            throw new Error("Failed to create order");
        }
    }

    async updateOrder(id: number, updateData: Partial<OrderInsert>) {
        if (!updateData || Object.keys(updateData).length === 0) {
            console.error(`No fields provided for update on order ID ${id}`);
            throw new Error("No fields provided for update");
        }

        try {
            const result = await db.update(Orders)
                .set(updateData)
                .where(eq(Orders.id, id))
                .returning();

            if (result.length === 0) {
                console.error(`Order with ID ${id} not found for update`);
                throw new Error(`Order with ID ${id} not found`);
            }

            return result[0];
        } catch (error) {
            console.error(`Error updating order with ID ${id}:`, error);
            if (error.message.includes(`Order with ID ${id} not found`)) {
                throw error; // Let specific error pass through
            }
            throw new Error("Failed to update order");
        }
    }


    async deleteOrder(id: number) {
        if (isNaN(id)) throw new Error("Invalid order ID");

        try {
            const order = await db.select().from(Orders).where(eq(Orders.id, id));
            if (order.length === 0) return null;

            await db.delete(OrderItems).where(eq(OrderItems.orderId, id));
            const result = await db.delete(Orders).where(eq(Orders.id, id)).returning();

            return result[0];
        } catch (error) {
            console.error(`Error deleting order with ID ${id}:`, error);
            throw new Error("Failed to delete order");
        }
    }
}

export const orderService = new OrderService();
