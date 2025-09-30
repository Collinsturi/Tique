import { EventService } from '../../../../src/components/event/event.service';
import db from '../../../../src/drizzle/db';
import { Events, Venue, TicketTypes, Tickets, StaffAssignments, User } from '../../../../src/drizzle/schema';
import { eq, and, inArray, lte, gte, lt, sql } from 'drizzle-orm';
import { addDays, startOfToday, format } from 'date-fns';

// Mock the database and drizzle-orm functions
jest.mock('../../../../src/drizzle/db', () => ({
    select: jest.fn(),
    insert: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    // Mock for direct query methods if needed
    query: {
        User: {
            findFirst: jest.fn(),
        },
        Events: {
            findFirst: jest.fn(),
        },
    },
}));

jest.mock('drizzle-orm', () => ({
    ...jest.requireActual('drizzle-orm'), // Keep original functions
    eq: jest.fn(),
    and: jest.fn(),
    inArray: jest.fn(),
    lte: jest.fn(),
    gte: jest.fn(),
    lt: jest.fn(),
    sql: jest.fn((str, ...params) => ({
        as: jest.fn().mockReturnValue({ name: str, params }),
        mapWith: jest.fn().mockReturnValue({ name: str, params }),
    })),
}));

jest.mock('date-fns', () => ({
    addDays: jest.fn(),
    startOfToday: jest.fn(),
    format: jest.fn(),
}));

describe('EventService', () => {
    let service: EventService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new EventService();
    });

    // Helper to mock a chained query
    const mockChainedQuery = (mockedValue) => ({
        from: jest.fn().mockReturnValue({
            leftJoin: jest.fn().mockReturnValue({
                leftJoin: jest.fn().mockReturnValue({
                    where: jest.fn().mockReturnValue({
                        groupBy: jest.fn().mockResolvedValue(mockedValue),
                        orderBy: jest.fn().mockResolvedValue(mockedValue),
                        execute: jest.fn().mockResolvedValue(mockedValue),
                        // Add other chain methods here as needed
                    }),
                    groupBy: jest.fn().mockResolvedValue(mockedValue),
                }),
                where: jest.fn().mockResolvedValue(mockedValue),
                groupBy: jest.fn().mockResolvedValue(mockedValue),
            }),
            innerJoin: jest.fn().mockReturnValue({
                leftJoin: jest.fn().mockReturnValue({
                    leftJoin: jest.fn().mockReturnValue({
                        where: jest.fn().mockReturnValue({
                            groupBy: jest.fn().mockResolvedValue(mockedValue),
                            orderBy: jest.fn().mockResolvedValue(mockedValue),
                        }),
                    }),
                    where: jest.fn().mockReturnValue({
                        groupBy: jest.fn().mockResolvedValue(mockedValue),
                    }),
                }),
                where: jest.fn().mockResolvedValue(mockedValue),
            }),
            where: jest.fn().mockResolvedValue(mockedValue),
            returning: jest.fn().mockResolvedValue(mockedValue),
        }),
        where: jest.fn().mockResolvedValue(mockedValue),
    });

    describe('getAllEvents', () => {
        it('should fetch all events without filters', async () => {
            const mockEvents = [{
                id: 1,
                title: 'Test Event',
                venueId: 1,
                venueName: 'Test Venue',
                venueAddress: '123 Main St',
                venueCapacity: 500,
                totalTicketsSold: 100,
                totalTicketsAvailable: 200,
                ticketsRemaining: 100,
            }];

            const mockTicketTypes = [
                { id: 10, eventId: 1, typeName: 'Standard', price: 50 }
            ];

            // Mock the first query (the main event data)
            (db.select as jest.Mock).mockReturnValueOnce(mockChainedQuery(mockEvents));
            // Mock the second query (the ticket types)
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockResolvedValue(mockTicketTypes)
                })
            });

            const result = await service.getAllEvents({});

            expect(result).toEqual([{
                id: 1,
                title: 'Test Event',
                venueId: 1,
                venueName: 'Test Venue',
                venueAddress: '123 Main St',
                venueCapacity: 500,
                totalTicketsSold: 100,
                totalTicketsAvailable: 200,
                ticketsRemaining: 100,
                venue: {
                    id: 1,
                    name: 'Test Venue',
                    address: '123 Main St',
                    capacity: 500,
                },
                ticketTypes: mockTicketTypes,
            }]);
        });
    });

    describe('getEventById', () => {
        it('should return event by ID', async () => {
            const mockEvent = [{
                id: 1,
                title: 'Test Event',
                venueId: 1,
                venueName: 'Test Venue',
                venueAddress: '123 Main St',
                venueCapacity: 500,
                totalTicketsSold: 100,
                totalTicketsAvailable: 200,
            }];
            const mockTicketTypes = [
                { id: 10, eventId: 1, typeName: 'Standard' }
            ];
            const mockTickets = [
                { id: 100, eventId: 1, uniqueCode: 'ABC' }
            ];

            // Mock the three distinct queries in sequence
            (db.select as jest.Mock).mockReturnValueOnce(mockChainedQuery(mockEvent));
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockResolvedValue(mockTicketTypes)
                })
            });
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockResolvedValue(mockTickets)
                })
            });

            const result = await service.getEventById(1);

            expect(result).toEqual({
                ...mockEvent[0],
                venue: {
                    id: mockEvent[0].venueId,
                    name: mockEvent[0].venueName,
                    address: mockEvent[0].venueAddress,
                    capacity: mockEvent[0].venueCapacity,
                },
                ticketTypes: mockTicketTypes,
                tickets: mockTickets,
            });
        });

        it('should throw if event not found', async () => {
            // Mock the first query to return an empty array
            (db.select as jest.Mock).mockReturnValueOnce(mockChainedQuery([]));

            await expect(service.getEventById(999)).rejects.toThrow('Event with ID 999 not found');
        });
    });

    describe('createEvent', () => {
        // it('should create a new event with a new venue', async () => {
        //     const organizerEmail = 'organizer@test.com';
        //     const mockOrganizer = { id: 10, email: organizerEmail, role: 'organizer' };
        //     const mockNewVenue = { id: 20, name: 'Test Event Venue' };
        //     const mockNewEvent = { id: 30, title: 'Test Event' };
        //     const mockTicketTypeInsert = [{ id: 40 }];
        //
        //     const eventPayload = {
        //         category: 'Music',
        //         name: 'Test Event',
        //         description: 'A cool event',
        //         startDate: '2024-08-01T10:00:00.000Z',
        //         endDate: '2024-08-01T12:00:00.000Z',
        //         address: '123 Test St',
        //         city: 'Test City',
        //         country: 'Testland',
        //         organizerEmail,
        //         ticketTypes: [{ name: 'VIP', price: 100, quantityAvailable: 50 }],
        //     };
        //
        //     // Mock the sequence of DB calls
        //     // 1. Find organizer
        //     (db.select as jest.Mock).mockReturnValueOnce(mockChainedQuery([mockOrganizer]));
        //     // 2. Insert new venue
        //     (db.insert as jest.Mock).mockReturnValueOnce({
        //         values: jest.fn().mockReturnValueOnce({
        //             returning: jest.fn().mockResolvedValueOnce([mockNewVenue]),
        //             execute: jest.fn().mockResolvedValueOnce([mockNewVenue]),
        //         }),
        //     });
        //     // 3. Insert new event
        //     (db.insert as jest.Mock).mockReturnValueOnce({
        //         values: jest.fn().mockReturnValueOnce({
        //             returning: jest.fn().mockResolvedValueOnce([mockNewEvent]),
        //             execute: jest.fn().mockResolvedValueOnce([mockNewEvent]),
        //         }),
        //     });
        //     // 4. Insert ticket types
        //     (db.insert as jest.Mock).mockReturnValueOnce({
        //         values: jest.fn().mockReturnValueOnce({
        //             execute: jest.fn().mockResolvedValueOnce(mockTicketTypeInsert),
        //         }),
        //     });
        //
        //     const result = await service.createEvent(eventPayload);
        //
        //     expect(result).toEqual({
        //         success: true,
        //         message: 'Event created successfully!',
        //         eventId: mockNewEvent.id,
        //     });
        // });
    });

    describe('updateEvent', () => {
        it('should update an event', async () => {
            const mockUpdatedEvent = { id: 1, title: 'Updated Event Title' };
            (db.update as jest.Mock).mockReturnValueOnce({
                set: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        returning: jest.fn().mockResolvedValueOnce([mockUpdatedEvent]),
                    }),
                }),
            });

            const result = await service.updateEvent(1, { title: 'Updated Event Title' });
            expect(result).toEqual(mockUpdatedEvent);
        });

        it('should throw if event not found', async () => {
            (db.update as jest.Mock).mockReturnValueOnce({
                set: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        returning: jest.fn().mockResolvedValueOnce([]),
                    }),
                }),
            });

            await expect(service.updateEvent(99, { title: 'No-op' })).rejects.toThrow('Event with ID 99 not found');
        });
    });

    describe('deleteEvent', () => {
        it('should delete an event', async () => {
            const mockDeletedEvent = { id: 1, title: 'Deleted Event' };
            (db.delete as jest.Mock).mockReturnValueOnce({
                where: jest.fn().mockReturnValueOnce({
                    returning: jest.fn().mockResolvedValueOnce([mockDeletedEvent]),
                }),
            });

            const result = await service.deleteEvent(1);
            expect(result).toEqual(mockDeletedEvent);
        });

        it('should throw if event not found', async () => {
            (db.delete as jest.Mock).mockReturnValueOnce({
                where: jest.fn().mockReturnValueOnce({
                    returning: jest.fn().mockResolvedValueOnce([]),
                }),
            });

            await expect(service.deleteEvent(99)).rejects.toThrow('Event with ID 99 not found');
        });
    });

    describe('getStaffAssignedEvents', () => {
        it('should return assigned events with ticket info', async () => {
            const mockUser = { id: 1, role: 'check_in_staff' };
            const mockEvents = [{ eventId: 10, title: 'Event A', ticketsSold: 50, ticketsRemaining: 20 }];

            // Mock the user query
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        then: jest.fn().mockResolvedValueOnce(mockUser),
                    }),
                }),
            });

            // Mock the events query
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    innerJoin: jest.fn().mockReturnValueOnce({
                        leftJoin: jest.fn().mockReturnValueOnce({
                            where: jest.fn().mockReturnValueOnce({
                                groupBy: jest.fn().mockResolvedValueOnce(mockEvents),
                            }),
                        }),
                    }),
                }),
            });

            const result = await service.getStaffAssignedEvents('staff@test.com');
            expect(result).toEqual(mockEvents);
        });

        it('should throw if user is not a staff member', async () => {
            const mockUser = { id: 1, role: 'organizer' };
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        then: jest.fn().mockResolvedValueOnce(mockUser),
                    }),
                }),
            });

            await expect(service.getStaffAssignedEvents('organizer@test.com')).rejects.toThrow('User not found or not a staff member');
        });
    });

    describe('getUpcomingEvents', () => {
        it('should return upcoming events for an organizer', async () => {
            const mockUser = { id: 1, role: 'organizer' };
            const mockEvents = [{ eventId: 1, title: 'Upcoming Event', ticketsSold: 10, ticketsRemaining: 90, ticketsScanned: 0 }];

            (startOfToday as jest.Mock).mockReturnValue(new Date('2024-07-20'));
            (addDays as jest.Mock).mockReturnValue(new Date('2024-08-19'));
            (format as jest.Mock).mockReturnValue('2024-07-20');
            (format as jest.Mock).mockReturnValue('2024-08-19');

            (db.select as jest.Mock)
                .mockReturnValueOnce({
                    from: jest.fn().mockReturnValueOnce({
                        where: jest.fn().mockReturnValueOnce({
                            then: jest.fn().mockResolvedValueOnce(mockUser),
                        }),
                    }),
                })
                .mockReturnValueOnce({
                    from: jest.fn().mockReturnValueOnce({
                        leftJoin: jest.fn().mockReturnValueOnce({
                            where: jest.fn().mockReturnValueOnce({
                                orderBy: jest.fn().mockResolvedValueOnce(mockEvents),
                            }),
                        }),
                    }),
                });

            const result = await service.getUpcomingEvents('organizer@test.com');
            expect(result).toEqual(mockEvents);
        });

        it('should throw if user is not an organizer', async () => {
            const mockUser = { id: 1, role: 'check_in_staff' };
            (db.select as jest.Mock).mockReturnValueOnce({
                from: jest.fn().mockReturnValueOnce({
                    where: jest.fn().mockReturnValueOnce({
                        then: jest.fn().mockResolvedValueOnce(mockUser),
                    }),
                }),
            });

            await expect(service.getUpcomingEvents('staff@test.com')).rejects.toThrow('User not found or not an organizer');
        });
    });

    describe('assignStaff', () => {
        it('should assign new staff to an event', async () => {
            const mockRequester = { id: 1, role: 'organizer' };
            const mockEvent = { id: 10, organizerId: 1 };
            const mockStaffUsers = [{ id: 100, email: 'staff1@test.com' }];
            const mockExistingAssignments = [];
            const mockNewAssignment = { userId: 100, eventId: 10 };

            // Mock the queries in order
            (db.select as jest.Mock)
                .mockReturnValueOnce(mockChainedQuery([mockRequester])) // Requester
                .mockReturnValueOnce(mockChainedQuery([mockEvent]))    // Event
                .mockReturnValueOnce(mockChainedQuery(mockStaffUsers)) // Staff users
                .mockReturnValueOnce(mockChainedQuery(mockExistingAssignments)); // Existing assignments

            (db.insert as jest.Mock).mockReturnValueOnce({
                values: jest.fn().mockResolvedValueOnce([mockNewAssignment]),
            });

            const result = await service.assignStaff('organizer@test.com', ['staff1@test.com'], 10);
            expect(result).toEqual({
                assigned: 1,
                alreadyAssigned: 0,
                notFound: [],
                totalRequested: 1
            });
        });

        // it('should handle already assigned staff and not-found staff', async () => {
        //     const mockRequester = { id: 1, role: 'organizer' };
        //     const mockEvent = { id: 10, organizerId: 1 };
        //     const mockStaffUsers = [{ id: 100, email: 'staff1@test.com' }, { id: 101, email: 'staff2@test.com' }];
        //     const mockExistingAssignments = [{ userId: 100 }];
        //
        //     (db.select as jest.Mock)
        //         .mockReturnValueOnce(mockChainedQuery([mockRequester]))
        //         .mockReturnValueOnce(mockChainedQuery([mockEvent]))
        //         .mockReturnValueOnce(mockChainedQuery(mockStaffUsers))
        //         .mockReturnValueOnce(mockChainedQuery(mockExistingAssignments));
        //
        //     const result = await service.assignStaff('organizer@test.com', ['staff1@test.com', 'staff2@test.com', 'nonexistent@test.com'], 10);
        //     expect(result).toEqual({
        //         assigned: 1,
        //         alreadyAssigned: 1,
        //         notFound: ['nonexistent@test.com'],
        //         totalRequested: 3
        //     });
        //     // Ensure insert was called for only one new assignment
        //     expect(db.insert).toHaveBeenCalledTimes(1);
        // });

        it('should throw if requester is not admin or organizer', async () => {
            const mockRequester = { id: 1, role: 'attendee' };
            (db.select as jest.Mock).mockReturnValueOnce(mockChainedQuery([mockRequester]));

            await expect(service.assignStaff('attendee@test.com', ['staff1@test.com'], 10)).rejects.toThrow('Only admin or organizer can assign staff');
        });
    });
});
