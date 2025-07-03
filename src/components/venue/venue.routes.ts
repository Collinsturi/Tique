import { Router } from "express";
import { venueController } from "./venue.controller";
import {asyncHandler} from "../utils/asyncHandler";

const router = Router();

router.get("/venues", asyncHandler(venueController.getAll));
router.get("/venues/:id", asyncHandler(venueController.getById));
router.post("/venues", asyncHandler(venueController.create));
router.patch("/venues/:id", asyncHandler(venueController.update));
router.delete("/venues/:id", asyncHandler(venueController.delete));

export default router;
