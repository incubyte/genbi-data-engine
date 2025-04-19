/**
 * Simple MySQL connection test
 */
const mysql = require('mysql2');

// Create a connection
const connection = mysql.createConnection({
  host: 'localhost',
  port: 3306,
  user: 'root',
  password: 'your_password' // Replace with your actual MySQL root password
});

// Connect to MySQL
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }

  console.log('Connected to MySQL successfully!');

  // Get MySQL version
  connection.query('SELECT VERSION() as version', (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return;
    }

    console.log('MySQL version:', results[0].version);

    // Close the connection
    connection.end((err) => {
      if (err) {
        console.error('Error closing connection:', err);
        return;
      }

      console.log('Connection closed.');
    });
  });
});
