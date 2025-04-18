import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Button,
  Alert,
  AlertTitle,
  CircularProgress,
  Divider
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import ConnectionForm from './ConnectionForm';
import SavedConnections from './SavedConnections';
import apiService from '../../services/api';

const DatabaseConnection = ({ onConnectionEstablished }) => {
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load saved connections on component mount
  useEffect(() => {
    const loadConnections = async () => {
      try {
        setLoading(true);
        const result = await apiService.getSavedConnections();
        if (result.success) {
          setConnections(result.data);
        } else {
          setError('Failed to load saved connections');
        }
      } catch (err) {
        console.error('Error loading connections:', err);
        setError('Error loading connections. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadConnections();
  }, []);

  // Handle selecting a saved connection
  const handleSelectConnection = (connectionInfo) => {
    if (onConnectionEstablished) {
      onConnectionEstablished(connectionInfo);
    } else {
      // If we're in the routed version, navigate to query page
      navigate('/query', { state: { connectionInfo } });
    }
  };

  // Handle connection established from form
  const handleConnectionEstablished = (connectionInfo) => {
    if (onConnectionEstablished) {
      onConnectionEstablished(connectionInfo);
    } else {
      // If we're in the routed version, navigate to query page
      navigate('/query', { state: { connectionInfo } });
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Show error state
  if (error) {
    return (
      <Container maxWidth="md">
        <Alert severity="error" sx={{ my: 4 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      </Container>
    );
  }

  // Show welcome message for first-time users
  const renderWelcomeMessage = () => {
    if (connections.length === 0) {
      return (
        <Paper sx={{ p: 3, mb: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            Welcome to GenBI!
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            Create your first database connection to start generating insights from your data.
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            GenBI supports SQLite, PostgreSQL, and MySQL databases.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => document.getElementById('connection-form').scrollIntoView({ behavior: 'smooth' })}
          >
            Create Your First Connection
          </Button>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Database Connections
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, textAlign: 'center' }}>
          Connect to your database to start generating insights from your data using natural language.
        </Typography>

        {renderWelcomeMessage()}

        <SavedConnections
          onSelectConnection={handleSelectConnection}
          connections={connections}
          setConnections={setConnections}
        />

        <Box id="connection-form">
          <ConnectionForm onConnectionEstablished={handleConnectionEstablished} />
        </Box>
      </Box>
    </Container>
  );
};

export default DatabaseConnection;
