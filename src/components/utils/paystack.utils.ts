import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_ENV = process.env.PAYSTACK_ENV || 'test';

const PAYSTACK_BASE_URL = PAYSTACK_ENV === 'live'
    ? 'https://api.paystack.co'
    : 'https://api.paystack.co'; // Same URL for test and live

/**
 * Creates axios instance with Paystack authorization
 */
const paystackAxios = axios.create({
    baseURL: PAYSTACK_BASE_URL,
    headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

/**
 * Initialize a Paystack transaction
 */
export async function initializePaystackTransaction(
    email: string,
    amount: number, // Amount in kobo (multiply by 100)
    reference: string,
    callbackUrl?: string
) {
    try {
        const response = await paystackAxios.post('/transaction/initialize', {
            email,
            amount,
            reference,
            callback_url: callbackUrl,
            metadata: {
                custom_fields: [
                    {
                        display_name: "Order Reference",
                        variable_name: "order_reference",
                        value: reference
                    }
                ]
            }
        });

        return response.data;
    } catch (error: any) {
        console.error('Error initializing Paystack transaction:', error.response?.data || error.message);
        throw new Error(`Paystack initialization failed: ${error.response?.data?.message || error.message}`);
    }
}

/**
 * Verify a Paystack transaction
 */
export async function verifyPaystackTransaction(reference: string) {
    try {
        const response = await paystackAxios.get(`/transaction/verify/${reference}`);
        return response.data;
    } catch (error: any) {
        console.error('Error verifying Paystack transaction:', error.response?.data || error.message);
        throw new Error(`Paystack verification failed: ${error.response?.data?.message || error.message}`);
    }
}

/**
 * Generate a unique transaction reference
 */
export function generatePaystackReference(orderId: number): string {
    const timestamp = Date.now();
    return `ORDER_${orderId}_${timestamp}`;
}

/**
 * Convert amount from your currency to kobo (for Nigerian Naira)
 * Multiply by 100 since Paystack expects amounts in kobo
 */
export function convertToKobo(amount: number): number {
    return Math.round(amount * 100);
}

/**
 * Convert amount from kobo to your currency
 */
export function convertFromKobo(amountInKobo: number): number {
    return amountInKobo / 100;
}