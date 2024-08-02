const express = require('express');
const multer = require('multer');
const { getFolders, renameFolder, uploadExceedingPaths, uploadSubdirectoryCounts, getExceedingPaths } = require('../controllers/folderController');
const router = express.Router();

const upload = multer({ dest: 'uploads/' });

router.get('/', getFolders);
router.post('/rename', renameFolder);
router.post('/upload', upload.array('files'), uploadExceedingPaths);
router.post('/uploadSubdirectoryCounts', upload.single('file'), uploadSubdirectoryCounts);
router.get('/exceeding-paths', getExceedingPaths);

module.exports = router;
