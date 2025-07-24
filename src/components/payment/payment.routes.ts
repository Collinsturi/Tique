import { Router } from "express";
import { paymentController } from "./payment.controller";
import {asyncHandler} from "../utils/asyncHandler"; // Assuming you have this utility

const router = Router();

// Standard CRUD routes for payments
router.get("/payments", asyncHandler(paymentController.getAll));
router.get("/payments/:id", asyncHandler(paymentController.getById));
router.post("/payments", asyncHandler(paymentController.create)); // Generic payment creation
router.patch("/payments/:id", asyncHandler(paymentController.update));
router.delete("/payments/:id", asyncHandler(paymentController.delete));

// M-Pesa specific routes
// Route to initiate an M-Pesa STK Push payment from the client
router.post("/payments/mpesa/stkpush", asyncHandler(paymentController.initiateMpesaPayment));

// Route for M-Pesa to send transaction callbacks (webhooks)
router.post("/payments/mpesa/callback", asyncHandler(paymentController.handleMpesaCallback));


// Paystack specific routes
router.post("/payments/paystack/initialize", asyncHandler(paymentController.initiatePaystackPayment));
router.get("/payments/paystack/verify/:reference", asyncHandler(paymentController.verifyPaystackPayment));
router.post("/payments/paystack/webhook", asyncHandler(paymentController.handlePaystackWebhook));

export default router;
