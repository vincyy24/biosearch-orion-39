import axios from 'axios';
import { toast } from '@/components/ui/use-toast';

// Create an Axios instance with defaults
const apiClient = axios.create({
  baseURL: '/api/v0/',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CSRF cookies
});

// Request interceptor for API calls
apiClient.interceptors.request.use(
  async (config) => {
    // For non-GET requests, ensure we have a CSRF token
    try {
      // Get CSRF token if not already in headers
      if (!config.headers['X-CSRFToken']) {
        const cookies = document.cookie.split('; ');
        const csrfCookie = cookies.find(cookie => cookie.startsWith('csrftoken='));
        const csrfToken = csrfCookie ? csrfCookie.split('=')[1] : null;
        config.headers['X-CSRFToken'] = csrfToken;
      }
    } catch (error) {
      console.error('Failed to find CSRF token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const statusCode = error.response ? error.response.status : null;

    // Handle specific error codes
    if (statusCode === 401) {
      // Unauthorized - could redirect to login
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please log in to continue.",
      });
    } else if (statusCode === 403) {
      // Forbidden
      toast({
        variant: "destructive",
        title: "Access denied",
        description: "You don't have permission to access this resource.",
      });
    } else if (statusCode === 404) {
      // Not found
      toast({
        variant: "destructive",
        title: "Resource not found",
        description: "The requested resource could not be found.",
      });
    } else if (statusCode === 429) {
      // Too many requests
      toast({
        variant: "destructive",
        title: "Rate limit exceeded",
        description: "Please try again later.",
      });
    } else if (statusCode >= 500) {
      // Server errors
      toast({
        variant: "destructive",
        title: "Server error",
        description: "An unexpected server error occurred. Please try again later.",
      });
    }

    return Promise.reject(error);
  }
);

export default apiClient;