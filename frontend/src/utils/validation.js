/**
 * Validate database connection form fields
 * @param {Object} formData - Form data to validate
 * @param {string} databaseType - Selected database type
 * @returns {Object} - Validation result with errors
 */
export const validateConnectionForm = (formData, databaseType) => {
  const errors = {};

  // Validate based on database type
  if (databaseType === 'sqlite') {
    if (!formData.connection) {
      errors.connection = 'Database file path is required';
    }
  } else if (databaseType === 'postgres' || databaseType === 'mysql') {
    if (!formData.host) {
      errors.host = 'Host is required';
    }

    if (!formData.port) {
      errors.port = 'Port is required';
    } else if (isNaN(formData.port) || formData.port < 0) {
      errors.port = 'Port must be a valid number';
    }

    if (!formData.database) {
      errors.database = 'Database name is required';
    }

    if (!formData.user) {
      errors.user = 'Username is required';
    }

    // Password validation
    if (databaseType === 'mysql' && !formData.password) {
      // Password is typically required for MySQL
      errors.password = 'Password is required';
    }
    // Password is optional for some PostgreSQL configurations
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Validate query form
 * @param {string} query - User's natural language query
 * @returns {Object} - Validation result with errors
 */
export const validateQueryForm = (query) => {
  const errors = {};

  if (!query || query.trim() === '') {
    errors.query = 'Query is required';
  } else if (query.length < 5) {
    errors.query = 'Query is too short';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};
