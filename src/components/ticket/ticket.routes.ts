import { Router } from "express";
import { ticketController } from "./ticket.controller";
import {asyncHandler} from "../utils/asyncHandler";

const router = Router();

router.get("/tickets", asyncHandler(ticketController.getAll));
router.get("/tickets/:id", asyncHandler(ticketController.getById));
router.post("/tickets", asyncHandler(ticketController.create));
router.put("/tickets/:id/scan", asyncHandler(ticketController.scan));
router.delete("/tickets/:id", asyncHandler(ticketController.delete));
router.get("/tickets/user/:id", asyncHandler(ticketController.getByUserid));

router.get("/tickets/logs", asyncHandler(ticketController.overrideTicket))

export default router;
