import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
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
import { getSavedConnections, deleteConnection } from '../../utils/storage';

const SavedConnections = ({ onSelectConnection }) => {
  const [connections, setConnections] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [connectionToDelete, setConnectionToDelete] = useState(null);
  const [expanded, setExpanded] = useState(true);

  // Load saved connections on component mount
  useEffect(() => {
    loadSavedConnections();
  }, []);

  // Load saved connections from local storage
  const loadSavedConnections = () => {
    const savedConnections = getSavedConnections();
    setConnections(savedConnections);
  };

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
  const handleDeleteConnection = () => {
    if (connectionToDelete) {
      deleteConnection(connectionToDelete.id);
      loadSavedConnections();
      setDeleteDialogOpen(false);
      setConnectionToDelete(null);
    }
  };

  // Format connection details for display
  const formatConnectionDetails = (connection) => {
    if (connection.type === 'sqlite') {
      return `SQLite: ${connection.connection}`;
    } else if (connection.type === 'postgres') {
      const conn = connection.connection;
      if (typeof conn === 'string') {
        return `PostgreSQL: ${conn}`;
      } else {
        return `PostgreSQL: ${conn.host}:${conn.port}/${conn.database}`;
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
                    secondary={formatConnectionDetails(connection.connection)}
                  />
                  <ListItemSecondaryAction>
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
                  </ListItemSecondaryAction>
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

export default SavedConnections;
