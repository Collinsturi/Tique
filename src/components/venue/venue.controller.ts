import { Request, Response } from "express";
import { venueService } from "./venue.service";

export class VenueController {
    getAll = async (req: Request, res: Response) => {
        try {
            const venues = await venueService.getAllVenues();
            res.json(venues);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch venues", error });
        }
    };

    getById = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        try {
            const venue = await venueService.getVenueById(id);
            if (!venue) return res.status(200).json({ message: "Venue not found" });
            res.json(venue);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch venue", error });
        }
    };

    create = async (req: Request, res: Response) => {
        try {
            const newVenue = await venueService.createVenue(req.body);
            res.status(201).json(newVenue);
        } catch (error) {
            res.status(500).json({ message: "Failed to create venue", error });
        }
    };

    update = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        try {
            const venue = await venueService.getVenueById(id);
            if (!venue) return res.status(200).json({ message: "Venue not found" });

            const updatedVenue = await venueService.updateVenue(id, req.body);
            res.json(updatedVenue);
        } catch (error) {
            res.status(500).json({ message: "Failed to update venue", error });
        }
    };

    delete = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        try {
            const deletedVenue = await venueService.deleteVenue(id);
            res.json(deletedVenue);
        } catch (error) {
            res.status(500).json({ message: "Failed to delete venue", error });
        }
    };
}

export const venueController = new VenueController();
