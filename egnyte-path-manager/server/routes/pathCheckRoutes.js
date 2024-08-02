const express = require('express');
const router = express.Router();
const path = require('path');
const { exec } = require('child_process');

router.post('/check', (req, res) => {
    const folderPath = req.body.path;
    
    // Execute PowerShell script to get path lengths
    exec(`powershell.exe -File ${path.join(__dirname, '..', 'scripts', 'GetPathLengths.ps1')} -FolderPath "${folderPath}"`, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error.message}`);
            return res.status(500).send('Error checking path lengths.');
        }
        if (stderr) {
            console.error(`PowerShell stderr: ${stderr}`);
            return res.status(500).send('Error checking path lengths.');
        }
        const pathLengths = JSON.parse(stdout);
        res.json(pathLengths);
    });
});

module.exports = router;
