import { Request, Response } from "express";
import { eventService } from "../services/event.service";

export class EventController {
    async getAll(req: Request, res: Response) {
        const filters = {
            venueId: req.query.venueId ? Number(req.query.venueId) : undefined,
            category: req.query.category as string | undefined,
            date: req.query.date as string | undefined,
        };

        try {
            const events = await eventService.getAllEvents(filters);
            res.json(events);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch events", error });
        }
    }

    async getById(req: Request, res: Response) {
        const id = Number(req.params.id);
        try {
            const event = await eventService.getEventById(id);
            if (!event) return res.status(404).json({ message: "Event not found" });
            res.json(event);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch event", error });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const newEvent = await eventService.createEvent(req.body);
            res.status(201).json(newEvent);
        } catch (error) {
            res.status(500).json({ message: "Failed to create event", error });
        }
    }

    async update(req: Request, res: Response) {
        const id = Number(req.params.id);
        try {
            const updatedEvent = await eventService.updateEvent(id, req.body);
            res.json(updatedEvent);
        } catch (error) {
            res.status(500).json({ message: "Failed to update event", error });
        }
    }

    async delete(req: Request, res: Response) {
        const id = Number(req.params.id);
        try {
            const deletedEvent = await eventService.deleteEvent(id);
            res.json(deletedEvent);
        } catch (error) {
            res.status(500).json({ message: "Failed to delete event", error });
        }
    }
}

export const eventController = new EventController();
