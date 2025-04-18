import React, { useState, useEffect } from 'react';
import { CssBaseline, ThemeProvider, createTheme, Box, AppBar, Toolbar, Typography, Container, Stepper, Step, StepLabel, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ErrorBoundary from './components/common/ErrorBoundary';
import LoadingIndicator from './components/common/LoadingIndicator';
import DatabaseConnection from './components/DatabaseConnection/DatabaseConnection';
import QueryInterface from './components/QueryInterface/QueryInterface';
import ResultsDisplay from './components/ResultsDisplay/ResultsDisplay';

// Create a theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196f3',
    },
    secondary: {
      main: '#f50057',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiPaper: {
      defaultProps: {
        elevation: 3,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});

// Steps for the application flow
const steps = ['Connect Database', 'Ask Questions', 'View Insights'];

function App() {
  const [activeStep, setActiveStep] = useState(0);
  const [connectionInfo, setConnectionInfo] = useState(null);
  const [queryResults, setQueryResults] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simulate initial loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle database connection
  const handleConnectionEstablished = (connInfo) => {
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setConnectionInfo(connInfo);
      setActiveStep(1);
      setLoading(false);
    }, 500);
  };

  // Handle query results
  const handleQueryResults = (results) => {
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setQueryResults(results);
      setActiveStep(2);
      setLoading(false);
    }, 500);
  };

  // Handle going back to previous step
  const handleBack = () => {
    setLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setActiveStep((prevStep) => Math.max(0, prevStep - 1));
      setLoading(false);
    }, 300);
  };

  // Render the current step
  const renderStep = () => {
    switch (activeStep) {
      case 0:
        return <DatabaseConnection onConnectionEstablished={handleConnectionEstablished} />;
      case 1:
        return <QueryInterface connectionInfo={connectionInfo} onQueryResults={handleQueryResults} />;
      case 2:
        return <ResultsDisplay results={queryResults} />;
      default:
        return <DatabaseConnection onConnectionEstablished={handleConnectionEstablished} />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                GenBI - AI-Powered Business Intelligence
              </Typography>
            </Toolbar>
          </AppBar>

          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              {activeStep > 0 && (
                <Button
                  startIcon={<ArrowBackIcon />}
                  onClick={handleBack}
                  sx={{ mr: 2 }}
                  disabled={loading}
                >
                  Back
                </Button>
              )}
              <Box sx={{ flexGrow: 1 }}>
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            </Box>

            <LoadingIndicator loading={loading} message="Loading...">
              {renderStep()}
            </LoadingIndicator>
          </Container>
        </Box>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;
