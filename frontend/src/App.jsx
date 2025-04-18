import React, { useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme, Box, AppBar, Toolbar, Typography, Container, Stepper, Step, StepLabel } from '@mui/material';
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

  // Handle database connection
  const handleConnectionEstablished = (connInfo) => {
    setConnectionInfo(connInfo);
    setActiveStep(1);
  };

  // Handle query results
  const handleQueryResults = (results) => {
    setQueryResults(results);
    setActiveStep(2);
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
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              GenBI - AI-Powered Business Intelligence
            </Typography>
          </Toolbar>
        </AppBar>

        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {renderStep()}
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;
