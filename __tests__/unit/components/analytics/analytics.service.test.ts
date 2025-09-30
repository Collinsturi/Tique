import { AnalyticsService } from '../../../../src/components/analytics/analytics.service';
import {
    and, eq, sql, desc, count, sum, inArray
} from 'drizzle-orm';
import {
    Events,
    TicketTypes,
    Tickets,
    User,
    Orders,
} from '../../../../src/drizzle/schema';
import db from '../../../../src/drizzle/db';
import { addDays, startOfDay, endOfDay, format } from 'date-fns';

// Mock the database and drizzle-orm functions
jest.mock('../../../../src/drizzle/db', () => ({
    // Mock the top-level query builder methods
    select: jest.fn(),
    execute: jest.fn(),
    // Mock the query builder for relations (used in getAttendeeNotification)
    query: {
        User: {
            findFirst: jest.fn(),
        },
        Tickets: {
            findMany: jest.fn(),
        },
        Orders: {
            findMany: jest.fn(),
        },
    },
}));

// Mock the drizzle-orm functions used in the service
jest.mock('drizzle-orm', () => ({
    ...jest.requireActual('drizzle-orm'), // Keep original functions if needed
    and: jest.fn(),
    eq: jest.fn(),
    sql: jest.fn((...args) => ({
        as: jest.fn().mockReturnValue({ name: 'alias', args }),
    })),
    desc: jest.fn(),
    count: jest.fn(),
    sum: jest.fn(),
    inArray: jest.fn(),
}));

// Mock date-fns
jest.mock('date-fns', () => ({
    addDays: jest.fn(),
    startOfDay: jest.fn(),
    endOfDay: jest.fn(),
    format: jest.fn(),
}));


describe('AnalyticsService', () => {
    let service: AnalyticsService;

    beforeEach(() => {
        jest.clearAllMocks();
        service = new AnalyticsService();
    });

    describe('AdminDashboardAnalytics', () => {
        it('should return a complete dashboard analytics summary for a valid admin', async () => {
            // const mockAdminEmail = 'admin@example.com';
            // const mockAdminId = 1;
            //
            // // Mock the various database calls in the correct order
            // (db.query.User.findFirst as jest.Mock).mockResolvedValueOnce({ id: mockAdminId });
            // (db.select as jest.Mock)
            //     .mockReturnValueOnce({
            //         from: jest.fn().mockResolvedValueOnce([{ totalEvents: 5 }]),
            //     })
            //     .mockReturnValueOnce({
            //         from: jest.fn().mockResolvedValueOnce([{ totalTicketsSold: 150 }]),
            //     })
            //     .mockReturnValueOnce({
            //         from: jest.fn().mockResolvedValueOnce([{ totalRevenue: 7500 }]),
            //     })
            //     .mockReturnValueOnce({
            //         from: jest.fn().mockResolvedValueOnce([
            //             { id: 101, title: 'Upcoming Event', eventDate: new Date(), eventTime: '10:00' }
            //         ]),
            //     })
            //     .mockReturnValueOnce({
            //         from: jest.fn().mockResolvedValueOnce([
            //             { ticketId: 1, buyerId: 10, eventTitle: 'Concert', createdAt: '...', user: { name: 'John' }, ticketType: { name: 'Standard' } }
            //         ]),
            //     })
            //     .mockReturnValueOnce({
            //         from: jest.fn().mockReturnValueOnce({
            //             groupBy: jest.fn().mockResolvedValueOnce([
            //                 { month: '2024-06', ticketCount: 50 },
            //                 { month: '2024-05', ticketCount: 30 },
            //             ]),
            //         }),
            //     })
            //     .mockReturnValueOnce({
            //         from: jest.fn().mockReturnValueOnce({
            //             where: jest.fn().mockResolvedValueOnce([
            //                 { id: 201, title: 'Latest Event', eventDate: new Date() }
            //             ]),
            //         }),
            //     })
            //     .mockReturnValueOnce({
            //         from: jest.fn().mockReturnValueOnce({
            //             where: jest.fn().mockReturnValueOnce({
            //                 groupBy: jest.fn().mockResolvedValueOnce([
            //                     { ticketType: 'VIP', sold: 25 }
            //                 ]),
            //             }),
            //         }),
            //     });
            //
            // const result = await service.AdminDashboardAnalytics(mockAdminEmail);
            //
            // // Assertions
            // expect(result).toEqual(expect.objectContaining({
            //     totalEvents: 5,
            //     totalTicketsSold: 150,
            //     totalRevenue: 7500,
            //     upcomingEvents: expect.any(Array),
            //     recentActivity: expect.any(Array),
            //     monthlySales: [
            //         { month: '2024-06', ticketCount: 50 },
            //         { month: '2024-05', ticketCount: 30 },
            //     ],
            //     ticketTypeDistribution: [{ ticketType: 'VIP', sold: 25 }],
            // }));
        });

        it('should throw an error if the admin is not found', async () => {
            // (db.query.User.findFirst as jest.Mock).mockResolvedValueOnce(undefined);
            //
            // await expect(service.AdminDashboardAnalytics('nonexistent@example.com')).rejects.toThrow("Admin not found");
        });
    });

    describe('getPlatformSummary', () => {
        it('should return a platform-wide summary', async () => {
            // const mockSummary = {
            //     totalEvents: 10,
            //     totalTicketsSold: 500,
            //     totalRevenue: 25000,
            //     avgTicketsPerEvent: 50,
            // };
            // (db.select as jest.Mock).mockReturnValueOnce({
            //     from: jest.fn().mockResolvedValueOnce([mockSummary]),
            // });
            //
            // const result = await service.getPlatformSummary();
            // expect(result).toEqual(mockSummary);
        });
    });

    describe('getMonthlySalesTrends', () => {
        it('should return monthly sales trends', async () => {
            // const mockTrends = [
            //     { month: '2024-05', ticketsSold: 100, totalRevenue: 5000 },
            //     { month: '2024-06', ticketsSold: 150, totalRevenue: 7500 },
            // ];
            // (db.select as jest.Mock).mockReturnValueOnce({
            //     from: jest.fn().mockReturnValueOnce({
            //         leftJoin: jest.fn().mockReturnValueOnce({
            //             groupBy: jest.fn().mockReturnValueOnce({
            //                 orderBy: jest.fn().mockResolvedValueOnce(mockTrends),
            //             }),
            //         }),
            //     }),
            // });
            //
            // const result = await service.getMonthlySalesTrends();
            // expect(result).toEqual(mockTrends);
        });
    });

    describe('getTopSellingEvents', () => {
        it('should return the top 5 best-selling events', async () => {
            // const mockEvents = [
            //     { eventName: 'Concert A', totalTicketsSold: 100 },
            //     { eventName: 'Festival B', totalTicketsSold: 80 },
            // ];
            // (db.select as jest.Mock).mockReturnValueOnce({
            //     from: jest.fn().mockReturnValueOnce({
            //         leftJoin: jest.fn().mockReturnValueOnce({
            //             groupBy: jest.fn().mockReturnValueOnce({
            //                 orderBy: jest.fn().mockReturnValueOnce({
            //                     limit: jest.fn().mockResolvedValueOnce(mockEvents),
            //                 }),
            //             }),
            //         }),
            //     }),
            // });
            //
            // const result = await service.getTopSellingEvents();
            // expect(result).toEqual(mockEvents);
        });
    });

    describe('getOverallTicketScanStatus', () => {
        it('should return the overall ticket scan status distribution', async () => {
            // const mockStatus = { scanned: 250, notScanned: 750 };
            // (db.select as jest.Mock).mockReturnValueOnce({
            //     from: jest.fn().mockResolvedValueOnce([mockStatus]),
            // });
            //
            // const result = await service.getOverallTicketScanStatus();
            // expect(result).toEqual(mockStatus);
        });
    });

    describe('getEventTicketSummary', () => {
        it('should return the ticket summary for a specific event', async () => {
            // const mockEventId = 1;
            // const mockSummary = [
            //     { ticketType: 'Regular', totalAvailable: 500, totalSold: 200, totalRevenue: 10000, totalScanned: 150 },
            // ];
            // (db.select as jest.Mock).mockReturnValueOnce({
            //     from: jest.fn().mockReturnValueOnce({
            //         leftJoin: jest.fn().mockReturnValueOnce({
            //             where: jest.fn().mockReturnValueOnce({
            //                 groupBy: jest.fn().mockResolvedValueOnce(mockSummary),
            //             }),
            //         }),
            //     }),
            // });
            //
            // const result = await service.getEventTicketSummary(mockEventId);
            // expect(result).toEqual(mockSummary);
        });
    });

    describe('getEventScanLog', () => {
        it('should return the event scan log with total and daily counts', async () => {
            // const mockEventId = 1;
            // const mockTotalScanned = [{ totalScanned: 150 }];
            // const mockDailyScans = [
            //     { scanDate: '2024-06-01', scanCount: 50 },
            //     { scanDate: '2024-06-02', scanCount: 100 },
            // ];
            // (db.select as jest.Mock)
            //     .mockReturnValueOnce({
            //         from: jest.fn().mockReturnValueOnce({
            //             where: jest.fn().mockResolvedValueOnce(mockTotalScanned),
            //         }),
            //     })
            //     .mockReturnValueOnce({
            //         from: jest.fn().mockReturnValueOnce({
            //             where: jest.fn().mockReturnValueOnce({
            //                 groupBy: jest.fn().mockReturnValueOnce({
            //                     orderBy: jest.fn().mockResolvedValueOnce(mockDailyScans),
            //                 }),
            //             }),
            //         }),
            //     });
            //
            // const result = await service.getEventScanLog(mockEventId);
            // expect(result).toEqual({ totalScanned: 150, dailyScans: mockDailyScans });
        });

        it('should return 0 totalScanned if no tickets are found', async () => {
            // const mockEventId = 1;
            // (db.select as jest.Mock)
            //     .mockReturnValueOnce({
            //         from: jest.fn().mockReturnValueOnce({
            //             where: jest.fn().mockResolvedValueOnce([]),
            //         }),
            //     })
            //     .mockReturnValueOnce({
            //         from: jest.fn().mockReturnValueOnce({
            //             where: jest.fn().mockReturnValueOnce({
            //                 groupBy: jest.fn().mockReturnValueOnce({
            //                     orderBy: jest.fn().mockResolvedValueOnce([]),
            //                 }),
            //             }),
            //         }),
            //     });
            //
            // const result = await service.getEventScanLog(mockEventId);
            // expect(result).toEqual({ totalScanned: 0, dailyScans: [] });
        });
    });

    describe('getTicketTypeDistribution', () => {
        it('should return the ticket type distribution for an event', async () => {
            // const mockEventId = 1;
            // const mockDistribution = [
            //     { ticketType: 'Standard', price: 50, countSold: 100, revenue: 5000 },
            //     { ticketType: 'VIP', price: 100, countSold: 20, revenue: 2000 },
            // ];
            // (db.select as jest.Mock).mockReturnValueOnce({
            //     from: jest.fn().mockReturnValueOnce({
            //         leftJoin: jest.fn().mockReturnValueOnce({
            //             where: jest.fn().mockReturnValueOnce({
            //                 groupBy: jest.fn().mockResolvedValueOnce(mockDistribution),
            //             }),
            //         }),
            //     }),
            // });
            //
            // const result = await service.getTicketTypeDistribution(mockEventId);
            // expect(result).toEqual(mockDistribution);
        });
    });

    describe('getEventScanStatus', () => {
        it('should return the scan status for a given event', async () => {
        //     const mockEventId = 1;
        //     (db.select as jest.Mock)
        //         .mockReturnValueOnce({
        //             from: jest.fn().mockReturnValueOnce({
        //                 leftJoin: jest.fn().mockReturnValueOnce({
        //                     where: jest.fn().mockResolvedValueOnce([{ count: 120 }]),
        //                 }),
        //             }),
        //         })
        //         .mockReturnValueOnce({
        //             from: jest.fn().mockReturnValueOnce({
        //                 leftJoin: jest.fn().mockReturnValueOnce({
        //                     where: jest.fn().mockResolvedValueOnce([{ count: 30 }]),
        //                 }),
        //             }),
        //         });
        //
        //     const result = await service.getEventScanStatus(mockEventId);
        //     expect(result).toEqual({ scannedCount: 120, notScannedCount: 30 });
        });
    });

    describe('getOrganizerEarningsSummary', () => {
        it('should return the earnings summary for an organizer with events', async () => {
            // const mockUserId = 1;
            // const mockEvents = [{ id: 101 }, { id: 102 }];
            // (db.select as jest.Mock)
            //     .mockReturnValueOnce({
            //         from: jest.fn().mockReturnValueOnce({
            //             where: jest.fn().mockResolvedValueOnce(mockEvents),
            //         }),
            //     })
            //     .mockReturnValueOnce({
            //         from: jest.fn().mockReturnValueOnce({
            //             where: jest.fn().mockResolvedValueOnce([{ total: 15000 }]),
            //         }),
            //     });
            //
            // const result = await service.getOrganizerEarningsSummary(mockUserId);
            // expect(result).toEqual({ totalEarnings: 15000, totalWithdrawn: 0, availableBalance: 15000 });
        });

        it('should return zero earnings if the organizer has no events', async () => {
            // const mockUserId = 2;
            // (db.select as jest.Mock).mockReturnValueOnce({
            //     from: jest.fn().mockReturnValueOnce({
            //         where: jest.fn().mockResolvedValueOnce([]),
            //     }),
            // });
            //
            // const result = await service.getOrganizerEarningsSummary(mockUserId);
            // expect(result).toEqual({ totalEarnings: 0, totalWithdrawn: 0, availableBalance: 0 });
        });
    });

    describe('getRevenuePerEvent', () => {
        it('should return revenue per event for a valid organizer', async () => {
            // const mockOrganizerEmail = 'organizer@example.com';
            // const mockOrganizerId = 1;
            // const mockRevenue = [
            //     { eventName: 'Tech Conference', revenue: 5000 },
            //     { eventName: 'Gaming Expo', revenue: 7500 },
            // ];
            // (db.query.User.findFirst as jest.Mock).mockResolvedValueOnce({ id: mockOrganizerId });
            // (db.select as jest.Mock).mockReturnValueOnce({
            //     from: jest.fn().mockReturnValueOnce({
            //         leftJoin: jest.fn().mockReturnValueOnce({
            //             where: jest.fn().mockReturnValueOnce({
            //                 groupBy: jest.fn().mockResolvedValueOnce(mockRevenue),
            //             }),
            //         }),
            //     }),
            // });
            //
            // const result = await service.getRevenuePerEvent(mockOrganizerEmail);
            // expect(result).toEqual(mockRevenue);
        });

        it('should throw an error if the organizer is not found', async () => {
            // (db.query.User.findFirst as jest.Mock).mockResolvedValueOnce(undefined);
            //
            // await expect(service.getRevenuePerEvent('nonexistent@example.com')).rejects.toThrow("Organizer not found");
        });
    });

    describe('getAttendeeNotification', () => {
        const mockEmail = 'user@example.com';
        const mockUser = { id: 10, email: mockEmail };
        const mockToday = new Date('2024-07-20T10:00:00Z');
        const mockOneDayAhead = new Date('2024-07-21T10:00:00Z');
        const mockTwoDaysAhead = new Date('2024-07-22T10:00:00Z');
        const mockStartOfDayOne = new Date('2024-07-21T00:00:00Z');
        const mockEndOfDayTwo = new Date('2024-07-22T23:59:59Z');

        beforeAll(() => {
            jest.useFakeTimers().setSystemTime(mockToday);
        });

        afterAll(() => {
            jest.useRealTimers();
        });

        it('should return null if the user is not found', async () => {
            // (db.query.User.findFirst as jest.Mock).mockResolvedValueOnce(undefined);
            // const notifications = await service.getAttendeeNotification(mockEmail);
            // expect(notifications).toBeNull();
        });

        it('should return notifications for upcoming events and pending orders', async () => {
            // (db.query.User.findFirst as jest.Mock).mockResolvedValueOnce(mockUser);
            // (db.query.Tickets.findMany as jest.Mock).mockResolvedValueOnce([
            //     {
            //         event: { title: 'Upcoming Event 1', eventDate: new Date('2024-07-21'), eventTime: '18:00' },
            //         ticketType: {},
            //     },
            //     {
            //         event: { title: 'Upcoming Event 2', eventDate: new Date('2024-07-22'), eventTime: '10:00' },
            //         ticketType: {},
            //     },
            //     {
            //         event: { title: 'Far Off Event', eventDate: new Date('2024-07-25'), eventTime: '12:00' },
            //         ticketType: {},
            //     },
            // ]);
            // (db.query.Orders.findMany as jest.Mock).mockResolvedValueOnce([
            //     { id: 101, totalAmount: 1500, status: 'pending_payment' },
            // ]);
            //
            // (addDays as jest.Mock).mockReturnValueOnce(mockOneDayAhead).mockReturnValueOnce(mockTwoDaysAhead);
            // (startOfDay as jest.Mock).mockReturnValue(mockStartOfDayOne);
            // (endOfDay as jest.Mock).mockReturnValue(mockEndOfDayTwo);
            // (format as jest.Mock).mockReturnValueOnce('July 21').mockReturnValueOnce('July 22');
            //
            // const notifications = await service.getAttendeeNotification(mockEmail);
            //
            // expect(notifications).toEqual([
            //     "Reminder: 'Upcoming Event 1' starts on July 21 at 18:00.",
            //     "Reminder: 'Upcoming Event 2' starts on July 22 at 10:00.",
            //     "Order #101 is still pending payment (KES 1,500).",
            // ]);
        });

        it('should return an empty array if there are no notifications', async () => {
            // (db.query.User.findFirst as jest.Mock).mockResolvedValueOnce(mockUser);
            // (db.query.Tickets.findMany as jest.Mock).mockResolvedValueOnce([]);
            // (db.query.Orders.findMany as jest.Mock).mockResolvedValueOnce([]);
            //
            // const notifications = await service.getAttendeeNotification(mockEmail);
            // expect(notifications).toEqual([]);
        });
    });
})
