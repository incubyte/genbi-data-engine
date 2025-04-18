import React, { useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
import { Chart, registerables } from 'chart.js';
import { prepareLineChartData } from '../../utils/chartUtils';

// Register Chart.js components
Chart.register(...registerables);

/**
 * Line Chart component using Chart.js
 */
const LineChart = ({ data, xAxis, yAxis, chartId }) => {
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
    const chartData = prepareLineChartData(data, xAxis, yAxis);

    // Create new chart instance
    chartInstance.current = new Chart(ctx, {
      type: 'line',
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
        },
        interaction: {
          mode: 'index',
          intersect: false,
        },
        elements: {
          point: {
            radius: 3,
            hoverRadius: 5
          },
          line: {
            tension: 0.2
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

LineChart.propTypes = {
  data: PropTypes.array.isRequired,
  xAxis: PropTypes.string.isRequired,
  yAxis: PropTypes.string.isRequired,
  chartId: PropTypes.string.isRequired
};

export default LineChart;
