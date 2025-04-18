import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Divider,
  Grid,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  FormGroup,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  Snackbar
} from '@mui/material';
import {
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';

// TabPanel component for tab content
const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
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

const AccountSettings = () => {
  const [tabValue, setTabValue] = useState(0);
  const [settings, setSettings] = useState({
    displayName: 'User',
    email: 'user@example.com',
    darkMode: false,
    notifications: true,
    saveHistory: true,
    autoSaveQueries: false,
    dataRetention: 30
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle settings change
  const handleSettingsChange = (event) => {
    const { name, value, checked } = event.target;
    setSettings({
      ...settings,
      [name]: event.target.type === 'checkbox' ? checked : value
    });
  };

  // Handle save settings
  const handleSaveSettings = () => {
    // In a real app, this would save to an API
    console.log('Saving settings:', settings);
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'Settings saved successfully',
      severity: 'success'
    });
  };

  // Handle clear data
  const handleClearData = () => {
    // In a real app, this would clear user data
    console.log('Clearing user data');
    
    // Show success message
    setSnackbar({
      open: true,
      message: 'All user data has been cleared',
      severity: 'info'
    });
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  return (
    <Box>
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="settings tabs"
          variant="fullWidth"
        >
          <Tab label="General" id="settings-tab-0" aria-controls="settings-tabpanel-0" />
          <Tab label="Appearance" id="settings-tab-1" aria-controls="settings-tabpanel-1" />
          <Tab label="Data & Privacy" id="settings-tab-2" aria-controls="settings-tabpanel-2" />
        </Tabs>

        {/* General Settings */}
        <TabPanel value={tabValue} index={0}>
          <Typography variant="h6" gutterBottom>
            Profile Information
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Display Name"
                name="displayName"
                value={settings.displayName}
                onChange={handleSettingsChange}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={settings.email}
                onChange={handleSettingsChange}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
            >
              Save Changes
            </Button>
          </Box>
        </TabPanel>

        {/* Appearance Settings */}
        <TabPanel value={tabValue} index={1}>
          <Typography variant="h6" gutterBottom>
            Theme & Display
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.darkMode}
                  onChange={handleSettingsChange}
                  name="darkMode"
                  color="primary"
                />
              }
              label="Dark Mode"
            />
          </FormGroup>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Notifications
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.notifications}
                  onChange={handleSettingsChange}
                  name="notifications"
                  color="primary"
                />
              }
              label="Enable Notifications"
            />
          </FormGroup>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
            >
              Save Changes
            </Button>
          </Box>
        </TabPanel>

        {/* Data & Privacy Settings */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Data Storage
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.saveHistory}
                  onChange={handleSettingsChange}
                  name="saveHistory"
                  color="primary"
                />
              }
              label="Save Query History"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.autoSaveQueries}
                  onChange={handleSettingsChange}
                  name="autoSaveQueries"
                  color="primary"
                />
              }
              label="Auto-save Successful Queries"
            />
          </FormGroup>

          <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
            Data Retention
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Keep History For (Days)"
                name="dataRetention"
                type="number"
                value={settings.dataRetention}
                onChange={handleSettingsChange}
                InputProps={{ inputProps: { min: 1, max: 365 } }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          <Typography variant="h6" gutterBottom color="error">
            Danger Zone
          </Typography>
          <Alert severity="warning" sx={{ mb: 2 }}>
            The following actions cannot be undone. Please proceed with caution.
          </Alert>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Card variant="outlined" sx={{ bgcolor: 'error.light' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Clear All Data
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    This will delete all your saved connections, queries, and visualizations.
                  </Typography>
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={handleClearData}
                  >
                    Clear All Data
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Reset Settings
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    This will reset all settings to their default values.
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    startIcon={<RefreshIcon />}
                  >
                    Reset to Defaults
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>
      </Paper>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AccountSettings;
