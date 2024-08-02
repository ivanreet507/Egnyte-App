const axios = require('axios');
const Bottleneck = require('bottleneck');

const egnyteDomain = "watersystems";
const accessToken = "dvupn7q6sgb4zyju8r4byp7c";
const egnyteApiUrl = `https://${egnyteDomain}.egnyte.com/pubapi/v1/fs/Shared`;

// Initialize Bottleneck with the rate limits
const limiter = new Bottleneck({
    minTime: 500, // Minimum time between requests (500 ms for 2 calls/second)
    maxConcurrent: 1
});

const testApiConnection = async () => {
    try {
        const response = await limiter.schedule(() => axios.get(egnyteApiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }));
        console.log('API Response:', response.data);
    } catch (error) {
        console.error('Error connecting to Egnyte API:', error.response ? error.response.data : error.message);
    }
};

testApiConnection();
