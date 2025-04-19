import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '../../services/api';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Alert,
  AlertTitle,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert as MuiAlert,
  CircularProgress
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Share as ShareIcon,
  Download as DownloadIcon,
  Add as AddIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon,
  TableChart as TableChartIcon
} from '@mui/icons-material';

// Default thumbnail URLs for different chart types
const defaultThumbnails = {
  bar: 'https://via.placeholder.com/300x200?text=Bar+Chart',
  pie: 'https://via.placeholder.com/300x200?text=Pie+Chart',
  line: 'https://via.placeholder.com/300x200?text=Line+Chart',
  default: 'https://via.placeholder.com/300x200?text=Visualization'
};

const SavedVisualizations = () => {
  const navigate = useNavigate();
  const [visualizations, setVisualizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedVisualization, setSelectedVisualization] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  // Fetch saved visualizations on component mount
  useEffect(() => {
    const fetchVisualizations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch saved queries that have visualization data
        const result = await apiService.getSavedQueries();

        if (result.success) {
          // Filter queries that have visualization data
          const visualizationQueries = result.data.filter(query =>
            query.chart_type && query.visualization_config
          );

          // Map to visualization format
          const mappedVisualizations = visualizationQueries.map(query => ({
            id: query.id,
            title: query.name,
            description: query.description || `Visualization for: ${query.query}`,
            type: query.chart_type,
            createdAt: query.created_at,
            query: query.query,
            sql_query: query.sql_query,
            results: query.results,
            visualization_config: query.visualization_config,
            thumbnailUrl: defaultThumbnails[query.chart_type] || defaultThumbnails.default
          }));

          setVisualizations(mappedVisualizations);
        } else {
          setError('Failed to fetch visualizations');
        }
      } catch (err) {
        setError(`Error fetching visualizations: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchVisualizations();
  }, []);

  // Handle menu open
  const handleMenuOpen = (event, visualization) => {
    setMenuAnchorEl(event.currentTarget);
    setSelectedVisualization(visualization);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle delete dialog open
  const handleDeleteDialogOpen = () => {
    handleMenuClose();
    setDeleteDialogOpen(true);
  };

  // Handle delete dialog close
  const handleDeleteDialogClose = () => {
    setDeleteDialogOpen(false);
  };

  // Handle delete visualization
  const handleDeleteVisualization = async () => {
    if (selectedVisualization) {
      try {
        // Delete the visualization using the API
        const result = await apiService.deleteQuery(selectedVisualization.id);

        if (result.success) {
          // Filter out the deleted visualization
          setVisualizations(visualizations.filter(v => v.id !== selectedVisualization.id));
          setNotification({
            open: true,
            message: 'Visualization deleted successfully',
            severity: 'success'
          });
        } else {
          setNotification({
            open: true,
            message: `Failed to delete visualization: ${result.error}`,
            severity: 'error'
          });
        }
      } catch (error) {
        setNotification({
          open: true,
          message: `Error deleting visualization: ${error.message}`,
          severity: 'error'
        });
      }
    }
    handleDeleteDialogClose();
  };

  // Handle create new visualization
  const handleCreateVisualization = () => {
    navigate('/query');
  };

  // Handle view visualization
  const handleViewVisualization = (visualization) => {
    // Navigate to results page with the saved visualization data
    navigate('/results', {
      state: {
        results: {
          results: visualization.results,
          sqlQuery: visualization.sql_query,
          userQuery: visualization.query,
          databaseType: 'saved', // Indicate this is a saved visualization
          visualization: visualization.visualization_config
        }
      }
    });
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  // Get icon based on chart type
  const getChartIcon = (type) => {
    switch (type) {
      case 'bar':
        return <BarChartIcon />;
      case 'pie':
        return <PieChartIcon />;
      case 'line':
        return <LineChartIcon />;
      default:
        return <TableChartIcon />;
    }
  };

  return (
    <Box>
      {/* Header with actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5">Saved Visualizations</Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateVisualization}
        >
          Create Visualization
        </Button>
      </Box>

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Error state */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {/* Empty state */}
      {!loading && !error && visualizations.length === 0 && (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="info" sx={{ mb: 2 }}>
            <AlertTitle>No Visualizations Yet</AlertTitle>
            Create your first visualization by running a query and saving the results.
          </Alert>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleCreateVisualization}
          >
            Create Your First Visualization
          </Button>
        </Paper>
      )}

      {/* Visualizations grid */}
      {!loading && !error && visualizations.length > 0 && (
        <Grid container spacing={3}>
        {visualizations.map((visualization) => (
          <Grid item xs={12} sm={6} md={4} key={visualization.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardMedia
                component="img"
                height="160"
                image={visualization.thumbnailUrl}
                alt={visualization.title}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ mr: 1, color: 'primary.main' }}>
                    {getChartIcon(visualization.type)}
                  </Box>
                  <Typography variant="h6" component="div" noWrap>
                    {visualization.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {visualization.description}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  Created: {new Date(visualization.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>
              <Divider />
              <CardActions sx={{ justifyContent: 'space-between' }}>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => handleViewVisualization(visualization)}
                >
                  View
                </Button>
                <IconButton
                  size="small"
                  onClick={(e) => handleMenuOpen(e, visualization)}
                >
                  <MoreIcon />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
      )}

      {/* Visualization actions menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <ShareIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Share</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <DownloadIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteDialogOpen}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: 'error.main' }}>Delete</ListItemText>
        </MenuItem>
      </Menu>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteDialogClose}
      >
        <DialogTitle>Delete Visualization</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{selectedVisualization?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteDialogClose}>Cancel</Button>
          <Button onClick={handleDeleteVisualization} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleNotificationClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <MuiAlert
          onClose={handleNotificationClose}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </MuiAlert>
      </Snackbar>
    </Box>
  );
};

export default SavedVisualizations;
