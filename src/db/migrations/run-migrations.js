/**
 * Script to run all migrations
 */
const logger = require('../../utils/logger');
const { runMigration: addVisualizationColumns } = require('./add-visualization-columns');

/**
 * Run all migrations in sequence
 */
async function runAllMigrations() {
  try {
    logger.info('Starting migrations...');
    
    // Run migrations in order
    await addVisualizationColumns();
    
    logger.info('All migrations completed successfully');
  } catch (error) {
    logger.error(`Error running migrations: ${error.message}`);
    throw error;
  }
}

// Run all migrations if this script is executed directly
if (require.main === module) {
  runAllMigrations()
    .then(() => {
      logger.info('All migrations completed successfully');
      process.exit(0);
    })
    .catch((err) => {
      logger.error(`Migrations failed: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { runAllMigrations };
