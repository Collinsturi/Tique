import { Router } from "express";
import { venueController } from "../controllers/venue.controller";

const router = Router();

router.get("/venues", venueController.getAll);
router.get("/venues/:id", venueController.getById);
router.post("/venues", venueController.create);
router.put("/venues/:id", venueController.update);
router.delete("/venues/:id", venueController.delete);

export default router;
