import db from "../../drizzle/db";
import { Venue, type VenueInsert } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export class VenueService {

    async getAllVenues() {
        try {
            return await db.select()
                .from(Venue);
        } catch (error) {
            console.error("Error fetching venues:", error);
            throw new Error("Failed to fetch venues");
        }
    }

    async getVenueById(id: number) {
        if (isNaN(id)) throw new Error("Invalid venue ID");

        try {
            const result = await db.select().from(Venue).where(eq(Venue.id, id));
            if (result.length === 0) return null;
            return result[0];
        } catch (error) {
            console.error(`Error fetching venue with ID ${id}:`, error);
            throw new Error("Failed to fetch venue");
        }
    }

    async createVenue(venueData: VenueInsert) {
        try {
            const result = await db.insert(Venue).values(venueData).returning();
            return result[0];
        } catch (error) {
            console.error("Error creating venue:", error);
            throw new Error("Failed to create venue");
        }
    }

    async updateVenue(id: number, venueData: Partial<VenueInsert>) {
        if (isNaN(id)) throw new Error("Invalid venue ID");

        try {
            const result = await db.update(Venue).set(venueData).where(eq(Venue.id, id)).returning();
            if (result.length === 0) return null;
            return result[0];
        } catch (error) {
            console.error(`Error updating venue with ID ${id}:`, error);
            throw new Error("Failed to update venue");
        }
    }

    async deleteVenue(id: number) {
        if (isNaN(id)) throw new Error("Invalid venue ID");

        try {
            const result = await db.delete(Venue).where(eq(Venue.id, id)).returning();
            if (result.length === 0) return null;
            return result[0];
        } catch (error) {
            console.error(`Error deleting venue with ID ${id}:`, error);
            throw new Error("Failed to delete venue");
        }
    }
}

export const venueService = new VenueService();
