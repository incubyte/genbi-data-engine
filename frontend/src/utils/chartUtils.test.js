import {
  analyzeDataForCharts,
  getColumnTypes,
  getColumnCardinality,
  prepareLineChartData,
  prepareBarChartData,
  preparePieChartData,
  generateChartTitle
} from './chartUtils';

// Sample data for testing
const sampleTimeSeriesData = [
  { date: '2023-01-01', sales: 100, category: 'Electronics' },
  { date: '2023-02-01', sales: 150, category: 'Electronics' },
  { date: '2023-03-01', sales: 200, category: 'Electronics' },
  { date: '2023-04-01', sales: 180, category: 'Electronics' },
  { date: '2023-05-01', sales: 220, category: 'Electronics' }
];

const sampleCategoricalData = [
  { category: 'Electronics', sales: 1200 },
  { category: 'Clothing', sales: 800 },
  { category: 'Food', sales: 600 },
  { category: 'Books', sales: 400 }
];

describe('Chart Utility Functions', () => {
  describe('getColumnTypes', () => {
    test('correctly identifies column types', () => {
      const columns = Object.keys(sampleTimeSeriesData[0]);
      const types = getColumnTypes(sampleTimeSeriesData, columns);
      
      expect(types.date).toBe('date');
      expect(types.sales).toBe('number');
      expect(types.category).toBe('string');
    });
    
    test('handles empty data', () => {
      const types = getColumnTypes([], []);
      expect(types).toEqual({});
    });
  });
  
  describe('getColumnCardinality', () => {
    test('correctly calculates column cardinality', () => {
      const columns = Object.keys(sampleTimeSeriesData[0]);
      const cardinality = getColumnCardinality(sampleTimeSeriesData, columns);
      
      expect(cardinality.date).toBe(5); // 5 unique dates
      expect(cardinality.sales).toBe(5); // 5 unique sales values
      expect(cardinality.category).toBe(1); // 1 unique category
    });
  });
  
  describe('analyzeDataForCharts', () => {
    test('recommends line chart for time series data', () => {
      const analysis = analyzeDataForCharts(sampleTimeSeriesData);
      
      expect(analysis.recommendedCharts.length).toBeGreaterThan(0);
      expect(analysis.recommendedCharts[0].type).toBe('line');
      expect(analysis.recommendedCharts[0].config.xAxis).toBe('date');
      expect(analysis.recommendedCharts[0].config.yAxis).toBe('sales');
    });
    
    test('recommends bar chart for categorical data', () => {
      const analysis = analyzeDataForCharts(sampleCategoricalData);
      
      expect(analysis.recommendedCharts.length).toBeGreaterThan(0);
      expect(analysis.recommendedCharts[0].type).toBe('bar');
      expect(analysis.recommendedCharts[0].config.xAxis).toBe('category');
      expect(analysis.recommendedCharts[0].config.yAxis).toBe('sales');
    });
    
    test('handles empty data', () => {
      const analysis = analyzeDataForCharts([]);
      
      expect(analysis.recommendedCharts).toEqual([]);
      expect(analysis.message).toContain('No data available');
    });
  });
  
  describe('prepareLineChartData', () => {
    test('correctly formats data for line chart', () => {
      const chartData = prepareLineChartData(sampleTimeSeriesData, 'date', 'sales');
      
      expect(chartData.labels).toHaveLength(5);
      expect(chartData.datasets).toHaveLength(1);
      expect(chartData.datasets[0].data).toEqual([100, 150, 200, 180, 220]);
    });
  });
  
  describe('prepareBarChartData', () => {
    test('correctly formats data for bar chart', () => {
      const chartData = prepareBarChartData(sampleCategoricalData, 'category', 'sales');
      
      expect(chartData.labels).toHaveLength(4);
      expect(chartData.datasets).toHaveLength(1);
      expect(chartData.datasets[0].data).toEqual([1200, 800, 600, 400]);
    });
  });
  
  describe('preparePieChartData', () => {
    test('correctly formats data for pie chart', () => {
      const chartData = preparePieChartData(sampleCategoricalData, 'category', 'sales');
      
      expect(chartData.labels).toHaveLength(4);
      expect(chartData.datasets).toHaveLength(1);
      expect(chartData.datasets[0].data).toEqual([1200, 800, 600, 400]);
    });
  });
  
  describe('generateChartTitle', () => {
    test('generates appropriate titles for different chart types', () => {
      expect(generateChartTitle('line', 'date', 'sales')).toBe('sales over date');
      expect(generateChartTitle('bar', 'category', 'sales')).toBe('sales by category');
      expect(generateChartTitle('pie', 'category', 'sales')).toBe('Distribution of sales by category');
    });
  });
});
