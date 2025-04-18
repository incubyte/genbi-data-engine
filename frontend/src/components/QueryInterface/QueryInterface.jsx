import React, { useState } from 'react';
import { Box, Typography, Container, Alert } from '@mui/material';
import QueryForm from './QueryForm';
import SavedQueries from './SavedQueries';
import apiService from '../../services/api';

const QueryInterface = ({ connectionInfo, onQueryResults }) => {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);

  // Handle query submission
  const handleSubmitQuery = async (queryText) => {
    setQuery(queryText);
    setIsProcessing(true);
    setError(null);
    
    try {
      // Process the query using the API service
      const result = await apiService.processQuery(queryText, connectionInfo);
      
      if (result.success) {
        // Pass results to parent component
        onQueryResults(result.data);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle selecting a saved query
  const handleSelectQuery = (queryText) => {
    setQuery(queryText);
    handleSubmitQuery(queryText);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Ask Questions About Your Data
        </Typography>
        
        <Typography variant="body1" paragraph align="center" sx={{ mb: 4 }}>
          Ask questions in plain English and get instant insights from your data.
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <SavedQueries onSelectQuery={handleSelectQuery} />
        <QueryForm 
          onSubmitQuery={handleSubmitQuery} 
          isProcessing={isProcessing}
          initialQuery={query}
        />
      </Box>
    </Container>
  );
};

export default QueryInterface;
