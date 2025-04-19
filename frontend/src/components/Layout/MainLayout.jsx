import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Header from './Header';
import Sidebar from './Sidebar';

// Page titles based on routes
const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/connections': 'Database Connections',
  '/query': 'Query Interface',
  '/results': 'Query Results',
  '/visualizations': 'Saved Visualizations',
  '/settings': 'Account Settings',
};

const MainLayout = () => {
  const theme = useTheme();
  const location = useLocation();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [pageTitle, setPageTitle] = useState('Dashboard');

  // Update page title based on current route
  useEffect(() => {
    const title = PAGE_TITLES[location.pathname] || 'GenBI Dashboard';
    setPageTitle(title);
    document.title = `${title} | GenBI`;
  }, [location.pathname]);

  // Handle sidebar toggle
  const handleSidebarToggle = (open) => {
    setSidebarOpen(open);
  };

  // Calculate content width based on sidebar state
  const contentWidth = {
    width: {
      xs: '100%',
      md: sidebarOpen ? 'calc(100% - 260px)' : 'calc(100% - 72px)',
    },
    ml: {
      xs: 0,
      md: sidebarOpen ? '260px' : '72px',
    },
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Header */}
      <Header
        open={sidebarOpen}
        onToggle={handleSidebarToggle}
        title={pageTitle}
      />

      {/* Sidebar */}
      <Sidebar
        open={sidebarOpen}
        onToggle={handleSidebarToggle}
      />

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 2 },
          pb: { xs: 3, sm: 4 },
          ...contentWidth,
          backgroundColor: theme.palette.background.default,
          overflowX: 'hidden',
        }}
      >
        <Toolbar /> {/* Spacer for fixed app bar */}
        <Box sx={{ maxWidth: '1400px', mx: 'auto' }}>
          <Outlet /> {/* Render the current route */}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
