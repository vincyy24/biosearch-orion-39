
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

export default apiClient;
