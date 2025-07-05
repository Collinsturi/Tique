import request from 'supertest';
import app from '../../../../src/index';
import { ticketService } from '../../../../src/components/ticket/ticket.service';

jest.mock('../../../../src/components/ticket/ticket.service');
const mockTicketService = ticketService as jest.Mocked<typeof ticketService>;

describe('Ticket Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockTicket = {
        id: 1,
        orderItemId: 10,
        userId: 5,
        eventId: 3,
        ticketTypeId: 2,
        isScanned: false,
        scannedByUser: null,
    };

    describe('GET /tickets', () => {
        it('should return all tickets', async () => {
            mockTicketService.getAllTickets.mockResolvedValue([mockTicket]);

            const res = await request(app).get('/api/tickets');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([mockTicket]);
            expect(mockTicketService.getAllTickets).toHaveBeenCalled();
        });

        it('should return 500 if service fails', async () => {
            mockTicketService.getAllTickets.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get('/api/tickets');

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Failed to fetch tickets');
        });
    });

    describe('GET /tickets/:id', () => {
        it('should return a ticket by ID', async () => {
            mockTicketService.getTicketById.mockResolvedValue(mockTicket);

            const res = await request(app).get(`/api/tickets/${mockTicket.id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockTicket);
            expect(mockTicketService.getTicketById).toHaveBeenCalledWith(mockTicket.id);
        });

        it('should return 400 for invalid ticket ID', async () => {
            const res = await request(app).get('/api/tickets/abc');

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid ticket ID');
        });

        it('should return 404 if ticket is not found', async () => {
            mockTicketService.getTicketById.mockRejectedValue(new Error('Ticket not found'));

            const res = await request(app).get('/api/tickets/999');

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Ticket not found');
        });
    });

    describe('POST /tickets', () => {
        it('should create a new ticket', async () => {
            mockTicketService.createTicket.mockResolvedValue(mockTicket);

            const res = await request(app).post('/api/tickets').send({
                orderItemId: 10,
                userId: 5,
                eventId: 3,
                ticketTypeId: 2,
            });

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(mockTicket);
            expect(mockTicketService.createTicket).toHaveBeenCalledWith({
                orderItemId: 10,
                userId: 5,
                eventId: 3,
                ticketTypeId: 2,
            });
        });

        it('should return 400 if required fields are missing', async () => {
            const res = await request(app).post('/api/tickets').send({});

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Missing required ticket fields');
        });

        it('should return 400 if service throws error', async () => {
            mockTicketService.createTicket.mockRejectedValue(new Error('Failed to create ticket'));

            const res = await request(app).post('/api/tickets').send({
                orderItemId: 10,
                userId: 5,
                eventId: 3,
                ticketTypeId: 2,
            });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Failed to create ticket');
        });
    });

    describe('PUT /tickets/:id/scan', () => {
        it('should scan a ticket successfully', async () => {
            const scannedTicket = { ...mockTicket, isScanned: true, scannedByUser: 8 };
            mockTicketService.scanTicket.mockResolvedValue(scannedTicket);

            const res = await request(app)
                .put(`/api/tickets/${mockTicket.id}/scan`)
                .send({ scannedByUser: 8 });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(scannedTicket);
            expect(mockTicketService.scanTicket).toHaveBeenCalledWith(mockTicket.id, 8);
        });

        it('should return 400 for invalid ticket ID', async () => {
            const res = await request(app)
                .put('/api/tickets/abc/scan')
                .send({ scannedByUser: 8 });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid ticket ID or scannedByUser');
        });

        it('should return 400 for invalid scannedByUser', async () => {
            const res = await request(app)
                .put(`/api/tickets/${mockTicket.id}/scan`)
                .send({ scannedByUser: 'abc' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid ticket ID or scannedByUser');
        });

        it('should return 400 if service fails', async () => {
            mockTicketService.scanTicket.mockRejectedValue(new Error('Ticket not found'));

            const res = await request(app)
                .put(`/api/tickets/${mockTicket.id}/scan`)
                .send({ scannedByUser: 8 });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Ticket not found');
        });
    });

    describe('DELETE /tickets/:id', () => {
        it('should delete a ticket', async () => {
            mockTicketService.deleteTicket.mockResolvedValue(mockTicket);

            const res = await request(app).delete(`/api/tickets/${mockTicket.id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockTicket);
            expect(mockTicketService.deleteTicket).toHaveBeenCalledWith(mockTicket.id);
        });

        it('should return 400 for invalid ticket ID', async () => {
            const res = await request(app).delete('/api/tickets/abc');

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('Invalid ticket ID');
        });

        it('should return 404 if ticket is not found', async () => {
            mockTicketService.deleteTicket.mockRejectedValue(new Error('Ticket not found'));

            const res = await request(app).delete('/api/tickets/999');

            expect(res.statusCode).toBe(404);
            expect(res.body.message).toBe('Ticket not found');
        });
    });
});
