import db from "../../drizzle/db";
import {Tickets, Events, TicketTypes, Venue} from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

export class TicketService {
    async getAllTickets(filters: { eventId?: number; userId?: number; isScanned?: boolean }) {
        const { eventId, userId, isScanned } = filters;
        const conditions = [];

        if (eventId !== undefined) conditions.push(eq(Tickets.eventId, eventId));
        if (userId !== undefined) conditions.push(eq(Tickets.userId, userId));
        if (isScanned !== undefined) conditions.push(eq(Tickets.isScanned, isScanned));

        const query = db
            .select()
            .from(Tickets)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        return await query;
    }

    async getTicketById(id: number) {
        if (isNaN(id) || id <= 0) throw new Error("Invalid ticket ID");

        const result = await db
            .select({
                ticket: Tickets,
                event: Events,
                ticketType: TicketTypes,
                venue: Venue
            })
            .from(Tickets)
            .leftJoin(Events, eq(Tickets.eventId, Events.id))
            .leftJoin(TicketTypes, eq(Tickets.ticketTypeId, TicketTypes.id))
            .leftJoin(Venue, eq(Events.VenueId, Venue.id))
            .where(eq(Tickets.id, id));

        if (result.length === 0) throw new Error(`Ticket with ID ${id} not found`);
        return result[0];
    }


    async createTicket(ticketData: { orderItemId: number; userId: number; eventId: number; ticketTypeId: number }) {
        const { orderItemId, userId, eventId, ticketTypeId } = ticketData;

        // Validate required fields
        if (!orderItemId || !userId || !eventId || !ticketTypeId) {
            throw new Error("Missing required ticket fields");
        }

        const newTicket = {
            orderItemId,
            userId,
            eventId,
            ticketTypeId,
            uniqueCode: this.generateUniqueCode(),
            isScanned: false
        };

        const result = await db.insert(Tickets).values(newTicket).returning();

        if (result.length === 0) throw new Error("Failed to create ticket");
        return result[0];
    }

    async scanTicket(id: number, scannedByUser: number) {
        if (isNaN(id) || id <= 0) throw new Error("Invalid ticket ID");
        if (isNaN(scannedByUser) || scannedByUser <= 0) throw new Error("Invalid scanning user ID");

        const ticket = await this.getTicketById(id);

        if (ticket.isScanned) {
            throw new Error(`Ticket with ID ${id} has already been scanned`);
        }

        const result = await db.update(Tickets)
            .set({
                isScanned: true,
                scannedAt: new Date(),
                scannedByUser,
            })
            .where(eq(Tickets.id, id))
            .returning();

        if (result.length === 0) throw new Error(`Ticket with ID ${id} not found during update`);
        return result[0];
    }

    async deleteTicket(id: number) {
        if (isNaN(id) || id <= 0) throw new Error("Invalid ticket ID");

        const result = await db.delete(Tickets).where(eq(Tickets.id, id)).returning();

        if (result.length === 0) throw new Error(`Ticket with ID ${id} not found for deletion`);
        return result[0];
    }

    async getByUserid(id: number) {
        const result = await db
            .select({
                ticket: Tickets,
                event: Events,
                ticketType: TicketTypes,
                venue: Venue
            })
            .from(Tickets)
            .leftJoin(Events, eq(Tickets.eventId, Events.id))
            .leftJoin(TicketTypes, eq(Tickets.ticketTypeId, TicketTypes.id))
            .leftJoin(Venue, eq(Events.VenueId, Venue.id))
            .where(eq(Tickets.userId, id))

        if(result.length === 0) throw new Error(`Ticket with user ID ${id} not found`);
        return result;
    }

    private generateUniqueCode(): string {
        return `ETIQUET-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
    }
}

export const ticketService = new TicketService();
