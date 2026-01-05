import api from './api';

export const getOrders = async () => {
  // Use staff-orders endpoint for branch-specific orders
  const response = await api.get('/api/orders/staff-orders/');
  return response.data.orders || response.data;
};

export const getOrderDetail = async orderId => {
  // Use staff-orders endpoint for branch-specific order details
  const response = await api.get(`/api/orders/staff-orders/${orderId}/`);
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.post(
    `/api/orders/admin/orders/${orderId}/update-status/`,
    {status},
  );
  return response.data;
};
