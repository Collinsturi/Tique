import { Request, Response } from "express";
import { paymentService } from "./payment.service";
import { PaymentInsert } from "../../drizzle/schema"; // Import PaymentInsert type

export class PaymentController {
    /**
     * Retrieves all payments.
     * @param req The Express request object.
     * @param res The Express response object.
     */
    getAll = async (req: Request, res: Response) => {
        try {
            const payments = await paymentService.getAllPayments();
            return res.json(payments);
        } catch (error: any) {
            console.error("Error fetching payments:", error);
            return res.status(500).json({ message: "Failed to fetch payments", error: error.message });
        }
    }

    /**
     * Retrieves a payment by its ID.
     * @param req The Express request object.
     * @param res The Express response object.
     */
    getById = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid payment ID" });
        }

        try {
            const payment = await paymentService.getPaymentById(id);
            if (!payment) {
                return res.status(404).json({ message: "Payment not found" });
            }
            return res.json(payment);
        } catch (error: any) {
            console.error(`Error fetching payment with ID ${id}:`, error);
            return res.status(500).json({ message: "Failed to fetch payment", error: error.message });
        }
    }

    /**
     * Creates a new payment record and updates the associated order's status.
     * This method is typically called by a payment gateway's webhook or after a successful client-side payment confirmation.
     * @param req The Express request object. Expected body: `PaymentInsert` data.
     * @param res The Express response object.
     */
    create = async (req: Request, res: Response) => {
        const paymentData: PaymentInsert = req.body;

        // Basic validation for required payment fields
        if (!paymentData.orderId || !paymentData.amount || !paymentData.paymentMethod || !paymentData.transactionId) {
            return res.status(400).json({ message: "Missing required payment fields (orderId, amount, paymentMethod, transactionId)." });
        }

        try {
            const newPayment = await paymentService.createPayment(paymentData);
            return res.status(201).json({ message: "Payment recorded and order updated successfully.", payment: newPayment });
        } catch (error: any) {
            console.error("Error creating payment:", error);
            if (error.message.includes("Order not found")) {
                return res.status(404).json({ message: error.message });
            }
            return res.status(500).json({ message: "Failed to process payment", error: error.message });
        }
    }

    /**
     * Updates an existing payment record.
     * @param req The Express request object.
     * @param res The Express response object.
     */
    update = async (req: Request, res: Response) => {
        const id = Number(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid payment ID" });
        }

        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Update data cannot be empty" });
        }

        try {
            const updatedPayment = await paymentService.updatePayment(id, req.body);

            if (!updatedPayment) {
                return res.status(404).json({ message: "Payment not found or no changes applied." });
            }

            return res.json({ message: "Payment updated successfully", updatedPayment });
        } catch (error: any) {
            console.error(`Error updating payment with ID ${id}:`, error);
            return res.status(500).json({ message: "Failed to update payment", error: error.message });
        }
    }

    /**
     * Deletes a payment record.
     * @param req The Express request object.
     * @param res The Express response object.
     */
    delete = async (req: Request, res: Response) => {
        const id = Number(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: "Invalid payment ID" });
        }

        try {
            const deletedPayment = await paymentService.deletePayment(id);

            if (!deletedPayment) {
                return res.status(404).json({ message: "Payment not found" });
            }

            return res.json({ message: "Payment deleted successfully", deletedPayment });
        } catch (error: any) {
            console.error(`Error deleting payment with ID ${id}:`, error);
            return res.status(500).json({ message: "Failed to delete payment", error: error.message });
        }
    }

    /**
     * Initiates an M-Pesa STK Push payment.
     * @param req The Express request object. Expected body: `{ orderId: number, amount: number, phoneNumber: string }`
     * @param res The Express response object.
     */
    initiateMpesaPayment = async (req: Request, res: Response) => {
        const { orderId, amount, phoneNumber } = req.body;

        if (!orderId || !amount || !phoneNumber) {
            return res.status(400).json({ message: "Missing required fields: orderId, amount, and phoneNumber." });
        }

        try {
            const response = await paymentService.initiateMpesaSTKPush(orderId, amount, phoneNumber);
            return res.status(200).json({ message: "M-Pesa STK Push initiated successfully.", response });
        } catch (error: any) {
            console.error("Error initiating M-Pesa STK Push:", error);
            return res.status(500).json({ message: "Failed to initiate M-Pesa payment", error: error.message });
        }
    }

    /**
     * Handles the M-Pesa callback (webhook) for transaction results.
     * This endpoint is called by Safaricom's Daraja API.
     * @param req The Express request object (M-Pesa callback payload).
     * @param res The Express response object.
     */
    handleMpesaCallback = async (req: Request, res: Response) => {
        console.log("=== M-Pesa Callback Received ===");
        console.log("Headers:", req.headers);
        console.log("Body:", JSON.stringify(req.body, null, 2));
        console.log("================================");

        try {
            await paymentService.processMpesaCallback(req.body);
            return res.json({
                "ResultCode": 0,
                "ResultDesc": "C2B Callback received successfully."
            });
        } catch (error: any) {
            console.error("Error processing M-Pesa callback:", error);
            return res.json({
                "ResultCode": 1,
                "ResultDesc": `Error processing callback: ${error.message}`
            });
        }
    }
    /**
     * Initiates a Paystack payment.
     * @param req Expected body: { orderId: number, amount: number, email: string, callbackUrl?: string }
     * @param res The Express response object.
     */
    initiatePaystackPayment = async (req: Request, res: Response) => {
        const { orderId, amount, email, callbackUrl } = req.body;

        if (!orderId || !amount || !email) {
            return res.status(400).json({
                message: "Missing required fields: orderId, amount, and email."
            });
        }

        try {
            const response = await paymentService.initiatePaystackPayment(orderId, amount, email, callbackUrl);

            if (response.success) {
                return res.status(200).json({
                    message: response.message,
                    authorization_url: response.authorization_url,
                    access_code: response.access_code,
                    reference: response.reference,
                    paymentId: response.paymentId
                });
            } else {
                return res.status(400).json({
                    message: response.message,
                    error: response.error
                });
            }
        } catch (error: any) {
            console.error("Error initiating Paystack payment:", error);
            return res.status(500).json({
                message: "Failed to initiate Paystack payment",
                error: error.message
            });
        }
    }

    /**
     * Verifies a Paystack payment.
     * @param req Expected params: { reference: string }
     * @param res The Express response object.
     */
    verifyPaystackPayment = async (req: Request, res: Response) => {
        const { reference } = req.params;

        if (!reference) {
            return res.status(400).json({ message: "Payment reference is required." });
        }

        try {
            const result = await paymentService.verifyPaystackPayment(reference);

            if (result.success) {
                return res.status(200).json({
                    message: result.message,
                    data: result.data
                });
            } else {
                return res.status(400).json({
                    message: result.message,
                    data: result.data
                });
            }
        } catch (error: any) {
            console.error("Error verifying Paystack payment:", error);
            return res.status(500).json({
                message: "Failed to verify payment",
                error: error.message
            });
        }
    }

    /**
     * Handles Paystack webhooks.
     * @param req The Express request object (Paystack webhook payload).
     * @param res The Express response object.
     */
    handlePaystackWebhook = async (req: Request, res: Response) => {
        console.log("=== Paystack Webhook Received ===");
        console.log("Headers:", req.headers);
        console.log("Body:", JSON.stringify(req.body, null, 2));
        console.log("=================================");

        try {
            // In production, you should verify the webhook signature
            // const signature = req.headers['x-paystack-signature'];
            // if (!verifyWebhookSignature(req.body, signature)) {
            //     return res.status(400).json({ message: "Invalid signature" });
            // }

            await paymentService.processPaystackWebhook(req.body);

            return res.status(200).json({ message: "Webhook processed successfully" });
        } catch (error: any) {
            console.error("Error processing Paystack webhook:", error);
            return res.status(500).json({
                message: "Error processing webhook",
                error: error.message
            });
        }
    }
}

export const paymentController = new PaymentController();
