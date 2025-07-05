import db from "../../drizzle/db";
import { TicketTypes, type TicketTypesInsert } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export class TicketTypeService {
    async getAll(eventId?: number) {
        if (eventId !== undefined && isNaN(eventId)) {
            throw new Error("Invalid event ID");
        }

        try {
            if (eventId) {
                return await db.select().from(TicketTypes).where(eq(TicketTypes.eventId, eventId));
            }

            return await db.select().from(TicketTypes);
        } catch (error) {
            console.error("Error fetching ticket types:", error);
            throw new Error("Failed to fetch ticket types");
        }
    }


    async getById(id: number) {
        if (isNaN(id)) {
            throw new Error("Invalid ticket type ID");
        }

        try {
            const result = await db.select().from(TicketTypes).where(eq(TicketTypes.id, id));
            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (error) {
            console.error(`Error fetching ticket type with ID ${id}:`, error);
            throw new Error("Failed to fetch ticket type");
        }
    }

    async create(ticketTypeData: TicketTypesInsert) {
        try {
            const result = await db.insert(TicketTypes).values(ticketTypeData).returning();
            return result[0];
        } catch (error) {
            console.error("Error creating ticket type:", error);
            throw new Error("Failed to create ticket type");
        }
    }

    async update(id: number, updateData: Partial<TicketTypesInsert>) {
        if (isNaN(id)) {
            throw new Error("Invalid ticket type ID");
        }

        try {
            const result = await db.update(TicketTypes).set(updateData).where(eq(TicketTypes.id, id)).returning();
            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (error) {
            console.error(`Error updating ticket type with ID ${id}:`, error);
            throw new Error("Failed to update ticket type");
        }
    }

    async delete(id: number) {
        if (isNaN(id)) {
            throw new Error("Invalid ticket type ID");
        }

        try {
            const result = await db.delete(TicketTypes).where(eq(TicketTypes.id, id)).returning();
            if (result.length === 0) {
                return null;
            }
            return result[0];
        } catch (error) {
            console.error(`Error deleting ticket type with ID ${id}:`, error);
            throw new Error("Failed to delete ticket type");
        }
    }
}

export const ticketTypeService = new TicketTypeService();
