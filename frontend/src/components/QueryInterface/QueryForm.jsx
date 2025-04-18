import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Chip,
  Grid,
  CircularProgress,
  Tooltip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Send as SendIcon,
  Save as SaveIcon,
  Lightbulb as LightbulbIcon
} from '@mui/icons-material';
import { validateQueryForm } from '../../utils/validation';
import apiService from '../../services/api';

// Example queries to suggest to the user
const EXAMPLE_QUERIES = [
  'Show me monthly revenue trends broken down by product category',
  'List all customers who made a purchase in the last 30 days',
  'What are the top 5 best-selling products?',
  'Show me the average order value by customer segment',
  'Which products have the highest profit margin?'
];

const QueryForm = ({ onSubmitQuery, isProcessing, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [errors, setErrors] = useState({});
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [queryName, setQueryName] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Handle query input change
  const handleQueryChange = (e) => {
    setQuery(e.target.value);

    // Clear error if it exists
    if (errors.query) {
      setErrors({});
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate query
    const validation = validateQueryForm(query);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Submit query to parent component
    onSubmitQuery(query);
  };

  // Handle example query selection
  const handleExampleClick = (exampleQuery) => {
    setQuery(exampleQuery);
    setErrors({});
  };

  // Handle save query
  const handleSaveQuery = async () => {
    if (!queryName.trim()) {
      setNotification({
        open: true,
        message: 'Please enter a name for this query',
        severity: 'error'
      });
      return;
    }

    // Save query to backend
    try {
      const result = await apiService.saveQuery(query, queryName);

      if (result.success) {
        // Close dialog and show success notification
        setSaveDialogOpen(false);
        setQueryName('');
        setNotification({
          open: true,
          message: 'Query saved successfully',
          severity: 'success'
        });
      } else {
        setNotification({
          open: true,
          message: `Failed to save query: ${result.error}`,
          severity: 'error'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: `Error saving query: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Ask a Question About Your Data
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          id="query"
          name="query"
          label="Enter your question in plain English"
          multiline
          rows={3}
          value={query}
          onChange={handleQueryChange}
          error={!!errors.query}
          helperText={errors.query}
          placeholder="e.g., Show me monthly revenue trends broken down by product category"
          sx={{ mb: 3 }}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center' }}>
            <LightbulbIcon fontSize="small" sx={{ mr: 1 }} />
            Try one of these examples:
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Tooltip title="Save this query for later use">
              <IconButton
                color="primary"
                onClick={() => setSaveDialogOpen(true)}
                disabled={!query.trim() || isProcessing}
              >
                <SaveIcon />
              </IconButton>
            </Tooltip>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              endIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              disabled={isProcessing}
            >
              {isProcessing ? 'Generating Insights...' : 'Generate Insights'}
            </Button>
          </Box>
        </Box>

        <Grid container spacing={1}>
          {EXAMPLE_QUERIES.map((exampleQuery, index) => (
            <Grid item key={index}>
              <Chip
                label={exampleQuery}
                onClick={() => handleExampleClick(exampleQuery)}
                clickable
                color="primary"
                variant="outlined"
                sx={{ mb: 1 }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Save Query Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Query</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="query-name"
            label="Query Name"
            type="text"
            fullWidth
            value={queryName}
            onChange={(e) => setQueryName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveQuery} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default QueryForm;
