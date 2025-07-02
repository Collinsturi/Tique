import db from "../../drizzle/db";
import { Tickets, type TicketInsert } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export class TicketService {
    // Get all tickets with optional filters
    async getAllTickets(filters: { eventId?: number; userId?: number; isScanned?: boolean }) {
        const { eventId, userId, isScanned } = filters;

        const conditions = [];

        if (eventId !== undefined) {
            conditions.push(eq(Tickets.eventId, eventId));
        }

        if (userId !== undefined) {
            conditions.push(eq(Tickets.userId, userId));
        }

        if (isScanned !== undefined) {
            conditions.push(eq(Tickets.isScanned, isScanned ? 1 : 0));
        }

        const query = db
            .select()
            .from(Tickets)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        return await query;
    }

    // Get a single ticket by ID
    async getTicketById(id: number) {
        const result = await db.select().from(Tickets).where(eq(Tickets.id, id));
        return result[0];
    }

    // Create (Book) a new ticket
    async createTicket(ticketData: TicketInsert) {
        const result = await db.insert(Tickets).values(ticketData).returning();
        return result[0];
    }

    // Mark ticket as scanned
    async scanTicket(id: number, scannedByUser: number) {
        const result = await db.update(Tickets)
            .set({
                isScanned: 1,
                scannedAt: Date.now(),
                scannedByUser: scannedByUser,
            })
            .where(eq(Tickets.id, id))
            .returning();
        return result[0];
    }

    // Delete a ticket (admin only)
    async deleteTicket(id: number) {
        const result = await db.delete(Tickets).where(eq(Tickets.id, id)).returning();
        return result[0];
    }
}

export const ticketService = new TicketService();
