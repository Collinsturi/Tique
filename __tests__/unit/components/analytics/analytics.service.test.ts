// import { and, eq, sql, desc, count, sum, gte, inArray } from "drizzle-orm";
// import {
//     Events,
//     TicketTypes,
//     Tickets,
//     User,
//     OrderItems,
//     Orders,
//     Payment,
// } from "../../../../src/drizzle/schema"; // Adjust path as necessary
// import db from "../../../../src/drizzle/db"; // Adjust path as necessary
// import { AnalyticsService } from "../../../../src/components/analytics/analytics.service"; // Adjust path as necessary
//
// // Mock Drizzle ORM functions
// jest.mock("drizzle-orm", () => ({
//     and: jest.fn((...args) => args.filter(Boolean).join(' AND ')), // Simple representation for testing
//     eq: jest.fn((col, val) => `${col.name} = ${val}`), // Simple representation for testing
//     sql: jest.fn((strings, ...values) => {
//         let result = strings[0];
//         for (let i = 0; i < values.length; i++) {
//             result += values[i];
//             result += strings[i + 1] || '';
//         }
//         // Mock mapWith for sql expressions
//         const mockSqlExpression = {
//             name: result,
//             mapWith: jest.fn(() => mockSqlExpression), // Allow chaining .mapWith(Number)
//             as: jest.fn((alias) => ({ name: alias, value: result })), // Allow chaining .as('alias')
//         };
//         return mockSqlExpression;
//     }),
//     desc: jest.fn((col) => `DESC(${col.name})`), // Simple representation for testing
//     count: jest.fn(() => ({ name: 'count', value: 'COUNT(*)' })), // Simple representation for testing
//     sum: jest.fn((col) => ({ name: 'sum', value: `SUM(${col.name})` })), // Simple representation for testing
//     gte: jest.fn((col, val) => `${col.name} >= ${val}`), // Simple representation for testing
//     inArray: jest.fn((col, arr) => `${col.name} IN (${arr.join(',')})`), // Simple representation for testing
// }));
//
// // Mock Drizzle DB instance
// const mockThen = jest.fn();
// const mockExecute = jest.fn();
//
// const mockQueryBuilder = {
//     from: jest.fn().mockReturnThis(),
//     where: jest.fn().mockReturnThis(),
//     leftJoin: jest.fn().mockReturnThis(),
//     innerJoin: jest.fn().mockReturnThis(),
//     groupBy: jest.fn().mockReturnThis(),
//     orderBy: jest.fn().mockReturnThis(),
//     limit: jest.fn().mockReturnThis(),
//     then: mockThen, // This is where the actual data will be returned
//     execute: mockExecute, // For raw SQL queries
// };
//
// jest.mock("../../../../src/drizzle/db", () => ({
//     select: jest.fn(() => mockQueryBuilder),
//     execute: jest.fn(() => mockQueryBuilder), // For raw SQL queries
// }));
//
// // Mock Drizzle Schema objects (just their names for simple mocking)
// jest.mock("../../../../src/drizzle/schema", () => ({
//     Events: { id: { name: 'events.id' }, title: { name: 'events.title' }, eventDate: { name: 'events.event_date' }, eventTime: { name: 'events.event_time' }, organizerId: { name: 'events.organizer_id' } },
//     TicketTypes: { id: { name: 'ticket_types.id' }, typeName: { name: 'ticket_types.type_name' }, quantitySold: { name: 'ticket_types.quantity_sold' }, quantityAvailable: { name: 'ticket_types.quantity_available' }, price: { name: 'ticket_types.price' }, eventId: { name: 'ticket_types.event_id' } },
//     Tickets: { id: { name: 'tickets.id' }, userId: { name: 'tickets.user_id' }, eventId: { name: 'tickets.event_id' }, createdAt: { name: 'tickets.created_at' }, orderItemId: { name: 'tickets.order_item_id' }, ticketTypeId: { name: 'tickets.ticket_type_id' }, isScanned: { name: 'tickets.is_scanned' }, scannedAt: { name: 'tickets.scanned_at' } },
//     User: { id: { name: 'user.id' }, email: { name: 'user.email' } },
//     OrderItems: { id: { name: 'order_items.id' }, unitPrice: { name: 'order_items.unit_price' }, orderId: { name: 'order_items.order_id' } },
//     Orders: { id: { name: 'orders.id' } },
//     Payment: { id: { name: 'payment.id' }, orderId: { name: 'payment.order_id' } },
// }));
//
//
// describe('AnalyticsService', () => {
//     let service: AnalyticsService;
//
//     beforeEach(() => {
//         service = new AnalyticsService();
//         // Reset all mocks before each test
//         jest.clearAllMocks();
//     });
//
//     describe('AdminDashboardAnalytics', () => {
//         const adminEmail = 'admin@example.com';
//         const adminId = 1;
//
//         it('should throw an error if admin is not found', async () => {
//             mockThen.mockResolvedValueOnce([]); // Mock db.select for user to return empty
//
//             await expect(service.AdminDashboardAnalytics(adminEmail)).rejects.toThrow(
//                 "Admin not found"
//             );
//             expect(db.select).toHaveBeenCalledWith({ id: User.id });
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(User);
//             expect(mockQueryBuilder.where).toHaveBeenCalledWith('user.email = admin@example.com');
//         });
//
//         it('should return correct dashboard analytics for an admin', async () => {
//             // Mock responses for each query in AdminDashboardAnalytics
//             mockThen
//                 .mockResolvedValueOnce([{ id: adminId }]) // Admin ID
//                 .mockResolvedValueOnce([{ count: 5 }]) // Total Events
//                 .mockResolvedValueOnce([{ count: 10 }]) // Total Tickets Sold
//                 .mockResolvedValueOnce([{ revenue: 1500.50 }]) // Total Revenue
//                 .mockResolvedValueOnce([ // Upcoming Events
//                     { id: 101, title: 'Event A', date: new Date(), time: '10:00' },
//                     { id: 102, title: 'Event B', date: new Date(), time: '14:00' },
//                 ])
//                 .mockResolvedValueOnce([ // Recent Activity
//                     { ticketId: 1, buyerId: 10, eventId: 101, eventTitle: 'Event A', createdAt: new Date() },
//                     { ticketId: 2, buyerId: 11, eventId: 102, eventTitle: 'Event B', createdAt: new Date() },
//                 ])
//                 .mockResolvedValueOnce([ // Latest Event for Ticket Type Distribution
//                     { id: 103, title: 'Latest Event', date: new Date() },
//                 ])
//                 .mockResolvedValueOnce([ // Ticket Type Distribution
//                     { ticketType: 'VIP', sold: 5 },
//                     { ticketType: 'Regular', sold: 10 },
//                 ]);
//
//             // Mock for monthlySales (db.execute)
//             mockExecute.mockResolvedValueOnce([
//                 { month: '2023-01-01T00:00:00.000Z', ticket_count: 20 },
//                 { month: '2023-02-01T00:00:00.000Z', ticket_count: 25 },
//             ]);
//
//
//             const result = await service.AdminDashboardAnalytics(adminEmail);
//
//             expect(result).toEqual({
//                 totalEvents: 5,
//                 totalTicketsSold: 10,
//                 totalRevenue: 1500.50,
//                 upcomingEvents: expect.any(Array), // Check content in detail if needed
//                 recentActivity: expect.any(Array), // Check content in detail if needed
//                 monthlySales: expect.any(Array), // Check content in detail if needed
//                 ticketTypeDistribution: expect.any(Array), // Check content in detail if needed
//             });
//
//             // Verify specific calls (optional, but good for complex queries)
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(User); // First call for admin
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(Events); // For totalEvents
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(Tickets); // For totalTicketsSold
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(OrderItems); // For totalRevenue
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(Events); // For upcomingEvents
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(Tickets); // For recentActivity
//             expect(db.execute).toHaveBeenCalledTimes(1); // For monthlySales
//             expect(db.execute).toHaveBeenCalledWith(expect.stringContaining(`events.organizer_id = ${adminId}`)); // Check SQL string
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(Events); // For latestEvent
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(TicketTypes); // For ticketTypeDistribution
//         });
//
//         it('should handle no latest event for ticket type distribution', async () => {
//             mockThen
//                 .mockResolvedValueOnce([{ id: adminId }]) // Admin ID
//                 .mockResolvedValueOnce([{ count: 5 }]) // Total Events
//                 .mockResolvedValueOnce([{ count: 10 }]) // Total Tickets Sold
//                 .mockResolvedValueOnce([{ revenue: 1500.50 }]) // Total Revenue
//                 .mockResolvedValueOnce([]) // Upcoming Events
//                 .mockResolvedValueOnce([]) // Recent Activity
//                 .mockResolvedValueOnce([]) // No Latest Event
//                 .mockResolvedValueOnce([]); // Ticket Type Distribution (will not be called if no latest event)
//
//             mockExecute.mockResolvedValueOnce([]); // No monthly sales
//
//             const result = await service.AdminDashboardAnalytics(adminEmail);
//
//             expect(result.ticketTypeDistribution).toEqual([]);
//         });
//     });
//
//     describe('getPlatformSummary', () => {
//         it('should return platform summary with data', async () => {
//             mockThen.mockResolvedValueOnce([
//                 {
//                     totalEvents: 10,
//                     totalTicketsSold: 100,
//                     totalRevenue: 5000.00,
//                     avgTicketsPerEvent: 10.00,
//                 },
//             ]);
//
//             const result = await service.getPlatformSummary();
//
//             expect(result).toEqual({
//                 totalEvents: 10,
//                 totalTicketsSold: 100,
//                 totalRevenue: 5000.00,
//                 avgTicketsPerEvent: 10.00,
//             });
//             expect(db.select).toHaveBeenCalled();
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(Events);
//             expect(mockQueryBuilder.leftJoin).toHaveBeenCalledTimes(2);
//         });
//
//         it('should return platform summary with zero values if no data', async () => {
//             mockThen.mockResolvedValueOnce([
//                 {
//                     totalEvents: null, // Drizzle might return null for COUNT/SUM if no rows
//                     totalTicketsSold: null,
//                     totalRevenue: null,
//                     avgTicketsPerEvent: null,
//                 },
//             ]);
//
//             const result = await service.getPlatformSummary();
//
//             // COALESCE(SUM(${TicketTypes.price}), 0) should ensure 0 for revenue
//             // COUNT(DISTINCT ${Events.id}) will be 0 if no events
//             // COUNT(${Tickets.id}) will be 0 if no tickets
//             expect(result).toEqual({
//                 totalEvents: 0, // Assuming sql count will result in 0 or null which is handled
//                 totalTicketsSold: 0,
//                 totalRevenue: 0,
//                 avgTicketsPerEvent: 0, // Assuming division by zero results in 0 or null which is handled
//             });
//         });
//     });
//
//     describe('getMonthlySalesTrends', () => {
//         it('should return monthly sales trends with data', async () => {
//             const mockData = [
//                 { month: '2023-01', ticketsSold: 50, totalRevenue: 2500 },
//                 { month: '2023-02', ticketsSold: 75, totalRevenue: 3750 },
//             ];
//             mockThen.mockResolvedValueOnce(mockData);
//
//             const result = await service.getMonthlySalesTrends();
//
//             expect(result).toEqual(mockData);
//             expect(db.select).toHaveBeenCalled();
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(Tickets);
//             expect(mockQueryBuilder.leftJoin).toHaveBeenCalledTimes(1);
//             expect(mockQueryBuilder.groupBy).toHaveBeenCalledTimes(1);
//             expect(mockQueryBuilder.orderBy).toHaveBeenCalledTimes(1);
//         });
//
//         it('should return empty array if no monthly sales data', async () => {
//             mockThen.mockResolvedValueOnce([]);
//
//             const result = await service.getMonthlySalesTrends();
//
//             expect(result).toEqual([]);
//         });
//     });
//
//     describe('getTopSellingEvents', () => {
//         it('should return top 5 selling events with data', async () => {
//             const mockData = [
//                 { eventName: 'Concert A', totalTicketsSold: 200 },
//                 { eventName: 'Festival B', totalTicketsSold: 150 },
//                 { eventName: 'Conference C', totalTicketsSold: 100 },
//             ];
//             mockThen.mockResolvedValueOnce(mockData);
//
//             const result = await service.getTopSellingEvents();
//
//             expect(result).toEqual(mockData);
//             expect(db.select).toHaveBeenCalled();
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(Tickets);
//             expect(mockQueryBuilder.leftJoin).toHaveBeenCalledTimes(1);
//             expect(mockQueryBuilder.groupBy).toHaveBeenCalledTimes(1);
//             expect(mockQueryBuilder.orderBy).toHaveBeenCalledTimes(1);
//             expect(mockQueryBuilder.limit).toHaveBeenCalledWith(5);
//         });
//
//         it('should return empty array if no top selling events', async () => {
//             mockThen.mockResolvedValueOnce([]);
//
//             const result = await service.getTopSellingEvents();
//
//             expect(result).toEqual([]);
//         });
//     });
//
//     describe('getOverallTicketScanStatus', () => {
//         it('should return overall ticket scan status', async () => {
//             mockThen.mockResolvedValueOnce([{ scanned: 70, notScanned: 30 }]);
//
//             const result = await service.getOverallTicketScanStatus();
//
//             expect(result).toEqual({ scanned: 70, notScanned: 30 });
//             expect(db.select).toHaveBeenCalled();
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(Tickets);
//         });
//
//         it('should return zero counts if no tickets', async () => {
//             mockThen.mockResolvedValueOnce([{ scanned: null, notScanned: null }]); // SUM can return null if no rows
//
//             const result = await service.getOverallTicketScanStatus();
//
//             expect(result).toEqual({ scanned: 0, notScanned: 0 });
//         });
//     });
//
//     describe('getEventTicketSummary', () => {
//         const eventId = 123;
//         it('should return event ticket summary with data', async () => {
//             const mockData = [
//                 {
//                     ticketType: 'VIP',
//                     totalAvailable: 50,
//                     totalSold: 20,
//                     totalRevenue: 2000,
//                     totalScanned: 15,
//                 },
//                 {
//                     ticketType: 'General',
//                     totalAvailable: 200,
//                     totalSold: 100,
//                     totalRevenue: 5000,
//                     totalScanned: 80,
//                 },
//             ];
//             mockThen.mockResolvedValueOnce(mockData);
//
//             const result = await service.getEventTicketSummary(eventId);
//
//             expect(result).toEqual(mockData);
//             expect(db.select).toHaveBeenCalled();
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(TicketTypes);
//             expect(mockQueryBuilder.where).toHaveBeenCalledWith(`ticket_types.event_id = ${eventId}`);
//         });
//
//         it('should return empty array if no tickets for the event', async () => {
//             mockThen.mockResolvedValueOnce([]);
//
//             const result = await service.getEventTicketSummary(eventId);
//
//             expect(result).toEqual([]);
//         });
//     });
//
//     describe('getEventScanLog', () => {
//         const eventId = 123;
//
//         it('should return event scan log with data', async () => {
//             mockThen
//                 .mockResolvedValueOnce([{ totalScanned: 10 }]) // Total scanned
//                 .mockResolvedValueOnce([ // Daily scans
//                     { scanDate: '2023-07-01', scanCount: 5 },
//                     { scanDate: '2023-07-02', scanCount: 5 },
//                 ]);
//
//             const result = await service.getEventScanLog(eventId);
//
//             expect(result).toEqual({
//                 totalScanned: 10,
//                 dailyScans: [
//                     { scanDate: '2023-07-01', scanCount: 5 },
//                     { scanDate: '2023-07-02', scanCount: 5 },
//                 ],
//             });
//             expect(db.select).toHaveBeenCalledTimes(2);
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(Tickets);
//             expect(mockQueryBuilder.where).toHaveBeenCalledWith(expect.stringContaining(`tickets.event_id = ${eventId}`));
//         });
//
//         it('should return zero counts if no scans for the event', async () => {
//             mockThen
//                 .mockResolvedValueOnce([]) // Total scanned (no result)
//                 .mockResolvedValueOnce([]); // Daily scans (no result)
//
//             const result = await service.getEventScanLog(eventId);
//
//             expect(result).toEqual({
//                 totalScanned: 0,
//                 dailyScans: [],
//             });
//         });
//     });
//
//     describe('getTicketTypeDistribution', () => {
//         const eventId = 123;
//
//         it('should return ticket type distribution for an event', async () => {
//             const mockData = [
//                 { ticketType: 'Standard', countSold: 50, revenue: 2500 },
//                 { ticketType: 'Premium', countSold: 20, revenue: 2000 },
//             ];
//             mockThen.mockResolvedValueOnce(mockData);
//
//             const result = await service.getTicketTypeDistribution(eventId);
//
//             expect(result).toEqual(mockData);
//             expect(db.select).toHaveBeenCalled();
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(Tickets);
//             expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(TicketTypes, expect.any(String));
//             expect(mockQueryBuilder.where).toHaveBeenCalledWith(`tickets.event_id = ${eventId}`);
//             expect(mockQueryBuilder.groupBy).toHaveBeenCalledTimes(1);
//         });
//
//         it('should return empty array if no ticket type distribution for the event', async () => {
//             mockThen.mockResolvedValueOnce([]);
//
//             const result = await service.getTicketTypeDistribution(eventId);
//
//             expect(result).toEqual([]);
//         });
//     });
//
//     describe('getEventScanStatus', () => {
//         const eventId = 123;
//
//         it('should return event scan status counts', async () => {
//             mockThen
//                 .mockResolvedValueOnce([{ count: 80 }]) // Scanned count
//                 .mockResolvedValueOnce([{ count: 20 }]); // Not scanned count
//
//             const result = await service.getEventScanStatus(eventId);
//
//             expect(result).toEqual({ scannedCount: 80, notScannedCount: 20 });
//             expect(db.select).toHaveBeenCalledTimes(2);
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(Tickets);
//             expect(mockQueryBuilder.where).toHaveBeenCalledWith(expect.stringContaining(`tickets.event_id = ${eventId}`));
//         });
//
//         it('should return zero counts if no tickets for the event', async () => {
//             mockThen
//                 .mockResolvedValueOnce([]) // Scanned count (no result)
//                 .mockResolvedValueOnce([]); // Not scanned count (no result)
//
//             const result = await service.getEventScanStatus(eventId);
//
//             expect(result).toEqual({ scannedCount: 0, notScannedCount: 0 });
//         });
//     });
//
//     describe('getOrganizerEarningsSummary', () => {
//         const userId = 1;
//
//         it('should return zero earnings if no events organized by the user', async () => {
//             mockThen.mockResolvedValueOnce([]); // No events
//
//             const result = await service.getOrganizerEarningsSummary(userId);
//
//             expect(result).toEqual({
//                 totalEarnings: 0,
//                 totalWithdrawn: 0,
//                 availableBalance: 0,
//             });
//             expect(db.select).toHaveBeenCalledWith({ id: Events.id });
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(Events);
//             expect(mockQueryBuilder.where).toHaveBeenCalledWith(`events.organizer_id = ${userId}`);
//         });
//
//         it('should return correct earnings summary for an organizer', async () => {
//             mockThen
//                 .mockResolvedValueOnce([{ id: 101 }, { id: 102 }]) // Events organized by user
//                 .mockResolvedValueOnce([{ total: 5000 }]); // Total earnings
//
//             const result = await service.getOrganizerEarningsSummary(userId);
//
//             expect(result).toEqual({
//                 totalEarnings: 5000,
//                 totalWithdrawn: 0,
//                 availableBalance: 5000,
//             });
//             expect(db.select).toHaveBeenCalledTimes(2);
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(Events);
//             expect(mockQueryBuilder.where).toHaveBeenCalledWith(`events.organizer_id = ${userId}`);
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(Tickets);
//             expect(mockQueryBuilder.innerJoin).toHaveBeenCalledTimes(4);
//             expect(inArray).toHaveBeenCalledWith(Tickets.eventId, [101, 102]);
//         });
//     });
//
//     describe('getRevenuePerEvent', () => {
//         const userId = 1;
//
//         it('should return revenue per event for an organizer', async () => {
//             const mockData = [
//                 { eventName: 'Event X', revenue: 1200 },
//                 { eventName: 'Event Y', revenue: 800 },
//             ];
//             mockThen.mockResolvedValueOnce(mockData);
//
//             const result = await service.getRevenuePerEvent(userId);
//
//             expect(result).toEqual(mockData);
//             expect(db.select).toHaveBeenCalled();
//             expect(mockQueryBuilder.from).toHaveBeenCalledWith(Events);
//             expect(mockQueryBuilder.innerJoin).toHaveBeenCalledTimes(4);
//             expect(mockQueryBuilder.where).toHaveBeenCalledWith(`events.organizer_id = ${userId}`);
//             expect(mockQueryBuilder.groupBy).toHaveBeenCalledTimes(1);
//         });
//
//         it('should return empty array if no revenue for the organizer', async () => {
//             mockThen.mockResolvedValueOnce([]);
//
//             const result = await service.getRevenuePerEvent(userId);
//
//             expect(result).toEqual([]);
//         });
//     });
// });
