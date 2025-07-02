import { Request, Response } from "express";
import { ticketTypeService } from "./ticketType.service";

export class TicketTypeController {
     getAll = async (req: Request, res: Response) => {
        const eventId = req.query.eventId ? Number(req.query.eventId) : undefined;

        try {
            const ticketTypes = await ticketTypeService.getAll(eventId);
            res.json(ticketTypes);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch ticket types", error });
        }
    }

     getById = async (req: Request, res: Response) => {
        const id = Number(req.params.id);

        try {
            const ticketType = await ticketTypeService.getById(id);
            if (!ticketType) return res.status(404).json({ message: "Ticket type not found" });
            res.json(ticketType);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch ticket type", error });
        }
    }

     create = async (req: Request, res: Response) => {
        try {
            const newTicketType = await ticketTypeService.create(req.body);
            res.status(201).json(newTicketType);
        } catch (error) {
            res.status(500).json({ message: "Failed to create ticket type", error });
        }
    }

     update = async (req: Request, res: Response) => {
        const id = Number(req.params.id);

        try {
            const updatedTicketType = await ticketTypeService.update(id, req.body);
            res.json(updatedTicketType);
        } catch (error) {
            res.status(500).json({ message: "Failed to update ticket type", error });
        }
    }

     delete = async (req: Request, res: Response) => {
        const id = Number(req.params.id);

        try {
            const deletedTicketType = await ticketTypeService.delete(id);
            res.json(deletedTicketType);
        } catch (error) {
            res.status(500).json({ message: "Failed to delete ticket type", error });
        }
    }
}

export const ticketTypeController = new TicketTypeController();
