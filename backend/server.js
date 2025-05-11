// Updated server.js with validation
const express = require('express');
const app = express();
const cors = require('cors');
const serverless = require("serverless-http");
const connectDB = require('./config/db');
const dotenv = require('dotenv');

// Load environment variables
require('dotenv').config();

// Validate MongoDB URI
if (!process.env.MONGO_URI) {
  console.error('MONGO_URI is not defined in .env file');
  process.exit(1);
}

app.use(cors({
  origin: 'https://order-management-system-main.vercel.app',  // Your frontend domain
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true
}));

app.options('*', cors());

// Validate JWT Secret
if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined in .env file');
  process.exit(1);
}

// Connect to database
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ extended: false }));

// Define Routes
app.use('/api/products', require('./routes/products'));
app.use('/api/stores', require('./routes/stores'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/bills', require('./routes/bills'));

// Basic route
app.get('/', (req, res) => {
  res.send('Cold Drinks Wholesale API is running');
});

// Export handler for Vercel
module.exports = app;
module.exports.handler = serverless(app);

// Define PORT
const PORT = process.env.PORT || 5000;

// Start server
/*app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});*/

module.exports = app;