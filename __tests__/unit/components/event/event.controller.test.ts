import { EventController } from '../../../../src/components/event/event.controller';
import { eventService } from '../../../../src/components/event/event.service';
import { Request, Response } from 'express';

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

    describe('create', () => {
        it('should create a new event successfully', async () => {
            (eventService.createEvent as jest.Mock).mockResolvedValue({ id: 1, name: 'New Event' });

            req.body = { name: 'New Event' };

            await controller.create(req as Request, res as Response);

            expect(eventService.createEvent).toHaveBeenCalledWith({ name: 'New Event' });
            expect(res.status).toHaveBeenCalledWith(201);
            expect(res.json).toHaveBeenCalledWith({ id: 1, name: 'New Event' });
        });

        it('should handle service errors when creating an event', async () => {
            (eventService.createEvent as jest.Mock).mockRejectedValue(new Error('DB Error'));

            req.body = { name: 'New Event' };

            await controller.create(req as Request, res as Response);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({ message: 'Failed to create event', error: new Error('DB Error') });
        });
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
