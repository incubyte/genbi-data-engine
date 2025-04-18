const logger = require('../../utils/logger');

/**
 * Utility for extracting relevant schema information based on user queries
 * This helps optimize prompt size when dealing with very large database schemas
 */
class SchemaExtractor {
  /**
   * Extract relevant schema portions based on a user query
   * @param {Object} schema - Complete database schema
   * @param {string} userQuery - User's natural language query
   * @param {Object} options - Options for extraction
   * @param {number} options.maxTables - Maximum number of tables to include (default: 20)
   * @param {boolean} options.includeForeignKeys - Whether to include foreign key relationships (default: true)
   * @returns {Object} - Filtered schema with only relevant tables
   */
  extractRelevantSchema(schema, userQuery, options = {}) {
    const maxTables = options.maxTables || 20;
    const includeForeignKeys = options.includeForeignKeys !== false;

    logger.debug('Extracting relevant schema based on user query', { 
      maxTables, 
      includeForeignKeys,
      schemaSize: Object.keys(schema).length
    });

    // Skip extraction if schema is small enough
    if (Object.keys(schema).length <= maxTables) {
      logger.debug('Schema is small enough, returning full schema');
      return schema;
    }

    // Normalize the user query for better matching
    const normalizedQuery = userQuery.toLowerCase();
    
    // Split query into individual words and remove common words
    const stopWords = new Set([
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 
      'by', 'about', 'like', 'through', 'over', 'before', 'after', 'between', 
      'under', 'during', 'without', 'of', 'from', 'as', 'into', 'through',
      'show', 'find', 'get', 'list', 'display', 'give', 'me', 'all', 'any',
      'where', 'who', 'what', 'when', 'how', 'which', 'why', 'whose'
    ]);
    
    const queryWords = normalizedQuery
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
    
    logger.debug('Extracted query words', { queryWords });

    // Score each table based on relevance to query
    const tableScores = new Map();
    
    // First pass: Direct table name matches
    for (const tableName in schema) {
      const normalizedTableName = tableName.toLowerCase();
      const singularTableName = this._getSingular(normalizedTableName);
      
      // Score based on table name matches
      let score = 0;
      
      // Exact table name match is highly relevant
      if (normalizedQuery.includes(normalizedTableName)) {
        score += 10;
      }
      
      // Singular form match
      if (singularTableName !== normalizedTableName && normalizedQuery.includes(singularTableName)) {
        score += 8;
      }
      
      // Check word by word matches
      for (const word of queryWords) {
        if (normalizedTableName.includes(word) || word.includes(normalizedTableName)) {
          score += 5;
        }
        
        if (singularTableName !== normalizedTableName && 
            (singularTableName.includes(word) || word.includes(singularTableName))) {
          score += 4;
        }
      }
      
      // Second pass: Column name matches
      const columns = schema[tableName].columns;
      for (const column of columns) {
        const normalizedColumnName = column.name.toLowerCase();
        
        // Column name in query is relevant
        if (normalizedQuery.includes(normalizedColumnName)) {
          score += 3;
        }
        
        // Column name matches a query word
        for (const word of queryWords) {
          if (normalizedColumnName.includes(word) || word.includes(normalizedColumnName)) {
            score += 2;
          }
        }
        
        // Score based on column name suggestions of intent
        const intentIndicators = {
          'id': 0.5,
          'name': 1,
          'title': 1,
          'description': 1,
          'date': 1,
          'time': 1,
          'amount': 1,
          'price': 1,
          'cost': 1,
          'quantity': 1,
          'total': 1,
          'count': 1,
          'status': 1
        };
        
        for (const [indicator, weight] of Object.entries(intentIndicators)) {
          if (normalizedColumnName.includes(indicator)) {
            score += weight;
          }
        }
      }
      
      tableScores.set(tableName, score);
    }
    
    // Sort tables by score and select top N
    const sortedTables = [...tableScores.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])
      .slice(0, maxTables);
    
    logger.debug('Selected tables by relevance', { 
      selectedTables: sortedTables,
      scores: Object.fromEntries([...tableScores.entries()]
        .filter(([table]) => sortedTables.includes(table)))
    });

    // If includeForeignKeys is true, add related tables
    const tablesWithRelations = new Set(sortedTables);
    
    if (includeForeignKeys) {
      for (const tableName of sortedTables) {
        const foreignKeys = schema[tableName].foreignKeys || [];
        
        for (const fk of foreignKeys) {
          if (fk.table && !tablesWithRelations.has(fk.table)) {
            tablesWithRelations.add(fk.table);
            logger.debug(`Added related table through foreign key: ${fk.table} (referenced by ${tableName})`);
          }
        }
      }
      
      // Also check for tables that reference our selected tables
      for (const tableName in schema) {
        if (tablesWithRelations.has(tableName)) continue;
        
        const foreignKeys = schema[tableName].foreignKeys || [];
        for (const fk of foreignKeys) {
          if (fk.table && tablesWithRelations.has(fk.table)) {
            tablesWithRelations.add(tableName);
            logger.debug(`Added related table that references: ${tableName} (references ${fk.table})`);
            break;
          }
        }
      }
    }
    
    // Build the filtered schema
    const filteredSchema = {};
    for (const tableName of tablesWithRelations) {
      filteredSchema[tableName] = schema[tableName];
    }
    
    logger.info(`Extracted schema with ${Object.keys(filteredSchema).length} tables from original schema with ${Object.keys(schema).length} tables`);
    
    return filteredSchema;
  }
  
  /**
   * Get singular form of a word (very simple implementation)
   * @param {string} word - Word to convert to singular
   * @returns {string} - Singular form
   * @private
   */
  _getSingular(word) {
    if (word.endsWith('ies')) {
      return word.slice(0, -3) + 'y';
    } else if (word.endsWith('es')) {
      return word.slice(0, -2);
    } else if (word.endsWith('s') && !word.endsWith('ss')) {
      return word.slice(0, -1);
    }
    return word;
  }
}

module.exports = new SchemaExtractor();