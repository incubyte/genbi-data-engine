import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Paper,
  Grid,
  Alert,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';
import { validateConnectionForm } from '../../utils/validation';
import { saveConnection } from '../../utils/storage';
import apiService from '../../services/api';

const ConnectionForm = ({ onConnectionEstablished }) => {
  // State for form fields
  const [databaseType, setDatabaseType] = useState('sqlite');
  const [formData, setFormData] = useState({
    connection: '', // For SQLite
    host: 'localhost', // For PostgreSQL/MySQL
    port: '5432', // For PostgreSQL (default 5432) / MySQL (default 3306)
    database: '', // For PostgreSQL/MySQL
    user: '', // For PostgreSQL/MySQL
    password: '' // For PostgreSQL/MySQL
  });

  // State for form validation
  const [errors, setErrors] = useState({});

  // State for testing connection
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  // State for save connection dialog
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [connectionName, setConnectionName] = useState('');

  // State for notifications
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field if it exists
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle database type change
  const handleDatabaseTypeChange = (e) => {
    const newType = e.target.value;
    setDatabaseType(newType);

    // Update port based on database type
    if (newType === 'mysql' && formData.port === '5432') {
      setFormData(prev => ({
        ...prev,
        port: '3306' // Default MySQL port
      }));
    } else if (newType === 'postgres' && formData.port === '3306') {
      setFormData(prev => ({
        ...prev,
        port: '5432' // Default PostgreSQL port
      }));
    }

    setErrors({});
  };

  // Test the database connection
  const handleTestConnection = async () => {
    // Validate form
    const validation = validateConnectionForm(formData, databaseType);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Prepare connection info based on database type
      const connectionInfo = prepareConnectionInfo();

      // Test connection
      const result = await apiService.testConnection(connectionInfo);

      setTestResult({
        success: result.success,
        message: result.success
          ? 'Connection successful!'
          : `Connection failed: ${result.error}`
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `Connection failed: ${error.message}`
      });
    } finally {
      setTesting(false);
    }
  };

  // Prepare connection info based on database type
  const prepareConnectionInfo = () => {
    if (databaseType === 'sqlite') {
      return {
        type: 'sqlite',
        connection: formData.connection
      };
    } else if (databaseType === 'postgres' || databaseType === 'mysql') {
      return {
        type: databaseType,
        connection: {
          host: formData.host,
          port: parseInt(formData.port),
          database: formData.database,
          user: formData.user,
          password: formData.password
        }
      };
    }
  };

  // Handle save connection
  const handleSaveConnection = () => {
    if (!connectionName.trim()) {
      setNotification({
        open: true,
        message: 'Please enter a name for this connection',
        severity: 'error'
      });
      return;
    }

    // Save connection to local storage
    const connectionInfo = prepareConnectionInfo();
    saveConnection(connectionInfo, connectionName);

    // Close dialog and show success notification
    setSaveDialogOpen(false);
    setConnectionName('');
    setNotification({
      open: true,
      message: 'Connection saved successfully',
      severity: 'success'
    });
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateConnectionForm(formData, databaseType);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    // Prepare connection info
    const connectionInfo = prepareConnectionInfo();

    // Call the parent component's callback
    onConnectionEstablished(connectionInfo);
  };

  // Close notification
  const handleCloseNotification = () => {
    setNotification(prev => ({
      ...prev,
      open: false
    }));
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Database Connection
      </Typography>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <Grid container spacing={3}>
          {/* Database Type Selector */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="database-type-label">Database Type</InputLabel>
              <Select
                labelId="database-type-label"
                id="database-type"
                value={databaseType}
                label="Database Type"
                onChange={handleDatabaseTypeChange}
              >
                <MenuItem value="sqlite">SQLite</MenuItem>
                <MenuItem value="postgres">PostgreSQL</MenuItem>
                <MenuItem value="mysql">MySQL</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Dynamic Form Fields Based on Database Type */}
          {databaseType === 'sqlite' ? (
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="connection"
                name="connection"
                label="Database File Path"
                value={formData.connection}
                onChange={handleChange}
                error={!!errors.connection}
                helperText={errors.connection || 'Path to your SQLite database file'}
                required
              />
            </Grid>
          ) : (
            <>
              <Grid item xs={12} md={8}>
                <TextField
                  fullWidth
                  id="host"
                  name="host"
                  label="Host"
                  value={formData.host}
                  onChange={handleChange}
                  error={!!errors.host}
                  helperText={errors.host}
                  required
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  id="port"
                  name="port"
                  label="Port"
                  value={formData.port}
                  onChange={handleChange}
                  error={!!errors.port}
                  helperText={errors.port}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="database"
                  name="database"
                  label="Database Name"
                  value={formData.database}
                  onChange={handleChange}
                  error={!!errors.database}
                  helperText={errors.database}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="user"
                  name="user"
                  label="Username"
                  value={formData.user}
                  onChange={handleChange}
                  error={!!errors.user}
                  helperText={errors.user}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password}
                  helperText={errors.password}
                />
              </Grid>
            </>
          )}

          {/* Test Result Alert */}
          {testResult && (
            <Grid item xs={12}>
              <Alert severity={testResult.success ? 'success' : 'error'}>
                {testResult.message}
              </Alert>
            </Grid>
          )}

          {/* Action Buttons */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                onClick={handleTestConnection}
                disabled={testing}
                startIcon={testing && <CircularProgress size={20} />}
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>

              <Button
                variant="outlined"
                onClick={() => setSaveDialogOpen(true)}
              >
                Save Connection
              </Button>

              <Button
                type="submit"
                variant="contained"
                color="primary"
              >
                Connect
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Save Connection Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)}>
        <DialogTitle>Save Connection</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            id="connection-name"
            label="Connection Name"
            type="text"
            fullWidth
            value={connectionName}
            onChange={(e) => setConnectionName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveConnection} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

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
    </Paper>
  );
};

export default ConnectionForm;
