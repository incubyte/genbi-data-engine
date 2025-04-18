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
  Button
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  BarChart as BarChartIcon
} from '@mui/icons-material';
import DataTable from './DataTable';
import SqlDisplay from './SqlDisplay';
import ExportOptions from './ExportOptions';
import SmartChart from '../Visualizations/SmartChart';

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
              />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <SqlDisplay sqlQuery={sqlQuery} />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

ResultsDisplay.propTypes = {
  results: PropTypes.shape({
    results: PropTypes.array,
    sqlQuery: PropTypes.string,
    databaseType: PropTypes.string
  })
};

ResultsDisplay.defaultProps = {
  results: null
};

export default ResultsDisplay;
