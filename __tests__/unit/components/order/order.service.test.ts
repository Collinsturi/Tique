import { OrderService } from '../../../../src/components/order/order.service';
import db from '../../../../src/drizzle/db';

jest.mock('../../../../src/drizzle/db');

describe('OrderService', () => {
    let orderService: OrderService;

    beforeEach(() => {
        orderService = new OrderService();
        jest.clearAllMocks();
    });

    describe('getAllOrders', () => {
        it('should fetch all orders successfully', async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockResolvedValue([{ id: 1 }])
            });

            const orders = await orderService.getAllOrders();
            expect(orders).toEqual([{ id: 1 }]);
        });

        it('should handle database errors', async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockRejectedValue(new Error('DB Error'))
            });

            await expect(orderService.getAllOrders()).rejects.toThrow('Failed to fetch orders');
        });
    });

    describe('getOrderById', () => {
        it('should return an order with its items', async () => {
            (db.select as jest.Mock)
                .mockReturnValueOnce({
                    from: jest.fn().mockReturnValueOnce({
                        where: jest.fn().mockResolvedValueOnce([{ id: 1 }])
                    })
                })
                .mockReturnValueOnce({
                    from: jest.fn().mockReturnValueOnce({
                        where: jest.fn().mockResolvedValueOnce([{ item: 'Item 1' }])
                    })
                });

            const result = await orderService.getOrderById(1);

            expect(result).toEqual({
                order: { id: 1 },
                items: [{ item: 'Item 1' }]
            });
        });

        it('should return null if order is not found', async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockResolvedValueOnce([])
                })
            });

            const result = await orderService.getOrderById(1);
            expect(result).toBeNull();
        });

        it('should throw error on database failure', async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockRejectedValueOnce(new Error('DB Error'))
                })
            });

            await expect(orderService.getOrderById(1)).rejects.toThrow('Failed to fetch order');
        });

        it('should throw error for invalid ID', async () => {
            await expect(orderService.getOrderById(NaN)).rejects.toThrow('Invalid order ID');
        });
    });

    describe('createOrder', () => {
        it('should create a new order with items', async () => {
            const orderData = { customerName: 'John Doe' };
            const orderItems = [{ productName: 'Product 1', quantity: 2 }];

            (db.insert as jest.Mock)
                .mockReturnValueOnce({ values: jest.fn().mockReturnValueOnce({ returning: jest.fn().mockResolvedValueOnce([{ id: 1 }]) }) })
                .mockReturnValueOnce({ values: jest.fn().mockResolvedValueOnce([]) });

            const getOrderByIdSpy = jest.spyOn(orderService, 'getOrderById').mockResolvedValue({ order: { id: 1 }, items: orderItems } as any);

            const result = await orderService.createOrder(orderData as any, orderItems as any);

            expect(result).toEqual({ order: { id: 1 }, items: orderItems });
            expect(getOrderByIdSpy).toHaveBeenCalledWith(1);
        });

        it('should throw an error if order or items are missing', async () => {
            await expect(orderService.createOrder(null as any, [] as any)).rejects.toThrow('Order and order items are required');
        });

        it('should throw an error if database fails', async () => {
            (db.insert as jest.Mock).mockReturnValueOnce({
                values: jest.fn().mockReturnValueOnce({
                    returning: jest.fn().mockRejectedValueOnce(new Error('DB Error'))
                })
            });

            const orderData = { customerName: 'John Doe' };
            const orderItems = [{ productName: 'Product 1', quantity: 2 }];

            await expect(orderService.createOrder(orderData as any, orderItems as any)).rejects.toThrow('Failed to create order');
        });
    });

    describe('updateOrder', () => {
        it('should update an order successfully', async () => {
            (db.update as jest.Mock).mockReturnValueOnce({
                set: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        returning: jest.fn().mockResolvedValueOnce([{ id: 1, status: 'Updated' }])
                    })
                })
            });

            const result = await orderService.updateOrder(1, { status: 'Updated' });
            expect(result).toEqual({ id: 1, status: 'Updated' });
        });

        it('should throw error if no update fields provided', async () => {
            await expect(orderService.updateOrder(1, {})).rejects.toThrow('No fields provided for update');
        });

        it('should throw error if order not found for update', async () => {
            (db.update as jest.Mock).mockReturnValueOnce({
                set: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        returning: jest.fn().mockResolvedValueOnce([])
                    })
                })
            });

            await expect(orderService.updateOrder(1, { status: 'Updated' })).rejects.toThrow('Order with ID 1 not found');
        });

        it('should handle database errors on update', async () => {
            (db.update as jest.Mock).mockReturnValueOnce({
                set: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        returning: jest.fn().mockRejectedValueOnce(new Error('DB Error'))
                    })
                })
            });

            await expect(orderService.updateOrder(1, { status: 'Updated' })).rejects.toThrow('Failed to update order');
        });
    });

    describe('deleteOrder', () => {
        it('should delete an order successfully', async () => {
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockResolvedValueOnce([{ id: 1 }])
                })
            });

            (db.delete as jest.Mock)
                .mockReturnValueOnce({ where: jest.fn().mockResolvedValueOnce([]) }) // delete OrderItems
                .mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        returning: jest.fn().mockResolvedValueOnce([{ id: 1 }])
                    })
                });

            const result = await orderService.deleteOrder(1);
            expect(result).toEqual({ id: 1 });
        });

        it('should return null if order not found', async () => {
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockResolvedValueOnce([])
                })
            });

            const result = await orderService.deleteOrder(1);
            expect(result).toBeNull();
        });

        it('should throw error on database failure during delete', async () => {
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockRejectedValueOnce(new Error('DB Error'))
                })
            });

            await expect(orderService.deleteOrder(1)).rejects.toThrow('Failed to delete order');
        });

        it('should throw error for invalid order ID', async () => {
            await expect(orderService.deleteOrder(NaN)).rejects.toThrow('Invalid order ID');
        });
    });
});
