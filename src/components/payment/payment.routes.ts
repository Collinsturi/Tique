import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";

const router = Router();

router.get("/payments", paymentController.getAll);
router.get("/payments/:id", paymentController.getById);
router.post("/payments", paymentController.create);
router.put("/payments/:id", paymentController.update);
router.delete("/payments/:id", paymentController.delete);

export default router;
