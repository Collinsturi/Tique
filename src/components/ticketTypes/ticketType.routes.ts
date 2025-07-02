import { Router } from "express";
import { ticketTypeController } from "./ticketType.controller";

const router = Router();

router.get("/ticket-types", ticketTypeController.getAll);
router.get("/ticket-types/:id", ticketTypeController.getById);
router.post("/ticket-types", ticketTypeController.create);
router.put("/ticket-types/:id", ticketTypeController.update);
router.delete("/ticket-types/:id", ticketTypeController.delete);

export default router;
