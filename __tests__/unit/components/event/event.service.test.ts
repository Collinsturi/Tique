import { EventService } from '../../../../src/components/event/event.service';
import db from '../../../../src/drizzle/db';
import { Events, Venue, TicketTypes, Tickets } from '../../../../src/drizzle/schema';
import { eq } from 'drizzle-orm';

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
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    leftJoin: jest.fn().mockReturnValue({
                        leftJoin: jest.fn().mockReturnValue({
                            leftJoin: jest.fn().mockReturnValue({
                                where: jest.fn().mockResolvedValue([
                                    {
                                        event: { id: 1, title: 'Test Event' },
                                        venue: { id: 10, name: 'Test Venue' },
                                        ticketTypes: { id: 100 },
                                        ticket: { id: 1000 },
                                    },
                                ]),
                            }),
                        }),
                    }),
                }),
            });

            const result = await service.getAllEvents({});
            expect(result).toEqual([
                {
                    event: { id: 1, title: 'Test Event' },
                    venue: { id: 10, name: 'Test Venue' },
                    ticketTypes: { id: 100 },
                    ticket: { id: 1000 },
                },
            ]);
        });
    });

    describe('getEventById', () => {
        it('should return event by ID', async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    leftJoin: jest.fn().mockReturnValue({
                        leftJoin: jest.fn().mockReturnValue({
                            leftJoin: jest.fn().mockReturnValue({
                                where: jest.fn().mockResolvedValue([
                                    {
                                        event: { id: 1, title: 'Test Event' },
                                        venue: { id: 10, name: 'Test Venue' },
                                        ticketTypes: { id: 100 },
                                        ticket: { id: 1000 },
                                    },
                                ]),
                            }),
                        }),
                    }),
                }),
            });

            const result = await service.getEventById(1);
            expect(result).toEqual([
                {
                    event: { id: 1, title: 'Test Event' },
                    venue: { id: 10, name: 'Test Venue' },
                    ticketTypes: { id: 100 },
                    ticket: { id: 1000 },
                },
            ]);
        });

        it('should throw if event not found', async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    leftJoin: jest.fn().mockReturnValue({
                        leftJoin: jest.fn().mockReturnValue({
                            leftJoin: jest.fn().mockReturnValue({
                                where: jest.fn().mockResolvedValue([]),
                            }),
                        }),
                    }),
                }),
            });

            await expect(service.getEventById(999)).rejects.toThrow('Event with ID 999 not found');
        });
    });

    describe('createEvent', () => {
        it('should create a new event', async () => {
            (db.insert as jest.Mock).mockReturnValue({
                values: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([{ id: 1, title: 'New Event' }]),
                }),
            });

            const result = await service.createEvent({ title: 'New Event' } as any);
            expect(result).toEqual({ id: 1, title: 'New Event' });
        });
    });

    describe('updateEvent', () => {
        it('should update an event', async () => {
            (db.update as jest.Mock).mockReturnValue({
                set: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        returning: jest.fn().mockResolvedValue([{ id: 1, title: 'Updated Event' }]),
                    }),
                }),
            });

            const result = await service.updateEvent(1, { title: 'Updated Event' });
            expect(result).toEqual({ id: 1, title: 'Updated Event' });
        });
    });

    describe('deleteEvent', () => {
        it('should delete an event', async () => {
            (db.delete as jest.Mock).mockReturnValue({
                where: jest.fn().mockReturnValue({
                    returning: jest.fn().mockResolvedValue([{ id: 1 }]),
                }),
            });

            const result = await service.deleteEvent(1);
            expect(result).toEqual({ id: 1 });
        });
    });

    describe('getStaffAssignedEvents', () => {
        it('should return assigned events with ticket info', async () => {
            // mock user fetch
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([
                        { id: 5, email: 'staff@example.com', role: 'check_in_staff' },
                    ]),
                }),
            });

            // mock events fetch
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValue({
                    innerJoin: jest.fn().mockReturnValue({
                        leftJoin: jest.fn().mockReturnValue({
                            where: jest.fn().mockReturnValue({
                                groupBy: jest.fn().mockResolvedValue([
                                    {
                                        eventId: 10,
                                        title: 'Assigned Event',
                                        ticketsSold: 50,
                                        ticketsRemaining: 150,
                                    },
                                ]),
                            }),
                        }),
                    }),
                }),
            });

            const result = await service.getStaffAssignedEvents('staff@example.com');

            expect(result).toEqual([
                {
                    eventId: 10,
                    title: 'Assigned Event',
                    ticketsSold: 50,
                    ticketsRemaining: 150,
                },
            ]);
        });

        it('should throw if user is not a staff member', async () => {
            (db.select as jest.Mock).mockReturnValue({
                from: jest.fn().mockReturnValue({
                    where: jest.fn().mockResolvedValue([
                        { id: 5, email: 'staff@example.com', role: 'customer' },
                    ]),
                }),
            });

            await expect(service.getStaffAssignedEvents('staff@example.com')).rejects.toThrow(
                'User not found or not a staff member'
            );
        });
    });
});
