import { TicketService } from '../../../../src/components/ticket/ticket.service';
import db from '../../../../src/drizzle/db';
import { Tickets } from '../../../../src/schema';

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

describe('TicketService', () => {
    let ticketService: TicketService;

    beforeEach(() => {
        jest.clearAllMocks();
        ticketService = new TicketService();
    });

    describe('getAllTickets', () => {
        it('should return all tickets without filters', async () => {
            (db.select as jest.Mock).mockReturnValueOnce({ from: jest.fn().mockReturnValueOnce({ where: jest.fn().mockResolvedValueOnce(['ticket1', 'ticket2']) }) });

            const result = await ticketService.getAllTickets({});
            expect(result).toEqual(['ticket1', 'ticket2']);
        });

        it('should return tickets with filters', async () => {
            (db.select as jest.Mock).mockReturnValueOnce({ from: jest.fn().mockReturnValueOnce({ where: jest.fn().mockResolvedValueOnce(['filteredTicket']) }) });

            const result = await ticketService.getAllTickets({ eventId: 1 });
            expect(result).toEqual(['filteredTicket']);
        });
    });

    describe('getTicketById', () => {
        it('should throw error for invalid ticket ID', async () => {
            await expect(ticketService.getTicketById(-1)).rejects.toThrow('Invalid ticket ID');
        });

        it('should throw error if ticket is not found', async () => {
            (db.select as jest.Mock).mockReturnValueOnce({ from: jest.fn().mockReturnValueOnce({ where: jest.fn().mockResolvedValueOnce([]) }) });

            await expect(ticketService.getTicketById(1)).rejects.toThrow('Ticket with ID 1 not found');
        });

        it('should return ticket if found', async () => {
            (db.select as jest.Mock).mockReturnValueOnce({ from: jest.fn().mockReturnValueOnce({ where: jest.fn().mockResolvedValueOnce([{ id: 1 }]) }) });

            const result = await ticketService.getTicketById(1);
            expect(result).toEqual({ id: 1 });
        });
    });

    describe('createTicket', () => {
        it('should throw error for missing fields', async () => {
            await expect(ticketService.createTicket({ orderItemId: 1, userId: 0, eventId: 1, ticketTypeId: 1 })).rejects.toThrow('Missing required ticket fields');
        });

        it('should throw error if ticket is not created', async () => {
            (db.insert as jest.Mock).mockReturnValueOnce({ values: jest.fn().mockReturnValueOnce({ returning: jest.fn().mockResolvedValueOnce([]) }) });

            await expect(ticketService.createTicket({ orderItemId: 1, userId: 1, eventId: 1, ticketTypeId: 1 })).rejects.toThrow('Failed to create ticket');
        });

        it('should create and return a ticket', async () => {
            const mockTicket = { id: 1, uniqueCode: 'ETIQUET-123456' };
            (db.insert as jest.Mock).mockReturnValueOnce({ values: jest.fn().mockReturnValueOnce({ returning: jest.fn().mockResolvedValueOnce([mockTicket]) }) });

            const result = await ticketService.createTicket({ orderItemId: 1, userId: 1, eventId: 1, ticketTypeId: 1 });
            expect(result).toEqual(mockTicket);
        });
    });

    describe('scanTicket', () => {
        it('should throw error for invalid ticket ID', async () => {
            await expect(ticketService.scanTicket(-1, 1)).rejects.toThrow('Invalid ticket ID');
        });

        it('should throw error for invalid scanning user ID', async () => {
            await expect(ticketService.scanTicket(1, 0)).rejects.toThrow('Invalid scanning user ID');
        });

        it('should throw error if ticket is already scanned', async () => {
            jest.spyOn(ticketService, 'getTicketById').mockResolvedValueOnce({ id: 1, isScanned: true } as any);

            await expect(ticketService.scanTicket(1, 2)).rejects.toThrow('Ticket with ID 1 has already been scanned');
        });

        it('should throw error if ticket not found during update', async () => {
            jest.spyOn(ticketService, 'getTicketById').mockResolvedValueOnce({ id: 1, isScanned: false } as any);

            (db.update as jest.Mock).mockReturnValueOnce({
                set: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        returning: jest.fn().mockResolvedValueOnce([])
                    })
                })
            });

            await expect(ticketService.scanTicket(1, 2)).rejects.toThrow('Ticket with ID 1 not found during update');
        });

        it('should successfully scan ticket', async () => {
            const mockUpdatedTicket = { id: 1, isScanned: true };

            jest.spyOn(ticketService, 'getTicketById').mockResolvedValueOnce({ id: 1, isScanned: false } as any);

            (db.update as jest.Mock).mockReturnValueOnce({
                set: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        returning: jest.fn().mockResolvedValueOnce([mockUpdatedTicket])
                    })
                })
            });

            const result = await ticketService.scanTicket(1, 2);
            expect(result).toEqual(mockUpdatedTicket);
        });
    });

    describe('deleteTicket', () => {
        it('should throw error for invalid ticket ID', async () => {
            await expect(ticketService.deleteTicket(0)).rejects.toThrow('Invalid ticket ID');
        });

        it('should throw error if ticket is not found for deletion', async () => {
            (db.delete as jest.Mock).mockReturnValueOnce({
                where: jest.fn().mockReturnValueOnce({
                    returning: jest.fn().mockResolvedValueOnce([])
                })
            });

            await expect(ticketService.deleteTicket(1)).rejects.toThrow('Ticket with ID 1 not found for deletion');
        });

        it('should delete and return ticket', async () => {
            const mockDeletedTicket = { id: 1 };

            (db.delete as jest.Mock).mockReturnValueOnce({
                where: jest.fn().mockReturnValueOnce({
                    returning: jest.fn().mockResolvedValueOnce([mockDeletedTicket])
                })
            });

            const result = await ticketService.deleteTicket(1);
            expect(result).toEqual(mockDeletedTicket);
        });
    });
});
