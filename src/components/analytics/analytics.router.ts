import { Router } from "express";
import { AnalyticsController } from "./analytics.controller";
import {asyncHandler} from "../utils/asyncHandler";

const router = Router();
const controller = new AnalyticsController();

router.get("/admin/summary", asyncHandler(controller.adminDashboard));
router.get("/platform/summary", asyncHandler(controller.getPlatformSummary));
router.get("/platform/monthly-trends", asyncHandler(controller.getMonthlySalesTrends));
router.get("/platform/top-events", asyncHandler(controller.getTopSellingEvents));
router.get("/platform/ticket-scan-status", asyncHandler(controller.getOverallTicketScanStatus));

router.get("/event/:eventId/summary", asyncHandler(controller.getEventTicketSummary));
router.get("/event/:eventId/scan-log", asyncHandler(controller.getEventScanLog));
router.get("/event/:eventId/scan-status", asyncHandler(controller.getEventScanStatus));
router.get("/event/:eventId/ticket-distribution", asyncHandler(controller.getTicketTypeDistribution));

router.get("/organizer/wallet", asyncHandler(controller.getOrganizerEarningsSummary));
router.get("/organizer/revenue", asyncHandler(controller.getRevenuePerEvent));

export default router;
