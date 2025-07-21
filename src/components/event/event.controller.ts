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

    getUpcomingEvents = async(req: Request, res: Response) => {
         const email: string = req.params.email;

         try {
             const upcomingEvents = await eventService.getUpcomingEvents(email);

             if(upcomingEvents.length > 0){
                 res.json(upcomingEvents);
             }
             res.status(200).json({message: "No upcoming events found."});

         }catch(error){
             res.status(500).json({ message: "Failed to fetch events", error });
         }
    }

    assignStaff = async (req: Request, res: Response) => {
        try {
            const email: string = req.params.email;
            const staffEmails: string[] = req.body.staffEmails; // expects: { staffEmails: ["a@a.com", "b@b.com"], eventId: 2 }
            const eventId: number = Number(req.body.eventId);

            if (!Array.isArray(staffEmails) || staffEmails.length === 0) {
                return res.status(400).json({ message: "No staff emails provided." });
            }

            if (isNaN(eventId)) {
                return res.status(400).json({ message: "Invalid event ID." });
            }

            await eventService.assignStaff(email, staffEmails, eventId);

            return res.status(200).json({ message: "Staff assigned successfully." });

        } catch (error) {
            console.error("Assign staff error:", error);
            return res.status(500).json({ message: "Failed to assign staff.", error: (error as Error).message });
        }
    };

    getCurrentOrganizerEvents = async(req: Request, res: Response) => {
        const email: string = req.params.email;

        try{
            const events = await eventService.getCurrentOrganizerEvents(email);
            res.json(events);
        }catch(error){
            console.error("Assign staff error:", error);
            return res.status(500).json({ message: "Failed to assign staff.", error: (error as Error).message });
        }
    }

    getPastOrganizerEvents = async (req: Request, res: Response) => {
        const email: string = req.params.email;

        try {
            const events = await eventService.getPastOrganizerEvents(email);
            res.json(events);
        }catch(error){
            console.error("Past events error:", error);
            return res.status(500).json({ message: "Failed to get past events.", error: (error as Error).message });
        }
    }

    getAvailableStaff = async(req: Request, res: Response) => {
        try{
            const availableStaff = await eventService.getAvailableStaff();

            res.json(availableStaff);
        }catch(error){
            console.error("Available staff error:", error);
            return res.status(500).json({ message: "Failed to get available staff.", error: (error as Error).message });

        }
    }

     unassignStaff = async (req: Request, res: Response) => {
        const { email: organizerEmail } = req.params; // Organizer email from URL
        const { staffEmails, eventId } = req.body; // Expecting staffEmails (array) and eventId in body

        if (!staffEmails || !Array.isArray(staffEmails) || staffEmails.length === 0 || !eventId) {
            return res.status(400).json({ message: 'Invalid request body: staffEmails (array) and eventId are required.' });
        }

        try {
            await eventService.unassignStaffFromEvent(eventId, staffEmails, organizerEmail);
            res.status(200).json({ message: 'Staff successfully unassigned from event.' });
        } catch (error: any) {
            console.error(`Error unassigning staff: ${error.message}`);
            res.status(500).json({ message: error.message || 'Failed to unassign staff.' });
        }
    };

     getOrganizerAssignedStaff = async (req: Request, res: Response) => {
        const { email: organizerEmail } = req.params; // Organizer email from URL
        const { eventId } = req.query; // Expecting eventId as a query parameter

        if (!eventId) {
            return res.status(400).json({ message: 'Event ID is required as a query parameter.' });
        }

        try {
            const assignedStaff = await eventService.getAssignedStaffForEvent(parseInt(eventId as string), organizerEmail);
            res.status(200).json(assignedStaff);
        } catch (error: any) {
            console.error(`Error fetching assigned staff: ${error.message}`);
            res.status(500).json({ message: error.message || 'Failed to fetch assigned staff.' });
        }
    };
}

export const eventController = new EventController();
