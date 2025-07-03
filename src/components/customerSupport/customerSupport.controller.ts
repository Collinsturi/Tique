import { Request, Response } from "express";
import { customerSupportService } from "./customerSupport.service";

export class CustomerSupportController {
    getAll = async (req: Request, res: Response) => {
        try {
            const tickets = await customerSupportService.getAll();
            if (!tickets.length) {
                return res.status(200).json({ message: "No support tickets found." });
            }
            return res.status(200).json(tickets);
        } catch (error: any) {
            console.error("Error fetching support tickets:", error);
            return res.status(500).json({ message: "Failed to fetch support tickets", error: error.message });
        }
    }

    getById = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ticket ID" });
        }

        try {
            const ticket = await customerSupportService.getById(id);
            if (!ticket) {
                return res.status(200).json({ message: "Support ticket not found" });
            }
            return res.status(200).json(ticket);
        } catch (error: any) {
            console.error(`Error fetching support ticket with ID ${id}:`, error);
            return res.status(500).json({ message: "Failed to fetch support ticket", error: error.message });
        }
    }

    create = async (req: Request, res: Response) => {
        try {
            const newTicket = await customerSupportService.create(req.body);
            return res.status(201).json(newTicket);
        } catch (error: any) {
            console.error("Error creating support ticket:", error);
            return res.status(500).json({ message: "Failed to create support ticket", error: error.message });
        }
    }

    update = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ticket ID" });
        }

        try {
            const updatedTicket = await customerSupportService.update(id, req.body);
            if (!updatedTicket) {
                return res.status(200).json({ message: "Support ticket not found" });
            }
            return res.status(200).json(updatedTicket);
        } catch (error: any) {
            console.error(`Error updating support ticket with ID ${id}:`, error);
            return res.status(500).json({ message: "Failed to update support ticket", error: error.message });
        }
    }

    delete = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid ticket ID" });
        }

        try {
            const deletedTicket = await customerSupportService.delete(id);
            if (!deletedTicket) {
                return res.status(200).json({ message: "Support ticket not found" });
            }
            return res.status(200).json({ message: "Support ticket deleted successfully", ticket: deletedTicket });
        } catch (error: any) {
            console.error(`Error deleting support ticket with ID ${id}:`, error);
            return res.status(500).json({ message: "Failed to delete support ticket", error: error.message });
        }
    }
}

export const customerSupportController = new CustomerSupportController();
