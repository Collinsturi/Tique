import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = 'http://localhost:8081';

export const options = {
    stages: [
        { duration: '30s', target: 20 },   // ramp-up to 20 users
        { duration: '30s', target: 100 },  // ramp-up to 100 users
        { duration: '30s', target: 200 },  // ramp-up to 200 users
        { duration: '1m', target: 300 },   // spike to 300 users
        { duration: '30s', target: 0 },    // ramp-down to 0 users
    ],
    ext: {
        loadimpact: {
            name: 'Events GET Stress Test',
        },
    },
};

export default function () {
    const res = http.get(`${BASE_URL}/api/venues`, {
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer YOUR_VALID_TOKEN`,
        },
    });

    check(res, {
        'status is 200': (r) => r.status === 200,
        'response is an array (even if empty)': (r) => {
            try {
                const body = JSON.parse(r.body as string);
                return Array.isArray(body);
            } catch {
                return false;
            }
        },
    });

    sleep(1);
}