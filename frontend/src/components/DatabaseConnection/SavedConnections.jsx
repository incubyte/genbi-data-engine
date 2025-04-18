import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Divider,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Collapse
} from '@mui/material';
import {
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import apiService from '../../services/api';

const SavedConnections = ({ onSelectConnection, connections = [], setConnections }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState(null);
  const [expanded, setExpanded] = useState(true);

  // Load saved connections from backend
  const loadSavedConnections = useCallback(async () => {
    try {
      const result = await apiService.getSavedConnections();
      if (result.success && setConnections) {
        setConnections(result.data);
      } else if (result.success) {
        // If setConnections not provided, use local state
        console.log('Using local state for connections');
      } else {
        console.error('Failed to load saved connections:', result.error);
      }
    } catch (error) {
      console.error('Error loading saved connections:', error);
    }
  }, [setConnections]);

  // Load saved connections if not provided as props
  useEffect(() => {
    if (!connections || connections.length === 0) {
      loadSavedConnections();
    }
  }, [connections, loadSavedConnections]);

  // Handle connection selection
  const handleSelectConnection = (connection) => {
    onSelectConnection(connection.connection);
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (e, connection) => {
    e.stopPropagation(); // Prevent triggering the list item click
    setConnectionToDelete(connection);
    setDeleteDialogOpen(true);
  };

  // Delete a saved connection
  const handleDeleteConnection = async () => {
    if (connectionToDelete) {
      try {
        const result = await apiService.deleteConnection(connectionToDelete.id);
        if (result.success) {
          await loadSavedConnections();
          setDeleteDialogOpen(false);
          setConnectionToDelete(null);
        } else {
          console.error('Failed to delete connection:', result.error);
        }
      } catch (error) {
        console.error('Error deleting connection:', error);
      }
    }
  };

  // Format connection details for display
  const formatConnectionDetails = (connection) => {
    if (!connection) return 'Invalid connection';

    const type = connection.type || 'unknown';
    const conn = connection.connection || connection;

    if (type === 'sqlite') {
      return `SQLite: ${typeof conn === 'string' ? conn : JSON.stringify(conn)}`;
    } else if (type === 'postgres') {
      if (typeof conn === 'string') {
        return `PostgreSQL: ${conn}`;
      } else {
        return `PostgreSQL: ${conn.host}:${conn.port}/${conn.database}`;
      }
    } else if (type === 'mysql') {
      if (typeof conn === 'string') {
        return `MySQL: ${conn}`;
      } else {
        return `MySQL: ${conn.host}:${conn.port}/${conn.database}`;
      }
    }
    return 'Unknown connection type';
  };

  // Toggle expansion
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h3">
          Saved Connections
        </Typography>
        <IconButton onClick={toggleExpanded}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        {connections.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No saved connections yet. Test and save a connection to see it here.
          </Typography>
        ) : (
          <List>
            {connections.map((connection, index) => (
              <React.Fragment key={connection.id}>
                {index > 0 && <Divider />}
                <ListItem
                  button
                  onClick={() => handleSelectConnection(connection)}
                  sx={{
                    '&:hover': {
                      backgroundColor: 'rgba(0, 0, 0, 0.04)'
                    }
                  }}
                >
                  <ListItemText
                    primary={connection.name}
                    secondary={formatConnectionDetails(connection)}
                  />
                  <Box sx={{ display: 'flex' }}>
                    <Tooltip title="Use this connection">
                      <IconButton
                        edge="end"
                        onClick={() => handleSelectConnection(connection)}
                        color="primary"
                      >
                        <LinkIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete connection">
                      <IconButton
                        edge="end"
                        onClick={(e) => handleOpenDeleteDialog(e, connection)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Collapse>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Connection</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the connection "{connectionToDelete?.name}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConnection} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

SavedConnections.propTypes = {
  onSelectConnection: PropTypes.func,
  connections: PropTypes.array,
  setConnections: PropTypes.func
};

SavedConnections.defaultProps = {
  onSelectConnection: () => {},
  connections: [],
  setConnections: null
};

export default SavedConnections;
