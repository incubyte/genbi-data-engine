import React from 'react';
import { Box, Typography, Container } from '@mui/material';
import ConnectionForm from './ConnectionForm';
import SavedConnections from './SavedConnections';

const DatabaseConnection = ({ onConnectionEstablished }) => {
  // Handle selecting a saved connection
  const handleSelectConnection = (connectionInfo) => {
    onConnectionEstablished(connectionInfo);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Connect to Your Database
        </Typography>
        
        <Typography variant="body1" paragraph align="center" sx={{ mb: 4 }}>
          Connect to your database to start generating insights from your data using natural language.
        </Typography>
        
        <SavedConnections onSelectConnection={handleSelectConnection} />
        <ConnectionForm onConnectionEstablished={onConnectionEstablished} />
      </Box>
    </Container>
  );
};

export default DatabaseConnection;
