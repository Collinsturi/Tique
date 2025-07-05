import { CustomerSupportService } from '../../../../src/components/customerSupport/customerSupport.service';
import db from '../../../../src/drizzle/db';
import { CustomerSupport } from '../../../../src/drizzle/schema';

jest.mock('../../../../src/drizzle/db');

describe('CustomerSupportService', () => {
    const service = new CustomerSupportService();

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getAll', () => {
        it('should return all customer support records', async () => {
            (db.select as jest.Mock).mockReturnValue({ from: jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }]) });

            const result = await service.getAll();

            expect(result).toEqual([{ id: 1 }, { id: 2 }]);
        });

        it('should throw an error if database fails', async () => {
            (db.select as jest.Mock).mockReturnValue({ from: jest.fn().mockRejectedValue(new Error('DB error')) });

            await expect(service.getAll()).rejects.toThrow('Failed to retrieve customer support records.');
        });
    });

    describe('getById', () => {
        it('should return the customer support record by ID', async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([{ id: 1 }])
                })
            });

            const result = await service.getById(1);

            expect(result).toEqual({ id: 1 });
        });

        it('should return null if record not found', async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([])
                })
            });

            const result = await service.getById(99);

            expect(result).toBeNull();
        });

        it('should throw an error if database fails', async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockRejectedValue(new Error('DB error'))
                })
            });

            await expect(service.getById(1)).rejects.toThrow('Failed to retrieve customer support record.');
        });
    });

    describe('create', () => {
        it('should create and return a new customer support record', async () => {
            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([{ id: 1, issue: 'Test issue' }])
                })
            });

            const result = await service.create({ issue: 'Test issue' } as any);

            expect(result).toEqual({ id: 1, issue: 'Test issue' });
        });

        it('should throw an error if database fails', async () => {
            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockRejectedValue(new Error('DB error'))
                })
            });

            await expect(service.create({ issue: 'Test issue' } as any)).rejects.toThrow('Failed to create customer support record.');
        });
    });

    describe('update', () => {
        it('should update and return the customer support record', async () => {
            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([{ id: 1, issue: 'Updated issue' }])
                    })
                })
            });

            const result = await service.update(1, { issue: 'Updated issue' });

            expect(result).toEqual({ id: 1, issue: 'Updated issue' });
        });

        it('should return null if record to update is not found', async () => {
            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([])
                    })
                })
            });

            const result = await service.update(99, { issue: 'Non-existing issue' });

            expect(result).toBeNull();
        });

        it('should throw an error if database fails', async () => {
            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockRejectedValue(new Error('DB error'))
                    })
                })
            });

            await expect(service.update(1, { issue: 'Update fail' })).rejects.toThrow('Failed to update customer support record.');
        });
    });

    describe('delete', () => {
        it('should delete and return the customer support record', async () => {
            (db.delete as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([{ id: 1 }])
                })
            });

            const result = await service.delete(1);

            expect(result).toEqual({ id: 1 });
        });

        it('should return null if record to delete is not found', async () => {
            (db.delete as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([])
                })
            });

            const result = await service.delete(99);

            expect(result).toBeNull();
        });

        it('should throw an error if database fails', async () => {
            (db.delete as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({
                    returning: jest.fn().mockRejectedValue(new Error('DB error'))
                })
            });

            await expect(service.delete(1)).rejects.toThrow('Failed to delete customer support record.');
        });
    });
});
