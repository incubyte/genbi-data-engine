const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const dotenv = require('dotenv');
const logger = require('./src/utils/logger');
const { errorHandler, setupErrorHandlers } = require('./src/utils/errorHandler');
const queryController = require('./src/controllers/queryController');

// Load environment variables
dotenv.config();

// Set up global error handlers
setupErrorHandlers();

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON request bodies

// Log all requests
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the GenBI Data Engine API',
  });
});

// Main endpoint for natural language to SQL conversion
app.post('/api/query', queryController.processQuery);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Start the server
app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app; // Export for testing
