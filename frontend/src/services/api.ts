
import axios from 'axios';

const API_BASE_URL = '/api';

// Create axios instance with CSRF token support
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CSRF token
});

// Intercept requests to add CSRF token
apiClient.interceptors.request.use(async (config) => {
  // Get CSRF token from API or use from cookie
  try {
    const { data } = await axios.get(`${API_BASE_URL}/csrf-token/`);
    config.headers['X-CSRFToken'] = data.csrf_token;
  } catch (error) {
    console.error('Error fetching CSRF token:', error);
  }
  return config;
});

// Auth API endpoints
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/login/', { email, password });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Login failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

export const signupUser = async (username: string, email: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/signup/', { username, email, password });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Signup failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

export const logoutUser = async () => {
  try {
    const response = await apiClient.post('/auth/logout/');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    // Even if the server request fails, we'll consider the user logged out locally
  }
};

export const verifyEmail = async (uid: string, token: string) => {
  try {
    const response = await apiClient.post('/auth/verify-email/', { uid, token });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Email verification failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

export const resetPassword = async (email: string) => {
  try {
    const response = await apiClient.post('/auth/password-reset/', { email });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Password reset request failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

export const confirmResetPassword = async (uid: string, token: string, password: string) => {
  try {
    const response = await apiClient.post('/auth/password-reset/confirm/', { uid, token, password });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Password reset confirmation failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getUserProfile = async () => {
  try {
    const response = await apiClient.get('/auth/profile/');
    return response.data;
  } catch (error) {
    // If 401 Unauthorized, the user is not logged in
    if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
      return null;
    }
    console.error('Error fetching user profile:', error);
    throw error;
  }
};

export const updateUserProfile = async (profileData: any) => {
  try {
    const response = await apiClient.put('/auth/profile/', profileData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Profile update failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

export const updateUsername = async (username: string) => {
  try {
    const response = await apiClient.put('/auth/update-username/', { username });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Username update failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

export const updatePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const response = await apiClient.put('/auth/update-password/', { current_password: currentPassword, new_password: newPassword });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Password update failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

export const deleteAccount = async (password: string) => {
  try {
    const response = await apiClient.post('/auth/delete-account/', { password });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Account deletion failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Research project API endpoints
export const getResearchProjects = async () => {
  try {
    const response = await apiClient.get('/research/projects/');
    return response.data;
  } catch (error) {
    console.error('Error fetching research projects:', error);
    throw error;
  }
};

export const getResearchProjectDetail = async (id: string) => {
  try {
    const response = await apiClient.get(`/research/projects/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching research project detail:', error);
    throw error;
  }
};

export const createResearchProject = async (projectData: any) => {
  try {
    const response = await apiClient.post('/research/projects/', projectData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Project creation failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

export const inviteCollaborator = async (projectId: string, inviteData: any) => {
  try {
    const response = await apiClient.post(`/research/projects/${projectId}/invite/`, inviteData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Invitation failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Publication API endpoints
export const getPublications = async () => {
  try {
    const response = await apiClient.get('/publications/');
    return response.data;
  } catch (error) {
    console.error('Error fetching publications:', error);
    throw error;
  }
};

export const getPublicationDetail = async (id: string) => {
  try {
    const response = await apiClient.get(`/publications/${id}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching publication detail:', error);
    throw error;
  }
};

export const registerPublication = async (publicationData: any) => {
  try {
    const response = await apiClient.post('/publications/register/', publicationData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Publication registration failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

// File upload API endpoints
export const uploadFile = async (formData: FormData) => {
  try {
    const response = await apiClient.post('/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'File upload failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getDataTypes = async () => {
  try {
    const response = await apiClient.get('/data-types/');
    return response.data;
  } catch (error) {
    console.error('Error fetching data types:', error);
    throw error;
  }
};

export const getDataCategories = async () => {
  try {
    const response = await apiClient.get('/data-categories/');
    return response.data;
  } catch (error) {
    console.error('Error fetching data categories:', error);
    throw error;
  }
};

// Search API endpoints
export const search = async (query: string, params?: any) => {
  try {
    const response = await apiClient.get('/search/', { params: { query, ...params } });
    return response.data;
  } catch (error) {
    console.error('Error performing search:', error);
    throw error;
  }
};

export const advancedSearch = async (params: any) => {
  try {
    const response = await apiClient.get('/advanced-search/', { params });
    return response.data;
  } catch (error) {
    console.error('Error performing advanced search:', error);
    throw error;
  }
};

// User API endpoints
export const searchUsers = async (query: string) => {
  try {
    const response = await apiClient.get('/users/search/', { params: { query } });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error);
    throw error;
  }
};

export const getUserPublicProfile = async (username: string) => {
  try {
    const response = await apiClient.get(`/users/profile/${username}/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user public profile:', error);
    throw error;
  }
};

// Notification API endpoints
export const getUserNotifications = async (params?: any) => {
  try {
    const response = await apiClient.get('/notifications/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    throw error;
  }
};

export const markNotificationAsRead = async (id: number) => {
  try {
    const response = await apiClient.put(`/notifications/${id}/`, { is_read: true });
    return response.data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await apiClient.put('/notifications/', { mark_all_read: true });
    return response.data;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    throw error;
  }
};

// Settings API endpoints
export const getUserSettings = async () => {
  try {
    const response = await apiClient.get('/user/settings/');
    return response.data;
  } catch (error) {
    console.error('Error fetching user settings:', error);
    throw error;
  }
};

export const updateUserSettings = async (settingsData: any) => {
  try {
    const response = await apiClient.put('/user/settings/', settingsData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Settings update failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

export const getNotificationSettings = async () => {
  try {
    const response = await apiClient.get('/notifications/settings/');
    return response.data;
  } catch (error) {
    console.error('Error fetching notification settings:', error);
    throw error;
  }
};

export const updateNotificationSettings = async (settingsData: any) => {
  try {
    const response = await apiClient.put('/notifications/settings/', settingsData);
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      throw new Error(error.response.data.error || 'Notification settings update failed');
    }
    throw new Error('Network error. Please try again.');
  }
};

// Analytics API endpoints
export const getAnalyticsOverview = async () => {
  try {
    const response = await apiClient.get('/analytics/overview/');
    return response.data;
  } catch (error) {
    console.error('Error fetching analytics overview:', error);
    throw error;
  }
};

export const getResearchAnalytics = async () => {
  try {
    const response = await apiClient.get('/analytics/research/');
    return response.data;
  } catch (error) {
    console.error('Error fetching research analytics:', error);
    throw error;
  }
};

export const getPublicationAnalytics = async () => {
  try {
    const response = await apiClient.get('/analytics/publications/');
    return response.data;
  } catch (error) {
    console.error('Error fetching publication analytics:', error);
    throw error;
  }
};

export const getDatasetAnalytics = async () => {
  try {
    const response = await apiClient.get('/analytics/datasets/');
    return response.data;
  } catch (error) {
    console.error('Error fetching dataset analytics:', error);
    throw error;
  }
};

export default apiClient;
