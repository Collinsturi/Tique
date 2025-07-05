import { Request, Response } from "express";
import { ticketTypeService } from "./ticketType.service";

export class TicketTypeController {
    getAll = async (req: Request, res: Response) => {
        if (req.query.eventId && isNaN(Number(req.query.eventId))) {
            return res.status(200).json({ message: "Invalid event ID" });
        }

        const eventId = req.query.eventId ? Number(req.query.eventId) : undefined;

        try {
            const ticketTypes = await ticketTypeService.getAll(eventId);
            return res.status(200).json(ticketTypes);
        } catch (error: any) {
            console.error("Error fetching ticket types:", error);
            return res.status(500).json({ message: "Failed to fetch ticket types", error: error.message });
        }
    }


    getById = async (req: Request, res: Response) => {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ticket type ID" });
        }

        try {
            const ticketType = await ticketTypeService.getById(id);
            if (!ticketType) return res.status(404).json({ message: "Ticket type not found" });
            return res.status(200).json(ticketType);
        } catch (error: any) {
            console.error(`Error fetching ticket type with ID ${id}:`, error);
            return res.status(500).json({ message: "Failed to fetch ticket type", error: error.message });
        }
    }

    create = async (req: Request, res: Response) => {
        try {
            const newTicketType = await ticketTypeService.create(req.body);
            return res.status(201).json(newTicketType);
        } catch (error: any) {
            console.error("Error creating ticket type:", error);
            return res.status(500).json({ message: "Failed to create ticket type", error: error.message });
        }
    }

    update = async (req: Request, res: Response) => {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ticket type ID" });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Update data cannot be empty" });
        }

        try {
            const updatedTicketType = await ticketTypeService.update(id, req.body);
            if (!updatedTicketType) return res.status(404).json({ message: "Ticket type not found" });
            return res.status(200).json(updatedTicketType);
        } catch (error: any) {
            console.error(`Error updating ticket type with ID ${id}:`, error);
            return res.status(500).json({ message: "Failed to update ticket type", error: error.message });
        }
    }


    delete = async (req: Request, res: Response) => {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ticket type ID" });
        }

        try {
            const deletedTicketType = await ticketTypeService.delete(id);
            if (!deletedTicketType) return res.status(404).json({ message: "Ticket type not found" });
            return res.status(200).json({ message: "Ticket type deleted successfully", ticket: deletedTicketType });
        } catch (error: any) {
            console.error(`Error deleting ticket type with ID ${id}:`, error);
            return res.status(500).json({ message: "Failed to delete ticket type", error: error.message });
        }
    }
}

export const ticketTypeController = new TicketTypeController();
