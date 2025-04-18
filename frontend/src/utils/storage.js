/**
 * Storage utility for managing saved connections and queries
 */

const SAVED_CONNECTIONS_KEY = 'genbi_saved_connections';
const SAVED_QUERIES_KEY = 'genbi_saved_queries';

/**
 * Save a database connection to local storage
 * @param {Object} connection - Connection information to save
 * @param {string} name - Name for the saved connection
 */
export const saveConnection = (connection, name) => {
  const savedConnections = getSavedConnections();
  
  // Add new connection with name and timestamp
  savedConnections.push({
    id: Date.now().toString(),
    name,
    connection,
    createdAt: new Date().toISOString()
  });
  
  // Save to local storage
  localStorage.setItem(SAVED_CONNECTIONS_KEY, JSON.stringify(savedConnections));
};

/**
 * Get all saved database connections
 * @returns {Array} - Array of saved connections
 */
export const getSavedConnections = () => {
  const savedConnections = localStorage.getItem(SAVED_CONNECTIONS_KEY);
  return savedConnections ? JSON.parse(savedConnections) : [];
};

/**
 * Delete a saved connection
 * @param {string} id - ID of the connection to delete
 */
export const deleteConnection = (id) => {
  const savedConnections = getSavedConnections();
  const updatedConnections = savedConnections.filter(conn => conn.id !== id);
  localStorage.setItem(SAVED_CONNECTIONS_KEY, JSON.stringify(updatedConnections));
};

/**
 * Save a query to local storage
 * @param {string} query - Query text to save
 * @param {string} name - Name for the saved query
 */
export const saveQuery = (query, name) => {
  const savedQueries = getSavedQueries();
  
  // Add new query with name and timestamp
  savedQueries.push({
    id: Date.now().toString(),
    name,
    query,
    createdAt: new Date().toISOString()
  });
  
  // Save to local storage
  localStorage.setItem(SAVED_QUERIES_KEY, JSON.stringify(savedQueries));
};

/**
 * Get all saved queries
 * @returns {Array} - Array of saved queries
 */
export const getSavedQueries = () => {
  const savedQueries = localStorage.getItem(SAVED_QUERIES_KEY);
  return savedQueries ? JSON.parse(savedQueries) : [];
};

/**
 * Delete a saved query
 * @param {string} id - ID of the query to delete
 */
export const deleteQuery = (id) => {
  const savedQueries = getSavedQueries();
  const updatedQueries = savedQueries.filter(query => query.id !== id);
  localStorage.setItem(SAVED_QUERIES_KEY, JSON.stringify(updatedQueries));
};
