
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: This ensures cookies are sent with requests
});

// Add a request interceptor to automatically add the CSRF token to requests
apiClient.interceptors.request.use(config => {
  // Get the CSRF token from cookies if it exists
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('csrftoken='))
    ?.split('=')[1];

  if (csrfToken) {
    config.headers['X-CSRFToken'] = csrfToken;
  }
  
  return config;
}, error => {
  return Promise.reject(error);
});

// Add a response interceptor to handle common response errors
apiClient.interceptors.response.use(
  response => response,
  error => {
    // Handle 401 Unauthorized errors (user not authenticated)
    if (error.response && error.response.status === 401) {
      // If we're already on the login page, don't redirect
      if (!window.location.pathname.includes('/login')) {
        console.log('Unauthorized request, redirecting to login');
        // Store the current location to redirect back after login
        sessionStorage.setItem('redirectAfterLogin', window.location.pathname);
        window.location.href = '/login';
      }
    }

    // Handle 403 Forbidden errors (user doesn't have permission)
    if (error.response && error.response.status === 403) {
      console.error('Forbidden request:', error.response.data);
    }

    // Handle 500 server errors
    if (error.response && error.response.status >= 500) {
      console.error('Server error:', error.response.data);
    }

    return Promise.reject(error);
  }
);

// Datasets API
export const fetchRecentDatasets = async () => {
  const response = await apiClient.get('/api/dashboard/recent-datasets/');
  return response.data;
};

export const fetchDatasetById = async (datasetId) => {
  const response = await apiClient.get(`/api/dashboard/datasets/${datasetId}/`);
  return response.data;
};

export const fetchDatasetVersions = async (datasetId) => {
  const response = await apiClient.get(`/api/research/files/${datasetId}/versions/`);
  return response.data;
};

export const downloadDataset = async (fileId, format = 'csv') => {
  const response = await apiClient.get(`/api/research/files/${fileId}/download/?format=${format}`, {
    responseType: 'blob'
  });
  
  // Create a download link
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  
  // Extract filename from Content-Disposition header if available
  const contentDisposition = response.headers['content-disposition'];
  let filename = `dataset_${fileId}.${format}`;
  
  if (contentDisposition) {
    const filenameMatch = contentDisposition.match(/filename="(.+)"/);
    if (filenameMatch) {
      filename = filenameMatch[1];
    }
  }
  
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  
  return response.data;
};

export const fetchVoltammetryData = async (experimentId) => {
  const response = await apiClient.get(`/api/dashboard/voltammetry/${experimentId}/`);
  return response.data;
};

export const fetchAllVoltammetryData = async (filters = {}) => {
  const response = await apiClient.get('/api/dashboard/voltammetry/', { params: filters });
  return response.data;
};

export const searchVoltammetryData = async (query, filters = {}) => {
  const params = { query, ...filters };
  const response = await apiClient.get('/api/dashboard/search-voltammetry/', { params });
  return response.data;
};

export const fetchUserProfile = async (username) => {
  const response = await apiClient.get(`/api/users/profile/${username}/`);
  return response.data;
};

// User settings and notifications
export const fetchUserSettings = async () => {
  const response = await apiClient.get('/api/users/settings/');
  return response.data;
};

export const updateUserSettings = async (settings) => {
  const response = await apiClient.put('/api/users/settings/', settings);
  return response.data;
};

export const fetchUserNotifications = async (page = 1, perPage = 10) => {
  const response = await apiClient.get('/api/users/notifications/', {
    params: { page, per_page: perPage }
  });
  return response.data;
};

export const markNotificationRead = async (notificationId) => {
  const response = await apiClient.put(`/api/users/notifications/${notificationId}/read/`);
  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await apiClient.delete(`/api/users/notifications/${notificationId}/`);
  return response.data;
};

export default apiClient;
