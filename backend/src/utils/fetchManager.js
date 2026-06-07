/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

const { default: axios } = require('axios');

// simple retry wrapper with timeout for external API calls
const callAPI = async (endpoint, accessToken, opts = {}) => {
    if (!accessToken || accessToken === "") {
        throw new Error('No tokens found');
    }

    const timeout = opts.timeout || 5000; // default 5s
    const maxRetries = typeof opts.retries === 'number' ? opts.retries : 2;

    const headers = {
        Authorization: `Bearer ${accessToken}`,
    };

    console.log('request made to web API at: ' + new Date().toISOString(), endpoint);

    let attempt = 0;
    while (attempt <= maxRetries) {
        try {
            const response = await axios.get(endpoint, { headers, timeout });
            return response.data;
        } catch (error) {
            attempt += 1;
            // if last attempt, throw detailed error
            if (attempt > maxRetries) {
                console.log('callAPI final error:', error && error.message ? error.message : error);
                if (error.response && error.response.data) {
                    throw new Error(JSON.stringify(error.response.data));
                }
                throw error;
            }
            // simple backoff
            const backoff = 100 * Math.pow(2, attempt);
            await new Promise((r) => setTimeout(r, backoff));
        }
    }
};

module.exports = {
    callAPI,
};