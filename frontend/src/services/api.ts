
import axios, { AxiosRequestConfig } from 'axios';

// Helper function to get cookies
export const getCookie = (name: string): string | undefined => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
};

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important: This ensures cookies are sent with requests
});

// Add a request interceptor to automatically add the CSRF token to requests
apiClient.interceptors.request.use((config: AxiosRequestConfig) => {
  // Get the CSRF token from cookies if it exists
  const csrfToken = getCookie('csrftoken');

  if (csrfToken && config.headers) {
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

// API Type Definitions
export interface Dataset {
  id: string;
  title: string;
  description?: string;
  author: string;
  date: string;
  category: string;
  access: 'public' | 'private';
  downloads: number;
  method?: string;
  electrode?: string;
  instrument?: string;
  experiment_type?: string;
}

export interface VoltammetryData {
  id: string;
  title: string;
  description: string;
  data: any[];
  metadata: {
    electrode: string;
    technique: string;
    scan_rate?: number;
    electrolyte?: string;
    reference_electrode?: string;
    date: string;
  };
}

export interface UserProfile {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  affiliation: string;
  bio: string;
  avatar_url: string;
  is_verified: boolean;
  publications_count: number;
  datasets_count: number;
  research_projects_count: number;
  date_joined: string;
  last_active: string;
  orcid_id?: string;
}

export interface UserSettings {
  email_notifications: boolean;
  display_name_preference: 'username' | 'full_name';
  default_visibility: 'public' | 'private';
  theme_preference: 'light' | 'dark' | 'system';
}

export interface NotificationItem {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
  link?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API endpoints - Datasets
export const fetchRecentDatasets = async (): Promise<PaginatedResponse<Dataset>> => {
  const response = await apiClient.get('/api/dashboard/recent-datasets/');
  return response.data;
};

export const fetchDatasetById = async (datasetId: string): Promise<Dataset> => {
  const response = await apiClient.get(`/api/dashboard/datasets/${datasetId}/`);
  return response.data;
};

export const fetchDatasetVersions = async (datasetId: string) => {
  const response = await apiClient.get(`/api/research/files/${datasetId}/versions/`);
  return response.data;
};

export const downloadDataset = async (fileId: string, format: 'csv' | 'xlsx' | 'json' = 'csv') => {
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

// API endpoints - Voltammetry
export const fetchVoltammetryData = async (experimentId: string): Promise<VoltammetryData> => {
  const response = await apiClient.get(`/api/dashboard/voltammetry/${experimentId}/`);
  return response.data;
};

export const fetchAllVoltammetryData = async (filters = {}): Promise<PaginatedResponse<VoltammetryData>> => {
  const response = await apiClient.get('/api/dashboard/voltammetry/', { params: filters });
  return response.data;
};

export const searchVoltammetryData = async (query: string, filters = {}): Promise<PaginatedResponse<VoltammetryData>> => {
  const params = { query, ...filters };
  const response = await apiClient.get('/api/dashboard/search-voltammetry/', { params });
  return response.data;
};

// API endpoints - Users
export const fetchUserProfile = async (username: string): Promise<UserProfile> => {
  const response = await apiClient.get(`/api/users/profile/${username}/`);
  return response.data;
};

export const fetchUserSettings = async (): Promise<UserSettings> => {
  const response = await apiClient.get('/api/users/settings/');
  return response.data;
};

export const updateUserSettings = async (settings: Partial<UserSettings>) => {
  const response = await apiClient.put('/api/users/settings/', settings);
  return response.data;
};

export const fetchUserNotifications = async (page = 1, perPage = 10): Promise<PaginatedResponse<NotificationItem>> => {
  const response = await apiClient.get('/api/users/notifications/', {
    params: { page, per_page: perPage }
  });
  return response.data;
};

export const markNotificationRead = async (notificationId: number) => {
  const response = await apiClient.put(`/api/users/notifications/${notificationId}/read/`);
  return response.data;
};

export const deleteNotification = async (notificationId: number) => {
  const response = await apiClient.delete(`/api/users/notifications/${notificationId}/`);
  return response.data;
};

export default apiClient;
