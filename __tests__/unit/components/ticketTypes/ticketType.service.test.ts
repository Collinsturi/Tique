import { TicketTypeService } from '../../../../src/components/ticketTypes/ticketType.service';
import db from '../../../../src/drizzle/db';
import { TicketTypes } from '../../../../src/drizzle/schema';

jest.mock('../../../../src/drizzle/db', () => ({
    select: jest.fn(() => db),
    insert: jest.fn(() => db),
    update: jest.fn(() => db),
    delete: jest.fn(() => db),
    from: jest.fn(() => db),
    where: jest.fn(() => db),
    returning: jest.fn(() => db),
    set: jest.fn(() => db),
}));

describe('TicketTypeService', () => {
    let ticketTypeService: TicketTypeService;

    beforeEach(() => {
        jest.clearAllMocks();
        ticketTypeService = new TicketTypeService();
    });

    describe('getAll', () => {
        it('should return all ticket types when no eventId is provided', async () => {
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce([])
            });

            await ticketTypeService.getAll();
            expect(db.select).toHaveBeenCalled();
        });

        it('should return ticket types filtered by eventId', async () => {
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockResolvedValueOnce(['type1', 'type2'])
                })
            });

            const result = await ticketTypeService.getAll(1);
            expect(result).toEqual(['type1', 'type2']);
        });

        it('should throw an error for invalid eventId', async () => {
            await expect(ticketTypeService.getAll(NaN)).rejects.toThrow('Invalid event ID');
        });

        it('should throw an error if service fails', async () => {
            (db.select as jest.Mock).mockImplementation(() => { throw new Error('DB error'); });

            await expect(ticketTypeService.getAll()).rejects.toThrow('Failed to fetch ticket types');
        });
    });

    describe('getById', () => {
        it('should return a ticket type by ID', async () => {
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockResolvedValueOnce([{ id: 1 }])
                })
            });

            const result = await ticketTypeService.getById(1);
            expect(result).toEqual({ id: 1 });
        });

        it('should return null if ticket type is not found', async () => {
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockResolvedValueOnce([])
                })
            });

            const result = await ticketTypeService.getById(1);
            expect(result).toBeNull();
        });

        it('should throw an error for invalid ID', async () => {
            await expect(ticketTypeService.getById(NaN)).rejects.toThrow('Invalid ticket type ID');
        });

        it('should throw an error if service fails', async () => {
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockImplementation(() => { throw new Error('DB error'); })
            });

            await expect(ticketTypeService.getById(1)).rejects.toThrow('Failed to fetch ticket type');
        });
    });

    describe('create', () => {
        it('should create a ticket type successfully', async () => {
            (db.insert as jest.Mock).mockReturnValueOnce({
                values: jest.fn().mockReturnValueOnce({
                    returning: jest.fn().mockResolvedValueOnce([{ id: 1 }])
                })
            });

            const result = await ticketTypeService.create({ eventId: 1, typeName: 'VIP', price: 1000, quantityAvailable: 50, quantitySold: 0 });
            expect(result).toEqual({ id: 1 });
        });

        it('should throw an error if service fails', async () => {
            (db.insert as jest.Mock).mockImplementation(() => { throw new Error('DB error'); });

            await expect(ticketTypeService.create({ eventId: 1, typeName: 'VIP', price: 1000, quantityAvailable: 50, quantitySold: 0 }))
                .rejects.toThrow('Failed to create ticket type');
        });
    });

    describe('update', () => {
        it('should update a ticket type successfully', async () => {
            (db.update as jest.Mock).mockReturnValueOnce({
                set: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        returning: jest.fn().mockResolvedValueOnce([{ id: 1 }])
                    })
                })
            });

            const result = await ticketTypeService.update(1, { typeName: 'Updated' });
            expect(result).toEqual({ id: 1 });
        });

        it('should return null if no ticket type is updated', async () => {
            (db.update as jest.Mock).mockReturnValueOnce({
                set: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        returning: jest.fn().mockResolvedValueOnce([])
                    })
                })
            });

            const result = await ticketTypeService.update(1, { typeName: 'Updated' });
            expect(result).toBeNull();
        });

        it('should throw an error for invalid ID', async () => {
            await expect(ticketTypeService.update(NaN, { typeName: 'Updated' })).rejects.toThrow('Invalid ticket type ID');
        });

        it('should throw an error if service fails', async () => {
            (db.update as jest.Mock).mockReturnValueOnce({
                set: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockImplementation(() => { throw new Error('DB error'); })
                })
            });

            await expect(ticketTypeService.update(1, { typeName: 'Updated' })).rejects.toThrow('Failed to update ticket type');
        });
    });

    describe('delete', () => {
        it('should delete a ticket type successfully', async () => {
            (db.delete as jest.Mock).mockReturnValueOnce({
                where: jest.fn().mockReturnValueOnce({
                    returning: jest.fn().mockResolvedValueOnce([{ id: 1 }])
                })
            });

            const result = await ticketTypeService.delete(1);
            expect(result).toEqual({ id: 1 });
        });

        it('should return null if no ticket type is deleted', async () => {
            (db.delete as jest.Mock).mockReturnValueOnce({
                where: jest.fn().mockReturnValueOnce({
                    returning: jest.fn().mockResolvedValueOnce([])
                })
            });

            const result = await ticketTypeService.delete(1);
            expect(result).toBeNull();
        });

        it('should throw an error for invalid ID', async () => {
            await expect(ticketTypeService.delete(NaN)).rejects.toThrow('Invalid ticket type ID');
        });

        it('should throw an error if service fails', async () => {
            (db.delete as jest.Mock).mockReturnValueOnce({
                where: jest.fn().mockImplementation(() => { throw new Error('DB error'); })
            });

            await expect(ticketTypeService.delete(1)).rejects.toThrow('Failed to delete ticket type');
        });
    });
});
