export const DOMAINS = [
  { id: 'household', label: 'Household', icon: '🏠', description: 'Electricity, water, expenses', color: '#3b82f6' },
  { id: 'vehicle', label: 'Vehicle', icon: '🚗', description: 'Fuel, distance, engine data', color: '#8b5cf6' },
  { id: 'business', label: 'Small Business', icon: '💼', description: 'Sales, orders, revenue', color: '#06b6d4' },
  { id: 'agriculture', label: 'Agriculture', icon: '🌿', description: 'Temperature, soil, moisture', color: '#10b981' },
  { id: 'industry', label: 'Industry', icon: '🏭', description: 'Machine, vibration, pressure', color: '#f59e0b' },
];

export const STATUS_CONFIG = {
  Normal:    { color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', label: 'Normal' },
  Watch:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', label: 'Watch' },
  Anomalous: { color: '#f97316', bg: 'rgba(249,115,22,0.1)', border: 'rgba(249,115,22,0.3)', label: 'Anomalous' },
  Critical:  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', label: 'Critical' },
};

export const CHART_COLORS = {
  value: '#3b82f6',
  baseline: '#8b5cf6',
  lower: 'rgba(139,92,246,0.2)',
  upper: 'rgba(139,92,246,0.2)',
  anomaly: '#ef4444',
  score: '#f59e0b',
  normal: '#10b981',
};
