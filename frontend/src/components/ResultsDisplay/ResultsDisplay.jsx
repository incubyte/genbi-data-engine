import React, { useState } from 'react';
import {
  Box,
  Typography,
  Container,
  Paper,
  Tabs,
  Tab,
  Divider,
  Alert
} from '@mui/material';
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

const ResultsDisplay = ({ results }) => {
  const [tabValue, setTabValue] = useState(0);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // If no results, show a message
  if (!results) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <Typography variant="h5" component="h2" gutterBottom>
            No Results Yet
          </Typography>
          <Typography variant="body1">
            Connect to a database and run a query to see results here.
          </Typography>
        </Box>
      </Container>
    );
  }

  const { results: data, sqlQuery, databaseType } = results;

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Query Results
        </Typography>
        
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
