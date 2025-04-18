import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  DialogActions
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

// Sample visualization data (in a real app, this would come from an API)
const sampleVisualizations = [
  {
    id: 1,
    title: 'Monthly Revenue by Category',
    description: 'Bar chart showing monthly revenue trends across product categories',
    type: 'bar',
    createdAt: '2023-10-15T14:30:00Z',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Bar+Chart'
  },
  {
    id: 2,
    title: 'Customer Segments',
    description: 'Pie chart showing distribution of customers by segment',
    type: 'pie',
    createdAt: '2023-10-10T09:15:00Z',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Pie+Chart'
  },
  {
    id: 3,
    title: 'Sales Growth Trend',
    description: 'Line chart showing sales growth over the past 12 months',
    type: 'line',
    createdAt: '2023-09-28T16:45:00Z',
    thumbnailUrl: 'https://via.placeholder.com/300x200?text=Line+Chart'
  }
];

const SavedVisualizations = () => {
  const navigate = useNavigate();
  const [visualizations, setVisualizations] = useState(sampleVisualizations);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedVisualization, setSelectedVisualization] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
  const handleDeleteVisualization = () => {
    if (selectedVisualization) {
      // Filter out the deleted visualization
      setVisualizations(visualizations.filter(v => v.id !== selectedVisualization.id));
    }
    handleDeleteDialogClose();
  };

  // Handle create new visualization
  const handleCreateVisualization = () => {
    navigate('/query');
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

      {/* Empty state */}
      {visualizations.length === 0 && (
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
                <Button size="small" color="primary">
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
    </Box>
  );
};

export default SavedVisualizations;
