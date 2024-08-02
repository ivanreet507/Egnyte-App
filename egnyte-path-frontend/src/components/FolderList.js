import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './FolderList.css'; // Make sure to create this CSS file

const FolderList = () => {
     // eslint-disable-next-line
    const [folders, setFolders] = useState([]);
    const [exceedingPaths, setExceedingPaths] = useState([]);
    const [subdirectoryCounts, setSubdirectoryCounts] = useState([]);
     // eslint-disable-next-line
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [path, setPath] = useState('');
    const [oldName, setOldName] = useState('');
    const [newName, setNewName] = useState('');

    const hardCodedData = [
        { name: "All Folders", fileCount: 2503081, folderCount: 363803, pathLimitExceededCount: "19653 (excluding 3.0 Clients and GIS)" },
        { name: "3.0 Clients", fileCount: 1336652, folderCount: 251080, pathLimitExceededCount: "TBD" },
        { name: "4.0 Teams", fileCount: 117121, folderCount: 17542, pathLimitExceededCount: 13224 },
        { name: "5.0 Professional Reference", fileCount: 39146, folderCount: 4403, pathLimitExceededCount: 1459 },
        { name: "6.0 Company Resources", fileCount: 3533, folderCount: 543, pathLimitExceededCount: 16 },
        { name: "7.0 Media", fileCount: 29753, folderCount: 1426, pathLimitExceededCount: 2 },
        { name: "8.0 Software", fileCount: 34536, folderCount: 2566, pathLimitExceededCount: 24 },
        { name: "9.0 Staff", fileCount: 209900, folderCount: 22510, pathLimitExceededCount: 4924 },
        { name: "GIS", fileCount: 685210, folderCount: 59331, pathLimitExceededCount: "TBD" },
        { name: "GIS_WSC", fileCount: 26589, folderCount: 1490, pathLimitExceededCount: 4 },
        { name: "Scans", fileCount: 580, folderCount: 63, pathLimitExceededCount: 0 }
    ];

    useEffect(() => {
        axios.get('http://localhost:5000/api/folders')
            .then(response => {
                console.log('Folders:', response.data);
                setFolders(response.data);
            })
            .catch(error => {
                console.error('Error fetching folders:', error);
            });
    }, []);

    const handleUpload = (event) => {
        const files = event.target.files;
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append('files', files[i]);
        }

        axios.post('http://localhost:5000/api/folders/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(response => {
            console.log('Exceeding Paths:', response.data);
            setExceedingPaths(response.data);
        }).catch(error => {
            console.error('Error uploading files:', error);
        });
    };

    const handleUploadSubdirectoryCounts = (event) => {
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('file', file);

        axios.post('http://localhost:5000/api/folders/uploadSubdirectoryCounts', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        }).then(response => {
            console.log('Subdirectory Counts:', response.data);
            setSubdirectoryCounts(response.data);
        }).catch(error => {
            console.error('Error uploading file:', error);
        });
    };

    const handleFolderClick = (folderName) => {
        console.log('Selected Folder:', folderName);
        setSelectedFolder(folderName);
    };

    const handleRenameFolder = () => {
        axios.post('http://localhost:5000/api/folders/rename', { path, oldName, newName })
            .then(response => {
                console.log('Folder renamed successfully');
                // Optionally refresh folders or provide feedback
            })
            .catch(error => {
                console.error('Error renaming folder:', error);
            });
    };

    const handleRemovePath = (index, isExceedingPath = false) => {
        if (isExceedingPath) {
            setExceedingPaths(prevPaths => prevPaths.filter((_, i) => i !== index));
        } else {
            setSubdirectoryCounts(prevCounts => prevCounts.filter((_, i) => i !== index));
        }
    };

    useEffect(() => {
        console.log('Subdirectory Counts Updated:', subdirectoryCounts);
    }, [subdirectoryCounts]);

    useEffect(() => {
        console.log('Exceeding Paths Updated:', exceedingPaths);
    }, [exceedingPaths]);

    const formatPath = (path) => path.replace(/^W:\\/, '/Shared/WSCData/').replace(/\\/g, '/');

    return (
        <div style={{ textAlign: 'center' }}>
            <img src="/WSC-Mark-Color.png" alt="Logo" className="logo" />
            <h1 style={{ fontSize: '35px' }}>Egnyte Path Manager</h1>
            <input type="file" multiple onChange={handleUpload} />
            <input type="file" onChange={handleUploadSubdirectoryCounts} />
            <div>
                <h2 style={{ fontSize: '28px' }}>Folders</h2>
                {hardCodedData.map(folder => (
                    <div key={folder.name} onClick={() => handleFolderClick(folder.name)} style={{ marginBottom: '10px' }}>
                        <p><strong>{folder.name}</strong></p>
                        <p>File Count: {folder.fileCount}</p>
                        <p>Folder Count: {folder.folderCount}</p>
                        <p>Path Limit Exceeded Count: {folder.pathLimitExceededCount}</p>
                    </div>
                ))}
            </div>
            <div>
                <h2 style={{ fontSize: '28px' }}>Rename File or Folder</h2>
                <form onSubmit={(e) => { e.preventDefault(); handleRenameFolder(); }}>
                    <label style={{ fontSize: '20px' }}>
                        Path:
                        <input type="text" value={path} onChange={(e) => setPath(e.target.value)} style={{ fontSize: '16px', width: '709px', height: '30px', marginLeft: '10px' }} />
                    </label>
                    <br />
                    <label style={{ fontSize: '20px' }}>
                        Old Name:
                        <input type="text" value={oldName} onChange={(e) => setOldName(e.target.value)} style={{ fontSize: '16px', width: '659px', height: '30px', marginLeft: '10px' }} />
                    </label>
                    <br />
                    <label style={{ fontSize: '20px' }}>
                        New Name:
                        <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} style={{ fontSize: '16px', width: '652px', height: '30px', marginLeft: '10px' }} />
                    </label>
                    <br />
                    <button type="submit" style={{ fontSize: '18px', marginTop: '10px' }}>Rename</button>
                </form>
            </div>
            <div>
                <h2 style={{ fontSize: '26px' }}>Subdirectory Counts</h2>
                {subdirectoryCounts.map((count, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div>
                            <p><strong>Path:</strong> {formatPath(count.Path)}</p>
                            <p><strong>Count:</strong> {count.Count}</p>
                        </div>
                        <button onClick={() => handleRemovePath(index)} style={{ marginLeft: '10px' }}>✔️</button>
                    </div>
                ))}
            </div>
            <div>
                <h2 style={{ fontSize: '26px' }}>Exceeding Paths</h2>
                {exceedingPaths.map((path, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div>
                            <p><strong>Local Path:</strong> {formatPath(path.localPath)}</p>
                            <p><strong>Web Path:</strong> <a href={path.webPath} target="_blank" rel="noopener noreferrer">{path.webPath}</a></p>
                            <p>File Name: {path.fileName}</p>
                        </div>
                        <button onClick={() => handleRemovePath(index, true)} style={{ marginLeft: '10px' }}>✔️</button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FolderList;
