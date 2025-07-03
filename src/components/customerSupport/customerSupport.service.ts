import db from "../../drizzle/db";
import { CustomerSupport, CustomerSupportInsert } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export class CustomerSupportService {
    async getAll() {
        try {
            const results = await db.select().from(CustomerSupport);
            return results;
        } catch (error) {
            console.error("Error fetching customer support records:", error);
            throw new Error("Failed to retrieve customer support records.");
        }
    }

    async getById(id: number) {
        try {
            const result = await db.select().from(CustomerSupport).where(eq(CustomerSupport.id, id));
            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (error) {
            console.error(`Error fetching customer support record with ID ${id}:`, error);
            throw new Error("Failed to retrieve customer support record.");
        }
    }

    async create(supportData: CustomerSupportInsert) {
        try {
            const result = await db.insert(CustomerSupport).values(supportData).returning();
            return result[0];
        } catch (error) {
            console.error("Error creating customer support record:", error);
            throw new Error("Failed to create customer support record.");
        }
    }

    async update(id: number, updateData: Partial<CustomerSupportInsert>) {
        try {
            const result = await db.update(CustomerSupport).set(updateData).where(eq(CustomerSupport.id, id)).returning();
            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (error) {
            console.error(`Error updating customer support record with ID ${id}:`, error);
            throw new Error("Failed to update customer support record.");
        }
    }

    async delete(id: number) {
        try {
            const result = await db.delete(CustomerSupport).where(eq(CustomerSupport.id, id)).returning();
            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (error) {
            console.error(`Error deleting customer support record with ID ${id}:`, error);
            throw new Error("Failed to delete customer support record.");
        }
    }
}

export const customerSupportService = new CustomerSupportService();
