import { Request, Response } from "express";
import { ticketService } from "./ticket.service";

export class TicketController {

    getAll = async (req: Request, res: Response) => {
        const filters = {
            eventId: req.query.eventId ? Number(req.query.eventId) : undefined,
            userId: req.query.userId ? Number(req.query.userId) : undefined,
            isScanned: req.query.isScanned ? req.query.isScanned === 'true' : undefined,
        };

        try {
            const tickets = await ticketService.getAllTickets(filters);
            res.json(tickets);
        } catch (error: any) {
            console.error("Error fetching tickets:", error);
            res.status(500).json({ message: "Failed to fetch tickets" });
        }
    }

    getById = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "Invalid ticket ID" });

        try {
            const ticket = await ticketService.getTicketById(id);
            res.json(ticket);
        } catch (error: any) {
            console.error(`Error fetching ticket with ID ${id}:`, error);
            res.status(404).json({ message: error.message || "Ticket not found" });
        }
    }

    create = async (req: Request, res: Response) => {
        try {
            const { orderItemId, userId, eventId, ticketTypeId } = req.body;

            // Validate required fields
            if (!orderItemId || !userId || !eventId || !ticketTypeId) {
                return res.status(400).json({ message: "Missing required ticket fields" });
            }

            // Only pass required fields to service
            const ticketData = { orderItemId, userId, eventId, ticketTypeId };

            const newTicket = await ticketService.createTicket(ticketData);
            res.status(201).json(newTicket);
        } catch (error: any) {
            console.error("Error creating ticket:", error);
            res.status(400).json({ message: error.message || "Failed to create ticket" });
        }
    }

    scan = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        const scannedByUser = Number(req.body.scannedByUser);

        if (isNaN(id) || isNaN(scannedByUser)) {
            return res.status(400).json({ message: "Invalid ticket ID or scannedByUser" });
        }

        try {
            const updatedTicket = await ticketService.scanTicket(id, scannedByUser);
            res.json(updatedTicket);
        } catch (error: any) {
            console.error(`Error scanning ticket with ID ${id}:`, error);
            res.status(400).json({ message: error.message || "Failed to scan ticket" });
        }
    }

    delete = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "Invalid ticket ID" });

        try {
            const deletedTicket = await ticketService.deleteTicket(id);
            res.json(deletedTicket);
        } catch (error: any) {
            console.error(`Error deleting ticket with ID ${id}:`, error);
            res.status(404).json({ message: error.message || "Failed to delete ticket" });
        }
    }

    getByUserid = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) return res.status(400).json({ message: "Invalid user ID" });

        try{
            const tickets = await ticketService.getByUserid(id);
            res.json(tickets);
        }catch(error: any) {
            console.error(`Error getting tickets with user ID ${id}:`, error);
            res.status(200).json({ message: error.message || "Failed to get tickets" });
        }
    }
    overrideTicket = async (req: Request, res: Response) => {
        const ticketCode = req.body.ticketCode;
        const reasonForOverride = req.body.reasonForOverride;
        const email = req.body.staffEmail;

        try {
            await ticketService.overrideTicket(ticketCode, reasonForOverride, email);
        }catch(error: any) {
            console.error(`Error override ticket with ID ${ticketCode}:`, error);
            res.status(500).json({ message: error.message || "Failed to override ticket" });
        }
    }
}

export const ticketController = new TicketController();
