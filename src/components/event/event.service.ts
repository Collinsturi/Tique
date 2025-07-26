import db from "../../drizzle/db";
import {
    Events,
    EventInsert,
    Venue,
    TicketTypes,
    Tickets,
    StaffAssignments,
    User,
    userRoles
} from "../../drizzle/schema";
import {eq, and, sql, lte, gte, lt, inArray} from "drizzle-orm";
import { addDays, startOfToday } from 'date-fns';

export type CreateEventServicePayload = {
    category: string;
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    address: string;
    city: string;
    country: string;
    latitude?: number | null;
    longitude?: number | null;
    posterImageUrl?: string;
    thumbnailImageUrl?: string;
    organizerEmail: string;
    venueId?: number;
    ticketTypes: {
        name: string;
        price: number;
        quantityAvailable: number;
        description?: string;
    }[];
};

export class EventService {
    // Fetch all events with optional filters - improved data structure
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

        // Get events with aggregated data
        const events = await db
            .select({
                id: Events.id,
                title: Events.title,
                description: Events.Description,
                eventDate: Events.eventDate,
                eventTime: Events.eventTime,
                category: Events.Category,
                organizerId: Events.organizerId,
                venueId: Events.VenueId,
                venueName: Venue.name,
                venueAddress: Venue.addresses,
                venueCapacity: Venue.capacity,
                totalTicketsSold: sql<number>`COALESCE(SUM(${TicketTypes.quantitySold}), 0)`,
                totalTicketsAvailable: sql<number>`COALESCE(SUM(${TicketTypes.quantityAvailable}), 0)`,
                ticketsRemaining: sql<number>`COALESCE(SUM(${TicketTypes.quantityAvailable} - ${TicketTypes.quantitySold}), 0)`,
            })
            .from(Events)
            .leftJoin(Venue, eq(Events.VenueId, Venue.id))
            .leftJoin(TicketTypes, eq(TicketTypes.eventId, Events.id))
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .groupBy(
                Events.id,
                Events.title,
                Events.Description,
                Events.eventDate,
                Events.eventTime,
                Events.Category,
                Events.organizerId,
                Events.VenueId,
                Venue.name,
                Venue.addresses,
                Venue.capacity
            );

        // Get ticket types for each event separately to avoid cartesian product
        const eventIds = events.map(e => e.id);
        const ticketTypes = eventIds.length > 0 ? await db
            .select()
            .from(TicketTypes)
            .where(inArray(TicketTypes.eventId, eventIds)) : [];

        // Structure the response properly
        return events.map(event => ({
            ...event,
            venue: {
                id: event.venueId,
                name: event.venueName,
                address: event.venueAddress,
                capacity: event.venueCapacity,
            },
            ticketTypes: ticketTypes.filter(tt => tt.eventId === event.id)
        }));
    }

    // Fetch a single event by ID - improved structure
    async getEventById(id: number) {
        const event = await db
            .select({
                id: Events.id,
                title: Events.title,
                description: Events.Description,
                eventDate: Events.eventDate,
                eventTime: Events.eventTime,
                category: Events.Category,
                organizerId: Events.organizerId,
                venueId: Events.VenueId,
                venueName: Venue.name,
                venueAddress: Venue.addresses,
                venueCapacity: Venue.capacity,
                totalTicketsSold: sql<number>`COALESCE(SUM(${TicketTypes.quantitySold}), 0)`,
                totalTicketsAvailable: sql<number>`COALESCE(SUM(${TicketTypes.quantityAvailable}), 0)`,
            })
            .from(Events)
            .leftJoin(Venue, eq(Events.VenueId, Venue.id))
            .leftJoin(TicketTypes, eq(TicketTypes.eventId, Events.id))
            .where(eq(Events.id, id))
            .groupBy(
                Events.id,
                Events.title,
                Events.Description,
                Events.eventDate,
                Events.eventTime,
                Events.Category,
                Events.organizerId,
                Events.VenueId,
                Venue.name,
                Venue.addresses,
                Venue.capacity
            );

        if (event.length === 0) throw new Error(`Event with ID ${id} not found`);

        // Get ticket types and tickets separately
        const [ticketTypes, tickets] = await Promise.all([
            db.select().from(TicketTypes).where(eq(TicketTypes.eventId, id)),
            db.select().from(Tickets).where(eq(Tickets.eventId, id))
        ]);

        return {
            ...event[0],
            venue: {
                id: event[0].venueId,
                name: event[0].venueName,
                address: event[0].venueAddress,
                capacity: event[0].venueCapacity,
            },
            ticketTypes,
            tickets
        };
    }


    // Create a new event
    async createEvent(eventPayload: CreateEventServicePayload) {

        // // Debug: Check each property before cleaning
        // for (const [key, value] of Object.entries(eventPayload)) {
        //     console.log(`🔍 ${key}:`, value, `(${typeof value}) - undefined? ${value === undefined}`);
        // }

        // 1. Clean the payload
        const cleanedPayload = this.removeUndefinedFields(eventPayload);

        const payload = cleanedPayload as CreateEventServicePayload;

        // 2. Retrieve Organizer
        console.log("🔍 Finding organizer with email:", payload.organizerEmail);
        const [organizer] = await db
            .select()
            .from(User)
            .where(eq(User.email, payload.organizerEmail))
            .execute();

        if (!organizer) {
            throw new Error('Organizer not found.');
        }

        const organizerId = organizer.id;

        // 3. Handle Venue
        let venueId: number;

        if (payload.venueId) {
            const [existingVenue] = await db
                .select()
                .from(Venue)
                .where(eq(Venue.id, payload.venueId))
                .execute();

            if (!existingVenue) {
                throw new Error('Provided venueId does not exist.');
            }

            venueId = existingVenue.id;
        } else {
            console.log("🏗 Creating new venue...");

            if (!payload.address || !payload.city || !payload.country) {
                throw new Error('Address information is required when creating a new venue');
            }

            const venueInsertData = {
                name: `${payload.name} Venue`,
                addresses: `${payload.address}, ${payload.city}, ${payload.country}`,
                capacity: payload.ticketTypes.reduce((sum, tt) => sum + tt.quantityAvailable, 0),
            };

            const [newVenue] = await db.insert(Venue).values(venueInsertData).returning().execute();

            if (!newVenue) {
                throw new Error('Failed to create venue.');
            }

            venueId = newVenue.id;
        }

        // 4. Insert Event
        const eventInsertData = {
            title: payload.name,
            Description: payload.description,
            VenueId: venueId,
            Category: payload.category,
            eventDate: payload.startDate.split('T')[0], // 'YYYY-MM-DD'
            eventTime: payload.startDate.split('T')[1]?.split('.')[0] ?? '00:00:00', // 'HH:mm:ss'
            organizerId,
        };

        const [newEvent] = await db.insert(Events).values(eventInsertData).returning().execute();

        if (!newEvent) {
            throw new Error('Failed to create event.');
        }


        // 5. Insert Ticket Types
        const ticketTypeInserts = payload.ticketTypes.map((tt) => ({
            eventId: newEvent.id,
            typeName: tt.name,
            price: tt.price,
            quantityAvailable: tt.quantityAvailable,
            quantitySold: 0,
            description: tt.description ?? null,
        }));

        if (ticketTypeInserts.length > 0) {
            const result = await db.insert(TicketTypes).values(ticketTypeInserts).execute();
        }
        return {
            success: true,
            message: 'Event created successfully!',
            eventId: newEvent.id,
        };
    }

    private removeUndefinedFields<T extends Record<string, any>>(obj: T): Partial<T> {
        // Fields that should be preserved even if they might seem "empty"
        const preserveFields = ['venueId', 'latitude', 'longitude', 'price', 'quantityAvailable'];

        const cleaned: any = {};

        for (const [key, value] of Object.entries(obj)) {
            console.log(`🔍 Processing key: ${key}, value:`, value, `type: ${typeof value}`);

            // Always preserve specific important fields (even if null/0)
            if (preserveFields.includes(key) && value !== undefined) {
                cleaned[key] = value;
                continue;
            }

            // Handle undefined values
            if (value === undefined) {
                continue;
            }

            // Handle arrays
            if (Array.isArray(value)) {
                const cleanedArray = value
                    .map(item => typeof item === 'object' && item !== null
                        ? this.removeUndefinedFields(item)
                        : item)
                    .filter(item => item !== undefined);

                if (cleanedArray.length > 0) {
                    cleaned[key] = cleanedArray;
                }
            }
            // Handle nested objects
            else if (typeof value === 'object' && value !== null) {
                const cleanedNested = this.removeUndefinedFields(value);
                // Only add if the cleaned object has keys OR if it's a preserved field
                if (Object.keys(cleanedNested).length > 0 || preserveFields.includes(key)) {
                    cleaned[key] = cleanedNested;
                }
            }
            // Handle primitive values
            else {
                cleaned[key] = value;
            }
        }

        return cleaned;
    }
    // Update an event
    async updateEvent(id: number, eventData: Partial<EventInsert>) {
        const result = await db.update(Events).set(eventData).where(eq(Events.id, id)).returning();
        if (result.length === 0) throw new Error(`Event with ID ${id} not found`);
        return result[0];
    }

    // Delete an event
    async deleteEvent(id: number) {
        const result = await db.delete(Events).where(eq(Events.id, id)).returning();
        if (result.length === 0) throw new Error(`Event with ID ${id} not found`);
        return result[0];
    }

    async getStaffAssignedEvents(email: string) {
        const user = await db.select({ id: User.id, role: User.role })
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
                eventDate: Events.eventDate,
                eventTime: Events.eventTime,
                ticketsSold: sql<number>`COALESCE(SUM(${TicketTypes.quantitySold}), 0)`,
                ticketsRemaining: sql<number>`COALESCE(SUM(${TicketTypes.quantityAvailable} - ${TicketTypes.quantitySold}), 0)`,
            })
            .from(Events)
            .innerJoin(StaffAssignments, eq(StaffAssignments.eventId, Events.id))
            .leftJoin(TicketTypes, eq(TicketTypes.eventId, Events.id))
            .where(eq(StaffAssignments.userId, user.id))
            .groupBy(Events.id, Events.title, Events.eventDate, Events.eventTime);

        return events;
    }

    async getStaffScannedTickets(email: string) {
        const user = await db.select({ id: User.id, role: User.role })
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
                eventDate: Events.eventDate,
                eventTime: Events.eventTime,
                ticketsSold: sql<number>`COALESCE(SUM(${TicketTypes.quantitySold}), 0)`,
                ticketsScanned: sql<number>`COALESCE(SUM(CASE WHEN ${Tickets.isScanned} = true THEN 1 ELSE 0 END), 0)`,
            })
            .from(Events)
            .innerJoin(StaffAssignments, eq(StaffAssignments.eventId, Events.id))
            .leftJoin(TicketTypes, eq(TicketTypes.eventId, Events.id))
            .leftJoin(Tickets, eq(Tickets.eventId, Events.id))
            .where(eq(StaffAssignments.userId, user.id))
            .groupBy(Events.id, Events.title, Events.eventDate, Events.eventTime);

        return events;
    }

    async getUpcomingEvents(email: string) {
        const user = await db.select({ id: User.id, role: User.role })
            .from(User)
            .where(eq(User.email, email))
            .then(res => res[0]);

        if (!user || user.role !== 'organizer') {
            throw new Error('User not found or not an organizer');
        }

        // Get upcoming events for organizer (within next 30 days)
        const today = startOfToday();
        const thirtyDaysLater = addDays(today, 30);

        const events = await db
            .select({
                eventId: Events.id,
                title: Events.title,
                eventDate: Events.eventDate,
                eventTime: Events.eventTime,
                venueName: Venue.name,
                venueAddress: Venue.addresses,
                ticketsSold: sql<number>`(
                          SELECT COALESCE(SUM(tt.quantity_sold), 0)
                          FROM ticket_types tt
                          WHERE tt.event_id = ${Events.id}
                        )`.mapWith(Number),
                                    ticketsRemaining: sql<number>`(
                          SELECT COALESCE(SUM(tt.quantity_available - tt.quantity_sold), 0)
                          FROM ticket_types tt
                          WHERE tt.event_id = ${Events.id}
                        )`.mapWith(Number),
                                    ticketsScanned: sql<number>`(
                          SELECT COALESCE(COUNT(*), 0)
                          FROM tickets t
                          WHERE t.event_id = ${Events.id} AND t.is_scanned = true
                        )`.mapWith(Number),
            })
            .from(Events)
            .leftJoin(Venue, eq(Events.VenueId, Venue.id))
            .where(
                and(
                    eq(Events.organizerId, user.id),
                    gte(Events.eventDate, today),
                    lte(Events.eventDate, thirtyDaysLater)
                )
            )
            .orderBy(Events.eventDate);

        return events;
    }

    async assignStaff(requesterEmail: string, staffEmails: string[], eventId: number) {
        // 1) Load & verify the requester
        const requester = await db
            .select({ id: User.id, role: User.role })
            .from(User)
            .where(eq(User.email, requesterEmail))
            .then(r => r[0]);

        if (!requester || !['admin', 'organizer'].includes(requester.role)) {
            throw new Error('Only admin or organizer can assign staff');
        }

        // 2) Verify event exists and if organizer, ensure they own this event
        const event = await db
            .select({ id: Events.id, organizerId: Events.organizerId })
            .from(Events)
            .where(eq(Events.id, eventId))
            .then(r => r[0]);

        if (!event) {
            throw new Error('Event not found');
        }

        if (requester.role === 'organizer' && event.organizerId !== requester.id) {
            throw new Error('Organizer can only assign staff to their own events');
        }

        // 3) Get all staff users in one query
        const staffUsers = await db
            .select({ id: User.id, email: User.email, role: User.role })
            .from(User)
            .where(and(
                inArray(User.email, staffEmails),
                eq(User.role, 'check_in_staff')
            ));

        // 4) Get existing assignments to avoid duplicates
        const existingAssignments = await db
            .select({ userId: StaffAssignments.userId })
            .from(StaffAssignments)
            .where(and(
                eq(StaffAssignments.eventId, eventId),
                inArray(StaffAssignments.userId, staffUsers.map(s => s.id))
            ));

        const existingUserIds = new Set(existingAssignments.map(a => a.userId));

        // 5) Insert new assignments
        const newAssignments = staffUsers
            .filter(staff => !existingUserIds.has(staff.id))
            .map(staff => ({ userId: staff.id, eventId }));

        if (newAssignments.length > 0) {
            await db.insert(StaffAssignments).values(newAssignments);
        }

        // Return summary
        const notFound = staffEmails.filter(email =>
            !staffUsers.some(staff => staff.email === email)
        );

        return {
            assigned: newAssignments.length,
            alreadyAssigned: staffUsers.length - newAssignments.length,
            notFound,
            totalRequested: staffEmails.length
        };
    }

    async getCurrentOrganizerEvents(organizerEmail: string) {
        const requester = await db
            .select({ id: User.id, role: User.role })
            .from(User)
            .where(eq(User.email, organizerEmail))
            .then(r => r[0]);

        if (!requester || !['admin', 'organizer'].includes(requester.role)) {
            throw new Error('Only admin or organizer can fetch organizer current events');
        }

        const today = startOfToday();
        const sevenDaysLater = addDays(today, 7);

        const events = await db
            .select({
                eventId: Events.id,
                title: Events.title,
                eventDate: Events.eventDate,
                eventTime: Events.eventTime,
                category: Events.Category,
                venueName: Venue.name,
                venueAddress: Venue.addresses,
                ticketsSold: sql<number>`COALESCE(SUM(${TicketTypes.quantitySold}), 0)`,
                ticketsScanned: sql<number>`COALESCE(SUM(CASE WHEN ${Tickets.isScanned} = true THEN 1 ELSE 0 END), 0)`,
                ticketsRemaining: sql<number>`COALESCE(SUM(${TicketTypes.quantityAvailable} - ${TicketTypes.quantitySold}), 0)`,
                staffCount: sql<number>`COALESCE(COUNT(DISTINCT ${StaffAssignments.userId}), 0)`,
            })
            .from(Events)
            .leftJoin(Venue, eq(Events.VenueId, Venue.id))
            .leftJoin(StaffAssignments, eq(StaffAssignments.eventId, Events.id))
            .leftJoin(TicketTypes, eq(TicketTypes.eventId, Events.id))
            .leftJoin(Tickets, eq(Tickets.eventId, Events.id))
            .where(and(
                eq(Events.organizerId, requester.id),
                gte(Events.eventDate, today),
                lte(Events.eventDate, sevenDaysLater)
            ))
            .groupBy(
                Events.id,
                Events.title,
                Events.eventDate,
                Events.eventTime,
                Events.Category,
                Venue.name,
                Venue.addresses
            )
            .orderBy(Events.eventDate);

        return events;
    }

    async getPastOrganizerEvents(organizerEmail: string) {
        const requester = await db
            .select({ id: User.id, role: User.role })
            .from(User)
            .where(eq(User.email, organizerEmail))
            .then(r => r[0]);

        if (!requester || !['admin', 'organizer'].includes(requester.role)) {
            throw new Error('Only admin or organizer can fetch organizer past events');
        }

        const today = startOfToday();

        const events = await db
            .select({
                eventId: Events.id,
                title: Events.title,
                eventDate: Events.eventDate,
                eventTime: Events.eventTime,
                category: Events.Category,
                venueName: Venue.name,
                venueAddress: Venue.addresses,
                ticketsSold: sql<number>`COALESCE(SUM(${TicketTypes.quantitySold}), 0)`,
                ticketsScanned: sql<number>`COALESCE(SUM(CASE WHEN ${Tickets.isScanned} = true THEN 1 ELSE 0 END), 0)`,
                attendanceRate: sql<number>`
                    CASE 
                        WHEN SUM(${TicketTypes.quantitySold}) > 0
                    THEN ROUND(
                    (SUM(CASE WHEN ${Tickets.isScanned} = true THEN 1 ELSE 0 END)::DECIMAL /
                    SUM(${TicketTypes.quantitySold})) * 100, 2
                    )
                    ELSE 0
                    END
                `,
            })
            .from(Events)
            .leftJoin(Venue, eq(Events.VenueId, Venue.id))
            .leftJoin(TicketTypes, eq(TicketTypes.eventId, Events.id))
            .leftJoin(Tickets, eq(Tickets.eventId, Events.id))
            .where(and(
                eq(Events.organizerId, requester.id),
                lt(Events.eventDate, today)
            ))
            .groupBy(
                Events.id,
                Events.title,
                Events.eventDate,
                Events.eventTime,
                Events.Category,
                Venue.name,
                Venue.addresses
            )
            .orderBy(sql`${Events.eventDate} DESC`);

        return events;
    }

    async getAvailableStaff() {
        const availableStaff = await db
            .select({
                id: User.id,
                email: User.email,
                firstName: User.firstName,
                lastName: User.lastName,
                role: User.role,
            })
            .from(User)
            .where(eq(User.role, 'check_in_staff'));

        return availableStaff;
    }

    async getEventStatistics(eventId: number, organizerEmail?: string) {
        // Verify access if organizer email is provided
        if (organizerEmail) {
            const organizer = await db
                .select({ id: User.id })
                .from(User)
                .where(eq(User.email, organizerEmail))
                .then(r => r[0]);

            if (organizer) {
                const event = await db
                    .select({ organizerId: Events.organizerId })
                    .from(Events)
                    .where(and(
                        eq(Events.id, eventId),
                        eq(Events.organizerId, organizer.id)
                    ))
                    .then(r => r[0]);

                if (!event) {
                    throw new Error('Event not found or access denied');
                }
            }
        }

        const stats = await db
            .select({
                eventId: Events.id,
                title: Events.title,
                totalTicketsAvailable: sql<number>`COALESCE(SUM(${TicketTypes.quantityAvailable}), 0)`,
                totalTicketsSold: sql<number>`COALESCE(SUM(${TicketTypes.quantitySold}), 0)`,
                totalTicketsScanned: sql<number>`COALESCE(SUM(CASE WHEN ${Tickets.isScanned} = true THEN 1 ELSE 0 END), 0)`,
                revenue: sql<number>`COALESCE(SUM(${TicketTypes.quantitySold} * ${TicketTypes.price}), 0)`,
                staffAssigned: sql<number>`COALESCE(COUNT(DISTINCT ${StaffAssignments.userId}), 0)`,
            })
            .from(Events)
            .leftJoin(TicketTypes, eq(TicketTypes.eventId, Events.id))
            .leftJoin(Tickets, eq(Tickets.eventId, Events.id))
            .leftJoin(StaffAssignments, eq(StaffAssignments.eventId, Events.id))
            .where(eq(Events.id, eventId))
            .groupBy(Events.id, Events.title);

        return stats[0] || null;
    }

    async unassignStaffFromEvent (eventId: number, staffEmails: string[], organizerEmail: string): Promise<void> {
        try {
            // First, verify the organizer owns the event
            const event = await db.select()
                .from(Events)
                .where(eq(Events.id, eventId))
                .leftJoin(User, eq(Events.organizerId, User.id))
                .execute();

            if (event.length === 0 || event[0].User?.email !== organizerEmail) {
                throw new Error('Event not found or organizer does not own this event.');
            }

            // Get the IDs of the staff members based on their emails and role
            const staffUsers = await db.select()
                .from(User)
                .where(and(inArray(User.email, staffEmails), eq(User.role, 'check_in_staff')))
                .execute();

            if (staffUsers.length === 0) {
                throw new Error('No staff members found with the provided emails.');
            }

            const staffIdsToUnassign = staffUsers.map(s => s.id);

            await db.delete(StaffAssignments)
                .where(and(
                    eq(StaffAssignments.eventId, eventId),
                    inArray(StaffAssignments.userId, staffIdsToUnassign)
                ))
                .execute();

        } catch (error) {
            console.error('Error unassigning staff from event:', error);
            throw error;
        }
    };

    async getAssignedStaffForEvent (eventId: number, organizerEmail: string): Promise<AssignedStaff[]> {
        try {
            // Verify the organizer owns the event
            const event = await db.select()
                .from(Events)
                .where(eq(Events.id, eventId))
                .leftJoin(User, eq(Events.organizerId, User.id))
                .execute();

            if (event.length === 0 || event[0].User?.email !== organizerEmail) {
                throw new Error('Event not found or organizer does not own this event.');
            }

            // Fetch assigned staff details for the given event
            const assignedStaffData = await db.select({
                id: User.id,
                firstName: User.firstName,
                lastName: User.lastName,
                email: User.email,
            })
                .from(StaffAssignments)
                .where(eq(StaffAssignments.eventId, eventId))
                .innerJoin(User, eq(StaffAssignments.userId, User.id))
                .execute();

            return assignedStaffData;
        } catch (error) {
            console.error('Error fetching assigned staff for event:', error);
            throw error;
        }
    };
}

export const eventService = new EventService();