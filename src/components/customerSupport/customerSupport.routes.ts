import { Router } from "express";
import { customerSupportController } from "./customerSupport.controller";
import {asyncHandler} from "../utils/asyncHandler";

const router = Router();

router.get("/support-tickets", asyncHandler(customerSupportController.getAll));
router.get("/support-tickets/:id", asyncHandler(customerSupportController.getById));
router.post("/support-tickets", asyncHandler(customerSupportController.create));
router.put("/support-tickets/:id", asyncHandler(customerSupportController.update));
router.delete("/support-tickets/:id", asyncHandler(customerSupportController.delete));

export default router;
