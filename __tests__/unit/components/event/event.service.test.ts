import { EventService } from '../../../../src/components/event/event.service';
import db from '../../../../src/drizzle/db';

jest.mock('../../../../src/drizzle/db', () => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
}));

describe('EventService', () => {
    const service = new EventService();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAllEvents', () => {
        it('should fetch all events without filters', async () => {
            // Proper chained mock
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([{ id: 1, name: 'Test Event' }])
                })
            });

            const result = await service.getAllEvents({});

            expect(result).toEqual([{ id: 1, name: 'Test Event' }]);
            expect(db.select).toHaveBeenCalled();
        });

        it('should fetch events with venueId filter', async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([{ id: 2, name: 'Filtered Event' }])
                })
            });

            const result = await service.getAllEvents({ venueId: 10 });

            expect(result).toEqual([{ id: 2, name: 'Filtered Event' }]);
        });

        it('should fetch events with multiple filters', async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([{ id: 3, name: 'Multi Filtered Event' }])
                })
            });

            const result = await service.getAllEvents({ venueId: 5, category: 'Music', date: '2024-08-12' });

            expect(result).toEqual([{ id: 3, name: 'Multi Filtered Event' }]);
        });
    });

    describe('getEventById', () => {
        it('should return event by ID', async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([{ id: 1, name: 'Test Event' }])
                })
            });

            const result = await service.getEventById(1);
            expect(result).toEqual({ id: 1, name: 'Test Event' });
        });

        it('should return undefined if event not found', async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([])
                })
            });

            const result = await service.getEventById(99);
            expect(result).toBeUndefined();
        });
    });

    describe('createEvent', () => {
        it('should create a new event', async () => {
            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([{ id: 1, name: 'New Event' }])
                })
            });

            const result = await service.createEvent({ name: 'New Event' } as any);
            expect(result).toEqual({ id: 1, name: 'New Event' });
        });
    });

    describe('updateEvent', () => {
        it('should update an event', async () => {
            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([{ id: 1, name: 'Updated Event' }])
                    })
                })
            });

            const result = await service.updateEvent(1, { name: 'Updated Event' });
            expect(result).toEqual({ id: 1, name: 'Updated Event' });
        });
    });

    describe('deleteEvent', () => {
        it('should delete an event', async () => {
            (db.delete as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([{ id: 1 }])
                })
            });

            const result = await service.deleteEvent(1);
            expect(result).toEqual({ id: 1 });
        });
    });
});
