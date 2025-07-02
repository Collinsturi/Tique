import { Router } from "express";
import { paymentController } from "./payment.controller";
import {asyncHandler} from "../utils/asyncHandler";

const router = Router();

router.get("/payments", asyncHandler(paymentController.getAll));
router.get("/payments/:id", asyncHandler(paymentController.getById));
router.post("/payments", asyncHandler(paymentController.create));
router.put("/payments/:id", asyncHandler(paymentController.update));
router.delete("/payments/:id", asyncHandler(paymentController.delete));

export default router;
