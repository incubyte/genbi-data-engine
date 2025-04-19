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
    <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      {renderWelcomeMessage()}

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 2, md: 3 }} sx={{ mb: { xs: 3, md: 4 } }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              boxShadow: 2,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              }
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: { xs: 2, sm: 3 }, flex: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'primary.light',
                  color: 'primary.main',
                  borderRadius: '12px',
                  p: 1.5,
                  mr: 2.5,
                  flexShrink: 0,
                  width: 56,
                  height: 56
                }}
              >
                <DatabaseIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h4" color="primary.main" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {stats.connections}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Database Connections
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              boxShadow: 2,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              }
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: { xs: 2, sm: 3 }, flex: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'secondary.light',
                  color: 'secondary.main',
                  borderRadius: '12px',
                  p: 1.5,
                  mr: 2.5,
                  flexShrink: 0,
                  width: 56,
                  height: 56
                }}
              >
                <QueryIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h4" color="secondary.main" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {stats.queries}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Saved Queries
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={4}>
          <Card
            sx={{
              height: '100%',
              boxShadow: 2,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: 3,
              }
            }}
          >
            <CardContent sx={{ display: 'flex', alignItems: 'center', p: { xs: 2, sm: 3 }, flex: 1 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'success.light',
                  color: 'success.main',
                  borderRadius: '12px',
                  p: 1.5,
                  mr: 2.5,
                  flexShrink: 0,
                  width: 56,
                  height: 56
                }}
              >
                <ChartIcon sx={{ fontSize: 28 }} />
              </Box>
              <Box>
                <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  {stats.visualizations}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Saved Visualizations
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Activity and Quick Actions */}
      <Grid container spacing={{ xs: 2, md: 3 }}>
        {/* Recent Connections */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              height: '100%',
              boxShadow: 2,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Recent Connections</Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleNewConnection}
                color="primary"
              >
                New Connection
              </Button>
            </Box>

            {recentConnections.length > 0 ? (
              <List sx={{ p: 0 }}>
                {recentConnections.map((connection, index) => (
                  <React.Fragment key={connection.id}>
                    {index > 0 && <Divider sx={{ my: 1 }} />}
                    <ListItem sx={{ px: 2, py: 1.5, borderRadius: 1, '&:hover': { bgcolor: 'background.dark' } }}>
                      <ListItemIcon>
                        <DatabaseIcon color="primary" fontSize="medium" />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{connection.name}</Typography>}
                        secondary={`${connection.connection.type || 'Database'} • ${new Date(connection.createdAt).toLocaleDateString()}`}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center', bgcolor: 'background.dark', borderRadius: 1.5, width: '100%' }}>
                <Typography variant="body1" color="text.secondary">
                  No saved connections yet. Create your first connection to get started.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Recent Queries */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              height: '100%',
              boxShadow: 2,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Recent Queries</Typography>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={handleNewQuery}
                color="secondary"
              >
                New Query
              </Button>
            </Box>

            {recentQueries.length > 0 ? (
              <List sx={{ p: 0 }}>
                {recentQueries.map((query, index) => (
                  <React.Fragment key={query.id}>
                    {index > 0 && <Divider sx={{ my: 1 }} />}
                    <ListItem sx={{ px: 2, py: 1.5, borderRadius: 1, '&:hover': { bgcolor: 'background.dark' } }}>
                      <ListItemIcon>
                        <QueryIcon color="secondary" fontSize="medium" />
                      </ListItemIcon>
                      <ListItemText
                        primary={<Typography variant="subtitle1" sx={{ fontWeight: 500 }}>{query.name}</Typography>}
                        secondary={`${new Date(query.createdAt).toLocaleDateString()}`}
                      />
                    </ListItem>
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center', bgcolor: 'background.dark', borderRadius: 1.5, width: '100%' }}>
                <Typography variant="body1" color="text.secondary">
                  No saved queries yet. Start asking questions about your data.
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Tips and Getting Started */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: { xs: 2, sm: 3 },
              mt: { xs: 1, sm: 2 },
              boxShadow: 2,
              borderRadius: 2,
            }}
          >
            <Typography variant="h6" sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 'bold' }}>
              Tips for Getting Started
            </Typography>

            <Grid container spacing={{ xs: 2, md: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    p: { xs: 1.5, sm: 2 },
                    bgcolor: 'background.dark',
                    borderRadius: 2,
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      bgcolor: 'primary.light',
                      '& .MuiSvgIcon-root': {
                        color: 'primary.dark'
                      }
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'white',
                      borderRadius: '8px',
                      p: 1,
                      mr: 1.5,
                      flexShrink: 0,
                      width: 36,
                      height: 36
                    }}
                  >
                    <TipIcon color="primary" sx={{ fontSize: 20, flexShrink: 0 }} />
                  </Box>
                  <Typography variant="body1">
                    <strong>Connect Your Database</strong> - Start by connecting to your SQLite, PostgreSQL, or MySQL database.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    p: { xs: 1.5, sm: 2 },
                    bgcolor: 'background.dark',
                    borderRadius: 2,
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      bgcolor: 'secondary.light',
                      '& .MuiSvgIcon-root': {
                        color: 'secondary.dark'
                      }
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'white',
                      borderRadius: '8px',
                      p: 1,
                      mr: 1.5,
                      flexShrink: 0,
                      width: 36,
                      height: 36
                    }}
                  >
                    <TipIcon color="primary" sx={{ fontSize: 20, flexShrink: 0 }} />
                  </Box>
                  <Typography variant="body1">
                    <strong>Ask Questions</strong> - Use natural language to ask questions about your data.
                  </Typography>
                </Box>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    p: { xs: 1.5, sm: 2 },
                    bgcolor: 'background.dark',
                    borderRadius: 2,
                    height: '100%',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      bgcolor: 'success.light',
                      '& .MuiSvgIcon-root': {
                        color: 'success.dark'
                      }
                    }
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'white',
                      borderRadius: '8px',
                      p: 1,
                      mr: 1.5,
                      flexShrink: 0,
                      width: 36,
                      height: 36
                    }}
                  >
                    <TipIcon color="primary" sx={{ fontSize: 20, flexShrink: 0 }} />
                  </Box>
                  <Typography variant="body1">
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
