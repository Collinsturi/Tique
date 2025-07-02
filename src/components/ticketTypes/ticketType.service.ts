import db from "../drizzle/db";
import { TicketTypes, TicketTypesInsert } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export class TicketTypeService {
    async getAll(eventId?: number) {
        if (eventId) {
            return await db.select().from(TicketTypes).where(eq(TicketTypes.eventId, eventId));
        }
        return await db.select().from(TicketTypes);
    }

    async getById(id: number) {
        const result = await db.select().from(TicketTypes).where(eq(TicketTypes.id, id));
        return result[0];
    }

    async create(ticketTypeData: TicketTypesInsert) {
        const result = await db.insert(TicketTypes).values(ticketTypeData).returning();
        return result[0];
    }

    async update(id: number, updateData: Partial<TicketTypesInsert>) {
        const result = await db.update(TicketTypes).set(updateData).where(eq(TicketTypes.id, id)).returning();
        return result[0];
    }

    async delete(id: number) {
        const result = await db.delete(TicketTypes).where(eq(TicketTypes.id, id)).returning();
        return result[0];
    }
}

export const ticketTypeService = new TicketTypeService();
