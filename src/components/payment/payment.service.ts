import db from "../../drizzle/db";
import { Payment, PaymentInsert, Orders, orderStatuses, paymentStatuses } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import axios from 'axios';
import * as mpesaUtils from '../utils/mpesa.utils'; // Import the new M-Pesa utilities
import * as paystackUtils from '../utils/paystack.utils';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const MPESA_SHORTCODE = process.env.MPESA_SHORTCODE!;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY!;
const MPESA_CALLBACK_URL = process.env.MPESA_CALLBACK_URL!;
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox'; // Default to sandbox

// M-Pesa API URLs
const MPESA_BASE_URL = MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke'
    : 'https://sandbox.safaricom.co.ke';
const STK_PUSH_URL = `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`;

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_WEBHOOK_URL = process.env.PAYSTACK_WEBHOOK_URL!;

export class PaymentService {
    async getAllPayments() {
        try {
            return await db.select().from(Payment);
        } catch (error) {
            console.error("Error fetching all payments:", error);
            throw new Error("Failed to fetch all payments");
        }
    }

    async getPaymentById(id: number) {
        if (isNaN(id)) throw new Error("Invalid payment ID provided.");

        try {
            const [payment] = await db.select().from(Payment).where(eq(Payment.id, id));
            return payment || null;
        } catch (error) {
            console.error(`Error fetching payment with ID ${id}:`, error);
            throw new Error("Failed to fetch payment details");
        }
    }

    async createPayment(paymentData: PaymentInsert) {
        if (!paymentData || !paymentData.orderId || !paymentData.amount || !paymentData.paymentMethod || !paymentData.transactionId) {
            throw new Error("Missing required payment data.");
        }

        // Ensure payment status is set, default to 'pending' if not provided
        const finalPaymentData: PaymentInsert = {
            ...paymentData,
            paymentStatus: paymentData.paymentStatus || 'pending',
            paymentDate: paymentData.paymentDate || new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.transaction(async (tx) => {
            // 1. Insert the new payment record
            const [newPayment] = await tx.insert(Payment).values(finalPaymentData).returning();

            if (!newPayment) {
                throw new Error("Failed to record payment.");
            }

            // 2. Update the associated order's status based on payment status
            const [order] = await tx.select().from(Orders).where(eq(Orders.id, newPayment.orderId));

            if (!order) {
                // This would be a critical error if a payment is made for a non-existent order
                throw new Error(`Order with ID ${newPayment.orderId} not found for payment processing.`);
            }

            let newOrderStatus: typeof orderStatuses[number];
            if (newPayment.paymentStatus === 'completed') {
                newOrderStatus = 'completed';
            } else if (newPayment.paymentStatus === 'failed') {
                newOrderStatus = 'cancelled'; // Or a specific 'payment_failed' status
            } else {
                newOrderStatus = 'pending_payment'; // Keep as pending if not completed/failed
            }

            await tx.update(Orders)
                .set({
                    status: newOrderStatus,
                    transactionId: newPayment.transactionId, // Link payment transaction ID to order
                    updatedAt: new Date(),
                })
                .where(eq(Orders.id, newPayment.orderId));

            return newPayment;
        });

        return result;
    }


    async updatePayment(id: number, updateData: Partial<PaymentInsert>) {
        if (!updateData || Object.keys(updateData).length === 0) {
            console.warn(`No fields provided for update on payment ID ${id}`);
            throw new Error("No fields provided for update.");
        }
        if (isNaN(id)) throw new Error("Invalid payment ID provided for update.");

        try {
            const [result] = await db.update(Payment)
                .set({ ...updateData, updatedAt: new Date() }) // Ensure updatedAt is updated
                .where(eq(Payment.id, id))
                .returning();

            return result || null;
        } catch (error: any) {
            console.error(`Error updating payment with ID ${id}:`, error);
            throw new Error("Failed to update payment.");
        }
    }

    async deletePayment(id: number) {
        if (isNaN(id)) throw new Error("Invalid payment ID provided for deletion.");

        try {
            const [paymentToDelete] = await db.select().from(Payment).where(eq(Payment.id, id));
            if (!paymentToDelete) return null;

            const [result] = await db.delete(Payment).where(eq(Payment.id, id)).returning();
            return result; // Return the payment that was deleted
        } catch (error: any) {
            console.error(`Error deleting payment with ID ${id}:`, error);
            throw new Error("Failed to delete payment.");
        }
    }


    async initiateMpesaSTKPush(orderId: number, amount: number, phoneNumber: string, tillNumber?: string) {
        console.log("Initiating M-Pesa STK Push for order", orderId, "with amount", amount, "to", phoneNumber, tillNumber ? `(Till: ${tillNumber})` : "");
        // Validation
        if (!MPESA_SHORTCODE || !MPESA_PASSKEY || !MPESA_CALLBACK_URL) {
            throw new Error("M-Pesa environment variables are not set. Please check .env file.");
        }

        // Format phone number properly
        let formattedPhone = phoneNumber;
        if (phoneNumber.startsWith('0')) {
            formattedPhone = '254' + phoneNumber.slice(1);
        } else if (phoneNumber.startsWith('+254')) {
            formattedPhone = phoneNumber.slice(1);
        }

        if (!formattedPhone.startsWith('254') || formattedPhone.length !== 12) {
            throw new Error("Invalid phone number format. Must be in format 254XXXXXXXXX");
        }

        if (amount <= 0) {
            throw new Error("Amount must be a positive number.");
        }

        // Determine the PartyB (till number or default shortcode)
        const targetPartyB = tillNumber || MPESA_SHORTCODE;

        try {
            // Get access token
            const accessToken = await mpesaUtils.getMpesaAccessToken();
            const timestamp = mpesaUtils.formatTimestamp();
            const password = mpesaUtils.generateMpesaPassword(MPESA_SHORTCODE, MPESA_PASSKEY, timestamp);

            // Create pending payment record
            const initialPayment: PaymentInsert = {
                orderId: orderId,
                amount: amount,
                paymentMethod: 'mpesa',
                paymentStatus: 'pending',
                transactionId: `STK_PENDING_${Date.now()}_${orderId}`,
                paymentDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const [newPaymentRecord] = await db.insert(Payment).values(initialPayment).returning();

            // STK Push request
            const requestBody = {
                BusinessShortCode: MPESA_SHORTCODE, // This is your Paybill/Till number, used for authentication
                Password: password,
                Timestamp: timestamp,
                TransactionType: "CustomerPayBillOnline", // This remains "CustomerPayBillOnline" even for till numbers
                Amount: amount,
                PartyA: formattedPhone,
                PartyB: targetPartyB, // This will be the user-provided till number or your default shortcode
                PhoneNumber: formattedPhone,
                CallBackURL: MPESA_CALLBACK_URL,
                AccountReference: `Tiquet events`,
                TransactionDesc: `Payment for Order ${orderId}`,
            };

            console.log("STK Push Request Body:", JSON.stringify(requestBody, null, 2));

            const response = await axios.post(STK_PUSH_URL, requestBody, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
                timeout: 30000, // 30 second timeout
            });

            console.log("M-Pesa STK Push Response:", JSON.stringify(response.data, null, 2));

            // Update payment with CheckoutRequestID
            if (response.data && response.data.CheckoutRequestID) {
                await db.update(Payment)
                    .set({
                        transactionId: response.data.CheckoutRequestID,
                        updatedAt: new Date()
                    })
                    .where(eq(Payment.id, newPaymentRecord.id));
            }

            return {
                success: true,
                message: "STK Push sent successfully",
                data: response.data,
                paymentId: newPaymentRecord.id
            };

        } catch (error: any) {
            console.error("Error calling M-Pesa STK Push API:", error.response?.data || error.message);

            // Return structured error response
            return {
                success: false,
                message: "STK Push failed",
                error: error.response?.data || error.message
            };
        }
    }

    async processMpesaCallback(callbackData: any) {
        const { Body } = callbackData;
        const { stkCallback } = Body;

        if (!stkCallback) {
            console.error("Invalid M-Pesa callback structure: Missing stkCallback in Body.");
            throw new Error("Invalid M-Pesa callback structure.");
        }

        const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

        let transactionId: string | null = null;
        let mpesaReceiptNumber: string | null = null;
        let amount: number | null = null;
        let phoneNumber: string | null = null;
        let paymentStatus: typeof paymentStatuses[number] = 'failed';
        let orderStatus: typeof orderStatuses[number] = 'pending_payment'; // Default to pending_payment

        // Extract relevant data from CallbackMetadata if transaction was successful
        if (ResultCode === 0 && CallbackMetadata && CallbackMetadata.Item) {
            const items = CallbackMetadata.Item;
            for (const item of items) {
                switch (item.Name) {
                    case 'MpesaReceiptNumber':
                        mpesaReceiptNumber = item.Value;
                        transactionId = item.Value; // Use MpesaReceiptNumber as the final transactionId
                        break;
                    case 'Amount':
                        amount = item.Value;
                        break;
                    case 'PhoneNumber':
                        phoneNumber = item.Value;
                        break;
                    // You can extract more fields like TransactionDate if needed
                }
            }
            paymentStatus = 'completed';
            orderStatus = 'completed';
        } else {
            // Transaction failed or was cancelled
            console.warn(`M-Pesa transaction failed or cancelled for CheckoutRequestID: ${CheckoutRequestID}. ResultCode: ${ResultCode}, ResultDesc: ${ResultDesc}`);
            paymentStatus = 'failed';
            orderStatus = 'cancelled'; // Or 'payment_failed' if you add that status
        }

        // Find the corresponding payment record using CheckoutRequestID (which was stored as transactionId)
        // Note: In a real scenario, you might also use MerchantRequestID or AccountReference
        const [paymentRecord] = await db.select().from(Payment)
            .where(eq(Payment.transactionId, CheckoutRequestID || MerchantRequestID));

        if (!paymentRecord) {
            console.error(`Payment record not found for CheckoutRequestID: ${CheckoutRequestID || MerchantRequestID}`);
            // It's crucial to acknowledge the callback even if our record isn't found
            return; // Or throw a specific error if you want to handle it higher up
        }

        // Update the payment record
        await db.update(Payment)
            .set({
                paymentStatus: paymentStatus,
                transactionId: mpesaReceiptNumber || paymentRecord.transactionId, // Update with actual MpesaReceiptNumber
                amount: amount || paymentRecord.amount, // Update amount if needed
                paymentDate: new Date(), // Set payment date to now
                updatedAt: new Date(),
            })
            .where(eq(Payment.id, paymentRecord.id));

        // Update the associated order's status
        await db.update(Orders)
            .set({
                status: orderStatus,
                transactionId: mpesaReceiptNumber || paymentRecord.transactionId, // Update order with actual MpesaReceiptNumber
                updatedAt: new Date(),
            })
            .where(eq(Orders.id, paymentRecord.orderId));

        console.log(`Payment for order ${paymentRecord.orderId} updated to ${paymentStatus}. Order status updated to ${orderStatus}.`);
    }

    async initiatePaystackPayment(orderId: number, amount: number, email: string, callbackUrl?: string) {
        // Validation
        if (!PAYSTACK_SECRET_KEY) {
            throw new Error("Paystack secret key is not set. Please check .env file.");
        }

        if (!email || !email.includes('@')) {
            throw new Error("Valid email address is required for Paystack payments.");
        }

        if (amount <= 0) {
            throw new Error("Amount must be a positive number.");
        }

        try {
            // Generate unique reference
            const reference = paystackUtils.generatePaystackReference(orderId);

            // Convert amount to kobo (Paystack expects amounts in kobo for NGN)
            const amountInKobo = paystackUtils.convertToKobo(amount);

            // Create pending payment record
            const initialPayment: PaymentInsert = {
                orderId: orderId,
                amount: amount,
                paymentMethod: 'paystack',
                paymentStatus: 'pending',
                transactionId: reference,
                paymentDate: new Date(),
                createdAt: new Date(),
                updatedAt: new Date(),
            };

            const [newPaymentRecord] = await db.insert(Payment).values(initialPayment).returning();

            // Initialize Paystack transaction
            const response = await paystackUtils.initializePaystackTransaction(
                email,
                amountInKobo,
                reference,
                callbackUrl
            );

            console.log("Paystack Initialization Response:", JSON.stringify(response, null, 2));

            return {
                success: true,
                message: "Paystack payment initialized successfully",
                data: response.data,
                paymentId: newPaymentRecord.id,
                authorization_url: response.data.authorization_url,
                access_code: response.data.access_code,
                reference: reference
            };

        } catch (error: any) {
            console.error("Error initializing Paystack payment:", error.message);

            return {
                success: false,
                message: "Paystack initialization failed",
                error: error.message
            };
        }
    }

    async verifyPaystackPayment(reference: string) {
        try {
            const verificationResponse = await paystackUtils.verifyPaystackTransaction(reference);

            if (verificationResponse.status && verificationResponse.data.status === 'success') {
                // Payment was successful, update records
                await this.processPaystackSuccess(verificationResponse.data);

                return {
                    success: true,
                    message: "Payment verified successfully",
                    data: verificationResponse.data
                };
            } else {
                // Payment failed or was not completed
                await this.processPaystackFailure(reference, verificationResponse);

                return {
                    success: false,
                    message: "Payment verification failed",
                    data: verificationResponse.data
                };
            }
        } catch (error: any) {
            console.error("Error verifying Paystack payment:", error.message);
            throw new Error(`Payment verification failed: ${error.message}`);
        }
    }

    private async processPaystackSuccess(transactionData: any) {
        const { reference, amount, customer } = transactionData;

        // Find the payment record
        const [paymentRecord] = await db.select().from(Payment)
            .where(eq(Payment.transactionId, reference));

        if (!paymentRecord) {
            console.error(`Payment record not found for reference: ${reference}`);
            return;
        }

        // Update payment record
        await db.update(Payment)
            .set({
                paymentStatus: 'completed',
                amount: paystackUtils.convertFromKobo(amount), // Convert back from kobo
                paymentDate: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(Payment.id, paymentRecord.id));

        // Update order status
        await db.update(Orders)
            .set({
                status: 'completed',
                transactionId: reference,
                updatedAt: new Date(),
            })
            .where(eq(Orders.id, paymentRecord.orderId));

        console.log(`Paystack payment for order ${paymentRecord.orderId} completed successfully.`);
    }

    private async processPaystackFailure(reference: string, verificationData: any) {
        // Find the payment record
        const [paymentRecord] = await db.select().from(Payment)
            .where(eq(Payment.transactionId, reference));

        if (!paymentRecord) {
            console.error(`Payment record not found for reference: ${reference}`);
            return;
        }

        // Update payment record
        await db.update(Payment)
            .set({
                paymentStatus: 'failed',
                updatedAt: new Date(),
            })
            .where(eq(Payment.id, paymentRecord.id));

        // Update order status
        await db.update(Orders)
            .set({
                status: 'cancelled',
                updatedAt: new Date(),
            })
            .where(eq(Orders.id, paymentRecord.orderId));

        console.log(`Paystack payment for order ${paymentRecord.orderId} failed.`);
    }

    async processPaystackWebhook(webhookData: any) {
        const { event, data } = webhookData;

        console.log(`Processing Paystack webhook: ${event}`);

        switch (event) {
            case 'charge.success':
                await this.processPaystackSuccess(data);
                break;

            case 'charge.failed':
                await this.processPaystackFailure(data.reference, webhookData);
                break;

            default:
                console.log(`Unhandled Paystack webhook event: ${event}`);
        }
    }
    async verifyMpesaTillPayment(orderId: number, mpesaReceiptNumber: string, phoneNumber: string, amount: number) {
        if (!mpesaReceiptNumber || !phoneNumber || !orderId || amount <= 0) {
            throw new Error("Missing required fields to verify M-Pesa payment.");
        }

        // Format phone number
        let formattedPhone = phoneNumber;
        if (formattedPhone.startsWith('0')) {
            formattedPhone = '254' + formattedPhone.slice(1);
        } else if (formattedPhone.startsWith('+254')) {
            formattedPhone = formattedPhone.slice(1);
        }

        if (!formattedPhone.startsWith('254') || formattedPhone.length !== 12) {
            throw new Error("Invalid phone number format. Use format 2547XXXXXXXX.");
        }

        // Check if a payment with this receipt exists
        const [existingPayment] = await db.select().from(Payment)
            .where(eq(Payment.transactionId, mpesaReceiptNumber));

        if (existingPayment) {
            return {
                success: true,
                message: "Payment already recorded",
                payment: existingPayment
            };
        }

        // Create a new payment record
        const newPayment: PaymentInsert = {
            orderId: orderId,
            amount: amount,
            paymentMethod: 'mpesa',
            paymentStatus: 'completed',
            transactionId: mpesaReceiptNumber,
            paymentDate: new Date(),
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await db.transaction(async (tx) => {
            const [createdPayment] = await tx.insert(Payment).values(newPayment).returning();

            await tx.update(Orders)
                .set({
                    status: 'completed',
                    transactionId: mpesaReceiptNumber,
                    updatedAt: new Date()
                })
                .where(eq(Orders.id, orderId));

            return createdPayment;
        });

        return {
            success: true,
            message: "Manual M-Pesa payment verified and recorded successfully.",
            payment: result
        };
    }

}

export const paymentService = new PaymentService();