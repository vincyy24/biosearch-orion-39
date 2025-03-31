
import apiClient from './api';

export const loginUser = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/api/login/', { email, password }, {
      withCredentials: true, // Important: This allows cookies to be sent and stored
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const response = await apiClient.post('/api/logout/', {}, {
      withCredentials: true, // Important: This allows cookies to be sent
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/api/users/current/', {
      withCredentials: true, // Important: This allows cookies to be sent
    });
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
  try {
    const response = await apiClient.post('/api/users/create/', {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const sendVerificationEmail = async (email: string) => {
  try {
    const response = await apiClient.post('/api/users/verify-email/', {
      email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyEmail = async (token: string) => {
  try {
    const response = await apiClient.post('/api/users/verify-email/confirm/', {
      token,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const response = await apiClient.post('/api/users/reset-password/', {
      email,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const confirmResetPassword = async (token: string, password: string) => {
  try {
    const response = await apiClient.post('/api/users/reset-password/confirm/', {
      token,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
