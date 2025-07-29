import { Router } from "express";
import { paymentController } from "./payment.controller";
import {asyncHandler} from "../utils/asyncHandler";

const router = Router();

// M-Pesa specific routes (placed before general :id routes for specificity)
// Route to initiate an M-Pesa STK Push payment from the client
router.post("/payments/mpesa/stkpush", asyncHandler(paymentController.initiateMpesaPayment));

// Route for M-Pesa to send transaction callbacks (webhooks)
router.post("/payments/mpesa/callback", asyncHandler(paymentController.handleMpesaCallback));

    
// Paystack specific routes (placed before general :id routes for specificity)
router.post("/payments/paystack/initialize", asyncHandler(paymentController.initiatePaystackPayment));
router.get("/payments/paystack/verify/:reference", asyncHandler(paymentController.verifyPaystackPayment));
router.post("/payments/paystack/webhook", asyncHandler(paymentController.handlePaystackWebhook));
router.post("/mpesa/manual-verify", paymentController.verifyMpesaTillPayment);


// Standard CRUD routes for payments
router.get("/payments", asyncHandler(paymentController.getAll));
router.post("/payments", asyncHandler(paymentController.create)); // Generic payment creation
router.get("/payments/:id", asyncHandler(paymentController.getById)); // This should come after more specific routes like /mpesa/stkpush
router.patch("/payments/:id", asyncHandler(paymentController.update));
router.delete("/payments/:id", asyncHandler(paymentController.delete));


export default router;
