import api from './api';

export const getOrders = async () => {
  const response = await api.get('/api/orders/my-orders/');
  return response.data.orders || response.data;
};

export const getOrderDetail = async orderId => {
  const response = await api.get(`/api/orders/my-orders/${orderId}/`);
  return response.data;
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.post(
    `/api/orders/admin/orders/${orderId}/update-status/`,
    {status},
  );
  return response.data;
};
