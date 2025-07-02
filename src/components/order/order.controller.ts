import { Request, Response } from "express";
import { orderService } from "./order.service";

export class OrderController {
     getAll = async (req: Request, res: Response) => {
        try {
            const orders = await orderService.getAllOrders();
            res.json(orders);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch orders", error });
        }
    }

     getById = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        try {
            const order = await orderService.getOrderById(id);
            if (!order.order) return res.status(404).json({ message: "Order not found" });
            res.json(order);
        } catch (error) {
            res.status(500).json({ message: "Failed to fetch order", error });
        }
    }

     create = async (req: Request, res: Response) => {
        const { order, orderItems } = req.body;

        if (!order || !orderItems || !Array.isArray(orderItems)) {
            return res.status(400).json({ message: "Order and order items are required" });
        }

        try {
            const newOrder = await orderService.createOrder(order, orderItems);
            res.status(201).json(newOrder);
        } catch (error) {
            res.status(500).json({ message: "Failed to create order", error });
        }
    }

    update = async (req: Request, res: Response) => {
        const id = Number(req.params.id);

        try {
            const updatedOrder = await orderService.updateOrder(id, req.body);
            res.json(updatedOrder);
        } catch (error) {
            res.status(500).json({ message: "Failed to update order", error });
        }
    }

     delete = async (req: Request, res: Response) => {
        const id = Number(req.params.id);

        try {
            const deletedOrder = await orderService.deleteOrder(id);
            res.json(deletedOrder);
        } catch (error) {
            res.status(500).json({ message: "Failed to delete order", error });
        }
    }
}

export const orderController = new OrderController();
