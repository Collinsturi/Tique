import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:8081';

export const options = {
    stages: [
        { duration: '30s', target: 40 }, // ramp-up to 40 users over 30 seconds
        // { duration: '40s', target: 50 }, // stay at 50 users for 40 seconds
        // { duration: '10s', target: 0 },  // ramp-down to 0 users
    ],
    ext: {
        loadimpact: {
            name: 'TIckets GET BY ID Load Test',
        },
    },
};

export default function () {
    // const token = 'YOUR_VALID_TOKEN';
    const res = http.get(`${BASE_URL}/api/tickets/6`, {
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer ${token}`,
        },
    });

    console.log(res);
    check(res, {
        'status is 200': (r) => r.status === 200,
        'response is an object with expected keys': (r) => {
            try {
                const body = JSON.parse(r.body as string);
                return body && typeof body === 'object' &&
                    'ticket' in body &&
                    'event' in body &&
                    'ticketType' in body &&
                    'venue' in body;
            } catch {
                return false;
            }
        },
    });

    sleep(1);
}