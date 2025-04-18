const { spawn } = require('child_process');
const path = require('path');

// First, set up the test database
console.log('Setting up SQLite test database...');
const setupDb = spawn('node', ['test-db.js'], { stdio: 'inherit' });

// Uncomment to also set up PostgreSQL test database
// Note: This requires PostgreSQL to be installed and configured
// console.log('Setting up PostgreSQL test database...');
// const setupPgDb = spawn('node', ['test-postgres-db.js'], { stdio: 'inherit' });

setupDb.on('close', (code) => {
  if (code !== 0) {
    console.error(`SQLite database setup process exited with code ${code}`);
    process.exit(code);
  }

  console.log('SQLite database setup complete. Starting server...');

  // Start the server
  const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    env: { ...process.env, PORT: '3000' }
  });

  // Give the server some time to start up
  setTimeout(() => {
    console.log('Running test queries...');

    // Run the test queries
    const testQueries = spawn('node', ['test-query.js'], { stdio: 'inherit' });

    testQueries.on('close', (code) => {
      console.log(`Test queries process exited with code ${code}`);

      // Kill the server process
      console.log('Shutting down server...');
      server.kill();
      process.exit(code);
    });

    testQueries.on('error', (err) => {
      console.error('Error running test queries:', err);
      server.kill();
      process.exit(1);
    });
  }, 5000); // Wait 5 seconds for the server to start
});
