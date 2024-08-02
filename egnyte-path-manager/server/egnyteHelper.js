//sdk-helper
//currently not using
const axios = require('axios');

const domain = 'watersystems';
const token = 'dvupn7q6sgb4zyju8r4byp7c';

async function getPathsExceedingLimit(folderPath, maxLength) {
    try {
        const response = await axios.get(`https://${domain}.egnyte.com/pubapi/v1/fs${folderPath}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            },
            params: {
                list_content: true,
                limit: 1000
            }
        });

        const exceedingPaths = response.data.files.filter(file => file.path.length > maxLength);
        return exceedingPaths;
    } catch (error) {
        console.error('Error fetching paths:', error);
        throw error;
    }
}

module.exports = {
    getPathsExceedingLimit
};
