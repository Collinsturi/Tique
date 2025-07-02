import { Request, Response } from "express";
import { paymentService } from "./payment.service";

export class PaymentController {
    async getAll(req: Request, res: Response) {
        try {
            const payments = await paymentService.getAll();
            res.json(payments);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch payments", error });
        }
    }

    async getById(req: Request, res: Response) {
        const id = Number(req.params.id);

        try {
            const payment = await paymentService.getById(id);
            if (!payment) return res.status(404).json({ message: "Payment not found" });
            res.json(payment);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch payment", error });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const newPayment = await paymentService.create(req.body);
            res.status(201).json(newPayment);
        } catch (error) {
            res.status(500).json({ message: "Failed to create payment", error });
        }
    }

    async update(req: Request, res: Response) {
        const id = Number(req.params.id);

        try {
            const updatedPayment = await paymentService.update(id, req.body);
            res.json(updatedPayment);
        } catch (error) {
            res.status(500).json({ message: "Failed to update payment", error });
        }
    }

    async delete(req: Request, res: Response) {
        const id = Number(req.params.id);

        try {
            const deletedPayment = await paymentService.delete(id);
            res.json(deletedPayment);
        } catch (error) {
            res.status(500).json({ message: "Failed to delete payment", error });
        }
    }
}

export const paymentController = new PaymentController();
