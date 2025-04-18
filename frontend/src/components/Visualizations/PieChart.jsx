import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { Chart, registerables } from 'chart.js';
import { preparePieChartData } from '../../utils/chartUtils';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Pie Chart component using Chart.js
 */
const PieChart = ({ data, labels, values, chartId }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Clean up previous chart instance
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Skip rendering if no data or axes
    if (!data || !data.length || !labels || !values) {
      return;
    }

    const ctx = chartRef.current.getContext('2d');
    const chartData = preparePieChartData(data, labels, values);

    // Create new chart instance
    chartInstance.current = new Chart(ctx, {
      type: 'pie',
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 15,
              padding: 15
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const label = context.label || '';
                const value = context.parsed || 0;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${new Intl.NumberFormat('en-US').format(value)} (${percentage}%)`;
              }
            }
          }
        },
        layout: {
          padding: 10
        },
        elements: {
          arc: {
            borderWidth: 1,
            borderColor: '#fff'
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
  }, [data, labels, values]);

  return (
    <Box sx={{ width: '100%', height: '100%', minHeight: 300 }}>
      <canvas id={chartId} ref={chartRef}></canvas>
    </Box>
  );
};

PieChart.propTypes = {
  data: PropTypes.array.isRequired,
  labels: PropTypes.string.isRequired,
  values: PropTypes.string.isRequired,
  chartId: PropTypes.string.isRequired
};

export default PieChart;
