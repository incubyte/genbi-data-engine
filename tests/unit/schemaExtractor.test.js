const schemaExtractor = require('../../src/services/anthropic/schemaExtractor');

describe('SchemaExtractor', () => {
  // Sample large schema for testing
  const testSchema = {
    users: {
      columns: [
        { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
        { name: 'username', type: 'TEXT', notNull: true },
        { name: 'email', type: 'TEXT', notNull: true },
        { name: 'created_at', type: 'TIMESTAMP', notNull: true }
      ],
      foreignKeys: [],
      indexes: []
    },
    products: {
      columns: [
        { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
        { name: 'name', type: 'TEXT', notNull: true },
        { name: 'price', type: 'REAL', notNull: true },
        { name: 'description', type: 'TEXT' },
        { name: 'category_id', type: 'INTEGER' },
        { name: 'created_at', type: 'TIMESTAMP', notNull: true }
      ],
      foreignKeys: [
        { id: 0, table: 'categories', from: 'category_id', to: 'id' }
      ],
      indexes: []
    },
    categories: {
      columns: [
        { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
        { name: 'name', type: 'TEXT', notNull: true }
      ],
      foreignKeys: [],
      indexes: []
    },
    orders: {
      columns: [
        { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
        { name: 'user_id', type: 'INTEGER', notNull: true },
        { name: 'total_amount', type: 'REAL', notNull: true },
        { name: 'status', type: 'TEXT', notNull: true },
        { name: 'created_at', type: 'TIMESTAMP', notNull: true }
      ],
      foreignKeys: [
        { id: 0, table: 'users', from: 'user_id', to: 'id' }
      ],
      indexes: []
    },
    order_items: {
      columns: [
        { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
        { name: 'order_id', type: 'INTEGER', notNull: true },
        { name: 'product_id', type: 'INTEGER', notNull: true },
        { name: 'quantity', type: 'INTEGER', notNull: true },
        { name: 'unit_price', type: 'REAL', notNull: true }
      ],
      foreignKeys: [
        { id: 0, table: 'orders', from: 'order_id', to: 'id' },
        { id: 1, table: 'products', from: 'product_id', to: 'id' }
      ],
      indexes: []
    },
    reviews: {
      columns: [
        { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
        { name: 'product_id', type: 'INTEGER', notNull: true },
        { name: 'user_id', type: 'INTEGER', notNull: true },
        { name: 'rating', type: 'INTEGER', notNull: true },
        { name: 'comment', type: 'TEXT' },
        { name: 'created_at', type: 'TIMESTAMP', notNull: true }
      ],
      foreignKeys: [
        { id: 0, table: 'products', from: 'product_id', to: 'id' },
        { id: 1, table: 'users', from: 'user_id', to: 'id' }
      ],
      indexes: []
    },
    notifications: {
      columns: [
        { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
        { name: 'user_id', type: 'INTEGER', notNull: true },
        { name: 'message', type: 'TEXT', notNull: true },
        { name: 'read', type: 'BOOLEAN', notNull: true, defaultValue: 'false' },
        { name: 'created_at', type: 'TIMESTAMP', notNull: true }
      ],
      foreignKeys: [
        { id: 0, table: 'users', from: 'user_id', to: 'id' }
      ],
      indexes: []
    },
    blog_posts: {
      columns: [
        { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
        { name: 'title', type: 'TEXT', notNull: true },
        { name: 'content', type: 'TEXT', notNull: true },
        { name: 'author_id', type: 'INTEGER', notNull: true },
        { name: 'published', type: 'BOOLEAN', notNull: true, defaultValue: 'false' },
        { name: 'created_at', type: 'TIMESTAMP', notNull: true }
      ],
      foreignKeys: [
        { id: 0, table: 'users', from: 'author_id', to: 'id' }
      ],
      indexes: []
    },
    tags: {
      columns: [
        { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
        { name: 'name', type: 'TEXT', notNull: true }
      ],
      foreignKeys: [],
      indexes: []
    },
    blog_post_tags: {
      columns: [
        { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
        { name: 'blog_post_id', type: 'INTEGER', notNull: true },
        { name: 'tag_id', type: 'INTEGER', notNull: true }
      ],
      foreignKeys: [
        { id: 0, table: 'blog_posts', from: 'blog_post_id', to: 'id' },
        { id: 1, table: 'tags', from: 'tag_id', to: 'id' }
      ],
      indexes: []
    },
    shipping_addresses: {
      columns: [
        { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
        { name: 'user_id', type: 'INTEGER', notNull: true },
        { name: 'address_line1', type: 'TEXT', notNull: true },
        { name: 'address_line2', type: 'TEXT' },
        { name: 'city', type: 'TEXT', notNull: true },
        { name: 'state', type: 'TEXT', notNull: true },
        { name: 'postal_code', type: 'TEXT', notNull: true },
        { name: 'country', type: 'TEXT', notNull: true }
      ],
      foreignKeys: [
        { id: 0, table: 'users', from: 'user_id', to: 'id' }
      ],
      indexes: []
    },
    payment_methods: {
      columns: [
        { name: 'id', type: 'INTEGER', notNull: true, primaryKey: true },
        { name: 'user_id', type: 'INTEGER', notNull: true },
        { name: 'type', type: 'TEXT', notNull: true },
        { name: 'details', type: 'TEXT', notNull: true },
        { name: 'is_default', type: 'BOOLEAN', notNull: true, defaultValue: 'false' }
      ],
      foreignKeys: [
        { id: 0, table: 'users', from: 'user_id', to: 'id' }
      ],
      indexes: []
    }
  };

  test('should return full schema when below maxTables threshold', () => {
    const userQuery = 'Show me all users';
    const options = { maxTables: 20 };
    
    const result = schemaExtractor.extractRelevantSchema(testSchema, userQuery, options);
    
    // Should return full schema as it's already below maxTables (12 tables < 20)
    expect(Object.keys(result).length).toBe(Object.keys(testSchema).length);
  });

  test('should extract tables directly mentioned in the query', () => {
    const userQuery = 'Show me all products with their categories';
    const options = { maxTables: 3, includeForeignKeys: true };
    
    const result = schemaExtractor.extractRelevantSchema(testSchema, userQuery, options);
    
    // Should include products and categories (directly mentioned)
    expect(result).toHaveProperty('products');
    expect(result).toHaveProperty('categories');
  });

  test('should include related tables through foreign keys', () => {
    const userQuery = 'Show me all orders';
    const options = { maxTables: 3, includeForeignKeys: true };
    
    const result = schemaExtractor.extractRelevantSchema(testSchema, userQuery, options);
    
    // Should include orders (directly mentioned) and related tables through foreign keys
    expect(result).toHaveProperty('orders');
    expect(result).toHaveProperty('users'); // related through foreign key
  });

  test('should prioritize tables based on query relevance', () => {
    const userQuery = 'What is the total quantity and price of products ordered by each user?';
    const options = { maxTables: 5, includeForeignKeys: true };
    
    const result = schemaExtractor.extractRelevantSchema(testSchema, userQuery, options);
    
    // Should include the most relevant tables
    expect(result).toHaveProperty('users');
    expect(result).toHaveProperty('orders');
    expect(result).toHaveProperty('order_items');
    expect(result).toHaveProperty('products');
  });

  test('should not include foreign keys when option is disabled', () => {
    const userQuery = 'Show me all orders';
    const options = { maxTables: 2, includeForeignKeys: false };
    
    const result = schemaExtractor.extractRelevantSchema(testSchema, userQuery, options);
    
    // Should include only the directly relevant table(s)
    expect(Object.keys(result).length).toBeLessThanOrEqual(2);
    expect(result).toHaveProperty('orders');
  });

  test('should handle singular/plural forms in queries', () => {
    const userQuery = 'Show me information about each product category';
    const options = { maxTables: 3, includeForeignKeys: true };
    
    const result = schemaExtractor.extractRelevantSchema(testSchema, userQuery, options);
    
    // Should match 'categories' from 'category' in the query
    expect(result).toHaveProperty('categories');
    expect(result).toHaveProperty('products');
  });

  test('should extract tables based on column name matches', () => {
    const userQuery = 'What is the total price of all orders?';
    const options = { maxTables: 3, includeForeignKeys: true };
    
    const result = schemaExtractor.extractRelevantSchema(testSchema, userQuery, options);
    
    // Should match tables with relevant columns mentioned in query
    expect(result).toHaveProperty('orders'); // has 'total_amount' column
    expect(result).toHaveProperty('products'); // has 'price' column
  });
});