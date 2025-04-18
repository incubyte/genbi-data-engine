import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import RefreshIcon from '@mui/icons-material/Refresh';

/**
 * Error Boundary component to catch and display errors in the UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to the console
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You could also log the error to an error reporting service
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }

  handleReload = () => {
    window.location.reload();
  }

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '300px',
            p: 3
          }}
        >
          <Paper 
            elevation={3} 
            sx={{ 
              p: 4, 
              maxWidth: '600px', 
              textAlign: 'center',
              borderLeft: '4px solid #f44336'
            }}
          >
            <ErrorOutlineIcon color="error" sx={{ fontSize: 60, mb: 2 }} />
            
            <Typography variant="h5" color="error" gutterBottom>
              Something went wrong
            </Typography>
            
            <Typography variant="body1" color="textSecondary" paragraph>
              {this.state.error?.message || 'An unexpected error occurred'}
            </Typography>
            
            {process.env.NODE_ENV !== 'production' && this.state.errorInfo && (
              <Box sx={{ mt: 2, mb: 2, textAlign: 'left' }}>
                <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                  Error Details (Development Only):
                </Typography>
                <Box 
                  component="pre" 
                  sx={{ 
                    p: 2, 
                    bgcolor: '#f5f5f5', 
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '0.8rem',
                    maxHeight: '200px'
                  }}
                >
                  {this.state.error?.stack}
                </Box>
              </Box>
            )}
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center', gap: 2 }}>
              <Button 
                variant="outlined" 
                color="primary" 
                onClick={this.handleReset}
                startIcon={<RefreshIcon />}
              >
                Try Again
              </Button>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={this.handleReload}
              >
                Reload Page
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
