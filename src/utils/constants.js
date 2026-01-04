export const API_BASE_URL = 'https://web-production-53e0c.up.railway.app';
export const API_TIMEOUT = 30000;

export const COLORS = {
  primary: '#FF6B35',
  secondary: '#1E1E1E',
  background: '#F5F5F5',
  white: '#FFFFFF',
  text: '#333333',
  textLight: '#666666',
  success: '#4CAF50',
  warning: '#FFA500',
  error: '#F44336',
  border: '#E0E0E0',
};

export const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending', color: '#FFA500' },
  { label: 'Confirmed', value: 'confirmed', color: '#2196F3' },
  { label: 'Preparing', value: 'preparing', color: '#9C27B0' },
  { label: 'Out for Delivery', value: 'out_for_delivery', color: '#FF6B35' },
];

export const STATUS_DISPLAY = {
  pending: 'Pending',
  confirmed: 'Confirmed', 
  preparing: 'Preparing',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
