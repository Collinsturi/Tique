import { Router } from "express";
import { eventController } from "./event.controller";
import {asyncHandler} from "../utils/asyncHandler";

const router = Router();

router.get("/events", asyncHandler(eventController.getAll));
router.get("/events/:id", asyncHandler(eventController.getById));
router.post("/events", asyncHandler(eventController.create));
router.put("/events/:id", asyncHandler(eventController.update));
router.delete("/events/:id", asyncHandler(eventController.delete));

export default router;
