import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Alert,
  AlertTitle,
  Button
} from '@mui/material';
import { Storage as DatabaseIcon } from '@mui/icons-material';
import QueryForm from './QueryForm';
import SavedQueries from './SavedQueries';
import apiService from '../../services/api';
import FeedbackMessage from '../common/FeedbackMessage';
import ErrorBoundary from '../common/ErrorBoundary';

const QueryInterface = ({ connectionInfo: propConnectionInfo, onQueryResults }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  // We don't need to keep results in state as we navigate away
  // const [results, setResults] = useState(null);
  const [activeConnectionInfo, setActiveConnectionInfo] = useState(propConnectionInfo || null);

  // Check for connection info from props or route state
  useEffect(() => {
    // First check if we have connection info from props
    if (propConnectionInfo && (!activeConnectionInfo || JSON.stringify(propConnectionInfo) !== JSON.stringify(activeConnectionInfo))) {
      setActiveConnectionInfo(propConnectionInfo);
      return;
    }

    // Then check if we have connection info from route state
    const locationState = location.state || {};
    if (locationState.connectionInfo && (!activeConnectionInfo || JSON.stringify(locationState.connectionInfo) !== JSON.stringify(activeConnectionInfo))) {
      setActiveConnectionInfo(locationState.connectionInfo);
    }
  }, [location, propConnectionInfo, activeConnectionInfo]);

  // Handle query submission
  const handleSubmitQuery = async (queryText) => {
    // Check if we have connection info
    if (!activeConnectionInfo) {
      setError('No active database connection. Please connect to a database first.');
      return;
    }

    setQuery(queryText);
    setIsProcessing(true);
    setError(null);

    try {
      // Process the query using the API service
      // Make sure we have a valid connection info object
      if (!activeConnectionInfo?.type) {
        throw new Error('Invalid connection information');
      }

      const result = await apiService.processQuery(queryText, activeConnectionInfo);

      if (result.success) {
        // If we're in the routed version, set local results
        if (onQueryResults) {
          onQueryResults(result.data);
        } else {
          // Navigate to results page with the data
          // No need to set results in state
          navigate('/results', { state: { results: result.data } });
        }
        return result.data; // Return data for promise chaining
      } else {
        setError(result.error);
        throw new Error(result.error); // Throw error for promise chaining
      }
    } catch (error) {
      setError(error.message);
      throw error; // Re-throw for promise chaining
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle selecting a saved query
  const handleSelectQuery = (queryText) => {
    setQuery(queryText);
    handleSubmitQuery(queryText);
  };

  // Show no connection warning
  const renderNoConnectionWarning = () => {
    if (!activeConnectionInfo) {
      return (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate('/connections')}
            >
              Connect Now
            </Button>
          }
        >
          <AlertTitle>No Database Connection</AlertTitle>
          You need to connect to a database before you can run queries.
        </Alert>
      );
    }
    return null;
  };

  return (
    <ErrorBoundary>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ fontWeight: 'bold', mb: 2 }}>
            Ask Questions About Your Data
          </Typography>

          <Typography variant="body1" sx={{ mb: 4, textAlign: 'center', fontSize: '1.1rem', color: 'text.secondary' }}>
            Ask questions in plain English and get instant insights from your data.
          </Typography>

          {renderNoConnectionWarning()}

          {activeConnectionInfo && (
            <Paper sx={{ p: 3, mb: 4, display: 'flex', alignItems: 'center', boxShadow: 2, borderLeft: 4, borderColor: 'primary.main' }}>
              <DatabaseIcon color="primary" sx={{ mr: 2, fontSize: 28 }} />
              <Typography variant="body1">
                Connected to: <strong>
                  {(() => {
                    if (!activeConnectionInfo) return 'Unknown';

                    if (activeConnectionInfo.type === 'sqlite') {
                      return `SQLite: ${activeConnectionInfo.connection || 'Unknown'}`;
                    } else if (activeConnectionInfo.connection && typeof activeConnectionInfo.connection === 'object') {
                      const dbType = activeConnectionInfo.type === 'postgres' ? 'PostgreSQL' : 'MySQL';
                      const host = activeConnectionInfo.connection.host || 'localhost';
                      const port = activeConnectionInfo.connection.port || '3306';
                      const database = activeConnectionInfo.connection.database || 'unknown';
                      return `${dbType}: ${host}:${port}/${database}`;
                    } else {
                      return `${activeConnectionInfo.type || 'Unknown'}: ${activeConnectionInfo.connection || 'Unknown'}`;
                    }
                  })()}
                </strong>
              </Typography>
            </Paper>
          )}

          <SavedQueries onSelectQuery={handleSelectQuery} />
          <QueryForm
            onSubmitQuery={handleSubmitQuery}
            isProcessing={isProcessing}
            initialQuery={query}
            disabled={!activeConnectionInfo}
          />

          {/* Error message feedback */}
          <FeedbackMessage
            open={!!error}
            message={error || ''}
            severity="error"
            onClose={() => setError(null)}
            position="bottom"
          />
        </Box>
      </Container>
    </ErrorBoundary>
  );
};

QueryInterface.propTypes = {
  connectionInfo: PropTypes.object,
  onQueryResults: PropTypes.func
};

QueryInterface.defaultProps = {
  connectionInfo: null,
  onQueryResults: null
};

export default QueryInterface;
