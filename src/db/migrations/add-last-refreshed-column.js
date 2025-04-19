/**
 * Migration script to add last_refreshed column to saved_queries table
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
        
        // Check if column already exists
        db.get("PRAGMA table_info(saved_queries)", (err, row) => {
          if (err) {
            logger.error(`Error checking table info: ${err.message}`);
            db.run('ROLLBACK');
            db.close();
            return reject(err);
          }
          
          // Add the new column
          db.run('ALTER TABLE saved_queries ADD COLUMN last_refreshed TEXT;', (err) => {
            if (err) {
              logger.error(`Error adding last_refreshed column: ${err.message}`);
              db.run('ROLLBACK');
              db.close();
              return reject(err);
            }
            
            // Initialize the last_refreshed column with created_at values
            db.run('UPDATE saved_queries SET last_refreshed = created_at WHERE last_refreshed IS NULL;', (err) => {
              if (err) {
                logger.error(`Error initializing last_refreshed column: ${err.message}`);
                db.run('ROLLBACK');
                db.close();
                return reject(err);
              }
              
              // Commit the transaction
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
      logger.error('Migration failed:', err);
      process.exit(1);
    });
}

module.exports = { runMigration };
