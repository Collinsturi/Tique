import { Request, Response } from "express";
import { AnalyticsService } from "./analytics.service";

const service = new AnalyticsService();

export class AnalyticsController {
    async adminDashboard(req: Request, res: Response) {
        try {
            const adminEmail = req.params.email;
            console.log(adminEmail);
            if (!adminEmail) return res.status(401).json({ error: "Unauthorized" });

            const result = await service.AdminDashboardAnalytics(adminEmail);
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

    async getPlatformSummary(req: Request, res: Response) {
        try {
            const summary = await service.getPlatformSummary();
            res.json(summary);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

    async getMonthlySalesTrends(req: Request, res: Response) {
        try {
            const trends = await service.getMonthlySalesTrends();
            res.json(trends);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

    async getTopSellingEvents(req: Request, res: Response) {
        try {
            const events = await service.getTopSellingEvents();
            res.json(events);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

    async getOverallTicketScanStatus(req: Request, res: Response) {
        try {
            const result = await service.getOverallTicketScanStatus();
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

    async getEventTicketSummary(req: Request, res: Response) {
        try {
            const { eventId } = req.params;
            const result = await service.getEventTicketSummary(Number(eventId));
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

    async getEventScanLog(req: Request, res: Response) {
        try {
            const { eventId } = req.params;
            const result = await service.getEventScanLog(Number(eventId));
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

    async getTicketTypeDistribution(req: Request, res: Response) {
        try {
            const { eventId } = req.params;
            const result = await service.getTicketTypeDistribution(Number(eventId));
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

    async getEventScanStatus(req: Request, res: Response) {
        try {
            const { eventId } = req.params;
            const result = await service.getEventScanStatus(Number(eventId));
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

    async getOrganizerEarningsSummary(req: Request, res: Response) {
        try {
            const userId = req.params.email;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });

            const result = await service.getOrganizerEarningsSummary(Number(userId));
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

    async getRevenuePerEvent(req: Request, res: Response) {
        try {
            const userEmail = req.params.email;
            if (!userEmail) return res.status(401).json({ error: "Unauthorized" });

            const result = await service.getRevenuePerEvent(userEmail);
            res.json(result);
        } catch (err: any) {
            res.status(500).json({ error: err.message });
        }
    }

    async getAttendeeNotification(req: Request, res: Response) {
        try {
            const userEmail = req.params.email;
            if (!userEmail) return res.status(401).json({ error: "Unauthorized" });

            const result = await service.getAttendeeNotification(userEmail);
            res.json(result);
        }catch (err: any) {
            res.status(500).json({ error: err.message });
        }

    }
}
