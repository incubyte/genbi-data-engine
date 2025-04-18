import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { Chart, registerables } from 'chart.js';
import { prepareBarChartData } from '../../utils/chartUtils';

// Register Chart.js components
// Safely register Chart.js components if the register function exists
if (Chart.register) {
  Chart.register(...registerables);
}

/**
 * Bar Chart component using Chart.js
 */
const BarChart = ({ data, xAxis, yAxis, chartId }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Clean up previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Skip rendering if no data or axes
    if (!data || !data.length || !xAxis || !yAxis) {
      return;
    }

    const ctx = chartRef.current.getContext('2d');
    const chartData = prepareBarChartData(data, xAxis, yAxis);

    // Create new chart instance
    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.parsed.y !== null) {
                  label += new Intl.NumberFormat('en-US').format(context.parsed.y);
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return new Intl.NumberFormat('en-US').format(value);
              }
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45
            }
          }
        }
      }
    });

    // Clean up on unmount
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data, xAxis, yAxis]);

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 300 }}>
      <canvas id={chartId} ref={chartRef}></canvas>
    </Box>
  );
};

BarChart.propTypes = {
  data: PropTypes.array.isRequired,
  xAxis: PropTypes.string.isRequired,
  yAxis: PropTypes.string.isRequired,
  chartId: PropTypes.string.isRequired
};

export default BarChart;
