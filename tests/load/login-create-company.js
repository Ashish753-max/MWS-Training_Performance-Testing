import http from 'k6/http';
import { check } from 'k6';

export const options = {
    vus: 1,
    iterations: 1,
};

const LOGIN_URL =
    'https://api.mwstraining.com/api/v1/organization/login';

const COMPANY_URL =
    'https://api.mwstraining.com/api/v1/organization/company/add';

export default function () {

    // ==============================
    // 1. LOGIN
    // ==============================

    const loginPayload = JSON.stringify({
        email: __ENV.LOGIN_EMAIL,
        password: __ENV.LOGIN_PASSWORD,
    });

    const loginResponse = http.post(
        LOGIN_URL,
        loginPayload,
        {
            headers: {
                'Content-Type': 'application/json',
            },
        }
    );

    const loginSuccessful = check(loginResponse, {
        'Login status is 200': (r) => r.status === 200,
        'Login successful': (r) => r.json('success') === true,
        'Access token exists': (r) =>
            !!r.json('data.access_token'),
    });

    if (!loginSuccessful) {
        console.log(
            `Login failed. Status: ${loginResponse.status}`
        );
        return;
    }

    // Get token from login response
    const accessToken =
        loginResponse.json('data.access_token');


    // ==============================
    // 2. CREATE UNIQUE COMPANY
    // ==============================

    const companyName =
        `Performance Company VU-${__VU}-${Date.now()}`;

    const productName =
        `Performance Product VU-${__VU}-${Date.now()}`;

    const companyPayload = JSON.stringify({
        name: companyName,

        description:
            '<p>Company created during k6 performance testing.</p>',

        products: [
            {
                name: productName,

                description:
                    '<p>Product created during k6 performance testing.</p>',

                image: ''
            }
        ]
    });


    // ==============================
    // 3. CREATE COMPANY
    // ==============================

    const companyResponse = http.post(
        COMPANY_URL,
        companyPayload,
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`,
            },
        }
    );


    // ==============================
    // 4. VALIDATE RESPONSE
    // ==============================

    check(companyResponse, {
        'Company status is 201':
            (r) => r.status === 201,

        'Company creation successful':
            (r) => r.json('success') === true,

        'Company ID exists':
            (r) => !!r.json('data._id'),
    });


    console.log(
        `VU ${__VU} | ${companyName} | Status: ${companyResponse.status}`
    );
}