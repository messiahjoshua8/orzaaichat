require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const { logger } = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const healthRoutes = require('./api/health');
const queryRoutes = require('./api/query');
const chatRoutes = require('./api/chat');

// Initialize express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(require('./middleware/requestLogger'));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/chat', chatRoutes);

// Error handling
app.use(errorHandler);

// Only start the server if this file is run directly (not when required in tests)
if (require.main === module) {
  // Start server
  app.listen(port, () => {
    logger.info(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

module.exports = app; 