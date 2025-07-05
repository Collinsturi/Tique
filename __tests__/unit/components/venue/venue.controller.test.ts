import { VenueController } from '../../../../src/components/venue/venue.controller';
import { venueService } from '../../../../src/components/venue/venue.service';

jest.mock('../../../../src/components/venue/venue.service');

describe('VenueController Unit Tests', () => {
    let venueController: VenueController;
    let mockReq: any;
    let mockRes: any;

    beforeEach(() => {
        venueController = new VenueController();
        mockReq = {};
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should return all venues', async () => {
            const mockVenues = [{ id: 1, name: 'Venue 1' }];
            (venueService.getAllVenues as jest.Mock).mockResolvedValue(mockVenues);

            await venueController.getAll(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(mockVenues);
            expect(venueService.getAllVenues).toHaveBeenCalled();
        });

        it('should handle errors', async () => {
            (venueService.getAllVenues as jest.Mock).mockRejectedValue(new Error('DB error'));

            await venueController.getAll(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to fetch venues', error: expect.any(Error) });
        });
    });

    describe('getById', () => {
        it('should return venue by id', async () => {
            const mockVenue = { id: 1, name: 'Venue 1' };
            mockReq.params = { id: '1' };
            (venueService.getVenueById as jest.Mock).mockResolvedValue(mockVenue);

            await venueController.getById(mockReq, mockRes);

            expect(venueService.getVenueById).toHaveBeenCalledWith(1);
            expect(mockRes.json).toHaveBeenCalledWith(mockVenue);
        });

        it('should return not found message if venue does not exist', async () => {
            mockReq.params = { id: '1' };
            (venueService.getVenueById as jest.Mock).mockResolvedValue(null);

            await venueController.getById(mockReq, mockRes);

            expect(venueService.getVenueById).toHaveBeenCalledWith(1);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Venue not found' });
        });

        it('should handle errors', async () => {
            mockReq.params = { id: '1' };
            (venueService.getVenueById as jest.Mock).mockRejectedValue(new Error('DB error'));

            await venueController.getById(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to fetch venue', error: expect.any(Error) });
        });
    });

    describe('create', () => {
        it('should create a new venue', async () => {
            const newVenue = { name: 'New Venue' };
            mockReq.body = newVenue;

            (venueService.createVenue as jest.Mock).mockResolvedValue(newVenue);

            await venueController.create(mockReq, mockRes);

            expect(venueService.createVenue).toHaveBeenCalledWith(newVenue);
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith(newVenue);
        });

        it('should handle errors', async () => {
            mockReq.body = { name: 'New Venue' };
            (venueService.createVenue as jest.Mock).mockRejectedValue(new Error('DB error'));

            await venueController.create(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to create venue', error: expect.any(Error) });
        });
    });

    describe('update', () => {
        it('should update existing venue', async () => {
            const venueId = 1;
            const venueData = { name: 'Updated Venue' };
            const updatedVenue = { id: venueId, ...venueData };

            mockReq.params = { id: '1' };
            mockReq.body = venueData;

            (venueService.getVenueById as jest.Mock).mockResolvedValue(updatedVenue);
            (venueService.updateVenue as jest.Mock).mockResolvedValue(updatedVenue);

            await venueController.update(mockReq, mockRes);

            expect(venueService.getVenueById).toHaveBeenCalledWith(venueId);
            expect(venueService.updateVenue).toHaveBeenCalledWith(venueId, venueData);
            expect(mockRes.json).toHaveBeenCalledWith(updatedVenue);
        });

        it('should return not found if venue does not exist', async () => {
            mockReq.params = { id: '1' };
            mockReq.body = { name: 'Updated Venue' };

            (venueService.getVenueById as jest.Mock).mockResolvedValue(null);

            await venueController.update(mockReq, mockRes);

            expect(venueService.getVenueById).toHaveBeenCalledWith(1);
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Venue not found' });
        });

        it('should handle errors', async () => {
            mockReq.params = { id: '1' };
            mockReq.body = { name: 'Updated Venue' };

            (venueService.getVenueById as jest.Mock).mockRejectedValue(new Error('DB error'));

            await venueController.update(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to update venue', error: expect.any(Error) });
        });
    });

    describe('delete', () => {
        it('should delete a venue', async () => {
            const deletedVenue = { id: 1, name: 'Deleted Venue' };
            mockReq.params = { id: '1' };

            (venueService.deleteVenue as jest.Mock).mockResolvedValue(deletedVenue);

            await venueController.delete(mockReq, mockRes);

            expect(venueService.deleteVenue).toHaveBeenCalledWith(1);
            expect(mockRes.json).toHaveBeenCalledWith(deletedVenue);
        });

        it('should handle errors', async () => {
            mockReq.params = { id: '1' };
            (venueService.deleteVenue as jest.Mock).mockRejectedValue(new Error('DB error'));

            await venueController.delete(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Failed to delete venue', error: expect.any(Error) });
        });
    });
});
