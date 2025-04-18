/**
 * Centralized validation service for the application
 */

/**
 * Validate connection information
 * @param {Object} connectionInfo - Connection information to validate
 * @returns {Object} - Validation result with isValid flag and errors object
 */
const validateConnection = (connectionInfo) => {
  const errors = {};

  if (!connectionInfo) {
    errors.connection = 'Connection information is required';
    return { isValid: false, errors };
  }

  // Validate connection type
  if (!connectionInfo.type) {
    errors.type = 'Database type is required';
  } else if (!['sqlite', 'postgres', 'mysql'].includes(connectionInfo.type.toLowerCase())) {
    errors.type = 'Invalid database type. Supported types: sqlite, postgres, mysql';
  }

  // Validate connection details based on type
  if (connectionInfo.type === 'sqlite') {
    if (!connectionInfo.connection) {
      errors.connection = 'SQLite database path is required';
    }
  } else if (connectionInfo.type && ['postgres', 'mysql'].includes(connectionInfo.type.toLowerCase())) {
    const conn = connectionInfo.connection;

    if (typeof conn === 'string') {
      // Connection string validation
      if (!conn) {
        errors.connection = `${connectionInfo.type} connection string is required`;
      } else if (connectionInfo.type === 'postgres' &&
                !conn.startsWith('postgres://') &&
                !conn.startsWith('postgresql://')) {
        errors.connection = 'Invalid PostgreSQL connection string format';
      } else if (connectionInfo.type === 'mysql' && !conn.startsWith('mysql://')) {
        errors.connection = 'Invalid MySQL connection string format';
      }
    } else if (typeof conn === 'object') {
      // Connection object validation
      if (!conn.host) {
        errors.host = 'Host is required';
      }

      if (!conn.database) {
        errors.database = 'Database name is required';
      }

      if (!conn.user) {
        errors.user = 'Username is required';
      }

      // Port validation
      if (conn.port) {
        const port = parseInt(conn.port);
        if (isNaN(port) || port <= 0 || port > 65535) {
          errors.port = 'Port must be a valid number between 1 and 65535';
        }
      }
    } else {
      errors.connection = 'Invalid connection format';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate query information
 * @param {Object} queryData - Query data to validate
 * @returns {Object} - Validation result with isValid flag and errors object
 */
const validateQuery = (queryData) => {
  const errors = {};

  if (!queryData) {
    errors.query = 'Query data is required';
    return { isValid: false, errors };
  }

  // Validate query name
  if (!queryData.name) {
    errors.name = 'Query name is required';
  } else if (queryData.name.length > 100) {
    errors.name = 'Query name must be less than 100 characters';
  }

  // Validate query text
  if (!queryData.query) {
    errors.query = 'Query text is required';
  }

  // Validate connection ID if provided
  if (queryData.connection_id && typeof queryData.connection_id !== 'string') {
    errors.connection_id = 'Connection ID must be a string';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate user query
 * @param {string} userQuery - User's natural language query
 * @returns {Object} - Validation result with isValid flag and errors object
 */
const validateUserQuery = (userQuery) => {
  const errors = {};

  if (!userQuery) {
    errors.userQuery = 'Query text is required';
  } else if (userQuery.trim().length < 3) {
    errors.userQuery = 'Query must be at least 3 characters long';
  } else if (userQuery.trim().length > 1000) {
    errors.userQuery = 'Query must be less than 1000 characters long';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

module.exports = {
  validateConnection,
  validateQuery,
  validateUserQuery
};
