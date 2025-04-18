import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip
} from '@mui/material';
import {
  MoreVert as MoreIcon,
  Download as DownloadIcon,
  PictureAsPdf as PdfIcon,
  Image as ImageIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  ShowChart as LineChartIcon
} from '@mui/icons-material';
import { exportChart } from '../../utils/chartUtils';

/**
 * Container component for charts with common controls and functionality
 */
const ChartContainer = ({ 
  title, 
  children, 
  chartId, 
  onChartTypeChange, 
  currentChartType,
  availableChartTypes = ['bar', 'line', 'pie']
}) => {
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [chartTypeMenuAnchorEl, setChartTypeMenuAnchorEl] = useState(null);
  const containerRef = useRef(null);

  // Handle menu open
  const handleMenuOpen = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle chart type menu open
  const handleChartTypeMenuOpen = (event) => {
    setChartTypeMenuAnchorEl(event.currentTarget);
  };

  // Handle chart type menu close
  const handleChartTypeMenuClose = () => {
    setChartTypeMenuAnchorEl(null);
  };

  // Handle chart type change
  const handleChartTypeChange = (type) => {
    if (onChartTypeChange) {
      onChartTypeChange(type);
    }
    handleChartTypeMenuClose();
  };

  // Handle export as PNG
  const handleExportPng = () => {
    exportChart(chartId, `chart-${Date.now()}`, 'png');
    handleMenuClose();
  };

  // Handle export as SVG
  const handleExportSvg = () => {
    exportChart(chartId, `chart-${Date.now()}`, 'svg');
    handleMenuClose();
  };

  // Get icon for chart type
  const getChartTypeIcon = (type) => {
    switch (type) {
      case 'bar':
        return <BarChartIcon />;
      case 'pie':
        return <PieChartIcon />;
      case 'line':
        return <LineChartIcon />;
      default:
        return <BarChartIcon />;
    }
  };

  return (
    <Paper 
      ref={containerRef}
      sx={{ 
        p: 2, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        boxShadow: 3,
        borderRadius: 2
      }}
    >
      {/* Chart header with title and actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6" component="h3" sx={{ fontWeight: 500 }}>
          {title}
        </Typography>
        <Box>
          {/* Chart type selector */}
          {availableChartTypes.length > 1 && onChartTypeChange && (
            <Tooltip title="Change chart type">
              <IconButton 
                size="small" 
                onClick={handleChartTypeMenuOpen}
                sx={{ mr: 1 }}
              >
                {getChartTypeIcon(currentChartType)}
              </IconButton>
            </Tooltip>
          )}
          
          {/* Chart actions menu */}
          <Tooltip title="Chart options">
            <IconButton 
              size="small" 
              onClick={handleMenuOpen}
            >
              <MoreIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Chart content */}
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {children}
      </Box>
      
      {/* Chart type menu */}
      <Menu
        anchorEl={chartTypeMenuAnchorEl}
        open={Boolean(chartTypeMenuAnchorEl)}
        onClose={handleChartTypeMenuClose}
      >
        {availableChartTypes.includes('bar') && (
          <MenuItem 
            onClick={() => handleChartTypeChange('bar')}
            selected={currentChartType === 'bar'}
          >
            <ListItemIcon>
              <BarChartIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Bar Chart</ListItemText>
          </MenuItem>
        )}
        {availableChartTypes.includes('line') && (
          <MenuItem 
            onClick={() => handleChartTypeChange('line')}
            selected={currentChartType === 'line'}
          >
            <ListItemIcon>
              <LineChartIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Line Chart</ListItemText>
          </MenuItem>
        )}
        {availableChartTypes.includes('pie') && (
          <MenuItem 
            onClick={() => handleChartTypeChange('pie')}
            selected={currentChartType === 'pie'}
          >
            <ListItemIcon>
              <PieChartIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Pie Chart</ListItemText>
          </MenuItem>
        )}
      </Menu>
      
      {/* Actions menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleExportPng}>
          <ListItemIcon>
            <ImageIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as PNG</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleExportSvg}>
          <ListItemIcon>
            <PdfIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Export as SVG</ListItemText>
        </MenuItem>
      </Menu>
    </Paper>
  );
};

ChartContainer.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  chartId: PropTypes.string.isRequired,
  onChartTypeChange: PropTypes.func,
  currentChartType: PropTypes.oneOf(['bar', 'line', 'pie']).isRequired,
  availableChartTypes: PropTypes.arrayOf(PropTypes.oneOf(['bar', 'line', 'pie']))
};

export default ChartContainer;
