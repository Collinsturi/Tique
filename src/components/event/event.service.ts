import db from "../../drizzle/db";
import {Events, EventInsert, Venue, TicketTypes, Tickets, StaffAssignments, User} from "../../drizzle/schema";
import {eq, and, sql} from "drizzle-orm";


export class EventService {
    // Fetch all events with optional filters
    async getAllEvents(filters: { venueId?: number; category?: string; date?: string }) {
        const { venueId, category, date } = filters;

        const conditions = [];

        if (venueId !== undefined) {
            conditions.push(eq(Events.VenueId, venueId));
        }

        if (category !== undefined) {
            conditions.push(eq(Events.Category, category));
        }

        if (date !== undefined) {
            conditions.push(eq(Events.eventDate, date));
        }

        const query = db
            .select({
                event: Events,
                venue: Venue,
                ticketTypes: TicketTypes,
                ticket: Tickets,
            })
            .from(Events)
            .leftJoin(Venue, eq(Events.VenueId, Venue.id))
            .leftJoin(TicketTypes, eq(TicketTypes.eventId, Events.id))
            .leftJoin(Tickets, eq(Tickets.eventId, Events.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        return await query;
    }

    // Fetch a single event by ID
    async getEventById(id: number) {
        const result = await db
            .select({
                event: Events,
                venue: Venue,
                ticketTypes: TicketTypes,
                ticket: Tickets,
            })
            .from(Events)
            .leftJoin(Venue, eq(Events.VenueId, Venue.id))
            .leftJoin(TicketTypes, eq(TicketTypes.eventId, Events.id))
            .leftJoin(Tickets, eq(Tickets.eventId, Events.id))
            .where(eq(Events.id, id));

        if (result.length === 0) throw new Error(`Event with ID ${id} not found`);
        return result;
    }

    // Create a new event
    async createEvent(eventData: EventInsert) {
        const result = await db.insert(Events).values(eventData).returning();
        return result[0];
    }

    // Update an event
    async updateEvent(id: number, eventData: Partial<EventInsert>) {
        const result = await db.update(Events).set(eventData).where(eq(Events.id, id)).returning();
        return result[0];
    }

    // Delete an event
    async deleteEvent(id: number) {
        const result = await db.delete(Events).where(eq(Events.id, id)).returning();
        return result[0];
    }

    async getStaffAssignedEvents(email: string) {
        const user = await db.select()
            .from(User)
            .where(eq(User.email, email))
            .then(res => res[0]);

        if (!user || user.role !== 'check_in_staff') {
            throw new Error('User not found or not a staff member');
        }

        const events = await db
            .select({
                eventId: Events.id,
                title: Events.title,
                ticketsSold: sql<number>`COALESCE(SUM(${TicketTypes.quantitySold}), 0)`,
                ticketsRemaining: sql<number>`COALESCE(SUM(${TicketTypes.quantityAvailable} - ${TicketTypes.quantitySold}), 0)`,
            })
            .from(Events)
            .innerJoin(StaffAssignments, eq(StaffAssignments.eventId, Events.id))
            .leftJoin(TicketTypes, eq(TicketTypes.eventId, Events.id))
            .where(eq(StaffAssignments.userId, user.id))
            .groupBy(Events.id, Events.title);

        return events;
    }

    async getStaffScannedTickets(email: string) {
        const user = await db.select()
            .from(User)
            .where(eq(User.email, email))
            .then(res => res[0]);

        if (!user || user.role !== 'check_in_staff') {
            throw new Error('User not found or not a staff member');
        }

        const events = await db
            .select({
                eventId: Events.id,
                title: Events.title,
                ticketsSold: sql<number>`COALESCE(SUM(${TicketTypes.quantitySold}),0)`,
                ticketsScanned: sql<number>`COALESCE(SUM(CASE WHEN ${Tickets.isScanned} = true THEN 1 ELSE 0 END), 0)`,
            })
            .from(Events)
            .innerJoin(StaffAssignments, eq(StaffAssignments.eventId, Events.id))
            .leftJoin(TicketTypes, eq(TicketTypes.eventId, Events.id))
            .leftJoin(Tickets, eq(Tickets.eventId, Events.id))
            .where(eq(StaffAssignments.userId, user.id))
            .groupBy(Events.id, Events.title);

        return events;
    }

    async getUpcomingEvents(email: string) {
        const user = await db.select()
            .from(User)
            .where(eq(User.email, email))
            .then(res => res[0]);

        if (!user || user.role !== 'organizer') {
            throw new Error('User not found or not a staff member');
        }

        const organizerEventOrganizer = await db
            .select({
                eventId: Events.id,
                title: Events.title,
                ticketsSold: sql<number>`COALESCE(SUM(${TicketTypes.quantitySold}), 0)`,
                ticketsScanned: sql<number>`COALESCE(SUM(CASE WHEN ${Tickets.isScanned} = true THEN 1 ELSE 0 END), 0)`,
            })
            .from(Events)
            .innerJoin(StaffAssignments, eq(StaffAssignments.eventId, Events.id))
            .leftJoin(TicketTypes, eq(TicketTypes.eventId, Events.id))
            .leftJoin(Tickets, eq(Tickets.eventId, Events.id))
            .where(eq(StaffAssignments.userId, user.id))
            .groupBy(Events.id, Events.title);

        return organizerEventOrganizer;
    }
}

export const eventService = new EventService();
