import { Request, Response } from "express";
import { AnalyticsService } from "./analytics.service";

const service = new AnalyticsService();

export class AnalyticsController {
    async adminDashboard(req: Request, res: Response) {
        try {
            const adminEmail = req.user?.email; // assuming user info is in req.user
            if (!adminEmail) return res.status(401).json({ error: "Unauthorized" });

            const result = await service.AdminDashboardAnalytics(adminEmail);
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getPlatformSummary(req: Request, res: Response) {
        try {
            const summary = await service.getPlatformSummary();
            res.json(summary);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getMonthlySalesTrends(req: Request, res: Response) {
        try {
            const trends = await service.getMonthlySalesTrends();
            res.json(trends);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getTopSellingEvents(req: Request, res: Response) {
        try {
            const events = await service.getTopSellingEvents();
            res.json(events);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getOverallTicketScanStatus(req: Request, res: Response) {
        try {
            const result = await service.getOverallTicketScanStatus();
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getEventTicketSummary(req: Request, res: Response) {
        try {
            const { eventId } = req.params;
            const result = await service.getEventTicketSummary(Number(eventId));
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getEventScanLog(req: Request, res: Response) {
        try {
            const { eventId } = req.params;
            const result = await service.getEventScanLog(Number(eventId));
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getTicketTypeDistribution(req: Request, res: Response) {
        try {
            const { eventId } = req.params;
            const result = await service.getTicketTypeDistribution(Number(eventId));
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getEventScanStatus(req: Request, res: Response) {
        try {
            const { eventId } = req.params;
            const result = await service.getEventScanStatus(Number(eventId));
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getOrganizerEarningsSummary(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });

            const result = await service.getOrganizerEarningsSummary(Number(userId));
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }

    async getRevenuePerEvent(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: "Unauthorized" });

            const result = await service.getRevenuePerEvent(Number(userId));
            res.json(result);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}
