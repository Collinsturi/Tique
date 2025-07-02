import { Router } from "express";
import { eventController } from "./event.controller";

const router = Router();

router.get("/events", eventController.getAll);
router.get("/events/:id", eventController.getById);
router.post("/events", eventController.create);
router.put("/events/:id", eventController.update);
router.delete("/events/:id", eventController.delete);

export default router;
