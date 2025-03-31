
import apiClient from './api';

export const loginUser = async (email: string, password: string) => {
  const response = await apiClient.post('/api/login/', { email, password });
  return response.data;
};

export const logoutUser = async () => {
  const response = await apiClient.post('/api/logout/');
  return response.data;
};

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/api/users/current/');
    return response.data;
  } catch (error) {
    // If 401 Unauthorized, the user is not logged in
    if (error.response && error.response.status === 401) {
      return null;
    }
    throw error;
  }
};

export const registerUser = async (username: string, email: string, password: string) => {
  const response = await apiClient.post('/api/users/create/', {
    username,
    email,
    password,
  });
  return response.data;
};

export const sendVerificationEmail = async (email: string) => {
  const response = await apiClient.post('/api/users/verify-email/', {
    email,
  });
  return response.data;
};

export const verifyEmail = async (token: string) => {
  const response = await apiClient.post('/api/users/verify-email/confirm/', {
    token,
  });
  return response.data;
};

export const resetPassword = async (email: string) => {
  const response = await apiClient.post('/api/users/reset-password/', {
    email,
  });
  return response.data;
};

export const confirmResetPassword = async (token: string, password: string) => {
  const response = await apiClient.post('/api/users/reset-password/confirm/', {
    token,
    password,
  });
  return response.data;
};
