
import apiClient from './api';

export interface LoginResponse {
  user: {
    id: number;
    username: string;
    email: string;
  };
  token?: string;
  message?: string;
}

export interface CurrentUserResponse {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
  last_login?: string;
  date_joined?: string;
}

export interface RegistrationResponse {
  user: {
    id: number;
    username: string;
    email: string;
  };
  message: string;
}

export const loginUser = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await apiClient.post('/api/auth/login/', { email, password });
  return response.data;
};

export const logoutUser = async (): Promise<any> => {
  const response = await apiClient.post('/api/auth/logout/');
  return response.data;
};

export const getCurrentUser = async (): Promise<CurrentUserResponse | null> => {
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

export const registerUser = async (username: string, email: string, password: string): Promise<RegistrationResponse> => {
  const response = await apiClient.post('/api/users/create/', {
    username,
    email,
    password,
  });
  return response.data;
};

export const sendVerificationEmail = async (email: string): Promise<any> => {
  const response = await apiClient.post('/api/users/verify-email/', {
    email,
  });
  return response.data;
};

export const verifyEmail = async (token: string): Promise<any> => {
  const response = await apiClient.post('/api/users/verify-email/confirm/', {
    token,
  });
  return response.data;
};

export const resetPassword = async (email: string): Promise<any> => {
  const response = await apiClient.post('/api/users/reset-password/', {
    email,
  });
  return response.data;
};

export const confirmResetPassword = async (token: string, password: string): Promise<any> => {
  const response = await apiClient.post('/api/users/reset-password/confirm/', {
    token,
    password,
  });
  return response.data;
};
