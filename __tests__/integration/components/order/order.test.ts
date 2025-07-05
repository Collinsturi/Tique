import request from 'supertest';
import app from '../../../../src/index';
import { orderService } from '../../../../src/components/order/order.service';

// Mock the orderService
jest.mock('../../../../src/components/order/order.service');
const mockOrderService = orderService as jest.Mocked<typeof orderService>;

describe('Order Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockOrder = {
        id: 1,
        userId: 2,
        totalAmount: 500,
        status: 'pending',
    };

    const mockOrderWithItems = {
        order: mockOrder,
        orderItems: [
            { id: 1, orderId: 1, productId: 10, quantity: 2, price: 100 },
            { id: 2, orderId: 1, productId: 11, quantity: 3, price: 100 }
        ]
    };

    describe('GET /orders', () => {
        it('should return all orders', async () => {
            mockOrderService.getAllOrders.mockResolvedValue([mockOrderWithItems]);

            const res = await request(app).get('/api/orders');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([mockOrderWithItems]);
            expect(mockOrderService.getAllOrders).toHaveBeenCalled();
        });

        it('should return 500 if service fails', async () => {
            mockOrderService.getAllOrders.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get('/api/orders');

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Failed to fetch orders');
        });
    });

    describe('GET /orders/:id', () => {
        it('should return order by ID', async () => {
            mockOrderService.getOrderById.mockResolvedValue(mockOrderWithItems);

            const res = await request(app).get(`/api/orders/${mockOrder.id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockOrderWithItems);
            expect(mockOrderService.getOrderById).toHaveBeenCalledWith(mockOrder.id);
        });

        it('should return 404 if order not found', async () => {
            mockOrderService.getOrderById.mockResolvedValue(null);

            const res = await request(app).get('/api/orders/999');

            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual({ message: 'Order not found' });
        });

        it('should return 400 for invalid order ID', async () => {
            const res = await request(app).get('/api/orders/abc');

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ message: 'Invalid order ID' });
        });

        it('should return 500 if service fails', async () => {
            mockOrderService.getOrderById.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get(`/api/orders/${mockOrder.id}`);

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Failed to fetch order');
        });
    });

    describe('POST /orders', () => {
        it('should create a new order', async () => {
            mockOrderService.createOrder.mockResolvedValue(mockOrderWithItems);

            const res = await request(app)
                .post('/api/orders')
                .send({
                    order: mockOrder,
                    orderItems: mockOrderWithItems.orderItems
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(mockOrderWithItems);
            expect(mockOrderService.createOrder).toHaveBeenCalledWith(mockOrder, mockOrderWithItems.orderItems);
        });

        it('should return 400 if order or orderItems are missing', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ message: 'Order and order items are required' });
        });

        it('should return 500 if service fails', async () => {
            mockOrderService.createOrder.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .post('/api/orders')
                .send({
                    order: mockOrder,
                    orderItems: mockOrderWithItems.orderItems
                });

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Failed to create order');
        });
    });

    describe('PATCH /orders/:id', () => {
        it('should update an existing order', async () => {
            const updatedOrder = { ...mockOrderWithItems, order: { ...mockOrder, status: 'completed' } };

            mockOrderService.getOrderById.mockResolvedValue(mockOrderWithItems);
            mockOrderService.updateOrder.mockResolvedValue(updatedOrder);

            const res = await request(app)
                .patch(`/api/orders/${mockOrder.id}`)
                .send({ status: 'completed' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(updatedOrder);
            expect(mockOrderService.getOrderById).toHaveBeenCalledWith(mockOrder.id);
            expect(mockOrderService.updateOrder).toHaveBeenCalledWith(mockOrder.id, { status: 'completed' });
        });

        it('should return 400 if ID is invalid', async () => {
            const res = await request(app)
                .patch('/api/orders/abc')
                .send({ status: 'completed' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ message: 'Invalid order ID' });
        });

        it('should return 400 if update body is empty', async () => {
            const res = await request(app)
                .patch(`/api/orders/${mockOrder.id}`)
                .send({});

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ message: 'Update data cannot be empty' });
        });

        it('should return 200 if order not found', async () => {
            mockOrderService.getOrderById.mockResolvedValue(null);

            const res = await request(app)
                .patch(`/api/orders/${mockOrder.id}`)
                .send({ status: 'completed' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: 'Order not found' });
        });

        it('should return 500 if service fails', async () => {
            mockOrderService.getOrderById.mockResolvedValue(mockOrderWithItems);
            mockOrderService.updateOrder.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .patch(`/api/orders/${mockOrder.id}`)
                .send({ status: 'completed' });

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Failed to update order');
        });
    });

    describe('DELETE /orders/:id', () => {
        it('should delete an order', async () => {
            mockOrderService.deleteOrder.mockResolvedValue(mockOrderWithItems);

            const res = await request(app).delete(`/api/orders/${mockOrder.id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: 'Order deleted successfully', deletedOrder: mockOrderWithItems });
            expect(mockOrderService.deleteOrder).toHaveBeenCalledWith(mockOrder.id);
        });

        it('should return 404 if order not found', async () => {
            mockOrderService.deleteOrder.mockResolvedValue(null);

            const res = await request(app).delete('/api/orders/999');

            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual({ message: 'Order not found' });
        });

        it('should return 400 if ID is invalid', async () => {
            const res = await request(app).delete('/api/orders/abc');

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ message: 'Invalid order ID' });
        });

        it('should return 500 if service fails', async () => {
            mockOrderService.deleteOrder.mockRejectedValue(new Error('Database error'));

            const res = await request(app).delete(`/api/orders/${mockOrder.id}`);

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Failed to delete order');
        });
    });
});
