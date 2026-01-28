const express = require('express');
const cors = require('cors');

// Import DB connection funciton.
const connectDb = require('./config/database');

// Import routes.
const smsRoutes = require('./routes/smsRoutes');


const app = express();
const PORT = process.env.PORT || 3000;

connectDb();

// Basic middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Routes:
app.get('/', (req, res) => {
    res.json({
        message: 'SMS API server is running!',
        timestampe: new Date().toISOString()
    });
});
app.use('/sms-api', smsRoutes);


// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}!`);
});