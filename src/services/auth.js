import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/api/users/login/', {
    email_or_phone: email,
    password,
  });
  return response.data;
};
