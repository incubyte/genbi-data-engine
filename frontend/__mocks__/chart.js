// Mock for Chart.js
const registerables = [];

class Chart {
  static register() {}
  static getChart() { return null; }
  
  constructor(ctx, config) {
    this.ctx = ctx;
    this.config = config;
    this.data = config.data || {};
    this.options = config.options || {};
    this.type = config.type || 'bar';
    this.id = Math.random().toString();
  }

  update() {}
  destroy() {}
}

module.exports = {
  Chart,
  registerables,
  LinearScale: class {},
  CategoryScale: class {},
  BarController: class {},
  LineController: class {},
  PieController: class {},
  PointElement: class {},
  LineElement: class {},
  BarElement: class {},
  ArcElement: class {},
  Tooltip: class {},
  Legend: class {},
  Title: class {},
};
