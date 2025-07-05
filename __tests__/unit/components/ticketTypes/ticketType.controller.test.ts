import { TicketTypeController } from '../../../../src/components/ticketTypes/ticketType.controller';
import { ticketTypeService } from '../../../../src/components/ticketTypes/ticketType.service';
import { Request, Response } from 'express';

jest.mock('../../../../src/components/ticketTypes/ticketType.service');

describe('TicketTypeController', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    const controller = new TicketTypeController();

    beforeEach(() => {
        jest.clearAllMocks();
        jsonMock = jest.fn();
        statusMock = jest.fn().mockReturnValue({ json: jsonMock });
        req = {};
        res = { status: statusMock, json: jsonMock };
    });

    describe('getAll', () => {
        it('should return 200 for invalid event ID', async () => {
            req.query = { eventId: 'invalid' };

            await controller.getAll(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Invalid event ID' });
        });

        it('should return ticket types successfully', async () => {
            const mockTicketTypes = [{ id: 1, typeName: 'VIP' }];
            (ticketTypeService.getAll as jest.Mock).mockResolvedValue(mockTicketTypes);

            req.query = { eventId: '1' };

            await controller.getAll(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(mockTicketTypes);
        });

        it('should handle service errors', async () => {
            (ticketTypeService.getAll as jest.Mock).mockRejectedValue(new Error('Service error'));

            req.query = { eventId: '1' };

            await controller.getAll(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Failed to fetch ticket types',
                error: 'Service error'
            });
        });
    });

    describe('getById', () => {
        it('should return 400 for invalid ID', async () => {
            req.params = { id: 'abc' };

            await controller.getById(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Invalid ticket type ID' });
        });

        it('should return 404 if ticket type not found', async () => {
            (ticketTypeService.getById as jest.Mock).mockResolvedValue(null);

            req.params = { id: '1' };

            await controller.getById(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Ticket type not found' });
        });

        it('should return ticket type successfully', async () => {
            const ticketType = { id: 1, typeName: 'VIP' };
            (ticketTypeService.getById as jest.Mock).mockResolvedValue(ticketType);

            req.params = { id: '1' };

            await controller.getById(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(ticketType);
        });

        it('should handle service errors', async () => {
            (ticketTypeService.getById as jest.Mock).mockRejectedValue(new Error('Service error'));

            req.params = { id: '1' };

            await controller.getById(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Failed to fetch ticket type',
                error: 'Service error'
            });
        });
    });

    describe('create', () => {
        it('should create ticket type successfully', async () => {
            const newTicketType = { id: 1, typeName: 'VIP' };
            (ticketTypeService.create as jest.Mock).mockResolvedValue(newTicketType);

            req.body = { typeName: 'VIP' };

            await controller.create(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(201);
            expect(jsonMock).toHaveBeenCalledWith(newTicketType);
        });

        it('should handle service errors', async () => {
            (ticketTypeService.create as jest.Mock).mockRejectedValue(new Error('Service error'));

            req.body = { typeName: 'VIP' };

            await controller.create(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Failed to create ticket type',
                error: 'Service error'
            });
        });
    });

    describe('update', () => {
        it('should return 400 for invalid ID', async () => {
            req.params = { id: 'abc' };
            req.body = { typeName: 'Updated' };

            await controller.update(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Invalid ticket type ID' });
        });

        it('should return 400 for empty update data', async () => {
            req.params = { id: '1' };
            req.body = {};

            await controller.update(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Update data cannot be empty' });
        });

        it('should return 404 if ticket type not found', async () => {
            (ticketTypeService.update as jest.Mock).mockResolvedValue(null);

            req.params = { id: '1' };
            req.body = { typeName: 'Updated' };

            await controller.update(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Ticket type not found' });
        });

        it('should update ticket type successfully', async () => {
            const updatedTicketType = { id: 1, typeName: 'Updated' };
            (ticketTypeService.update as jest.Mock).mockResolvedValue(updatedTicketType);

            req.params = { id: '1' };
            req.body = { typeName: 'Updated' };

            await controller.update(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith(updatedTicketType);
        });

        it('should handle service errors', async () => {
            (ticketTypeService.update as jest.Mock).mockRejectedValue(new Error('Service error'));

            req.params = { id: '1' };
            req.body = { typeName: 'Updated' };

            await controller.update(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Failed to update ticket type',
                error: 'Service error'
            });
        });
    });

    describe('delete', () => {
        it('should return 400 for invalid ID', async () => {
            req.params = { id: 'abc' };

            await controller.delete(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(400);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Invalid ticket type ID' });
        });

        it('should return 404 if ticket type not found', async () => {
            (ticketTypeService.delete as jest.Mock).mockResolvedValue(null);

            req.params = { id: '1' };

            await controller.delete(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(404);
            expect(jsonMock).toHaveBeenCalledWith({ message: 'Ticket type not found' });
        });

        it('should delete ticket type successfully', async () => {
            const deletedTicketType = { id: 1, typeName: 'VIP' };
            (ticketTypeService.delete as jest.Mock).mockResolvedValue(deletedTicketType);

            req.params = { id: '1' };

            await controller.delete(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(200);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Ticket type deleted successfully',
                ticket: deletedTicketType
            });
        });

        it('should handle service errors', async () => {
            (ticketTypeService.delete as jest.Mock).mockRejectedValue(new Error('Service error'));

            req.params = { id: '1' };

            await controller.delete(req as Request, res as Response);

            expect(statusMock).toHaveBeenCalledWith(500);
            expect(jsonMock).toHaveBeenCalledWith({
                message: 'Failed to delete ticket type',
                error: 'Service error'
            });
        });
    });
});
