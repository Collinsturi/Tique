import request from 'supertest';
import app from '../../../../src/index';
import { venueService } from '../../../../src/components/venue/venue.service';

jest.mock('../../../../src/components/venue/venue.service');
const mockVenueService = venueService as jest.Mocked<typeof venueService>;

describe('Venue Integration Tests', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const mockVenue = {
        id: 1,
        name: 'Madison Square Garden',
        location: 'New York',
        capacity: 20000,
    };

    describe('GET /venues', () => {
        it('should return all venues', async () => {
            mockVenueService.getAllVenues.mockResolvedValue([mockVenue]);

            const res = await request(app).get('/api/venues');

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual([mockVenue]);
            expect(mockVenueService.getAllVenues).toHaveBeenCalled();
        });

        it('should return 500 if service fails', async () => {
            mockVenueService.getAllVenues.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get('/api/venues');

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Failed to fetch venues');
        });
    });

    describe('GET /venues/:id', () => {
        it('should return a venue by ID', async () => {
            mockVenueService.getVenueById.mockResolvedValue(mockVenue);

            const res = await request(app).get(`/api/venues/${mockVenue.id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockVenue);
            expect(mockVenueService.getVenueById).toHaveBeenCalledWith(mockVenue.id);
        });

        it('should return "Venue not found" if not found', async () => {
            mockVenueService.getVenueById.mockResolvedValue(null);

            const res = await request(app).get('/api/venues/999');

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Venue not found');
        });

        it('should return 500 if service fails', async () => {
            mockVenueService.getVenueById.mockRejectedValue(new Error('Database error'));

            const res = await request(app).get(`/api/venues/${mockVenue.id}`);

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Failed to fetch venue');
        });
    });

    describe('POST /venues', () => {
        it('should create a new venue', async () => {
            mockVenueService.createVenue.mockResolvedValue(mockVenue);

            const res = await request(app).post('/api/venues').send({
                name: 'Madison Square Garden',
                location: 'New York',
                capacity: 20000,
            });

            expect(res.statusCode).toBe(201);
            expect(res.body).toEqual(mockVenue);
            expect(mockVenueService.createVenue).toHaveBeenCalled();
        });

        it('should return 500 if service fails', async () => {
            mockVenueService.createVenue.mockRejectedValue(new Error('Create failed'));

            const res = await request(app).post('/api/venues').send({
                name: 'Madison Square Garden',
                location: 'New York',
                capacity: 20000,
            });

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Failed to create venue');
        });
    });

    describe('PATCH /venues/:id', () => {
        it('should update a venue', async () => {
            mockVenueService.getVenueById.mockResolvedValue(mockVenue);
            const updatedVenue = { ...mockVenue, capacity: 25000 };
            mockVenueService.updateVenue.mockResolvedValue(updatedVenue);

            const res = await request(app).patch(`/api/venues/${mockVenue.id}`).send({ capacity: 25000 });

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(updatedVenue);
            expect(mockVenueService.updateVenue).toHaveBeenCalledWith(mockVenue.id, { capacity: 25000 });
        });

        it('should return "Venue not found" if not found', async () => {
            mockVenueService.getVenueById.mockResolvedValue(null);

            const res = await request(app).patch(`/api/venues/${mockVenue.id}`).send({ capacity: 25000 });

            expect(res.statusCode).toBe(200);
            expect(res.body.message).toBe('Venue not found');
        });

        it('should return 500 if service fails', async () => {
            mockVenueService.getVenueById.mockResolvedValue(mockVenue);
            mockVenueService.updateVenue.mockRejectedValue(new Error('Update failed'));

            const res = await request(app).patch(`/api/venues/${mockVenue.id}`).send({ capacity: 25000 });

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Failed to update venue');
        });
    });

    describe('DELETE /venues/:id', () => {
        it('should delete a venue', async () => {
            mockVenueService.deleteVenue.mockResolvedValue(mockVenue);

            const res = await request(app).delete(`/api/venues/${mockVenue.id}`);

            expect(res.statusCode).toBe(200);
            expect(res.body).toEqual(mockVenue);
            expect(mockVenueService.deleteVenue).toHaveBeenCalledWith(mockVenue.id);
        });

        it('should return 500 if service fails', async () => {
            mockVenueService.deleteVenue.mockRejectedValue(new Error('Delete failed'));

            const res = await request(app).delete(`/api/venues/${mockVenue.id}`);

            expect(res.statusCode).toBe(500);
            expect(res.body.message).toBe('Failed to delete venue');
        });
    });
});
