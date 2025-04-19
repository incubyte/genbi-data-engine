import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Paper,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  BarChart as BarChartIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import DataTable from './DataTable';
import SqlDisplay from './SqlDisplay';
import ExportOptions from './ExportOptions';
import SmartChart from '../Visualizations/SmartChart';
import apiService from '../../services/api';

// TabPanel component for tab content
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`results-tabpanel-${index}`}
      aria-labelledby={`results-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
};

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

const ResultsDisplay = ({ results: propResults }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [tabValue, setTabValue] = useState(0);
  const [results, setResults] = useState(propResults);
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [visualizationName, setVisualizationName] = useState('');
  const [visualizationDescription, setVisualizationDescription] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [currentChartType, setCurrentChartType] = useState('');
  const [currentChartConfig, setCurrentChartConfig] = useState({});
  // We don't need loading state as we're using route state
  // const [loading, setLoading] = useState(false);

  // Check for results from route state
  useEffect(() => {
    const locationState = location.state || {};
    if (locationState.results && !results) {
      setResults(locationState.results);
    }
  }, [location, results]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle back to query
  const handleBackToQuery = () => {
    navigate('/query');
  };

  // Handle chart type and config changes
  const handleChartChange = (chartType, chartConfig) => {
    setCurrentChartType(chartType);
    setCurrentChartConfig(chartConfig);
  };

  // Handle save dialog open
  const handleSaveDialogOpen = () => {
    setSaveDialogOpen(true);
    // Set default name based on query
    if (!visualizationName && results) {
      const queryText = results.userQuery || '';
      setVisualizationName(queryText.length > 30 ? `${queryText.substring(0, 30)}...` : queryText);
    }
  };

  // Handle save dialog close
  const handleSaveDialogClose = () => {
    setSaveDialogOpen(false);
  };

  // Handle notification close
  const handleNotificationClose = () => {
    setNotification({ ...notification, open: false });
  };

  // Handle save visualization
  const handleSaveVisualization = async () => {
    if (!visualizationName.trim()) {
      setNotification({
        open: true,
        message: 'Please enter a name for this visualization',
        severity: 'error'
      });
      return;
    }

    try {
      // Prepare visualization data
      const visualizationData = {
        name: visualizationName,
        description: visualizationDescription,
        query: results.userQuery || '',
        sql_query: results.sqlQuery,
        results: results.results,
        chart_type: currentChartType || results?.visualization?.recommendedChartTypes?.[0] || 'bar',
        visualization_config: {
          ...currentChartConfig,
          xAxis: results?.visualization?.xAxis,
          yAxis: results?.visualization?.yAxis,
          reasoning: results?.visualization?.reasoning
        }
      };

      // Save visualization
      const result = await apiService.saveVisualization(visualizationData);

      if (result.success) {
        // Close dialog and show success notification
        handleSaveDialogClose();
        setNotification({
          open: true,
          message: 'Visualization saved successfully',
          severity: 'success'
        });
      } else {
        setNotification({
          open: true,
          message: `Failed to save visualization: ${result.error}`,
          severity: 'error'
        });
      }
    } catch (error) {
      setNotification({
        open: true,
        message: `Error saving visualization: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // We don't need loading state as we're using route state
  // if (loading) {
  //   return (
  //     <Container maxWidth="md">
  //       <Box sx={{ display: 'flex', justifyContent: 'center', my: 8 }}>
  //         <CircularProgress />
  //       </Box>
  //     </Container>
  //   );
  // }

  // If no results, show a message
  if (!results) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h5" component="h2" gutterBottom>
            No Results Yet
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            Connect to a database and run a query to see results here.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToQuery}
          >
            Go to Query Interface
          </Button>
        </Box>
      </Container>
    );
  }

  const { results: data, sqlQuery, databaseType } = results;

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToQuery}
            sx={{ mr: 3, px: 2, py: 1 }}
          >
            Back to Query
          </Button>
          <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
            Query Results
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Button
            variant="contained"
            color="primary"
            startIcon={<SaveIcon />}
            onClick={handleSaveDialogOpen}
            sx={{ px: 2, py: 1 }}
          >
            Save Visualization
          </Button>
        </Box>

        <Paper elevation={3} sx={{ boxShadow: 3, borderRadius: 2, overflow: 'hidden' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="results tabs"
              variant="fullWidth"
              sx={{
                bgcolor: 'background.dark',
                '& .MuiTab-root': {
                  py: 2,
                  fontWeight: 600,
                  fontSize: '1rem'
                },
                '& .Mui-selected': {
                  color: 'primary.main',
                }
              }}
            >
              <Tab label="Results" id="results-tab-0" aria-controls="results-tabpanel-0" />
              <Tab label="Visualizations" id="results-tab-1" aria-controls="results-tabpanel-1" icon={<BarChartIcon fontSize="small" />} iconPosition="start" />
              <Tab label="Generated SQL" id="results-tab-2" aria-controls="results-tabpanel-2" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 500, fontSize: '1.1rem' }}>
                  Database Type: <strong>{databaseType}</strong>
                </Typography>

                <ExportOptions data={data} query={sqlQuery} />
              </Box>

              <DataTable data={data} />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ mb: 3 }}>
              <SmartChart
                data={data}
                initialChartType={results?.visualization?.recommendedChartTypes?.[0]}
                recommendedConfig={{
                  xAxis: results?.visualization?.xAxis,
                  yAxis: results?.visualization?.yAxis,
                  labels: results?.visualization?.xAxis,
                  values: results?.visualization?.yAxis,
                  title: `${results?.visualization?.yAxis || ''} by ${results?.visualization?.xAxis || ''}`
                }}
                recommendationReason={results?.visualization?.reasoning}
                onChartChange={handleChartChange}
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <SqlDisplay sqlQuery={sqlQuery} />
          </TabPanel>
        </Paper>
      </Box>

      {/* Save Visualization Dialog */}
      <Dialog open={saveDialogOpen} onClose={handleSaveDialogClose} maxWidth="sm" fullWidth>
        <DialogTitle>Save Visualization</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Save this visualization to access it later without re-running the query.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Visualization Name"
            type="text"
            fullWidth
            variant="outlined"
            value={visualizationName}
            onChange={(e) => setVisualizationName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            id="description"
            label="Description (optional)"
            type="text"
            fullWidth
            variant="outlined"
            multiline
            rows={3}
            value={visualizationDescription}
            onChange={(e) => setVisualizationDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSaveDialogClose}>Cancel</Button>
          <Button onClick={handleSaveVisualization} variant="contained" color="primary">
            Save
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
        <Alert
          onClose={handleNotificationClose}
          severity={notification.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

ResultsDisplay.propTypes = {
  results: PropTypes.shape({
    results: PropTypes.array,
    sqlQuery: PropTypes.string,
    databaseType: PropTypes.string,
    userQuery: PropTypes.string,
    visualization: PropTypes.object
  })
};

ResultsDisplay.defaultProps = {
  results: null
};

export default ResultsDisplay;
