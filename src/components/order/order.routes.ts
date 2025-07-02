import { Router } from "express";
import { orderController } from "./order.controller";

const router = Router();

router.get("/orders", orderController.getAll);
router.get("/orders/:id", orderController.getById);
router.post("/orders", orderController.create);
router.put("/orders/:id", orderController.update);
router.delete("/orders/:id", orderController.delete);

export default router;
