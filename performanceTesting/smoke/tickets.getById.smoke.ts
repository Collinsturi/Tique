import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
    vus: 1,        // 1 virtual user for smoke test
    iterations: 1, // 1 iteration for quick health check
};

export default function () {
    const url = 'http://localhost:8081/api/tickets/6';

    const params = {
        headers: {
            'Content-Type': 'application/json',
            // 'Authorization': `Bearer YOUR_VALID_ADMIN_TOKEN`
        },
    };

    const res = http.get(url, params);

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