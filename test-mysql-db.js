const mysql = require('mysql2/promise');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// MySQL connection info
const connectionInfo = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  database: process.env.MYSQL_DATABASE || 'testdb',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || 'password'
};

// SQL statements to create tables and insert data
const setupQueries = [
  // Drop tables if they exist
  `DROP TABLE IF EXISTS order_items;`,
  `DROP TABLE IF EXISTS orders;`,
  `DROP TABLE IF EXISTS products;`,
  `DROP TABLE IF EXISTS users;`,
  
  // Create users table
  `CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  
  // Create products table
  `CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  
  // Create orders table
  `CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );`,
  
  // Create order_items table
  `CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
  );`,
  
  // Insert sample users
  `INSERT INTO users (name, email, age) VALUES
    ('John Doe', 'john@example.com', 30),
    ('Jane Smith', 'jane@example.com', 25),
    ('Bob Johnson', 'bob@example.com', 40),
    ('Alice Brown', 'alice@example.com', 35);`,
  
  // Insert sample products
  `INSERT INTO products (name, description, price, category) VALUES
    ('Laptop', 'High-performance laptop', 1200.00, 'Electronics'),
    ('Smartphone', 'Latest smartphone model', 800.00, 'Electronics'),
    ('Headphones', 'Noise-cancelling headphones', 150.00, 'Electronics'),
    ('T-shirt', 'Cotton t-shirt', 20.00, 'Clothing'),
    ('Jeans', 'Blue denim jeans', 50.00, 'Clothing'),
    ('Coffee Maker', 'Automatic coffee maker', 80.00, 'Kitchen'),
    ('Blender', 'High-speed blender', 60.00, 'Kitchen');`,
  
  // Insert sample orders
  `INSERT INTO orders (user_id, total_amount, status) VALUES
    (1, 1350.00, 'completed'),
    (1, 80.00, 'completed'),
    (2, 950.00, 'processing'),
    (3, 70.00, 'pending'),
    (4, 1200.00, 'completed');`,
  
  // Insert sample order items
  `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
    (1, 1, 1, 1200.00),
    (1, 3, 1, 150.00),
    (2, 6, 1, 80.00),
    (3, 2, 1, 800.00),
    (3, 3, 1, 150.00),
    (4, 4, 2, 20.00),
    (4, 5, 1, 50.00),
    (5, 1, 1, 1200.00);`
];

// Execute setup queries
async function setupDatabase() {
  let connection;
  
  try {
    console.log('Setting up MySQL test database...');
    
    // Create database if it doesn't exist
    const tempConnection = await mysql.createConnection({
      host: connectionInfo.host,
      port: connectionInfo.port,
      user: connectionInfo.user,
      password: connectionInfo.password
    });
    
    await tempConnection.query(`CREATE DATABASE IF NOT EXISTS ${connectionInfo.database}`);
    await tempConnection.end();
    
    // Connect to the database
    connection = await mysql.createConnection(connectionInfo);
    
    // Execute each query
    for (const query of setupQueries) {
      await connection.query(query);
      console.log('Executed:', query.split('\n')[0].substring(0, 60) + (query.length > 60 ? '...' : ''));
    }
    
    console.log('MySQL test database setup complete!');
    console.log(`Connection info: ${JSON.stringify(connectionInfo, null, 2)}`);
  } catch (error) {
    console.error('Error setting up MySQL database:', error);
  } finally {
    // Close connection
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the setup
setupDatabase();
