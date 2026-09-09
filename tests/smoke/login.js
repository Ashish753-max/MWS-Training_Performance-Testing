import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 1,
    duration: '10s',
};

export default function () {

    const url = 'https://api.mwstraining.com/api/v1/organization/login';

    const payload = JSON.stringify({
        email: __ENV.LOGIN_EMAIL,
        password: __ENV.LOGIN_PASSWORD,
    });

    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const response = http.post(url, payload, params);

    check(response, {
        'login status is 200': (r) => r.status === 200,
    });

    console.log(response.body);
}