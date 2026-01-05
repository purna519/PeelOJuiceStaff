import api from './api';

export const login = async (email, password) => {
  const response = await api.post('/api/users/login/', {
    email_or_phone: email,
    password,
  });
  return response.data;
};

// Register new user
export const register = async (email, phoneNumber, password, confirmPassword, firstName, lastName) => {
  const response = await api.post('/api/users/register/', {
    email,
    phone_number: phoneNumber,
    password,
    confirm_password: confirmPassword,
    first_name: firstName,
    last_name: lastName,
  });
  return response.data;
};

// Verify OTP
export const verifyOTP = async (email, otp) => {
  const response = await api.post('/api/users/verify-otp/', {
    email,
    otp,
  });
  return response.data;
};

// Resend OTP
export const resendOTP = async email => {
  const response = await api.post('/api/users/resend-otp/', {email});
  return response.data;
};

// Request password reset OTP
export const requestPasswordReset = async (emailOrPhone) => {
  const response = await api.post('/api/users/password-reset/request/', {
    email_or_phone: emailOrPhone,
  });
  return response.data;
};

// Verify password reset OTP
export const verifyPasswordResetOTP = async (emailOrPhone, otp) => {
  const response = await api.post('/api/users/password-reset/verify/', {
    email_or_phone: emailOrPhone,
    otp,
  });
  return response.data;
};

// Confirm password reset with new password
export const confirmPasswordReset = async (emailOrPhone, newPassword) => {
  const response = await api.post('/api/users/password-reset/confirm/', {
    email_or_phone: emailOrPhone,
    new_password: newPassword,
  });
  return response.data;
};
