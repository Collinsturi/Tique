import { Router } from "express";
import { eventController } from "./event.controller";
import {asyncHandler} from "../utils/asyncHandler";

const router = Router();

router.get("/events", asyncHandler(eventController.getAll));
router.get("/events/:id", asyncHandler(eventController.getById));
router.post("/events", asyncHandler(eventController.create));
router.put("/events/:id", asyncHandler(eventController.update));
router.delete("/events/:id", asyncHandler(eventController.delete));

router.get("/events/staff/assigned/:email", asyncHandler(eventController.getStaffAssignedEvents));
router.get("/events/staff/scanned/:email", asyncHandler(eventController.getStaffScannedTickets));

//Get organizer upcoming events
router.get("/events/organizer/:email/upcoming", asyncHandler(eventController.getUpcomingEvents));

//Assign events staff for events

// Get current events for organizer

// Get past events for organizer


export default router;
