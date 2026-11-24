// Feature 004 (FR-033): 500 concurrent visitors on the contact page, p95 < 1 s once cached, zero errors. Read-only: never POSTs the form, so no real leads or emails are created.
// Run against STAGING only:  k6 run -e BASE_URL=https://staging.aacpa.sa tests/load/k6-contact.js
import http from 'k6/http';
import { check, sleep } from 'k6';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const PATH = __ENV.TARGET_PATH || '/ar/contact';

export const options = {
    stages: [
        { duration: '1m', target: 100 },
        { duration: '2m', target: 500 },
        { duration: '3m', target: 500 },
        { duration: '1m', target: 0 },
    ],
    thresholds: {
        http_req_failed: ['rate<0.001'],
        http_req_duration: ['p(95)<1000'],
        checks: ['rate>0.999'],
    },
};

export default function () {
    const res = http.get(`${BASE_URL}${PATH}`, { headers: { 'Accept-Language': 'ar' } });
    check(res, {
        'status is 200': (r) => r.status === 200,
        'has a title': (r) => r.body.includes('<title'),
    });
    sleep(Math.random() * 2 + 0.5);
}
