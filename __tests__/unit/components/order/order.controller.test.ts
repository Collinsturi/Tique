import { OrderController } from "../../../../src/components/order/order.controller";
import { orderService } from "../../../../src/components/order/order.service";
import { Request, Response } from "express";

jest.mock("../../../../src/components/order/order.service");

describe("OrderController", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    const controller = new OrderController();

    beforeEach(() => {
        jest.clearAllMocks();

        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });

        res = {
            status: statusMock,
            json: jsonMock
        };
    });

    describe("getAll", () => {
        it("should return all orders", async () => {
            const mockOrders = [{ id: 1, name: "Order 1" }];
            (orderService.getAllOrders as jest.Mock).mockResolvedValue(mockOrders);

            await controller.getAll(req as Request, res as Response);

            expect(orderService.getAllOrders).toHaveBeenCalled();
            expect(jsonMock).toHaveBeenCalledWith(mockOrders);
        });

        it("should handle errors", async () => {
            (orderService.getAllOrders as jest.Mock).mockRejectedValue(new Error("DB error"));

            await controller.getAll(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Failed to fetch orders", error: "DB error" });
        });
    });

    describe("getById", () => {
        it("should return 400 for invalid ID", async () => {
            req = { params: { id: "abc" } };

            await controller.getById(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Invalid order ID" });
        });

        it("should return order by ID", async () => {
            req = { params: { id: "1" } };
            const mockOrder = { order: { id: 1 }, items: [] };
            (orderService.getOrderById as jest.Mock).mockResolvedValue(mockOrder);

            await controller.getById(req as Request, res as Response);

            expect(orderService.getOrderById).toHaveBeenCalledWith(1);
            expect(jsonMock).toHaveBeenCalledWith(mockOrder);
        });

        it("should return 404 if order not found", async () => {
            req = { params: { id: "1" } };
            (orderService.getOrderById as jest.Mock).mockResolvedValue(null);

            await controller.getById(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Order not found" });
        });

        it("should handle errors", async () => {
            req = { params: { id: "1" } };
            (orderService.getOrderById as jest.Mock).mockRejectedValue(new Error("Fetch error"));

            await controller.getById(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Failed to fetch order", error: "Fetch error" });
        });
    });

    describe("create", () => {
        it("should return 400 for invalid input", async () => {
            req = { body: {} };

            await controller.create(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Order and order items are required" });
        });

        it("should create a new order", async () => {
            req = { body: { order: { name: "Test Order" }, orderItems: [{ productId: 1, quantity: 2 }] } };
            const mockOrder = { id: 1, name: "Test Order" };
            (orderService.createOrder as jest.Mock).mockResolvedValue(mockOrder);

            await controller.create(req as Request, res as Response);

            expect(orderService.createOrder).toHaveBeenCalled();
            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(mockOrder);
        });

        it("should handle errors", async () => {
            req = { body: { order: { name: "Test Order" }, orderItems: [{ productId: 1, quantity: 2 }] } };
            (orderService.createOrder as jest.Mock).mockRejectedValue(new Error("Create error"));

            await controller.create(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Failed to create order", error: "Create error" });
        });
    });

    describe("update", () => {
        it("should return 400 for invalid ID", async () => {
            req = { params: { id: "abc" }, body: { status: "Shipped" } };

            await controller.update(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Invalid order ID" });
        });

        it("should return 400 for empty update data", async () => {
            req = { params: { id: "1" }, body: {} };

            await controller.update(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Update data cannot be empty" });
        });

        it("should return 200 if order not found", async () => {
            req = { params: { id: "1" }, body: { status: "Shipped" } };
            (orderService.getOrderById as jest.Mock).mockResolvedValue(null);

            await controller.update(req as Request, res as Response);

            expect(jsonMock).toHaveBeenCalledWith({ message: "Order not found" });
        });

        it("should update an order", async () => {
            req = { params: { id: "1" }, body: { status: "Shipped" } };
            (orderService.getOrderById as jest.Mock).mockResolvedValue({ order: { id: 1 } });
            const updatedOrder = { id: 1, status: "Shipped" };
            (orderService.updateOrder as jest.Mock).mockResolvedValue(updatedOrder);

            await controller.update(req as Request, res as Response);

            expect(orderService.updateOrder).toHaveBeenCalledWith(1, { status: "Shipped" });
            expect(jsonMock).toHaveBeenCalledWith(updatedOrder);
        });

        it("should handle errors", async () => {
            req = { params: { id: "1" }, body: { status: "Shipped" } };
            (orderService.getOrderById as jest.Mock).mockResolvedValue({ order: { id: 1 } });
            (orderService.updateOrder as jest.Mock).mockRejectedValue(new Error("Update error"));

            await controller.update(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Failed to update order" });
        });
    });

    describe("delete", () => {
        it("should return 400 for invalid ID", async () => {
            req = { params: { id: "abc" } };

            await controller.delete(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Invalid order ID" });
        });

        it("should return 404 if order not found", async () => {
            req = { params: { id: "1" } };
            (orderService.deleteOrder as jest.Mock).mockResolvedValue(null);

            await controller.delete(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Order not found" });
        });

        it("should delete an order", async () => {
            req = { params: { id: "1" } };
            const deletedOrder = { id: 1 };
            (orderService.deleteOrder as jest.Mock).mockResolvedValue(deletedOrder);

            await controller.delete(req as Request, res as Response);

            expect(jsonMock).toHaveBeenCalledWith({ message: "Order deleted successfully", deletedOrder });
        });

        it("should handle errors", async () => {
            req = { params: { id: "1" } };
            (orderService.deleteOrder as jest.Mock).mockRejectedValue(new Error("Delete error"));

            await controller.delete(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({ message: "Failed to delete order", error: "Delete error" });
        });
    });
});
