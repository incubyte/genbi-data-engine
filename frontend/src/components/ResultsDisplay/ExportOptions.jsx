import React, { useState } from 'react';
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Snackbar,
  Alert
} from '@mui/material';
import {
  FileDownload as DownloadIcon,
  Description as CsvIcon,
  PictureAsPdf as PdfIcon
} from '@mui/icons-material';

const ExportOptions = ({ data }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Handle menu open
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleClose = () => {
    setAnchorEl(null);
  };

  // Export data to CSV
  const exportToCsv = () => {
    try {
      if (!data || data.length === 0) {
        throw new Error('No data to export');
      }

      // Get column headers
      const headers = Object.keys(data[0]);

      // Create CSV content
      const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
          headers.map(header => {
            const value = row[header];
            // Handle null, undefined, and quotes in strings
            if (value === null || value === undefined) {
              return '';
            }
            if (typeof value === 'string') {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          }).join(',')
        )
      ].join('\\n');

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `query_results_${new Date().toISOString().slice(0, 10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setNotification({
        open: true,
        message: 'CSV file downloaded successfully',
        severity: 'success'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to export CSV: ${error.message}`,
        severity: 'error'
      });
    }

    handleClose();
  };

  // Export data to PDF (simplified implementation)
  const exportToPdf = () => {
    try {
      setNotification({
        open: true,
        message: 'PDF export functionality will be implemented in a future update',
        severity: 'info'
      });
    } catch (error) {
      setNotification({
        open: true,
        message: `Failed to export PDF: ${error.message}`,
        severity: 'error'
      });
    }

    handleClose();
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<DownloadIcon />}
        onClick={handleClick}
        disabled={!data || data.length === 0}
      >
        Export
      </Button>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={exportToCsv}>
          <ListItemIcon>
            <CsvIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as CSV</ListItemText>
        </MenuItem>
        <MenuItem onClick={exportToPdf}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as PDF</ListItemText>
        </MenuItem>
      </Menu>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={handleCloseNotification}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default ExportOptions;
