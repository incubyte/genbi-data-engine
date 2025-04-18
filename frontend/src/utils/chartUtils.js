/**
 * Utility functions for chart generation and data analysis
 */

/**
 * Analyzes data structure and recommends appropriate chart types
 * @param {Array} data - Array of data objects
 * @returns {Object} - Recommended chart types and configuration
 */
export const analyzeDataForCharts = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return {
      recommendedCharts: [],
      message: 'No data available for visualization'
    };
  }

  // Get column names and types
  const columns = Object.keys(data[0]);
  const columnTypes = getColumnTypes(data, columns);
  const columnCardinality = getColumnCardinality(data, columns);
  
  // Initialize recommendations array
  const recommendedCharts = [];
  
  // Check for time series data (date/time columns)
  const timeColumns = columns.filter(col => columnTypes[col] === 'date');
  
  // Check for numeric columns (potential measures)
  const numericColumns = columns.filter(col => columnTypes[col] === 'number');
  
  // Check for categorical columns (potential dimensions)
  const categoricalColumns = columns.filter(col => 
    columnTypes[col] === 'string' && 
    columnCardinality[col] <= Math.min(20, data.length / 2)
  );

  // If we have time and numeric columns, recommend line chart
  if (timeColumns.length > 0 && numericColumns.length > 0) {
    recommendedCharts.push({
      type: 'line',
      suitability: 'high',
      config: {
        xAxis: timeColumns[0],
        yAxis: numericColumns[0],
        title: `${numericColumns[0]} over time`
      },
      reason: 'Time series data detected'
    });
  }
  
  // If we have categorical and numeric columns, recommend bar chart
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    recommendedCharts.push({
      type: 'bar',
      suitability: categoricalColumns.length <= 10 ? 'high' : 'medium',
      config: {
        xAxis: categoricalColumns[0],
        yAxis: numericColumns[0],
        title: `${numericColumns[0]} by ${categoricalColumns[0]}`
      },
      reason: 'Categorical comparison data detected'
    });
  }
  
  // If we have a single categorical column with reasonable cardinality, recommend pie chart
  if (categoricalColumns.length > 0 && numericColumns.length > 0) {
    const pieColumn = categoricalColumns.find(col => columnCardinality[col] <= 8);
    if (pieColumn) {
      recommendedCharts.push({
        type: 'pie',
        suitability: columnCardinality[pieColumn] <= 5 ? 'high' : 'medium',
        config: {
          labels: pieColumn,
          values: numericColumns[0],
          title: `Distribution of ${numericColumns[0]} by ${pieColumn}`
        },
        reason: 'Part-to-whole relationship detected'
      });
    }
  }
  
  // If no specific chart type is recommended, suggest a generic bar chart if we have numeric data
  if (recommendedCharts.length === 0 && numericColumns.length > 0) {
    const xAxis = categoricalColumns.length > 0 ? categoricalColumns[0] : columns.find(col => col !== numericColumns[0]);
    recommendedCharts.push({
      type: 'bar',
      suitability: 'low',
      config: {
        xAxis: xAxis,
        yAxis: numericColumns[0],
        title: `${numericColumns[0]} by ${xAxis}`
      },
      reason: 'Generic visualization based on available data'
    });
  }
  
  // Sort recommendations by suitability
  recommendedCharts.sort((a, b) => {
    const suitabilityRank = { high: 3, medium: 2, low: 1 };
    return suitabilityRank[b.suitability] - suitabilityRank[a.suitability];
  });
  
  return {
    recommendedCharts,
    columns,
    columnTypes,
    columnCardinality,
    message: recommendedCharts.length > 0 
      ? `Found ${recommendedCharts.length} suitable visualization types` 
      : 'No suitable visualizations found for this data'
  };
};

/**
 * Determines the data type of each column
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Array of column names
 * @returns {Object} - Object mapping column names to data types
 */
export const getColumnTypes = (data, columns) => {
  const columnTypes = {};
  
  columns.forEach(column => {
    // Get non-null values for this column
    const values = data
      .map(row => row[column])
      .filter(val => val !== null && val !== undefined);
    
    if (values.length === 0) {
      columnTypes[column] = 'unknown';
      return;
    }
    
    // Check if all values are numbers
    const allNumbers = values.every(val => !isNaN(Number(val)) && typeof val !== 'boolean');
    if (allNumbers) {
      columnTypes[column] = 'number';
      return;
    }
    
    // Check if all values are dates
    const datePattern = /^\d{4}-\d{2}-\d{2}|^\d{2}\/\d{2}\/\d{4}|^\d{2}\.\d{2}\.\d{4}/;
    const allDates = values.every(val => {
      if (typeof val !== 'string') return false;
      return datePattern.test(val) || !isNaN(Date.parse(val));
    });
    if (allDates) {
      columnTypes[column] = 'date';
      return;
    }
    
    // Check if all values are booleans
    const allBooleans = values.every(val => 
      typeof val === 'boolean' || val === 'true' || val === 'false' || val === 0 || val === 1
    );
    if (allBooleans) {
      columnTypes[column] = 'boolean';
      return;
    }
    
    // Default to string
    columnTypes[column] = 'string';
  });
  
  return columnTypes;
};

/**
 * Calculates the cardinality (number of unique values) for each column
 * @param {Array} data - Array of data objects
 * @param {Array} columns - Array of column names
 * @returns {Object} - Object mapping column names to cardinality
 */
export const getColumnCardinality = (data, columns) => {
  const columnCardinality = {};
  
  columns.forEach(column => {
    const uniqueValues = new Set();
    data.forEach(row => {
      if (row[column] !== null && row[column] !== undefined) {
        uniqueValues.add(String(row[column]));
      }
    });
    columnCardinality[column] = uniqueValues.size;
  });
  
  return columnCardinality;
};

/**
 * Prepares data for a line chart
 * @param {Array} data - Array of data objects
 * @param {string} xAxis - Column name for x-axis
 * @param {string} yAxis - Column name for y-axis
 * @returns {Object} - Prepared data for Chart.js
 */
export const prepareLineChartData = (data, xAxis, yAxis) => {
  // Sort data by x-axis if it's a date
  const sortedData = [...data].sort((a, b) => {
    const aValue = a[xAxis];
    const bValue = b[xAxis];
    
    if (isNaN(Date.parse(aValue)) || isNaN(Date.parse(bValue))) {
      return 0; // Not dates, don't sort
    }
    
    return new Date(aValue) - new Date(bValue);
  });
  
  const labels = sortedData.map(item => item[xAxis]);
  const values = sortedData.map(item => item[yAxis]);
  
  return {
    labels,
    datasets: [
      {
        label: yAxis,
        data: values,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: true
      }
    ]
  };
};

/**
 * Prepares data for a bar chart
 * @param {Array} data - Array of data objects
 * @param {string} xAxis - Column name for x-axis
 * @param {string} yAxis - Column name for y-axis
 * @returns {Object} - Prepared data for Chart.js
 */
export const prepareBarChartData = (data, xAxis, yAxis) => {
  // Group data by x-axis and calculate sum of y-axis values
  const groupedData = {};
  data.forEach(item => {
    const key = String(item[xAxis]);
    if (!groupedData[key]) {
      groupedData[key] = 0;
    }
    groupedData[key] += Number(item[yAxis]) || 0;
  });
  
  const labels = Object.keys(groupedData);
  const values = Object.values(groupedData);
  
  return {
    labels,
    datasets: [
      {
        label: yAxis,
        data: values,
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };
};

/**
 * Prepares data for a pie chart
 * @param {Array} data - Array of data objects
 * @param {string} labels - Column name for labels
 * @param {string} values - Column name for values
 * @returns {Object} - Prepared data for Chart.js
 */
export const preparePieChartData = (data, labels, values) => {
  // Group data by labels and calculate sum of values
  const groupedData = {};
  data.forEach(item => {
    const key = String(item[labels]);
    if (!groupedData[key]) {
      groupedData[key] = 0;
    }
    groupedData[key] += Number(item[values]) || 0;
  });
  
  const labelArray = Object.keys(groupedData);
  const valueArray = Object.values(groupedData);
  
  // Generate colors for each segment
  const backgroundColors = labelArray.map((_, index) => {
    const hue = (index * 137) % 360; // Golden angle approximation for good color distribution
    return `hsla(${hue}, 70%, 60%, 0.7)`;
  });
  
  return {
    labels: labelArray,
    datasets: [
      {
        data: valueArray,
        backgroundColor: backgroundColors,
        borderColor: backgroundColors.map(color => color.replace('0.7', '1')),
        borderWidth: 1
      }
    ]
  };
};

/**
 * Generates a chart title based on the data and selected axes
 * @param {string} chartType - Type of chart
 * @param {string} xAxis - Column name for x-axis
 * @param {string} yAxis - Column name for y-axis
 * @returns {string} - Generated chart title
 */
export const generateChartTitle = (chartType, xAxis, yAxis) => {
  switch (chartType) {
    case 'line':
      return `${yAxis} over ${xAxis}`;
    case 'bar':
      return `${yAxis} by ${xAxis}`;
    case 'pie':
      return `Distribution of ${yAxis} by ${xAxis}`;
    default:
      return `${yAxis} vs ${xAxis}`;
  }
};

/**
 * Exports a chart as an image
 * @param {string} chartId - ID of the chart canvas element
 * @param {string} fileName - Name for the downloaded file
 * @param {string} format - File format ('png' or 'svg')
 */
export const exportChart = (chartId, fileName, format = 'png') => {
  const canvas = document.getElementById(chartId);
  if (!canvas) {
    console.error('Chart canvas not found');
    return;
  }
  
  let dataUrl;
  if (format === 'svg') {
    // For SVG, we need to use the Chart.js toBase64Image with image/svg+xml
    const chart = Chart.getChart(canvas);
    if (!chart) {
      console.error('Chart instance not found');
      return;
    }
    dataUrl = chart.toBase64Image('image/svg+xml');
  } else {
    // Default to PNG
    dataUrl = canvas.toDataURL('image/png');
  }
  
  // Create a download link
  const link = document.createElement('a');
  link.download = `${fileName}.${format}`;
  link.href = dataUrl;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
