import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  FormControlLabel,
  Switch,
  Button,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Palette as PaletteIcon,
  Title as TitleIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

/**
 * Chart configuration panel component
 */
const ChartConfigPanel = ({ 
  chartType, 
  config, 
  columns, 
  columnTypes, 
  onConfigChange 
}) => {
  const [expanded, setExpanded] = useState('panel1');

  // Handle accordion change
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // Handle config change
  const handleConfigChange = (key, value) => {
    if (onConfigChange) {
      onConfigChange({
        ...config,
        [key]: value
      });
    }
  };

  // Get numeric columns
  const numericColumns = columns.filter(col => columnTypes[col] === 'number');
  
  // Get categorical columns
  const categoricalColumns = columns.filter(col => 
    columnTypes[col] === 'string' || columnTypes[col] === 'boolean'
  );
  
  // Get date columns
  const dateColumns = columns.filter(col => columnTypes[col] === 'date');

  return (
    <Paper sx={{ p: 2, mb: 3 }}>
      <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
        <SettingsIcon sx={{ mr: 1 }} />
        Chart Configuration
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      {/* Data Mapping Section */}
      <Accordion 
        expanded={expanded === 'panel1'} 
        onChange={handleAccordionChange('panel1')}
        sx={{ mb: 1 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1">Data Mapping</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {/* X-Axis / Labels Selection */}
            {(chartType === 'bar' || chartType === 'line') && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="x-axis-label">X-Axis</InputLabel>
                  <Select
                    labelId="x-axis-label"
                    value={config.xAxis || ''}
                    label="X-Axis"
                    onChange={(e) => handleConfigChange('xAxis', e.target.value)}
                  >
                    {chartType === 'line' && dateColumns.map(col => (
                      <MenuItem key={col} value={col}>{col}</MenuItem>
                    ))}
                    {categoricalColumns.map(col => (
                      <MenuItem key={col} value={col}>{col}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
            
            {/* Y-Axis / Values Selection */}
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel id="y-axis-label">
                  {chartType === 'pie' ? 'Values' : 'Y-Axis'}
                </InputLabel>
                <Select
                  labelId="y-axis-label"
                  value={chartType === 'pie' ? (config.values || '') : (config.yAxis || '')}
                  label={chartType === 'pie' ? 'Values' : 'Y-Axis'}
                  onChange={(e) => handleConfigChange(
                    chartType === 'pie' ? 'values' : 'yAxis', 
                    e.target.value
                  )}
                >
                  {numericColumns.map(col => (
                    <MenuItem key={col} value={col}>{col}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            {/* Labels Selection for Pie Chart */}
            {chartType === 'pie' && (
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel id="labels-label">Labels</InputLabel>
                  <Select
                    labelId="labels-label"
                    value={config.labels || ''}
                    label="Labels"
                    onChange={(e) => handleConfigChange('labels', e.target.value)}
                  >
                    {categoricalColumns.map(col => (
                      <MenuItem key={col} value={col}>{col}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      {/* Title and Labels Section */}
      <Accordion 
        expanded={expanded === 'panel2'} 
        onChange={handleAccordionChange('panel2')}
        sx={{ mb: 1 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
            <TitleIcon fontSize="small" sx={{ mr: 1 }} />
            Title & Labels
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Chart Title"
                variant="outlined"
                size="small"
                value={config.title || ''}
                onChange={(e) => handleConfigChange('title', e.target.value)}
              />
            </Grid>
            
            {(chartType === 'bar' || chartType === 'line') && (
              <>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="X-Axis Label"
                    variant="outlined"
                    size="small"
                    value={config.xAxisLabel || ''}
                    onChange={(e) => handleConfigChange('xAxisLabel', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Y-Axis Label"
                    variant="outlined"
                    size="small"
                    value={config.yAxisLabel || ''}
                    onChange={(e) => handleConfigChange('yAxisLabel', e.target.value)}
                  />
                </Grid>
              </>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      {/* Appearance Section */}
      <Accordion 
        expanded={expanded === 'panel3'} 
        onChange={handleAccordionChange('panel3')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center' }}>
            <PaletteIcon fontSize="small" sx={{ mr: 1 }} />
            Appearance
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body2" gutterBottom>
                Legend Position
              </Typography>
              <FormControl fullWidth size="small">
                <Select
                  value={config.legendPosition || 'top'}
                  onChange={(e) => handleConfigChange('legendPosition', e.target.value)}
                >
                  <MenuItem value="top">Top</MenuItem>
                  <MenuItem value="bottom">Bottom</MenuItem>
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={config.showLegend !== false}
                    onChange={(e) => handleConfigChange('showLegend', e.target.checked)}
                  />
                }
                label="Show Legend"
              />
            </Grid>
            
            {(chartType === 'bar' || chartType === 'line') && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={config.beginAtZero !== false}
                      onChange={(e) => handleConfigChange('beginAtZero', e.target.checked)}
                    />
                  }
                  label="Begin Y-Axis at Zero"
                />
              </Grid>
            )}
          </Grid>
        </AccordionDetails>
      </Accordion>
      
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => {
            // Reset to default configuration
            if (onConfigChange) {
              onConfigChange({
                title: '',
                xAxisLabel: '',
                yAxisLabel: '',
                legendPosition: 'top',
                showLegend: true,
                beginAtZero: true
              });
            }
          }}
          sx={{ mr: 1 }}
        >
          Reset
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => setExpanded(false)}
        >
          Apply
        </Button>
      </Box>
    </Paper>
  );
};

ChartConfigPanel.propTypes = {
  chartType: PropTypes.oneOf(['bar', 'line', 'pie']).isRequired,
  config: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  columnTypes: PropTypes.object.isRequired,
  onConfigChange: PropTypes.func.isRequired
};

export default ChartConfigPanel;
