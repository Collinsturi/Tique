import {and, eq, sql, desc, count, sum, gte, inArray} from "drizzle-orm";
import {
    Events,
    TicketTypes,
    Tickets,
    User,
    OrderItems,
    Orders,
    Payment,
} from "../../drizzle/schema";
import db from "../../drizzle/db";
import { addDays, startOfDay, endOfDay, format } from 'date-fns';


export class AnalyticsService {
    //Admin Dashboard Summary
    async AdminDashboardAnalytics(adminEmail: string) {
        // Get Admin ID
        const admin = await db
            .select({ id: User.id })
            .from(User)
            .where(eq(User.email, adminEmail))
            .then(r => r[0]);

        if (!admin) throw new Error("Admin not found");

        // Total Events
        const totalEvents = await db
            .select({ count: count() })
            .from(Events)
            .where(eq(Events.organizerId, admin.id))
            .then(r => r[0].count);

        // Total Tickets Sold
        const totalTicketsSold = await db
            .select({ count: count() })
            .from(Tickets)
            .leftJoin(Events, eq(Tickets.eventId, Events.id))
            .where(eq(Events.organizerId, admin.id))
            .then(r => r[0].count);

        // Total Revenue
        const totalRevenue = await db
            .select({ revenue: sql<number>`COALESCE(SUM(${OrderItems.unitPrice}), 0)` })
            .from(OrderItems)
            .leftJoin(Tickets, eq(OrderItems.id, Tickets.orderItemId))
            .leftJoin(Events, eq(Tickets.eventId, Events.id))
            .where(eq(Events.organizerId, admin.id))
            .then(r => r[0].revenue);

        // Upcoming Events
        const today = new Date();
        const upcomingEvents = await db
            .select({
                id: Events.id,
                title: Events.title,
                date: Events.eventDate,
                time: Events.eventTime,
            })
            .from(Events)
            .where(and(eq(Events.organizerId, admin.id)))
            .orderBy(Events.eventDate);

        // Recent Activity (Recent ticket purchases)
        const recentActivity = await db
            .select({
                ticketId: Tickets.id,
                buyerId: Tickets.userId,
                eventId: Events.id,
                eventTitle: Events.title,
                createdAt: Tickets.createdAt,
                user: User.firstName,
                ticketType: TicketTypes.typeName,
            })
            .from(Tickets)
            .leftJoin(Events, eq(Tickets.eventId, Events.id))
            .leftJoin(User, eq(Tickets.userId, User.id))
            .leftJoin(TicketTypes, eq(Tickets.ticketTypeId, TicketTypes.id))
            .where(eq(Events.organizerId, admin.id))
            .orderBy(desc(Tickets.createdAt))
            .limit(10);

        // Monthly Sales (tickets count per month)
        const monthlySalesRaw = await db.execute(
            sql`
                SELECT
                    DATE_TRUNC('month', t."createdAt") AS month,
              COUNT(*)::int AS ticket_count
                        FROM "tickets" t
                            JOIN "Events" e ON t.event_id = e.id
                        WHERE e.organizer_id = ${admin.id}
                        GROUP BY month
                        ORDER BY month DESC
                `
        );


        const monthlySales = (monthlySalesRaw as any).rows as {
            month: string;
            ticket_count: number;
        }[];


        // Ticket Type Distribution for Latest Event
        const latestEvent = await db
            .select({
                id: Events.id,
                title: Events.title,
                date: Events.eventDate,
            })
            .from(Events)
            .where(eq(Events.organizerId, admin.id))
            .orderBy(desc(Events.eventDate))
            .limit(1)
            .then(r => r[0]);

        let ticketTypeDistribution :any[] = [];
        if (latestEvent) {
            ticketTypeDistribution = await db
                .select({
                    ticketType: TicketTypes.typeName,
                    sold: TicketTypes.quantitySold,
                })
                .from(TicketTypes)
                .where(eq(TicketTypes.eventId, latestEvent.id));
        }

        return {
            totalEvents,
            totalTicketsSold,
            totalRevenue,
            upcomingEvents,
            recentActivity,
            monthlySales,
            ticketTypeDistribution,
        };
    }

    // Platform-Wide Summary
    async getPlatformSummary() {
        const [summary] = await db
            .select({
                totalEvents: sql<number>`COUNT(DISTINCT ${Events.id})`,
                totalTicketsSold: sql<number>`COUNT(${Tickets.id})`,
                totalRevenue: sql<number>`COALESCE(SUM(${TicketTypes.price}), 0)`,
                avgTicketsPerEvent: sql<number>`ROUND(COUNT(${Tickets.id})::decimal / NULLIF(COUNT(DISTINCT ${Events.id}), 0), 2)`
            })
            .from(Events)
            .leftJoin(Tickets, eq(Tickets.eventId, Events.id))
            .leftJoin(TicketTypes, eq(Tickets.ticketTypeId, TicketTypes.id));

        return summary;
    }

    // Monthly Ticket and Revenue Trends
    async getMonthlySalesTrends() {
        const result = await db
            .select({
                month: sql<string>`TO_CHAR(${Tickets.createdAt}, 'YYYY-MM')`.as('month'),
                ticketsSold: sql<number>`COUNT(${Tickets.id})`,
                totalRevenue: sql<number>`COALESCE(SUM(${TicketTypes.price}), 0)`
            })
            .from(Tickets)
            .leftJoin(TicketTypes, sql`${TicketTypes.id} = ${Tickets.ticketTypeId}`)
            .groupBy(sql`TO_CHAR(${Tickets.createdAt}, 'YYYY-MM')`)
            .orderBy(sql`TO_CHAR(${Tickets.createdAt}, 'YYYY-MM')`);

        return result;
    }

    // 4. Top 5 Best-Selling Events
    async getTopSellingEvents() {
        const result = await db
            .select({
                eventName: Events.title,
                totalTicketsSold: sql<number>`COUNT(${Tickets.id})`
            })
            .from(Tickets)
            .leftJoin(Events, sql`${Events.id} = ${Tickets.eventId}`)
            .groupBy(Events.id)
            .orderBy(sql`COUNT(${Tickets.id}) DESC`)
            .limit(5);

        return result;
    }

    // 5. Ticket Scan Status Distribution (Pie Chart)
    async getOverallTicketScanStatus() {
        const result = await db
            .select({
                scanned: sql<number>`SUM(CASE WHEN ${Tickets.isScanned} = true THEN 1 ELSE 0 END)`,
                notScanned: sql<number>`SUM(CASE WHEN ${Tickets.isScanned} = false THEN 1 ELSE 0 END)`
            })
            .from(Tickets);

        return result[0]; // Return the single row with both counts
    }

    // 6. Event Summary
    async getEventTicketSummary(eventId: number) {
        const result = await db
            .select({
                ticketType: TicketTypes.typeName,
                totalAvailable: TicketTypes.quantityAvailable,
                totalSold: sql<number>`COUNT(${Tickets.id})`.as('totalSold'),
                totalRevenue: sql<number>`COUNT(${Tickets.id}) * ${TicketTypes.price}`.as('totalRevenue'),
                totalScanned: sql<number>`SUM(CASE WHEN ${Tickets.isScanned} = true THEN 1 ELSE 0 END)`.as('totalScanned')
            })
            .from(TicketTypes)
            .leftJoin(Tickets, eq(TicketTypes.id, Tickets.ticketTypeId))
            .leftJoin(Orders, eq(Tickets.orderItemId, Orders.id))
            .leftJoin(Payment, eq(Orders.id, Payment.orderId))
            .where(eq(TicketTypes.eventId, eventId))
            .groupBy(TicketTypes.id, TicketTypes.typeName, TicketTypes.quantityAvailable, TicketTypes.price);

        return result;
    }

    // 7. Event Scan Log
    async getEventScanLog(eventId: number) {
        // Total scanned tickets
        const totalScanResult = await db
            .select({ totalScanned: sql<number>`COUNT(*)` })
            .from(Tickets)
            .where(and(
                eq(Tickets.eventId, eventId),
                sql`${Tickets.scannedAt} IS NOT NULL`)
            );

        // Grouped by scan date (daily count)
        const groupedScanResults = await db
            .select({
                scanDate: sql<string>`DATE(${Tickets.scannedAt})`,
                scanCount: sql<number>`COUNT(*)`
            })
            .from(Tickets)
            .where(and(eq(Tickets.eventId, eventId),
                sql`${Tickets.scannedAt} IS NOT NULL`)
            )
            .groupBy(sql`DATE(${Tickets.scannedAt})`)
            .orderBy(sql`DATE(${Tickets.scannedAt}) ASC`);

        return {
            totalScanned: totalScanResult[0]?.totalScanned ?? 0,
            dailyScans: groupedScanResults
        };
    }

    // 8. Ticket Type Distribution for Event
    async getTicketTypeDistribution(eventId: number) {
        const results = await db
            .select({
                ticketType: TicketTypes.typeName,
                price: TicketTypes.price,
                countSold: sql<number>`COUNT(${Tickets.id})`.as('countSold'),
                revenue: sql<number>`COALESCE(COUNT(${Tickets.id}) * ${TicketTypes.price}, 0)`.as('revenue'),
            })
            .from(TicketTypes)
            .leftJoin(Tickets, and(
                eq(TicketTypes.id, Tickets.ticketTypeId),
                eq(Tickets.eventId, eventId)
            ))
            .where(eq(TicketTypes.eventId, eventId))
            .groupBy(TicketTypes.typeName, TicketTypes.price);

        return results;
    }

    // 9. Event Scan Status Distribution
    async getEventScanStatus(eventId: number) {
        const scannedCountResult = await db
            .select({ count: count() })
            .from(Tickets)
            .where(and(eq(Tickets.eventId, eventId), eq(Tickets.isScanned, true)));

        const notScannedCountResult = await db
            .select({ count: count() })
            .from(Tickets)
            .where(and(eq(Tickets.eventId, eventId), eq(Tickets.isScanned, false)));

        return {
            scannedCount: scannedCountResult[0]?.count || 0,
            notScannedCount: notScannedCountResult[0]?.count || 0,
        };
    }

    // 10. Organizer Wallet Overview
    async getOrganizerEarningsSummary(userId: number) {
        // Step 1: Get all event IDs organized by this user
        const events = await db
            .select({ id: Events.id })
            .from(Events)
            .where(eq(Events.organizerId, userId));

        console.log(events);

        const eventIds = events.map(e => e.id);

        console.log(eventIds);

        if (eventIds.length === 0) {
            return {
                totalEarnings: 0,
                totalWithdrawn: 0,
                availableBalance: 0,
            };
        }

        // Step 2: Calculate total earnings from paid tickets (joined via payment)
        const earningsResult = await db
            .select({
                total: sql<number>`SUM(${TicketTypes.price})`.mapWith(Number),
            })
            .from(Tickets)
            .innerJoin(TicketTypes, eq(Tickets.ticketTypeId, TicketTypes.id))
            .innerJoin(OrderItems, eq(Tickets.orderItemId, OrderItems.id))
            .innerJoin(Orders, eq(OrderItems.orderId, Orders.id))
            .innerJoin(Payment, eq(Orders.id, Payment.orderId)) // only paid orders
            .where(inArray(Tickets.eventId, eventIds));

        const totalEarnings = earningsResult[0]?.total || 0;

        // Step 3: Set withdrawals as 0 for now
        const totalWithdrawn = 0;
        const availableBalance = totalEarnings;

        return {
            totalEarnings,
            totalWithdrawn,
            availableBalance,
        };
    }

    // 11. Revenue per Event
    async getRevenuePerEvent(organizerEmail: string) {
        // Step 1: Get organizer's user ID
        const organizer = await db.query.User.findFirst({
            where: eq(User.email, organizerEmail),
            columns: { id: true }
        });

        if (!organizer) throw new Error("Organizer not found");

        const result = await db
            .select({
                eventName: Events.title,
                revenue: sql<number>`SUM(${TicketTypes.price})`.mapWith(Number),
            })
            .from(Events)
            .innerJoin(Tickets, eq(Tickets.eventId, Events.id))
            .innerJoin(TicketTypes, eq(Tickets.ticketTypeId, TicketTypes.id))
            .innerJoin(OrderItems, eq(Tickets.orderItemId, OrderItems.id))
            .innerJoin(Orders, eq(OrderItems.orderId, Orders.id))
            .innerJoin(Payment, eq(Orders.id, Payment.orderId))
            .where(eq(Events.organizerId, organizer.id))
            .groupBy(Events.id, Events.title);

        return result;
    }

    //Get user notification
     async getAttendeeNotification(email: string): Promise<string[] | null> {
        // 1. Get user
        const user = await db.query.User.findFirst({
            where: eq(User.email, email)
        });

        if (!user) return null;

        // 2. Get user tickets with event and ticketType
        const userTickets = await db.query.Tickets.findMany({
            where: eq(Tickets.userId, user.id),
            with: {
                event: true,
                ticketType: true
            }
        });

        // 3. Define date range: 1 or 2 days ahead
        const today = new Date();
        const oneDayAhead = addDays(today, 1);
        const twoDaysAhead = addDays(today, 2);

        const upcomingEventNotifications = userTickets
            .filter(ticket => {
                const eventDate = new Date(ticket.event.eventDate);
                return (
                    eventDate >= startOfDay(oneDayAhead) &&
                    eventDate <= endOfDay(twoDaysAhead)
                );
            })
            .map(ticket => {
                const { title, eventDate, eventTime } = ticket.event;
                return `Reminder: '${title}' starts on ${format(eventDate, 'MMMM d')} at ${eventTime}.`;
            });

        // 4. Get user's pending orders
        const pendingOrders = await db.query.Orders.findMany({
            where: and(
                eq(Orders.userId, user.id),
                eq(Orders.status, 'pending_payment')
            )
        });

         const pendingOrderNotifications = pendingOrders.map(order => {
             const amount = order.totalAmount ?? 0;
             return `Order #${order.id} is still pending payment (KES ${amount.toLocaleString()}).`;
         });

         // 5. Return all notifications
        return [...upcomingEventNotifications, ...pendingOrderNotifications];
    }
}
