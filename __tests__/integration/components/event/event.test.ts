import request from 'supertest';
import app from '../../../../src/index';
import { eventService } from '../../../../src/components/event/event.service';

// Mock the eventService
jest.mock('../../../../src/components/event/event.service');
const mockEventService = eventService as jest.Mocked<typeof eventService>;

describe('Event Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockEvent = {
        id: 1,
        name: 'Music Festival',
        description: 'Annual music festival',
        date: '2025-08-01',
        category: 'Music',
        venueId: 2,
    };

    describe('GET /events', () => {
        it('should return all events', async () => {
            mockEventService.getAllEvents.mockResolvedValue([mockEvent]);

            const res = await request(app).get('/api/events');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([mockEvent]);
            expect(mockEventService.getAllEvents).toHaveBeenCalledWith({
                venueId: undefined,
                category: undefined,
                date: undefined,
            });
        });

        it('should support filtering by venueId, category, and date', async () => {
            mockEventService.getAllEvents.mockResolvedValue([mockEvent]);

            const res = await request(app)
                .get('/api/events')
                .query({ venueId: 2, category: 'Music', date: '2025-08-01' });

            expect(res.statusCode).toBe(200);
            expect(mockEventService.getAllEvents).toHaveBeenCalledWith({
                venueId: 2,
                category: 'Music',
                date: '2025-08-01',
            });
        });

        it('should return 500 if service fails', async () => {
            mockEventService.getAllEvents.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get('/api/events');

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('message', 'Failed to fetch events');
        });
    });

    describe('GET /events/:id', () => {
        it('should return event by ID', async () => {
            mockEventService.getEventById.mockResolvedValue(mockEvent);

            const res = await request(app).get(`/api/events/${mockEvent.id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockEvent);
            expect(mockEventService.getEventById).toHaveBeenCalledWith(mockEvent.id);
        });

        it('should return 404 if event not found', async () => {
            mockEventService.getEventById.mockResolvedValue(null);

            const res = await request(app).get('/api/events/999');

            expect(res.statusCode).toBe(404);
            expect(res.body).toEqual({ message: 'Event not found' });
        });

        it('should return 500 if service fails', async () => {
            mockEventService.getEventById.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get(`/api/events/${mockEvent.id}`);

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('message', 'Failed to fetch event');
        });
    });

    describe('POST /events', () => {
        it('should create a new event', async () => {
            mockEventService.createEvent.mockResolvedValue(mockEvent);

            const res = await request(app)
                .post('/api/events')
                .send({
                    name: 'Music Festival',
                    description: 'Annual music festival',
                    date: '2025-08-01',
                    category: 'Music',
                    venueId: 2,
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(mockEvent);
            expect(mockEventService.createEvent).toHaveBeenCalled();
        });

        it('should return 500 if service fails', async () => {
            mockEventService.createEvent.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .post('/api/events')
                .send({
                    name: 'Music Festival',
                    description: 'Annual music festival',
                    date: '2025-08-01',
                    category: 'Music',
                    venueId: 2,
                });

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('message', 'Failed to create event');
        });
    });

    describe('PUT /events/:id', () => {
        it('should update an event', async () => {
            const updatedEvent = { ...mockEvent, name: 'Updated Festival' };
            mockEventService.updateEvent.mockResolvedValue(updatedEvent);

            const res = await request(app)
                .put(`/api/events/${mockEvent.id}`)
                .send({ name: 'Updated Festival' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(updatedEvent);
            expect(mockEventService.updateEvent).toHaveBeenCalledWith(mockEvent.id, { name: 'Updated Festival' });
        });

        it('should return 500 if service fails', async () => {
            mockEventService.updateEvent.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .put(`/api/events/${mockEvent.id}`)
                .send({ name: 'Updated Festival' });

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('message', 'Failed to update event');
        });
    });

    describe('DELETE /events/:id', () => {
        it('should delete an event', async () => {
            mockEventService.deleteEvent.mockResolvedValue(mockEvent);

            const res = await request(app).delete(`/api/events/${mockEvent.id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockEvent);
            expect(mockEventService.deleteEvent).toHaveBeenCalledWith(mockEvent.id);
        });

        it('should return 500 if service fails', async () => {
            mockEventService.deleteEvent.mockRejectedValue(new Error('Database error'));

            const res = await request(app).delete(`/api/events/${mockEvent.id}`);

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('message', 'Failed to delete event');
        });
    });
});
