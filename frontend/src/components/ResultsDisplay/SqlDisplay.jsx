import React, { useState } from 'react';
import { Box, Paper, Typography, Button, Snackbar, Alert } from '@mui/material';
import { ContentCopy as CopyIcon } from '@mui/icons-material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';

const SqlDisplay = ({ sqlQuery }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  // If no SQL query, show a message
  if (!sqlQuery) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1" color="textSecondary">
          No SQL query to display
        </Typography>
      </Box>
    );
  }

  // Handle copy to clipboard
  const handleCopy = () => {
    navigator.clipboard.writeText(sqlQuery);
    setCopySuccess(true);
  };

  // Handle close notification
  const handleCloseNotification = () => {
    setCopySuccess(false);
  };

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden' }}>
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 1, borderColor: 'divider' }}>
        <Typography variant="h6" component="h3">
          Generated SQL Query
        </Typography>
        <Button
          startIcon={<CopyIcon />}
          onClick={handleCopy}
          size="small"
        >
          Copy
        </Button>
      </Box>

      <Box sx={{ p: 0 }}>
        <SyntaxHighlighter
          language="sql"
          style={materialDark}
          customStyle={{ margin: 0, borderRadius: '0 0 4px 4px' }}
          wrapLongLines={true}
        >
          {sqlQuery}
        </SyntaxHighlighter>
      </Box>

      {/* Copy Success Notification */}
      <Snackbar
        open={copySuccess}
        autoHideDuration={3000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity="success"
          sx={{ width: '100%' }}
        >
          SQL query copied to clipboard!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default SqlDisplay;
