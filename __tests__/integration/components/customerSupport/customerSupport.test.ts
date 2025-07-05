import request from 'supertest';
import app from '../../../../src/index';
import { customerSupportService } from '../../../../src/components/customerSupport/customerSupport.service';

// Mock the service
jest.mock('../../../../src/components/customerSupport/customerSupport.service');
const mockCustomerSupportService = customerSupportService as jest.Mocked<typeof customerSupportService>;

describe('Customer Support Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockTicket = {
        id: 1,
        subject: 'Issue with event',
        description: 'Details about the issue',
        status: 'open',
    };

    describe('GET /support-tickets', () => {
        it('should return all support tickets', async () => {
            mockCustomerSupportService.getAll.mockResolvedValue([mockTicket]);

            const res = await request(app).get('/api/support-tickets');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([mockTicket]);
            expect(mockCustomerSupportService.getAll).toHaveBeenCalled();
        });

        it('should return message if no tickets found', async () => {
            mockCustomerSupportService.getAll.mockResolvedValue([]);

            const res = await request(app).get('/api/support-tickets');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: 'No support tickets found.' });
            expect(mockCustomerSupportService.getAll).toHaveBeenCalled();
        });
    });

    describe('GET /support-tickets/:id', () => {
        it('should return a specific ticket by ID', async () => {
            mockCustomerSupportService.getById.mockResolvedValue(mockTicket);

            const res = await request(app).get(`/api/support-tickets/${mockTicket.id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockTicket);
            expect(mockCustomerSupportService.getById).toHaveBeenCalledWith(mockTicket.id);
        });

        it('should return message if ticket not found', async () => {
            mockCustomerSupportService.getById.mockResolvedValue(null);

            const res = await request(app).get('/api/support-tickets/999');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: 'Support ticket not found' });
        });

        it('should return 400 for invalid ticket ID', async () => {
            const res = await request(app).get('/api/support-tickets/invalid');

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ message: 'Invalid ticket ID' });
        });
    });

    describe('POST /support-tickets', () => {
        it('should create a new support ticket', async () => {
            mockCustomerSupportService.create.mockResolvedValue(mockTicket);

            const res = await request(app)
                .post('/api/support-tickets')
                .send({ subject: 'New issue', description: 'Issue details', status: 'open' });

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(mockTicket);
            expect(mockCustomerSupportService.create).toHaveBeenCalled();
        });

        it('should return 500 if service fails to create ticket', async () => {
            mockCustomerSupportService.create.mockRejectedValue(new Error('Database error'));

            const res = await request(app)
                .post('/api/support-tickets')
                .send({ subject: 'New issue', description: 'Issue details', status: 'open' });

            expect(res.statusCode).toBe(500);
            expect(res.body).toHaveProperty('message', 'Failed to create support ticket');
        });
    });

    describe('PUT /support-tickets/:id', () => {
        it('should update a support ticket', async () => {
            const updatedTicket = { ...mockTicket, status: 'closed' };
            mockCustomerSupportService.update.mockResolvedValue(updatedTicket);

            const res = await request(app)
                .put(`/api/support-tickets/${mockTicket.id}`)
                .send({ status: 'closed' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(updatedTicket);
            expect(mockCustomerSupportService.update).toHaveBeenCalledWith(mockTicket.id, { status: 'closed' });
        });

        it('should return message if ticket not found for update', async () => {
            mockCustomerSupportService.update.mockResolvedValue(null);

            const res = await request(app)
                .put('/api/support-tickets/999')
                .send({ status: 'closed' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: 'Support ticket not found' });
        });

        it('should return 400 for invalid ticket ID on update', async () => {
            const res = await request(app)
                .put('/api/support-tickets/invalid')
                .send({ status: 'closed' });

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ message: 'Invalid ticket ID' });
        });
    });

    describe('DELETE /support-tickets/:id', () => {
        it('should delete a support ticket', async () => {
            mockCustomerSupportService.delete.mockResolvedValue(mockTicket);

            const res = await request(app).delete(`/api/support-tickets/${mockTicket.id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: 'Support ticket deleted successfully', ticket: mockTicket });
            expect(mockCustomerSupportService.delete).toHaveBeenCalledWith(mockTicket.id);
        });

        it('should return message if ticket not found for deletion', async () => {
            mockCustomerSupportService.delete.mockResolvedValue(null);

            const res = await request(app).delete('/api/support-tickets/999');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual({ message: 'Support ticket not found' });
        });

        it('should return 400 for invalid ticket ID on deletion', async () => {
            const res = await request(app).delete('/api/support-tickets/invalid');

            expect(res.statusCode).toBe(400);
            expect(res.body).toEqual({ message: 'Invalid ticket ID' });
        });
    });
});
