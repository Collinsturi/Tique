import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config(); // Load environment variables

const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!;
const MPESA_ENV = process.env.MPESA_ENV || 'sandbox'; // Default to sandbox

const MPESA_AUTH_URL = MPESA_ENV === 'production'
    ? 'https://api.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials'
    : 'https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials';

/**
 * Generates the M-Pesa password (base64 encoded string of Shortcode + Passkey + Timestamp).
 * @param shortcode Your Lipa Na M-Pesa Shortcode or Till Number.
 * @param passkey Your M-Pesa Passkey.
 * @param timestamp The timestamp in YYYYMMDDHHmmss format.
 * @returns A base64 encoded string.
 */
export function generateMpesaPassword(shortcode: string, passkey: string, timestamp: string): string {
    const rawPassword = shortcode + passkey + timestamp;
    return Buffer.from(rawPassword).toString('base64');
}

/**
 * Formats the current timestamp to YYYYMMDDHHmmss.
 * @returns A string representing the current timestamp.
 */
export function formatTimestamp(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Fetches the M-Pesa OAuth access token.
 * This token is required for all M-Pesa API calls.
 * @returns A promise that resolves to the access token string.
 */
export async function getMpesaAccessToken(): Promise<string> {
    if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET) {
        throw new Error("M-Pesa Consumer Key or Secret not set in environment variables.");
    }

    const auth = Buffer.from(`${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`).toString('base64');

    try {
        const response = await axios.get(MPESA_AUTH_URL, {
            headers: {
                'Authorization': `Basic ${auth}`,
            },
        });
        return response.data.access_token;
    } catch (error: any) {
        console.error("Error fetching M-Pesa access token:", error.response ? error.response.data : error.message);
        throw new Error(`Failed to get M-Pesa access token: ${error.response ? JSON.stringify(error.response.data) : error.message}`);
    }
}
