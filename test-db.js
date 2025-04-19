const sqlite3 = require('sqlite3').verbose();
const { promisify } = require('util');
const path = require('path');

const dbPath = path.join(__dirname, 'mydatabase.db');
const db = new sqlite3.Database(dbPath);

const runAsync = promisify(db.run).bind(db);

// Create tables and insert sample data
async function setupDatabase() {
  try {
    // Enable foreign keys
    await runAsync('PRAGMA foreign_keys = ON');
    
    // Create users table
    await runAsync(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        age INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created users table');
    
    // Create products table
    await runAsync(`
      CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        price REAL NOT NULL,
        category TEXT,
        in_stock BOOLEAN DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Created products table');
    
    // Create orders table
    await runAsync(`
      CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        total_amount REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `);
    console.log('Created orders table');
    
    // Create order_items table
    await runAsync(`
      CREATE TABLE order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price REAL NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id),
        FOREIGN KEY (product_id) REFERENCES products (id)
      )
    `);
    console.log('Created order_items table');
    
    // Insert sample users
    await runAsync(`
      INSERT INTO users (name, email, age) VALUES
      ('John Doe', 'john@example.com', 30),
      ('Jane Smith', 'jane@example.com', 25),
      ('Bob Johnson', 'bob@example.com', 40),
      ('Alice Brown', 'alice@example.com', 35)
    `);
    console.log('Inserted sample users');
    
    // Insert sample products
    await runAsync(`
      INSERT INTO products (name, description, price, category) VALUES
      ('Laptop', 'High-performance laptop', 1200.00, 'Electronics'),
      ('Smartphone', 'Latest smartphone model', 800.00, 'Electronics'),
      ('Headphones', 'Noise-cancelling headphones', 150.00, 'Electronics'),
      ('T-shirt', 'Cotton t-shirt', 20.00, 'Clothing'),
      ('Jeans', 'Blue denim jeans', 50.00, 'Clothing'),
      ('Coffee Maker', 'Automatic coffee maker', 80.00, 'Kitchen'),
      ('Blender', 'High-speed blender', 60.00, 'Kitchen')
    `);
    console.log('Inserted sample products');
    
    // Insert sample orders
    await runAsync(`
      INSERT INTO orders (user_id, total_amount, status) VALUES
      (1, 1350.00, 'completed'),
      (1, 80.00, 'completed'),
      (2, 950.00, 'processing'),
      (3, 70.00, 'pending'),
      (4, 1200.00, 'completed')
    `);
    console.log('Inserted sample orders');
    
    // Insert sample order items
    await runAsync(`
      INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
      (1, 1, 1, 1200.00),
      (1, 3, 1, 150.00),
      (2, 6, 1, 80.00),
      (3, 2, 1, 800.00),
      (3, 3, 1, 150.00),
      (4, 4, 2, 20.00),
      (4, 5, 1, 50.00),
      (5, 1, 1, 1200.00)
    `);
    console.log('Inserted sample order items');
    
    console.log('Database setup complete!');
    console.log(`Database file created at: ${dbPath}`);
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

// Run the setup
setupDatabase();
