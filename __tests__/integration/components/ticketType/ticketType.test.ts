import request from 'supertest';
import app from '../../../../src/index';
import { ticketTypeService } from '../../../../src/components/ticketTypes/ticketType.service';

jest.mock('../../../../src/components/ticketTypes/ticketType.service');
const mockTicketTypeService = ticketTypeService as jest.Mocked<typeof ticketTypeService>;

describe('Ticket Types Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockTicketType = {
        id: 1,
        name: 'VIP',
        price: 1000,
        quantity: 50,
        eventId: 2,
    };

    describe('GET /ticket-types', () => {
        it('should return all ticket types', async () => {
            mockTicketTypeService.getAll.mockResolvedValue([mockTicketType]);

            const res = await request(app).get('/api/ticket-types');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([mockTicketType]);
            expect(mockTicketTypeService.getAll).toHaveBeenCalledWith(undefined);
        });

        it('should filter by eventId', async () => {
            mockTicketTypeService.getAll.mockResolvedValue([mockTicketType]);

            const res = await request(app).get('/api/ticket-types?eventId=2');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([mockTicketType]);
            expect(mockTicketTypeService.getAll).toHaveBeenCalledWith(2);
        });

        it('should return "Invalid event ID" for non-numeric eventId', async () => {
            const res = await request(app).get('/api/ticket-types?eventId=abc');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Invalid event ID');
        });

        it('should return 500 if service fails', async () => {
            mockTicketTypeService.getAll.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get('/api/ticket-types');

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Failed to fetch ticket types');
        });
    });

    describe('GET /ticket-types/:id', () => {
        it('should return a ticket type by ID', async () => {
            mockTicketTypeService.getById.mockResolvedValue(mockTicketType);

            const res = await request(app).get(`/api/ticket-types/${mockTicketType.id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockTicketType);
            expect(mockTicketTypeService.getById).toHaveBeenCalledWith(mockTicketType.id);
        });

        it('should return 400 for invalid ID', async () => {
            const res = await request(app).get('/api/ticket-types/abc');

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid ticket type ID');
        });

        it('should return 404 if ticket type not found', async () => {
            mockTicketTypeService.getById.mockResolvedValue(null);

            const res = await request(app).get('/api/ticket-types/999');

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Ticket type not found');
        });
    });

    describe('POST /ticket-types', () => {
        it('should create a new ticket type', async () => {
            mockTicketTypeService.create.mockResolvedValue(mockTicketType);

            const res = await request(app).post('/api/ticket-types').send({
                name: 'VIP',
                price: 1000,
                quantity: 50,
                eventId: 2,
            });

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(mockTicketType);
            expect(mockTicketTypeService.create).toHaveBeenCalled();
        });

        it('should return 500 if service fails', async () => {
            mockTicketTypeService.create.mockRejectedValue(new Error('Service failed'));

            const res = await request(app).post('/api/ticket-types').send({
                name: 'VIP',
                price: 1000,
                quantity: 50,
                eventId: 2,
            });

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Failed to create ticket type');
        });
    });

    describe('PATCH /ticket-types/:id', () => {
        it('should update a ticket type', async () => {
            const updatedTicketType = { ...mockTicketType, price: 1200 };
            mockTicketTypeService.update.mockResolvedValue(updatedTicketType);

            const res = await request(app).patch(`/api/ticket-types/${mockTicketType.id}`).send({ price: 1200 });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(updatedTicketType);
            expect(mockTicketTypeService.update).toHaveBeenCalledWith(mockTicketType.id, { price: 1200 });
        });

        it('should return 400 for invalid ID', async () => {
            const res = await request(app).patch('/api/ticket-types/abc').send({ price: 1200 });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid ticket type ID');
        });

        it('should return 400 for empty body', async () => {
            const res = await request(app).patch(`/api/ticket-types/${mockTicketType.id}`).send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Update data cannot be empty');
        });

        it('should return 404 if ticket type not found', async () => {
            mockTicketTypeService.update.mockResolvedValue(null);

            const res = await request(app).patch(`/api/ticket-types/${mockTicketType.id}`).send({ price: 1200 });

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Ticket type not found');
        });

        it('should return 500 if service fails', async () => {
            mockTicketTypeService.update.mockRejectedValue(new Error('Update failed'));

            const res = await request(app).patch(`/api/ticket-types/${mockTicketType.id}`).send({ price: 1200 });

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Failed to update ticket type');
        });
    });

    describe('DELETE /ticket-types/:id', () => {
        it('should delete a ticket type', async () => {
            mockTicketTypeService.delete.mockResolvedValue(mockTicketType);

            const res = await request(app).delete(`/api/ticket-types/${mockTicketType.id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({
                message: 'Ticket type deleted successfully',
                ticket: mockTicketType,
            });
            expect(mockTicketTypeService.delete).toHaveBeenCalledWith(mockTicketType.id);
        });

        it('should return 400 for invalid ID', async () => {
            const res = await request(app).delete('/api/ticket-types/abc');

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid ticket type ID');
        });

        it('should return 404 if ticket type not found', async () => {
            mockTicketTypeService.delete.mockResolvedValue(null);

            const res = await request(app).delete(`/api/ticket-types/${mockTicketType.id}`);

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Ticket type not found');
        });

        it('should return 500 if service fails', async () => {
            mockTicketTypeService.delete.mockRejectedValue(new Error('Delete failed'));

            const res = await request(app).delete(`/api/ticket-types/${mockTicketType.id}`);

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Failed to delete ticket type');
        });
    });
});
