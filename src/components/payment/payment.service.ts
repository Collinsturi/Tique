import db from "../drizzle/db";
import { Payment, PaymentInsert } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export class PaymentService {
    async getAll() {
        return await db.select().from(Payment);
    }

    async getById(id: number) {
        const result = await db.select().from(Payment).where(eq(Payment.id, id));
        return result[0];
    }

    async create(paymentData: PaymentInsert) {
        const result = await db.insert(Payment).values(paymentData).returning();
        return result[0];
    }

    async update(id: number, updateData: Partial<PaymentInsert>) {
        const result = await db.update(Payment).set(updateData).where(eq(Payment.id, id)).returning();
        return result[0];
    }

    async delete(id: number) {
        const result = await db.delete(Payment).where(eq(Payment.id, id)).returning();
        return result[0];
    }
}

export const paymentService = new PaymentService();
