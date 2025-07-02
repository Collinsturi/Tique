import db from "../../drizzle/db";
import { CustomerSupport, CustomerSupportInsert } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export class CustomerSupportService {
    async getAll() {
        return await db.select().from(CustomerSupport);
    }

    async getById(id: number) {
        const result = await db.select().from(CustomerSupport).where(eq(CustomerSupport.id, id));
        return result[0];
    }

    async create(supportData: CustomerSupportInsert) {
        const result = await db.insert(CustomerSupport).values(supportData).returning();
        return result[0];
    }

    async update(id: number, updateData: Partial<CustomerSupportInsert>) {
        const result = await db.update(CustomerSupport).set(updateData).where(eq(CustomerSupport.id, id)).returning();
        return result[0];
    }

    async delete(id: number) {
        const result = await db.delete(CustomerSupport).where(eq(CustomerSupport.id, id)).returning();
        return result[0];
    }
}

export const customerSupportService = new CustomerSupportService();
