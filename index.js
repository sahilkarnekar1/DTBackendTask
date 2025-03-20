const express = require('express');
require('dotenv').config();
const eventRoutes = require('./routes/eventRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/api/v3/app', eventRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
