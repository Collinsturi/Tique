import { Request, Response } from "express";
import { ticketService } from "../services/ticket.service";

export class TicketController {
    async getAll(req: Request, res: Response) {
        const filters = {
            eventId: req.query.eventId ? Number(req.query.eventId) : undefined,
            userId: req.query.userId ? Number(req.query.userId) : undefined,
            isScanned: req.query.isScanned ? req.query.isScanned === 'true' : undefined,
        };

        try {
            const tickets = await ticketService.getAllTickets(filters);
            res.json(tickets);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch tickets", error });
        }
    }

    async getById(req: Request, res: Response) {
        const id = Number(req.params.id);
        try {
            const ticket = await ticketService.getTicketById(id);
            if (!ticket) return res.status(404).json({ message: "Ticket not found" });
            res.json(ticket);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch ticket", error });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const newTicket = await ticketService.createTicket(req.body);
            res.status(201).json(newTicket);
        } catch (error) {
            res.status(500).json({ message: "Failed to create ticket", error });
        }
    }

    async scan(req: Request, res: Response) {
        const id = Number(req.params.id);
        const scannedByUser = Number(req.body.scannedByUser);

        try {
            const updatedTicket = await ticketService.scanTicket(id, scannedByUser);
            res.json(updatedTicket);
        } catch (error) {
            res.status(500).json({ message: "Failed to scan ticket", error });
        }
    }

    async delete(req: Request, res: Response) {
        const id = Number(req.params.id);
        try {
            const deletedTicket = await ticketService.deleteTicket(id);
            res.json(deletedTicket);
        } catch (error) {
            res.status(500).json({ message: "Failed to delete ticket", error });
        }
    }
}

export const ticketController = new TicketController();
