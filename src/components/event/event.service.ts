import db from "../../drizzle/db";
import { Events, EventInsert } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

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
            conditions.push(eq(Events.eventDate, new Date(date)));
        }

        const query = db
            .select()
            .from(Events)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

        return await query;
    }

    // Fetch a single event by ID
    async getEventById(id: number) {
        const result = await db.select().from(Events).where(eq(Events.id, id));
        return result[0];
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
}

export const eventService = new EventService();
