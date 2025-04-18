import React, { useState } from 'react';
import PropTypes from 'prop-types';
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
  DialogActions
} from '@mui/material';
import FeedbackMessage from '../common/FeedbackMessage';

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

const QueryForm = ({ onSubmitQuery, isProcessing, initialQuery = '', disabled = false }) => {
  const [query, setQuery] = useState(initialQuery);
  const [errors, setErrors] = useState({});
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [queryName, setQueryName] = useState('');
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  // We use isProcessing from props instead of this local state
  // const [submitting, setSubmitting] = useState(false);

  // Handle query input change
  const handleQueryChange = (e) => {
    setQuery(e.target.value);

    // Clear error if it exists
    if (errors.query) {
      setErrors({});
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate query
    const validation = validateQueryForm(query);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Submit query to parent component with loading state
    // Note: isProcessing is handled by the parent component
    try {
      await onSubmitQuery(query);
    } catch (error) {
      setNotification({
        open: true,
        message: `Error processing query: ${error.message || 'Unknown error'}`,
        severity: 'error'
      });
    }
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
    <Paper elevation={3} sx={{ p: 4, mb: 4, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
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
          helperText={errors.query || (disabled ? 'Connect to a database first to run queries' : '')}
          placeholder="e.g., Show me monthly revenue trends broken down by product category"
          sx={{
            mb: 3,
            '& .MuiOutlinedInput-root': {
              borderRadius: 1.5,
              fontSize: '1.1rem',
              '& fieldset': {
                borderWidth: 2,
              },
              '&:hover fieldset': {
                borderColor: 'primary.main',
              },
            },
            '& .MuiInputLabel-root': {
              fontSize: '1.1rem',
            }
          }}
          disabled={disabled || isProcessing}
        />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="body1" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', fontWeight: 500 }}>
            <LightbulbIcon fontSize="small" sx={{ mr: 1, color: 'warning.main' }} />
            Try one of these examples:
          </Typography>

          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Tooltip title="Save this query for later use">
              <span> {/* Wrapper to handle disabled state properly */}
                <IconButton
                  color="primary"
                  onClick={() => setSaveDialogOpen(true)}
                  disabled={!query.trim() || isProcessing}
                  sx={{
                    bgcolor: !query.trim() || isProcessing ? 'background.dark' : 'primary.light',
                    color: !query.trim() || isProcessing ? 'text.disabled' : 'white',
                    '&:hover': { bgcolor: 'primary.main' }
                  }}
                >
                  <SaveIcon />
                </IconButton>
              </span>
            </Tooltip>

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              endIcon={isProcessing ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
              disabled={isProcessing || disabled || !query.trim()}
              sx={{
                px: 3,
                py: 1,
                fontWeight: 'bold',
                boxShadow: 2,
                '&:hover': { boxShadow: 3 }
              }}
            >
              {isProcessing ? 'Generating Insights...' : 'Generate Insights'}
            </Button>
          </Box>
        </Box>

        <Box sx={{ p: 2, bgcolor: 'background.dark', borderRadius: 2, mb: 2 }}>
          <Grid container spacing={1.5}>
            {EXAMPLE_QUERIES.map((exampleQuery) => (
              <Grid item key={exampleQuery}>
                <Chip
                  label={exampleQuery}
                  onClick={() => handleExampleClick(exampleQuery)}
                  clickable
                  color="primary"
                  variant="outlined"
                  sx={{
                    mb: 1,
                    py: 1.5,
                    px: 1,
                    borderRadius: 2,
                    fontWeight: 500,
                    borderWidth: 2,
                    '&:hover': { bgcolor: 'primary.light', color: 'white', borderColor: 'primary.light' }
                  }}
                  disabled={disabled || isProcessing}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
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

      {/* Notification Feedback Message */}
      <FeedbackMessage
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
        autoHideDuration={6000}
        position="bottom"
      />
    </Paper>
  );
};

QueryForm.propTypes = {
  onSubmitQuery: PropTypes.func.isRequired,
  isProcessing: PropTypes.bool,
  initialQuery: PropTypes.string,
  disabled: PropTypes.bool
};

QueryForm.defaultProps = {
  isProcessing: false,
  initialQuery: '',
  disabled: false
};

export default QueryForm;
