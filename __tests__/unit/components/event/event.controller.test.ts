import { EventController } from '../../../../src/components/event/event.controller';
import { eventService } from '../../../../src/components/event/event.service';
import { Request, Response } from 'express';
import { CreateEventServicePayload } from '../../../../src/components/event/event.service';

jest.mock('../../../../src/components/event/event.service');

describe('EventController', () => {
    let controller: EventController;
    let req: Partial<Request>;
    let res: Partial<Response>;

    beforeEach(() => {
        controller = new EventController();

        req = {};
        res = {
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should fetch all events successfully', async () => {
            (eventService.getAllEvents as jest.Mock).mockResolvedValue([{ id: 1, name: 'Event 1' }]);

            req.query = {};

            await controller.getAll(req as Request, res as Response);

            expect(eventService.getAllEvents).toHaveBeenCalledWith({ venueId: undefined, category: undefined, date: undefined });
            expect(res.json).toHaveBeenCalledWith([{ id: 1, name: 'Event 1' }]);
        });

        it('should handle service errors when fetching all events', async () => {
            (eventService.getAllEvents as jest.Mock).mockRejectedValue(new Error('DB Error'));

            req.query = {};

            await controller.getAll(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch events', error: new Error('DB Error') });
        });
    });

    describe('getById', () => {
        it('should fetch an event by ID successfully', async () => {
            (eventService.getEventById as jest.Mock).mockResolvedValue({ id: 1, name: 'Event 1' });

            req.params = { id: '1' };

            await controller.getById(req as Request, res as Response);

            expect(eventService.getEventById).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Event 1' });
        });

        it('should return 404 if event not found', async () => {
            (eventService.getEventById as jest.Mock).mockResolvedValue(undefined);

            req.params = { id: '1' };

            await controller.getById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({ message: 'Event not found' });
        });

        it('should handle service errors when fetching event by ID', async () => {
            (eventService.getEventById as jest.Mock).mockRejectedValue(new Error('DB Error'));

            req.params = { id: '1' };

            await controller.getById(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Failed to fetch event', error: new Error('DB Error') });
        });
    });

    // Corrected tests for the createEvent method
    describe('createEvent', () => {
        const mockEventPayload: CreateEventServicePayload = {
            category: 'Music',
            name: 'New Event',
            description: 'A description',
            startDate: '2025-01-01T10:00:00Z',
            endDate: '2025-01-01T12:00:00Z',
            address: '123 Main St',
            city: 'Anytown',
            country: 'USA',
            organizerEmail: 'organizer@example.com',
            venueId: 1,
            ticketTypes: [
                {
                    name: 'VIP',
                    price: 100.0,
                    quantityAvailable: 50,
                    minPerOrder: 1,
                    maxPerOrder: 10,
                    salesStartDate: '2024-12-01T10:00:00Z',
                    salesEndDate: '2024-12-30T10:00:00Z',
                    description: 'VIP ticket',
                },
            ],
        };

        it('should create a new event successfully', async () => {
            const mockRawEventData = {
                ...mockEventPayload,
                ticketTypes: mockEventPayload.ticketTypes.map(tt => ({
                    typeName: tt.name,
                    price: String(tt.price),
                    quantityAvailable: String(tt.quantityAvailable),
                    minPerOrder: String(tt.minPerOrder),
                    maxPerOrder: String(tt.maxPerOrder),
                    salesStartDate: tt.salesStartDate,
                    salesEndDate: tt.salesEndDate,
                    description: tt.description,
                })),
            };

            (eventService.createEvent as jest.Mock).mockResolvedValue({ id: 1, ...mockEventPayload });

            req.body = mockRawEventData;
            req.params = { email: 'organizer@example.com' };

            await controller.createEvent(req as Request, res as Response);

            expect(eventService.createEvent).toHaveBeenCalledWith(mockEventPayload);
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ id: 1, ...mockEventPayload });
        });

        // it('should handle service errors when creating an event', async () => {
        //     (eventService.createEvent as jest.Mock).mockRejectedValue(new Error('DB Error'));
        //
        //     req.body = {};
        //     req.params = { email: 'organizer@example.com' };
        //
        //     await controller.createEvent(req as Request, res as Response);
        //
        //     expect(res.status).toHaveBeenCalledWith(500);
        //     expect(res.json).toHaveBeenCalledWith({ message: 'Failed to create event', error: expect.any(Error) });
        // });
    });

    describe('update', () => {
        it('should update an event successfully', async () => {
            (eventService.updateEvent as jest.Mock).mockResolvedValue({ id: 1, name: 'Updated Event' });

            req.params = { id: '1' };
            req.body = { name: 'Updated Event' };

            await controller.update(req as Request, res as Response);

            expect(eventService.updateEvent).toHaveBeenCalledWith(1, { name: 'Updated Event' });
            expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'Updated Event' });
        });

        it('should handle service errors when updating an event', async () => {
            (eventService.updateEvent as jest.Mock).mockRejectedValue(new Error('DB Error'));

            req.params = { id: '1' };
            req.body = { name: 'Updated Event' };

            await controller.update(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Failed to update event', error: new Error('DB Error') });
        });
    });

    describe('delete', () => {
        it('should delete an event successfully', async () => {
            (eventService.deleteEvent as jest.Mock).mockResolvedValue({ id: 1 });

            req.params = { id: '1' };

            await controller.delete(req as Request, res as Response);

            expect(eventService.deleteEvent).toHaveBeenCalledWith(1);
            expect(res.json).toHaveBeenCalledWith({ id: 1 });
        });

        it('should handle service errors when deleting an event', async () => {
            (eventService.deleteEvent as jest.Mock).mockRejectedValue(new Error('DB Error'));

            req.params = { id: '1' };

            await controller.delete(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Failed to delete event', error: new Error('DB Error') });
        });
    });
});
