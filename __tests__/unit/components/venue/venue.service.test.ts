import { VenueService } from '../../../../src/components/venue/venue.service';
import db from '../../../../src/drizzle/db';

jest.mock('../../../../src/drizzle/db', () => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
}));

describe('VenueService', () => {
    const venueService = new VenueService();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllVenues', () => {
        it('should return all venues', async () => {
            const mockVenues = [{ id: 1, name: 'Venue 1' }];

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockResolvedValue(mockVenues),
            });

            const result = await venueService.getAllVenues();
            expect(result).toEqual(mockVenues);
        });

        it('should throw an error if fetching venues fails', async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockRejectedValue(new Error('DB error')),
            });

            await expect(venueService.getAllVenues()).rejects.toThrow('Failed to fetch venues');
        });
    });

    describe('getVenueById', () => {
        it('should return the venue by ID', async () => {
            const mockVenue = [{ id: 1, name: 'Venue 1' }];

            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue(mockVenue),
                }),
            });

            const result = await venueService.getVenueById(1);
            expect(result).toEqual(mockVenue[0]);
        });

        it('should throw an error if fetching venue by ID fails', async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockRejectedValue(new Error('DB error')),
                }),
            });

            await expect(venueService.getVenueById(1)).rejects.toThrow('Failed to fetch venue');
        });
    });

    describe('createVenue', () => {
        it('should create a new venue', async () => {
            const mockVenue = [{ id: 1, name: 'Venue 1' }];

            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue(mockVenue),
                }),
            });

            const result = await venueService.createVenue({ name: 'Venue 1' });
            expect(result).toEqual(mockVenue[0]);
        });

        it('should throw an error if creating venue fails', async () => {
            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockRejectedValue(new Error('DB error')),
                }),
            });

            await expect(venueService.createVenue({ name: 'Venue 1' })).rejects.toThrow('Failed to create venue');
        });
    });

    describe('updateVenue', () => {
        it('should update a venue', async () => {
            const mockVenue = [{ id: 1, name: 'Updated Venue' }];

            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue(mockVenue),
                    }),
                }),
            });

            const result = await venueService.updateVenue(1, { name: 'Updated Venue' });
            expect(result).toEqual(mockVenue[0]);
        });

        it('should throw an error if updating venue fails', async () => {
            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockRejectedValue(new Error('DB error')),
                    }),
                }),
            });

            await expect(venueService.updateVenue(1, { name: 'Updated Venue' })).rejects.toThrow('Failed to update venue');
        });
    });

    describe('deleteVenue', () => {
        it('should delete a venue', async () => {
            const mockVenue = [{ id: 1, name: 'Venue 1' }];

            (db.delete as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue(mockVenue),
                }),
            });

            const result = await venueService.deleteVenue(1);
            expect(result).toEqual(mockVenue[0]);
        });

        it('should throw an error if deleting venue fails', async () => {
            (db.delete as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({
                    returning: jest.fn().mockRejectedValue(new Error('DB error')),
                }),
            });

            await expect(venueService.deleteVenue(1)).rejects.toThrow('Failed to delete venue');
        });
    });
});
