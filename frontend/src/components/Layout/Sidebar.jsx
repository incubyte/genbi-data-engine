import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Storage as DatabaseIcon,
  QuestionAnswer as QueryIcon,
  BarChart as VisualizationIcon,
  Settings as SettingsIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon
} from '@mui/icons-material';

// Sidebar width
const DRAWER_WIDTH = 260;
const COLLAPSED_DRAWER_WIDTH = 72;

const Sidebar = ({ open, onToggle }) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Navigation items
  const navItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: <DashboardIcon />
    },
    {
      title: 'Database Connections',
      path: '/connections',
      icon: <DatabaseIcon />
    },
    {
      title: 'Query Interface',
      path: '/query',
      icon: <QueryIcon />
    },
    {
      title: 'Saved Visualizations',
      path: '/visualizations',
      icon: <VisualizationIcon />
    },
    {
      title: 'Account Settings',
      path: '/settings',
      icon: <SettingsIcon />
    }
  ];

  // Handle navigation
  const handleNavigation = (path) => {
    navigate(path);
    if (isMobile) {
      onToggle(false);
    }
  };

  // Drawer content
  const drawerContent = (
    <>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: open ? 'space-between' : 'center',
          padding: theme.spacing(2),
          minHeight: 64
        }}
      >
        {open ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                sx={{
                  bgcolor: theme.palette.primary.main,
                  width: 40,
                  height: 40,
                  marginRight: 1
                }}
              >
                G
              </Avatar>
              <Typography variant="h6" color="textPrimary">
                GenBI
              </Typography>
            </Box>
            <IconButton onClick={() => onToggle(false)}>
              <ChevronLeftIcon />
            </IconButton>
          </>
        ) : (
          <IconButton onClick={() => onToggle(true)}>
            <MenuIcon />
          </IconButton>
        )}
      </Box>

      <Divider />

      <Box sx={{ mt: 2 }}>
        <List component="nav" sx={{ px: 1 }}>
          {navItems.map((item) => {
            const isSelected = location.pathname === item.path;

            return open ? (
              <ListItemButton
                key={item.title}
                selected={isSelected}
                onClick={() => handleNavigation(item.path)}
                sx={{
                  borderRadius: 1.5,
                  mb: 0.5,
                  py: 1.25,
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: isSelected ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.title}
                  primaryTypographyProps={{
                    fontWeight: isSelected ? 600 : 500,
                    fontSize: '0.95rem'
                  }}
                />
              </ListItemButton>
            ) : (
              <Tooltip key={item.title} title={item.title} placement="right">
                <ListItemButton
                  selected={isSelected}
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    minHeight: 48,
                    justifyContent: 'center',
                    px: 2,
                    borderRadius: 1.5,
                    mb: 0.5,
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: 'auto',
                      justifyContent: 'center',
                      color: isSelected ? 'primary.main' : 'inherit'
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      <Box
        sx={{
          p: 2,
          display: open ? 'block' : 'none',
        }}
      >
        <Typography variant="body2" color="textSecondary" align="center">
          GenBI v1.0
        </Typography>
        <Typography variant="caption" color="textSecondary" align="center" display="block">
          Making Data Insights Accessible to Everyone
        </Typography>
      </Box>
    </>
  );

  return (
    <Box
      component="nav"
      sx={{
        width: { md: open ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH },
        flexShrink: { md: 0 }
      }}
    >
      {/* Mobile drawer */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={open}
          onClose={() => onToggle(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: open ? DRAWER_WIDTH : COLLAPSED_DRAWER_WIDTH,
            boxSizing: 'border-box',
            overflowX: 'hidden',
            borderRight: '1px solid',
            borderColor: 'divider',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
          },
        }}
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

export default Sidebar;
