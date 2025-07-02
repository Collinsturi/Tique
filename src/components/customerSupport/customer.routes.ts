import { Router } from "express";
import { customerSupportController } from "../controllers/customerSupport.controller";

const router = Router();

router.get("/support-tickets", customerSupportController.getAll);
router.get("/support-tickets/:id", customerSupportController.getById);
router.post("/support-tickets", customerSupportController.create);
router.put("/support-tickets/:id", customerSupportController.update);
router.delete("/support-tickets/:id", customerSupportController.delete);

export default router;
