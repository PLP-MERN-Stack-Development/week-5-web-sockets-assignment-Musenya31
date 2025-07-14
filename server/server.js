
// server.js - Main server file for Socket.io chat application

const express = require('express');
const http = require('http');
const cors = require('cors');
const { setupSocket } = require('./socket');
const connectDB = require('./config/db');

require('dotenv').config();

const app = express();
app.use(cors());

// Connect to MongoDB
connectDB();

const server = http.createServer(app);

// Setup Socket.io
setupSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
