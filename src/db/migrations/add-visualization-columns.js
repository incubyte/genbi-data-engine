/**
 * Migration script to add visualization columns to saved_queries table
 */
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('../../utils/logger');

// Path to the user database
const dbPath = path.join(__dirname, '../../../data/user-data.db');

/**
 * Run the migration
 */
async function runMigration() {
  return new Promise((resolve, reject) => {
    // Open the database
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        logger.error(`Error opening database: ${err.message}`);
        return reject(err);
      }
      
      logger.info(`Connected to the database at ${dbPath}`);
      
      // Begin transaction
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          logger.error(`Error beginning transaction: ${err.message}`);
          db.close();
          return reject(err);
        }
        
        // Check if columns already exist
        db.get("PRAGMA table_info(saved_queries)", (err, row) => {
          if (err) {
            logger.error(`Error checking table info: ${err.message}`);
            db.run('ROLLBACK');
            db.close();
            return reject(err);
          }
          
          // Add the new columns
          const alterTableQueries = [
            'ALTER TABLE saved_queries ADD COLUMN sql_query TEXT;',
            'ALTER TABLE saved_queries ADD COLUMN results TEXT;',
            'ALTER TABLE saved_queries ADD COLUMN chart_type TEXT;',
            'ALTER TABLE saved_queries ADD COLUMN visualization_config TEXT;',
            'ALTER TABLE saved_queries ADD COLUMN description TEXT;'
          ];
          
          // Execute each alter table query
          let completed = 0;
          let hasError = false;
          
          alterTableQueries.forEach((query) => {
            db.run(query, (err) => {
              completed++;
              
              if (err) {
                // If column already exists, this is not a fatal error
                if (err.message.includes('duplicate column name')) {
                  logger.warn(`Column already exists: ${err.message}`);
                } else {
                  logger.error(`Error executing query "${query}": ${err.message}`);
                  hasError = true;
                }
              } else {
                logger.info(`Successfully executed: ${query}`);
              }
              
              // Check if all queries have been executed
              if (completed === alterTableQueries.length) {
                if (hasError) {
                  db.run('ROLLBACK', () => {
                    db.close();
                    reject(new Error('Migration failed'));
                  });
                } else {
                  db.run('COMMIT', (err) => {
                    if (err) {
                      logger.error(`Error committing transaction: ${err.message}`);
                      db.run('ROLLBACK');
                      db.close();
                      return reject(err);
                    }
                    
                    logger.info('Migration completed successfully');
                    db.close();
                    resolve();
                  });
                }
              }
            });
          });
        });
      });
    });
  });
}

// Run the migration if this script is executed directly
if (require.main === module) {
  runMigration()
    .then(() => {
      logger.info('Migration completed successfully');
      process.exit(0);
    })
    .catch((err) => {
      logger.error(`Migration failed: ${err.message}`);
      process.exit(1);
    });
}

module.exports = { runMigration };
