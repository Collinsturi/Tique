import { Request, Response } from "express";
import { eventService } from "./event.service";

export class EventController {
     getAll = async (req: Request, res: Response) => {
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

     getById = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        try {
            const event = await eventService.getEventById(id);
            if (!event) return res.status(404).json({ message: "Event not found" });
            res.json(event);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch event", error });
        }
    }

    create = async (req: Request, res: Response) => {
        try {
            const newEvent = await eventService.createEvent(req.body);
            res.status(201).json(newEvent);
        } catch (error) {
            res.status(500).json({ message: "Failed to create event", error });
        }
    }

    update = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        try {
            const updatedEvent = await eventService.updateEvent(id, req.body);
            res.json(updatedEvent);
        } catch (error) {
            res.status(500).json({ message: "Failed to update event", error });
        }
    }

     delete = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        try {
            const deletedEvent = await eventService.deleteEvent(id);
            res.json(deletedEvent);
        } catch (error) {
            res.status(500).json({ message: "Failed to delete event", error });
        }
    }

    getStaffAssignedEvents = async(req: Request, res: Response) => {
         const email: string = req.params.email;

         try{
             const events = await eventService.getStaffAssignedEvents(email);

             console.log(events);
             res.json(events);
         }catch(error){
             res.status(500).json({ message: "Failed to fetch events", error });
         }
    }

    getStaffScannedTickets = async(req: Request, res: Response) => {
         const email: string = req.params.email;

         try{
             const events = await eventService.getStaffScannedTickets(email);
             console.log(events);
             res.json(events);
         }catch(error){
             res.status(500).json({ message: "Failed to fetch events", error });
         }
    }
}

export const eventController = new EventController();
