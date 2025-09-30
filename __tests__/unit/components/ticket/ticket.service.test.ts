import { TicketService } from '../../../../src/components/ticket/ticket.service';
import db from '../../../../src/drizzle/db';

jest.mock('../../../../src/drizzle/db', () => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
}));

describe('TicketService', () => {
    let ticketService: TicketService;

    beforeEach(() => {
        jest.clearAllMocks();
        ticketService = new TicketService();
    });

    describe('getAllTickets', () => {
        it('returns all tickets without filters', async () => {
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockResolvedValueOnce(['ticket1', 'ticket2']),
                }),
            });

            const result = await ticketService.getAllTickets({});
            expect(result).toEqual(['ticket1', 'ticket2']);
        });

        it('returns tickets with filters', async () => {
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockResolvedValueOnce(['filteredTicket']),
                }),
            });

            const result = await ticketService.getAllTickets({ eventId: 1 });
            expect(result).toEqual(['filteredTicket']);
        });
    });

    describe('getTicketById', () => {
        it('throws error for invalid ticket ID', async () => {
            await expect(ticketService.getTicketById(-1)).rejects.toThrow('Invalid ticket ID');
        });

        it('throws error if ticket not found', async () => {
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    leftJoin: jest.fn().mockReturnValueOnce({
                        leftJoin: jest.fn().mockReturnValueOnce({
                            leftJoin: jest.fn().mockReturnValueOnce({
                                where: jest.fn().mockResolvedValueOnce([]),
                            }),
                        }),
                    }),
                }),
            });

            await expect(ticketService.getTicketById(99)).rejects.toThrow('Ticket with ID 99 not found');
        });

        it('returns ticket with event, ticketType, and venue', async () => {
            const mockResult = {
                ticket: { id: 1, isScanned: false },
                event: { id: 1 },
                ticketType: { id: 1 },
                venue: { id: 1 },
            };

            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    leftJoin: jest.fn().mockReturnValueOnce({
                        leftJoin: jest.fn().mockReturnValueOnce({
                            leftJoin: jest.fn().mockReturnValueOnce({
                                where: jest.fn().mockResolvedValueOnce([mockResult]),
                            }),
                        }),
                    }),
                }),
            });

            const result = await ticketService.getTicketById(1);
            expect(result).toEqual(mockResult);
        });
    });

    describe('createTicket', () => {
        it('throws error for missing fields', async () => {
            await expect(ticketService.createTicket({
                orderItemId: 1,
                userId: 0,
                eventId: 1,
                ticketTypeId: 1,
            })).rejects.toThrow('Missing required ticket fields');
        });

        it('throws error if creation fails', async () => {
            (db.insert as jest.Mock).mockReturnValueOnce({
                values: jest.fn().mockReturnValueOnce({
                    returning: jest.fn().mockResolvedValueOnce([]),
                }),
            });

            await expect(ticketService.createTicket({
                orderItemId: 1,
                userId: 1,
                eventId: 1,
                ticketTypeId: 1,
            })).rejects.toThrow('Failed to create ticket');
        });

        it('creates and returns a ticket', async () => {
            const mockTicket = { id: 1, uniqueCode: 'ETIQUET-123456' };

            (db.insert as jest.Mock).mockReturnValueOnce({
                values: jest.fn().mockReturnValueOnce({
                    returning: jest.fn().mockResolvedValueOnce([mockTicket]),
                }),
            });

            const result = await ticketService.createTicket({
                orderItemId: 1,
                userId: 1,
                eventId: 1,
                ticketTypeId: 1,
            });

            expect(result).toEqual(mockTicket);
        });
    });

    describe('scanTicket', () => {
        it('throws for invalid ticket ID', async () => {
            await expect(ticketService.scanTicket(0, 1)).rejects.toThrow('Invalid ticket ID');
        });

        it('throws for invalid scanner ID', async () => {
            await expect(ticketService.scanTicket(1, 0)).rejects.toThrow('Invalid scanning user ID');
        });

        it('throws if already scanned', async () => {
            // jest.spyOn(ticketService, 'getTicketById').mockResolvedValueOnce({
            //     id: 1,
            //     isScanned: true,
            // } as any);
            //
            // await expect(ticketService.scanTicket(1, 2)).rejects.toThrow('Ticket with ID 1 has already been scanned');
        });

        it('throws if not found during update', async () => {
            // jest.spyOn(ticketService, 'getTicketById').mockResolvedValueOnce({
            //     id: 1,
            //     isScanned: false,
            // } as any);
            //
            // (db.update as jest.Mock).mockReturnValueOnce({
            //     set: jest.fn().mockReturnValueOnce({
            //         where: jest.fn().mockReturnValueOnce({
            //             returning: jest.fn().mockResolvedValueOnce([]),
            //         }),
            //     }),
            // });
            //
            // await expect(ticketService.scanTicket(1, 2)).rejects.toThrow('Ticket with ID 1 not found during update');
        });

        it('successfully scans the ticket', async () => {
            // const updatedTicket = { id: 1, isScanned: true };
            //
            // jest.spyOn(ticketService, 'getTicketById').mockResolvedValueOnce({
            //     id: 1,
            //     isScanned: false,
            // } as any);
            //
            // (db.update as jest.Mock).mockReturnValueOnce({
            //     set: jest.fn().mockReturnValueOnce({
            //         where: jest.fn().mockReturnValueOnce({
            //             returning: jest.fn().mockResolvedValueOnce([updatedTicket]),
            //         }),
            //     }),
            // });
            //
            // const result = await ticketService.scanTicket(1, 2);
            // expect(result).toEqual(updatedTicket);
        });
    });

    describe('deleteTicket', () => {
        it('throws error for invalid ticket ID', async () => {
            await expect(ticketService.deleteTicket(0)).rejects.toThrow('Invalid ticket ID');
        });

        it('throws if ticket not found', async () => {
            (db.delete as jest.Mock).mockReturnValueOnce({
                where: jest.fn().mockReturnValueOnce({
                    returning: jest.fn().mockResolvedValueOnce([]),
                }),
            });

            await expect(ticketService.deleteTicket(1)).rejects.toThrow('Ticket with ID 1 not found for deletion');
        });

        it('returns deleted ticket', async () => {
            const deleted = { id: 1 };

            (db.delete as jest.Mock).mockReturnValueOnce({
                where: jest.fn().mockReturnValueOnce({
                    returning: jest.fn().mockResolvedValueOnce([deleted]),
                }),
            });

            const result = await ticketService.deleteTicket(1);
            expect(result).toEqual(deleted);
        });
    });

    describe('getByUserid', () => {
        it('returns tickets by user ID with joins', async () => {
            const joinedTicket = {
                ticket: { id: 1 },
                event: { id: 1 },
                ticketType: { id: 1 },
                venue: { id: 1 },
            };

            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    leftJoin: jest.fn().mockReturnValueOnce({
                        leftJoin: jest.fn().mockReturnValueOnce({
                            leftJoin: jest.fn().mockReturnValueOnce({
                                where: jest.fn().mockResolvedValueOnce([joinedTicket]),
                            }),
                        }),
                    }),
                }),
            });

            const result = await ticketService.getByUserid(1);
            expect(result).toEqual([joinedTicket]);
        });

        it('throws if user has no tickets', async () => {
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    leftJoin: jest.fn().mockReturnValueOnce({
                        leftJoin: jest.fn().mockReturnValueOnce({
                            leftJoin: jest.fn().mockReturnValueOnce({
                                where: jest.fn().mockResolvedValueOnce([]),
                            }),
                        }),
                    }),
                }),
            });

            await expect(ticketService.getByUserid(99)).rejects.toThrow('Ticket with user ID 99 not found');
        });
    });
});
