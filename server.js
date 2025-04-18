const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const logger = require('./src/utils/logger');
const config = require('./src/config/config');
const { errorHandler, setupErrorHandlers } = require('./src/utils/errorHandler');
const queryController = require('./src/controllers/queryController');
const connectionController = require('./src/controllers/connectionController');
const userDataService = require('./src/services/userDataService');
const connectionPoolManager = require('./src/services/connectionPoolManager');

// Set up global error handlers
setupErrorHandlers();

// Patch path-to-regexp error
process.on('uncaughtException', (error) => {
  if (error.message && error.message.includes('pathToRegexpError')) {
    logger.error('Path-to-regexp error detected:', error);
    // Continue execution instead of crashing
  } else {
    // Re-throw other errors
    throw error;
  }
});

// Initialize services
Promise.all([
  userDataService.init().catch(err => {
    logger.error('Failed to initialize user data service:', err);
    throw err;
  })
]).catch(err => {
  logger.error('Failed to initialize services:', err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

/**
 * Graceful shutdown function
 */
async function gracefulShutdown() {
  logger.info('Received shutdown signal, closing connections...');

  try {
    // Close all database connections
    await connectionPoolManager.closeAllConnections();
    logger.info('All database connections closed');

    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
}

// Get server configuration
const serverConfig = config.getServerConfig();
const port = process.env.PORT || serverConfig.port || 3000; // Use a different port if 3000 is in use

// Create Express app
const app = express();

// Middleware
app.use(helmet()); // Security headers

// Configure CORS
app.use(cors({
  origin: serverConfig.corsOrigins || ['http://localhost:5173', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  credentials: true // Allow cookies in cross-site requests
}));

// Handle preflight requests
app.options('*', cors());

// Parse JSON request bodies
app.use(express.json({ limit: '1mb' }));

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

// Debug route
app.get('/api/debug', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'API is working correctly',
    timestamp: new Date().toISOString(),
    headers: req.headers,
    env: process.env.NODE_ENV
  });
});

// Main endpoint for natural language to SQL conversion
app.post('/api/query', queryController.processQuery);

// Saved connections endpoints
app.get('/api/connections', connectionController.getAllConnections);
app.get('/api/connections/:id', connectionController.getConnectionById);
app.post('/api/connections', connectionController.saveConnection);
app.delete('/api/connections/:id', connectionController.deleteConnection);

// Saved queries endpoints
app.get('/api/saved-queries', queryController.getAllQueries);
app.get('/api/saved-queries/:id', queryController.getQueryById);
app.post('/api/saved-queries', queryController.saveQuery);
app.delete('/api/saved-queries/:id', queryController.deleteQuery);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`,
  });
});

// Error handling middleware
app.use(errorHandler);

// Export for testing
module.exports = app;

// Only start the server if this file is run directly
if (require.main === module) {
  // Start the server
  app.listen(port, () => {
    logger.info(`Server running on port ${port}`);
    logger.info(`Environment: ${serverConfig.env}`);
    logger.info(`API URL: http://localhost:${port}/api`);
  });
}
