import { Router } from "express";
import { ticketController } from "../controllers/ticket.controller";

const router = Router();

router.get("/tickets", ticketController.getAll);
router.get("/tickets/:id", ticketController.getById);
router.post("/tickets", ticketController.create);
router.put("/tickets/:id/scan", ticketController.scan);
router.delete("/tickets/:id", ticketController.delete);

export default router;
