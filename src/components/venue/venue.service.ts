import db from "../drizzle/db";
import { Venue, VenueInsert } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export class VenueService {
    async getAllVenues() {
        return await db.select().from(Venue);
    }

    async getVenueById(id: number) {
        const result = await db.select().from(Venue).where(eq(Venue.id, id));
        return result[0];
    }

    async createVenue(venueData: VenueInsert) {
        const result = await db.insert(Venue).values(venueData).returning();
        return result[0];
    }

    async updateVenue(id: number, venueData: Partial<VenueInsert>) {
        const result = await db.update(Venue).set(venueData).where(eq(Venue.id, id)).returning();
        return result[0];
    }

    async deleteVenue(id: number) {
        const result = await db.delete(Venue).where(eq(Venue.id, id)).returning();
        return result[0];
    }
}

export const venueService = new VenueService();
