import { Request, Response } from "express";
import { orderService } from "./order.service";

export class OrderController {
    getAll = async (req: Request, res: Response) => {
        try {
            const orders = await orderService.getAllOrders();
            return res.json(orders);
        } catch (error: any) {
            console.error("Error fetching orders:", error);
            return res.status(500).json({ message: "Failed to fetch orders", error: error.message });
        }
    }

    getById = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid order ID" });
        }

        try {
            const order = await orderService.getOrderById(id);
            if (!order || !order.order) {
                return res.status(404).json({ message: "Order not found" });
            }
            return res.json(order);
        } catch (error: any) {
            console.error(`Error fetching order with ID ${id}:`, error);
            return res.status(500).json({ message: "Failed to fetch order", error: error.message });
        }
    }

    create = async (req: Request, res: Response) => {
        const { order, orderItems } = req.body;

        if (!order || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ message: "Order and order items are required" });
        }

        try {
            const newOrder = await orderService.createOrder(order, orderItems);
            return res.status(201).json(newOrder);
        } catch (error: any) {
            console.error("Error creating order:", error);
            return res.status(500).json({ message: "Failed to create order", error: error.message });
        }
    }

    update = async (req: Request, res: Response) => {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid order ID" });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Update data cannot be empty" });
        }

        try {
            const updatedCarExists = await orderService.getOrderById(id);

            if (!updatedCarExists || !updatedCarExists.order) {
                return res.status(200).json({ message: "Order not found" });
            }

            const updatedOrder = await orderService.updateOrder(id, req.body);

            return res.json(updatedOrder);
        } catch (error: any) {
            console.error(`Error updating order with ID ${id}:`, error);
            return res.status(500).json({ message: "Failed to update order" });
        }
    }


    delete = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid order ID" });
        }

        try {
            const deletedOrder = await orderService.deleteOrder(id);

            if (!deletedOrder) {
                return res.status(404).json({ message: "Order not found" });
            }

            return res.json({ message: "Order deleted successfully", deletedOrder });
        } catch (error: any) {
            console.error(`Error deleting order with ID ${id}:`, error);
            return res.status(500).json({ message: "Failed to delete order", error: error.message });
        }
    }
}

export const orderController = new OrderController();
