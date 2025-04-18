import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  CircularProgress,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Storage as DatabaseIcon,
  QueryStats as QueryIcon,
  BarChart as ChartIcon,
  Lightbulb as TipIcon,
  Add as AddIcon
} from '@mui/icons-material';
import apiService from '../../services/api';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    connections: 0,
    queries: 0,
    visualizations: 0
  });
  const [recentConnections, setRecentConnections] = useState([]);
  const [recentQueries, setRecentQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // Load connections
        const connectionsResult = await apiService.getSavedConnections();
        if (connectionsResult.success) {
          setRecentConnections(connectionsResult.data.slice(0, 3));
          setStats(prev => ({ ...prev, connections: connectionsResult.data.length }));
        }
        
        // Load queries
        const queriesResult = await apiService.getSavedQueries();
        if (queriesResult.success) {
          setRecentQueries(queriesResult.data.slice(0, 3));
          setStats(prev => ({ ...prev, queries: queriesResult.data.length }));
        }
        
        // For now, visualizations are mocked
        setStats(prev => ({ ...prev, visualizations: 0 }));
        
      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    loadDashboardData();
  }, []);

  // Navigate to create new connection
  const handleNewConnection = () => {
    navigate('/connections');
  };

  // Navigate to query interface
  const handleNewQuery = () => {
    navigate('/query');
  };

  // Show welcome message for new users
  const renderWelcomeMessage = () => {
    if (stats.connections === 0) {
      return (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={handleNewConnection}
            >
              Get Started
            </Button>
          }
        >
          <AlertTitle>Welcome to GenBI!</AlertTitle>
          Create your first database connection to start generating insights from your data.
        </Alert>
      );
    }
    return null;
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert severity="error" sx={{ mt: 2 }}>
        <AlertTitle>Error</AlertTitle>
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      {renderWelcomeMessage()}
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <DatabaseIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Box>
                <Typography variant="h4" color="primary.main">
                  {stats.connections}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Database Connections
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <QueryIcon sx={{ fontSize: 40, color: 'secondary.main', mr: 2 }} />
              <Box>
                <Typography variant="h4" color="secondary.main">
                  {stats.queries}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Saved Queries
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <ChartIcon sx={{ fontSize: 40, color: 'success.main', mr: 2 }} />
              <Box>
                <Typography variant="h4" color="success.main">
                  {stats.visualizations}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Saved Visualizations
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      {/* Recent Activity and Quick Actions */}
      <Grid container spacing={3}>
        {/* Recent Connections */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Connections</Typography>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<AddIcon />}
                onClick={handleNewConnection}
              >
                New Connection
              </Button>
            </Box>
            
            {recentConnections.length > 0 ? (
              <List>
                {recentConnections.map((connection, index) => (
                  <React.Fragment key={connection.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemIcon>
                        <DatabaseIcon color="primary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={connection.name} 
                        secondary={`${connection.connection.type || 'Database'} • ${new Date(connection.createdAt).toLocaleDateString()}`} 
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No saved connections yet. Create your first connection to get started.
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Queries */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Queries</Typography>
              <Button 
                variant="outlined" 
                size="small" 
                startIcon={<AddIcon />}
                onClick={handleNewQuery}
              >
                New Query
              </Button>
            </Box>
            
            {recentQueries.length > 0 ? (
              <List>
                {recentQueries.map((query, index) => (
                  <React.Fragment key={query.id}>
                    {index > 0 && <Divider />}
                    <ListItem>
                      <ListItemIcon>
                        <QueryIcon color="secondary" />
                      </ListItemIcon>
                      <ListItemText 
                        primary={query.name} 
                        secondary={`${new Date(query.createdAt).toLocaleDateString()}`} 
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                No saved queries yet. Start asking questions about your data.
              </Typography>
            )}
          </Paper>
        </Grid>
        
        {/* Tips and Getting Started */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Tips for Getting Started
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <TipIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                  <Typography variant="body2">
                    <strong>Connect Your Database</strong> - Start by connecting to your SQLite, PostgreSQL, or MySQL database.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <TipIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                  <Typography variant="body2">
                    <strong>Ask Questions</strong> - Use natural language to ask questions about your data.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <TipIcon color="primary" sx={{ mr: 1, mt: 0.5 }} />
                  <Typography variant="body2">
                    <strong>Save & Share</strong> - Save your queries and visualizations for future reference.
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
