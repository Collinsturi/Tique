import db from "../../drizzle/db";
import { Orders, OrderInsert, OrderItems, OrderItemInsert } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export class OrderService {
    async getAllOrders() {
        return await db.select().from(Orders);
    }

    async getOrderById(id: number) {
        const order = await db.select().from(Orders).where(eq(Orders.id, id));
        const items = await db.select().from(OrderItems).where(eq(OrderItems.orderId, id));

        return { order: order[0], items };
    }

    async createOrder(orderData: OrderInsert, orderItems: OrderItemInsert[]) {
        const [newOrder] = await db.insert(Orders).values(orderData).returning();

        // Link order items to the new order
        const itemsWithOrderId = orderItems.map(item => ({
            ...item,
            orderId: newOrder.id,
        }));

        await db.insert(OrderItems).values(itemsWithOrderId);

        return await this.getOrderById(newOrder.id);
    }

    async updateOrder(id: number, updateData: Partial<OrderInsert>) {
        const result = await db.update(Orders).set(updateData).where(eq(Orders.id, id)).returning();
        return result[0];
    }

    async deleteOrder(id: number) {
        await db.delete(OrderItems).where(eq(OrderItems.orderId, id)); // Clean up order items first
        const result = await db.delete(Orders).where(eq(Orders.id, id)).returning();
        return result[0];
    }
}

export const orderService = new OrderService();
