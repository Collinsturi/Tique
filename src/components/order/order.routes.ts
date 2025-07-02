import { Router } from "express";
import { orderController } from "./order.controller";
import {asyncHandler} from "../utils/asyncHandler";

const router = Router();

router.get("/orders", asyncHandler(orderController.getAll));
router.get("/orders/:id", asyncHandler(orderController.getById));
router.post("/orders", asyncHandler(orderController.create));
router.put("/orders/:id", asyncHandler(orderController.update));
router.delete("/orders/:id", asyncHandler(orderController.delete));

export default router;
