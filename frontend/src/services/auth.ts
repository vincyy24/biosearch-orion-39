import apiClient from './api';

export interface LoginResponse {
  user: {
    id: number;
    username: string;
    email: string;
    name?: string;
    role?: string;
  };
  token?: string;
  message?: string;
}

export interface CurrentUserResponse {
  id: number;
  username: string;
  email: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
  role?: string;
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
  const response = await apiClient.post('auth/login/', { email, password });
  return response.data;
};

export const logoutUser = async (): Promise<any> => {
  const response = await apiClient.post('auth/logout/');
  return response.data;
};

export const getCurrentUser = async (): Promise<CurrentUserResponse | null> => {
  try {
    const response = await apiClient.get('users/me/');
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
  const response = await apiClient.post('auth/signup/', {
    username,
    email,
    password,
  });
  return response.data;
};

// Updated to use the new endpoint for sending verification emails
export const sendVerificationEmail = async (email: string): Promise<any> => {
  const response = await apiClient.post('auth/send-verification-email/', {
    email,
  });
  return response.data;
};

// Updated to use the dedicated verification endpoint
export const verifyEmail = async (token: string, uid: string): Promise<any> => {
  const response = await apiClient.post('auth/verify-email/', {
    token,
    uid,
  });
  return response.data;
};

export const resetPassword = async (email: string): Promise<any> => {
  const response = await apiClient.post('auth/reset-password/', {
    email,
  });
  return response.data;
};

export const confirmResetPassword = async (uid: string, token: string, password: string): Promise<any> => {
  const response = await apiClient.post('auth/reset-password/confirm/', {
    uid,
    token,
    password,
  });
  return response.data;
};
