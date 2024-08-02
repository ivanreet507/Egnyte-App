const express = require('express');
const cors = require('cors');
const folderRoutes = require('./routes/folderRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/folders', folderRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
