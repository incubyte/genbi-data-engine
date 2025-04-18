const { Pool } = require('pg');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// PostgreSQL connection info
const connectionInfo = {
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE || 'testdb',
  user: process.env.PG_USER || 'postgres',
  password: process.env.PG_PASSWORD || 'postgres'
};

// Create a connection pool
const pool = new Pool(connectionInfo);

// SQL statements to create tables and insert data
const setupQueries = [
  // Drop tables if they exist
  `DROP TABLE IF EXISTS order_items CASCADE;`,
  `DROP TABLE IF EXISTS orders CASCADE;`,
  `DROP TABLE IF EXISTS products CASCADE;`,
  `DROP TABLE IF EXISTS users CASCADE;`,
  
  // Create users table
  `CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  
  // Create products table
  `CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    category VARCHAR(50),
    in_stock BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  
  // Create orders table
  `CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    total_amount DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );`,
  
  // Create order_items table
  `CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    product_id INTEGER NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL
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
  const client = await pool.connect();
  
  try {
    console.log('Setting up PostgreSQL test database...');
    
    // Begin transaction
    await client.query('BEGIN');
    
    // Execute each query
    for (const query of setupQueries) {
      await client.query(query);
      console.log('Executed:', query.split('\n')[0].substring(0, 60) + (query.length > 60 ? '...' : ''));
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('PostgreSQL test database setup complete!');
    console.log(`Connection info: ${JSON.stringify(connectionInfo, null, 2)}`);
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error setting up PostgreSQL database:', error);
  } finally {
    // Release client
    client.release();
    
    // Close pool
    await pool.end();
    console.log('Database connection closed');
  }
}

// Run the setup
setupDatabase();
