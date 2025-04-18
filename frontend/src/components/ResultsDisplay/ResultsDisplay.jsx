import React, { useState, useEffect } from 'react';
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
import { ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import DataTable from './DataTable';
import SqlDisplay from './SqlDisplay';
import ExportOptions from './ExportOptions';

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
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={handleBackToQuery}
            sx={{ mr: 2 }}
          >
            Back to Query
          </Button>
          <Typography variant="h4" component="h1" gutterBottom>
            Query Results
          </Typography>
        </Box>

        <Paper elevation={3}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              aria-label="results tabs"
              variant="fullWidth"
            >
              <Tab label="Results" id="results-tab-0" aria-controls="results-tabpanel-0" />
              <Tab label="Generated SQL" id="results-tab-1" aria-controls="results-tabpanel-1" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Database Type: <strong>{databaseType}</strong>
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <ExportOptions data={data} query={sqlQuery} />
              </Box>

              <DataTable data={data} />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <SqlDisplay sqlQuery={sqlQuery} />
          </TabPanel>
        </Paper>
      </Box>
    </Container>
  );
};

export default ResultsDisplay;
