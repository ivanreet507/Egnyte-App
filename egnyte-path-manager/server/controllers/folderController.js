const axios = require('axios');
const fs = require('fs');
const xlsx = require('xlsx');
const csv = require('csv-parser');

const egnyteDomain = "watersystems";
const accessToken = "dvupn7q6sgb4zyju8r4byp7c";
const egnyteApiUrl = `https://${egnyteDomain}.egnyte.com/pubapi/v1/fs/Shared/WSCData`;

const readExcelFile = (filePath) => {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    return jsonData.map(row => row[2]); // Assuming paths are in the third column
};

const readCsvFile = (filePath) => {
    return new Promise((resolve, reject) => {
        const results = [];
        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', () => {
                resolve(results);
            })
            .on('error', (error) => {
                reject(error);
            });
    });
};

const localToWebPath = (localPath) => {
    const basePath = "https://watersystems.egnyte.com/app/index.do#storage/files/1/Shared/WSCData";
    const relativePath = localPath.replace(/^W:\\/, '').replace(/\\/g, '/');
    const pathParts = relativePath.split('/');
    const deepestFolder = pathParts.slice(0, -1).join('/');
    const fileName = pathParts[pathParts.length - 1];
    return {
        webPath: `${basePath}/${encodeURIComponent(deepestFolder)}`,
        fileName
    };
};

const getFolders = async (req, res) => {
    try {
        const response = await axios.get(egnyteApiUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        res.json(response.data.folders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const copyFolder = async (oldPath, newPath) => {
    const copyUrl = `https://${egnyteDomain}.egnyte.com/pubapi/v1/fs${oldPath}`;
    const payload = {
        action: 'copy',
        destination: newPath,
        permissions: 'inherit_from_parent' // Optional
    };
    try {
        console.log('Copy URL:', copyUrl);
        console.log('Payload:', payload);
        const response = await axios.post(copyUrl, payload, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (err) {
        console.error(`Error copying folder from ${oldPath} to ${newPath}:`, err.response.data);
        throw new Error(`Error copying folder: ${err.message}`);
    }
};

const deleteFolder = async (path) => {
    const deleteUrl = `https://${egnyteDomain}.egnyte.com/pubapi/v1/fs${path}`;
    try {
        const response = await axios.delete(deleteUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
        return response.data;
    } catch (err) {
        console.error(`Error deleting folder at ${path}:`, err.response.data);
        throw new Error(`Error deleting folder: ${err.message}`);
    }
};

const renameFolder = async (req, res) => {
    const { path, oldName, newName } = req.body;

    const oldPath = `${path}/${oldName}`;
    const newPath = `${path}/${newName}`;

    try {
        console.log('Old Path:', oldPath);
        console.log('New Path:', newPath);

        //Copy the folder to the new name
        await copyFolder(oldPath, newPath);
        console.log(`Folder copied from ${oldPath} to ${newPath}`);

        //Delete the old folder
        await deleteFolder(oldPath);
        console.log(`Folder deleted at ${oldPath}`);

        res.sendStatus(200);
    } catch (err) {
        console.error('Error renaming folder:', err.message);
        res.status(500).json({ error: err.message });
    }
};

const uploadExceedingPaths = async (req, res) => {
    const files = req.files;
    const exceedingPaths = [];

    console.log('Received files:', files);

    files.forEach((file) => {
        console.log('Processing file:', file.path);
        const paths = readExcelFile(file.path).map(localPath => {
            const { webPath, fileName } = localToWebPath(localPath);
            return {
                localPath,
                webPath,
                fileName
            };
        });
        console.log('Extracted paths:', paths);
        exceedingPaths.push(...paths);
        fs.unlinkSync(file.path); // Clean up the uploaded file
    });

    res.json(exceedingPaths);
};

const uploadSubdirectoryCounts = async (req, res) => {
    const file = req.file;
    console.log('Received file:', file);
    if (!file) {
        res.status(400).json({ error: 'No file uploaded' });
        return;
    }
    try {
        const subdirectoryCounts = await readCsvFile(file.path);
        console.log('Subdirectory Counts:', subdirectoryCounts);
        // Adjust the structure to ensure the frontend can use it properly
        const adjustedCounts = subdirectoryCounts.map(count => ({
            Path: count.Path,
            Count: parseInt(count.Count, 10)
        }));
        fs.unlinkSync(file.path); // Clean up the uploaded file
        console.log('Adjusted Counts:', adjustedCounts);
        res.json(adjustedCounts);
    } catch (err) {
        console.error('Error reading CSV file:', err);
        res.status(500).json({ error: err.message });
    }
};

const getExceedingPaths = (req, res) => {
    const exceedingPaths = []; // Replace with actual logic to get stored paths
    res.json(exceedingPaths);
};

module.exports = { getFolders, renameFolder, uploadExceedingPaths, uploadSubdirectoryCounts, getExceedingPaths };
