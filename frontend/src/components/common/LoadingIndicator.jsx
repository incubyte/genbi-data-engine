import React from 'react';
import { Box, CircularProgress, Typography, Paper } from '@mui/material';
import PropTypes from 'prop-types';

/**
 * Loading indicator component with optional message
 * @param {Object} props - Component props
 * @param {boolean} props.loading - Whether the component is in loading state
 * @param {string} props.message - Loading message to display
 * @param {React.ReactNode} props.children - Child components to render when not loading
 * @param {boolean} props.fullPage - Whether to display as a full page overlay
 * @param {number} props.size - Size of the loading spinner
 * @param {string} props.color - Color of the loading spinner
 */
const LoadingIndicator = ({ 
  loading, 
  message = 'Loading...', 
  children, 
  fullPage = false,
  size = 40,
  color = 'primary'
}) => {
  if (!loading) {
    return children;
  }

  const loadingContent = (
    <>
      <CircularProgress size={size} color={color} thickness={4} />
      {message && (
        <Typography 
          variant="body1" 
          color="textSecondary" 
          sx={{ mt: 2, textAlign: 'center' }}
        >
          {message}
        </Typography>
      )}
    </>
  );

  if (fullPage) {
    return (
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 9999,
        }}
      >
        {loadingContent}
      </Box>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        minHeight: '200px',
        width: '100%',
        backgroundColor: 'transparent',
      }}
    >
      {loadingContent}
    </Paper>
  );
};

LoadingIndicator.propTypes = {
  loading: PropTypes.bool.isRequired,
  message: PropTypes.string,
  children: PropTypes.node,
  fullPage: PropTypes.bool,
  size: PropTypes.number,
  color: PropTypes.string
};

export default LoadingIndicator;
