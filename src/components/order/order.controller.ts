import { Request, Response } from "express";
import { orderService } from "./order.service";
import { OrderItemInsert } from "../../drizzle/schema";

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

        const { userId, orderItems }: { userId: number, orderItems: OrderItemInsert[] } = req.body;

        if (!userId || !orderItems || !Array.isArray(orderItems) || orderItems.length === 0) {
            return res.status(400).json({ message: "User ID and order items are required to create an order." });
        }

        try {
            const newOrder = await orderService.createOrder(userId, orderItems);
            return res.status(201).json({ message: "Order created successfully. Pending payment.", order: newOrder });
        } catch (error: any) {
            console.error("Error creating order:", error);
            // Provide more specific error messages to the client
            if (error.message.includes("Not enough tickets available")) {
                return res.status(409).json({ message: error.message }); // Conflict
            }
            if (error.message.includes("Ticket type with ID")) {
                return res.status(404).json({ message: error.message }); // Not Found
            }
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
            const updatedOrder = await orderService.updateOrder(id, req.body);

            if (!updatedOrder) {
                return res.status(404).json({ message: "Order not found or no changes applied." });
            }

            return res.json({ message: "Order updated successfully", updatedOrder });
        } catch (error: any) {
            console.error(`Error updating order with ID ${id}:`, error);
            return res.status(500).json({ message: "Failed to update order", error: error.message });
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
