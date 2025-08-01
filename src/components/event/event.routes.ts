import { Router } from "express";
import { eventController } from "./event.controller";
import {asyncHandler} from "../utils/asyncHandler";

const router = Router();

router.get("/events", asyncHandler(eventController.getAll));
router.get("/events/:id", asyncHandler(eventController.getById));
router.post("/events/:email", asyncHandler(eventController.createEvent));
router.put("/events/:id", asyncHandler(eventController.update));
router.delete("/events/:id", asyncHandler(eventController.delete));

router.get("/events/staff/assigned/:email", asyncHandler(eventController.getStaffAssignedEvents));
router.get("/events/organizer/:email/assigned-staff", asyncHandler(eventController.getOrganizerAssignedStaff));

//Get organizer upcoming events
router.get("/events/organizer/:email/upcoming", asyncHandler(eventController.getUpcomingEvents));

//Get available staff
router.get("/events/staff/available", asyncHandler(eventController.getAvailableStaff));
//Assign events staff for events
router.post("/events/organizer/:email/assignStaff", asyncHandler(eventController.assignStaff));
router.delete("/events/organizer/:email/unassign-staff", asyncHandler(eventController.unassignStaff));

// Get current events for organizer
router.get("/events/organizer/current/:email", asyncHandler(eventController.getCurrentOrganizerEvents));

// Get past events for organizer
router.get("/events/organizer/past/:email", asyncHandler(eventController.getPastOrganizerEvents));


export default router;
