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
  Send as SendIcon
} from '@mui/icons-material';
import { getSavedQueries, deleteQuery } from '../../utils/storage';

const SavedQueries = ({ onSelectQuery }) => {
  const [queries, setQueries] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [queryToDelete, setQueryToDelete] = useState(null);
  const [expanded, setExpanded] = useState(true);

  // Load saved queries on component mount
  useEffect(() => {
    loadSavedQueries();
  }, []);

  // Load saved queries from local storage
  const loadSavedQueries = () => {
    const savedQueries = getSavedQueries();
    setQueries(savedQueries);
  };

  // Handle query selection
  const handleSelectQuery = (query) => {
    onSelectQuery(query.query);
  };

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (e, query) => {
    e.stopPropagation(); // Prevent triggering the list item click
    setQueryToDelete(query);
    setDeleteDialogOpen(true);
  };

  // Delete a saved query
  const handleDeleteQuery = () => {
    if (queryToDelete) {
      deleteQuery(queryToDelete.id);
      loadSavedQueries();
      setDeleteDialogOpen(false);
      setQueryToDelete(null);
    }
  };

  // Toggle expansion
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h3">
          Saved Queries
        </Typography>
        <IconButton onClick={toggleExpanded}>
          {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>
      
      <Collapse in={expanded}>
        {queries.length === 0 ? (
          <Typography variant="body2" color="textSecondary">
            No saved queries yet. Save a query to see it here.
          </Typography>
        ) : (
          <List>
            {queries.map((query, index) => (
              <React.Fragment key={query.id}>
                {index > 0 && <Divider />}
                <ListItem 
                  button 
                  onClick={() => handleSelectQuery(query)}
                  sx={{ 
                    '&:hover': { 
                      backgroundColor: 'rgba(0, 0, 0, 0.04)' 
                    } 
                  }}
                >
                  <ListItemText
                    primary={query.name}
                    secondary={
                      <>
                        <Typography component="span" variant="body2" color="textPrimary">
                          {query.query.length > 60 ? `${query.query.substring(0, 60)}...` : query.query}
                        </Typography>
                        <Typography component="span" variant="body2" color="textSecondary" sx={{ display: 'block' }}>
                          Saved on {formatDate(query.createdAt)}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <Tooltip title="Run this query">
                      <IconButton 
                        edge="end" 
                        onClick={() => handleSelectQuery(query)}
                        color="primary"
                      >
                        <SendIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete query">
                      <IconButton 
                        edge="end" 
                        onClick={(e) => handleOpenDeleteDialog(e, query)}
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
        <DialogTitle>Delete Query</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete the query "{queryToDelete?.name}"? 
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteQuery} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default SavedQueries;
