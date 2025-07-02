import { Router } from "express";
import { ticketTypeController } from "./ticketType.controller";
import {asyncHandler} from "../utils/asyncHandler";

const router = Router();

router.get("/ticket-types", asyncHandler(ticketTypeController.getAll));
router.get("/ticket-types/:id", asyncHandler(ticketTypeController.getById));
router.post("/ticket-types", asyncHandler(ticketTypeController.create));
router.put("/ticket-types/:id", asyncHandler(ticketTypeController.update));
router.delete("/ticket-types/:id", asyncHandler(ticketTypeController.delete));

export default router;
