import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:8081';

export const options = {
    stages: [
        { duration: '30s', target: 50 },    // ramp-up to 50 users
        { duration: '30s', target: 100 },   // ramp-up to 100 users
        { duration: '30s', target: 200 },   // ramp-up to 200 users
        { duration: '30s', target: 400 },   // ramp-up to 400 users
        { duration: '30s', target: 800 },   // ramp-up to 800 users
        { duration: '30s', target: 1600 },  // ramp-up to 1600 users (keep increasing)
        { duration: '30s', target: 0 },     // ramp-down to 0 users
    ],
    ext: {
        loadimpact: {
            name: 'tickets GET BY ID Breakpoint Test',
        },
    },
};

export default function () {
    const res = http.get(`${BASE_URL}/api/tickets/6`, {
        headers: {
            'Content-Type': 'application/json',
        },
    });

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