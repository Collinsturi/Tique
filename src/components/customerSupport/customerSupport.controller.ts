import { Request, Response } from "express";
import { customerSupportService } from "./customerSupport.service";

export class CustomerSupportController {
    getAll = async (req: Request, res: Response) => {
        try {
            const tickets = await customerSupportService.getAll();
            res.json(tickets);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch support tickets", error });
        }
    }

    getById = async (req: Request, res: Response) => {
        const id = Number(req.params.id);

        try {
            const ticket = await customerSupportService.getById(id);
            if (!ticket) return res.status(404).json({ message: "Support ticket not found" });
            res.json(ticket);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch support ticket", error });
        }
    }

    create = async (req: Request, res: Response) => {
        try {
            const newTicket = await customerSupportService.create(req.body);
            res.status(201).json(newTicket);
        } catch (error) {
            res.status(500).json({ message: "Failed to create support ticket", error });
        }
    }

    update = async (req: Request, res: Response) => {
        const id = Number(req.params.id);

        try {
            const updatedTicket = await customerSupportService.update(id, req.body);
            res.json(updatedTicket);
        } catch (error) {
            res.status(500).json({ message: "Failed to update support ticket", error });
        }
    }

     delete = async (req: Request, res: Response) => {
        const id = Number(req.params.id);

        try {
            const deletedTicket = await customerSupportService.delete(id);
            res.json(deletedTicket);
        } catch (error) {
            res.status(500).json({ message: "Failed to delete support ticket", error });
        }
    }
}

export const customerSupportController = new CustomerSupportController();
