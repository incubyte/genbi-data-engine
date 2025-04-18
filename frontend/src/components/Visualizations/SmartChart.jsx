import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Paper,
  Alert,
  AlertTitle,
  CircularProgress,
  Tabs,
  Tab,
  Button,
  Collapse,
  IconButton
} from '@mui/material';
import {
  Settings as SettingsIcon,
  ExpandMore as ExpandMoreIcon
} from '@mui/icons-material';
import BarChart from './BarChart';
import LineChart from './LineChart';
import PieChart from './PieChart';
import ChartContainer from './ChartContainer';
import ChartConfigPanel from './ChartConfigPanel';
import { analyzeDataForCharts, generateChartTitle } from '../../utils/chartUtils';

/**
 * Smart chart component that automatically selects the appropriate chart type
 * based on data characteristics
 */
const SmartChart = ({
  data,
  initialChartType = null,
  recommendedConfig = null,
  recommendationReason = null
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [selectedChartIndex, setSelectedChartIndex] = useState(0);
  const [chartType, setChartType] = useState(initialChartType);
  const [showConfig, setShowConfig] = useState(false);
  const [chartConfig, setChartConfig] = useState({});
  const chartId = `chart-${Date.now()}`;

  // Analyze data when it changes
  useEffect(() => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      setError('No data available for visualization');
      setLoading(false);
      return;
    }

    try {
      // Analyze data for chart recommendations
      const analysisResult = analyzeDataForCharts(data);
      setAnalysis(analysisResult);

      // If we have recommended config from the API, use it to override the analysis
      if (recommendedConfig && initialChartType) {
        // Create a custom recommendation based on API suggestions
        const apiRecommendation = {
          type: initialChartType,
          suitability: 'high',
          config: recommendedConfig,
          reason: recommendationReason || 'Recommended by AI based on query intent'
        };

        // Add the API recommendation to the top of the list
        analysisResult.recommendedCharts = [
          apiRecommendation,
          ...analysisResult.recommendedCharts.filter(chart => chart.type !== initialChartType)
        ];

        // Update the analysis with the modified recommendations
        setAnalysis(analysisResult);

        // Set the chart type and config based on API recommendation
        setChartType(initialChartType);
        setChartConfig(recommendedConfig);
      } else if (analysisResult.recommendedCharts.length > 0) {
        // Set chart type based on analysis recommendations or initial type
        if (!chartType || !analysisResult.recommendedCharts.some(chart => chart.type === chartType)) {
          setChartType(analysisResult.recommendedCharts[0].type);
          // Initialize chart config with recommended settings
          setChartConfig(analysisResult.recommendedCharts[0].config);
        }
      } else {
        setError('Could not determine appropriate visualization for this data');
      }
    } catch (err) {
      setError(`Error analyzing data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [data, initialChartType, recommendedConfig, recommendationReason]);

  // Handle chart type change
  const handleChartTypeChange = (newType) => {
    setChartType(newType);
    // Update config when chart type changes
    const newChartConfig = analysis?.recommendedCharts?.find(chart => chart.type === newType)?.config;
    if (newChartConfig) {
      setChartConfig(newChartConfig);
    }
  };

  // Handle chart config change
  const handleConfigChange = (newConfig) => {
    setChartConfig(newConfig);
  };

  // Get color based on suitability rating
  const getSuitabilityColor = (suitability) => {
    switch (suitability) {
      case 'high':
        return 'success.main';
      case 'medium':
        return 'warning.main';
      default:
        return 'error.main';
    }
  };

  // Handle chart tab change
  const handleChartTabChange = (event, newValue) => {
    setSelectedChartIndex(newValue);
    const selectedChart = analysis?.recommendedCharts?.[newValue];
    if (selectedChart) {
      setChartType(selectedChart.type);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        <AlertTitle>Visualization Error</AlertTitle>
        {error}
      </Alert>
    );
  }

  // Show no data state
  if (!analysis?.recommendedCharts?.length) {
    return (
      <Alert severity="info" sx={{ mt: 2 }}>
        <AlertTitle>No Visualization Available</AlertTitle>
        The current data structure doesn't support automatic visualization. Try a different query or data set.
      </Alert>
    );
  }

  // Get current chart configuration
  const currentChart = analysis.recommendedCharts.find(chart => chart.type === chartType) || analysis.recommendedCharts[0];
  const availableChartTypes = [...new Set(analysis.recommendedCharts.map(chart => chart.type))];

  // Merge recommended config with user config
  const mergedConfig = { ...currentChart.config, ...chartConfig };

  // Render the appropriate chart based on type
  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart
            data={data}
            xAxis={mergedConfig.xAxis}
            yAxis={mergedConfig.yAxis}
            chartId={chartId}
          />
        );
      case 'line':
        return (
          <LineChart
            data={data}
            xAxis={mergedConfig.xAxis}
            yAxis={mergedConfig.yAxis}
            chartId={chartId}
          />
        );
      case 'pie':
        return (
          <PieChart
            data={data}
            labels={mergedConfig.labels}
            values={mergedConfig.values}
            chartId={chartId}
          />
        );
      default:
        return (
          <Typography variant="body1" color="text.secondary" align="center">
            Unsupported chart type: {chartType}
          </Typography>
        );
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* Chart configuration toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<SettingsIcon />}
          onClick={() => setShowConfig(!showConfig)}
          endIcon={
            <IconButton size="small" sx={{ p: 0 }}>
              <ExpandMoreIcon
                sx={{
                  transform: showConfig ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: '0.2s'
                }}
              />
            </IconButton>
          }
        >
          {showConfig ? 'Hide' : 'Show'} Chart Settings
        </Button>
      </Box>

      {/* Chart configuration panel */}
      <Collapse in={showConfig}>
        <ChartConfigPanel
          chartType={chartType}
          config={chartConfig}
          columns={analysis.columns || []}
          columnTypes={analysis.columnTypes || {}}
          onConfigChange={handleConfigChange}
        />
      </Collapse>

      {/* Chart recommendation tabs */}
      {analysis.recommendedCharts.length > 1 && (
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs
            value={selectedChartIndex}
            onChange={handleChartTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            {analysis.recommendedCharts.map((chart, index) => (
              <Tab
                key={`${chart.type}-${index}`}
                label={`${chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} Chart`}
                icon={
                  <Box sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: getSuitabilityColor(chart.suitability),
                    display: 'inline-block',
                    mr: 1
                  }} />
                }
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>
      )}

      {/* Chart container */}
      <ChartContainer
        title={mergedConfig.title || generateChartTitle(chartType, mergedConfig.xAxis, mergedConfig.yAxis)}
        chartId={chartId}
        onChartTypeChange={handleChartTypeChange}
        currentChartType={chartType}
        availableChartTypes={availableChartTypes}
      >
        {renderChart()}
      </ChartContainer>

      {/* Chart explanation */}
      <Paper sx={{ mt: 2, p: 2, bgcolor: 'background.dark' }}>
        <Typography variant="subtitle2" color="text.secondary">
          Why this visualization?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {recommendationReason || currentChart.reason || 'This chart type was selected based on your data structure.'}
        </Typography>
      </Paper>
    </Box>
  );
};

SmartChart.propTypes = {
  data: PropTypes.array.isRequired,
  initialChartType: PropTypes.oneOf(['bar', 'line', 'pie']),
  recommendedConfig: PropTypes.object,
  recommendationReason: PropTypes.string
};

export default SmartChart;
