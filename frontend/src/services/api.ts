// This file handles API requests to the Django backend

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8000/api';

// Helper function to handle response errors consistently
const handleResponseErrors = async (response) => {
  if (!response.ok) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || response.statusText);
    } else {
      throw new Error(response.statusText);
    }
  }
  return response;
};

export const fetchPublicationsData = async () => {
  try {
    // Call the Django API to get publications data
    const response = await fetch(`${API_BASE_URL}/publications/`);
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching publications data:", error);
    throw error;
  }
};

export const fetchVisualizationUrl = (vizType: string) => {
  // This will return the URL to the Django-Plotly-Dash visualization
  return `${API_BASE_URL}/dash/app/${vizType}/`;
};

export const fetchDataTypes = async () => {
  try {
    // Get data types from Django API
    const response = await fetch(`${API_BASE_URL}/data-types/`);
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching data types:", error);
    throw error;
  }
};

export const fetchDataCategories = async () => {
  try {
    // Get data categories from Django API
    const response = await fetch(`${API_BASE_URL}/data-categories/`);
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching data categories:", error);
    throw error;
  }
};

export const uploadFile = async (formData: FormData, token: string) => {
  try {
    // Upload file to Django backend
    const response = await fetch(`${API_BASE_URL}/upload/`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
      credentials: 'include', // Include cookies for session authentication
    });
    
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

export const searchData = async (query: string, filters?: Record<string, string>) => {
  try {
    // Build query string with filters
    let queryString = `query=${encodeURIComponent(query)}`;
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryString += `&${key}=${encodeURIComponent(value)}`;
        }
      });
    }
    
    // Call the search API
    const response = await fetch(`${API_BASE_URL}/search/?${queryString}`, {
      credentials: 'include', // Include cookies for authentication
    });
    
    if (!response.ok) {
      throw new Error('Search failed');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error searching data:", error);
    throw error;
  }
};

export const downloadData = async (dataset: string, format: 'csv' | 'excel') => {
  try {
    // Use fetch with blob response to download the file
    const response = await fetch(`${API_BASE_URL}/download/?dataset=${encodeURIComponent(dataset)}&format=${format}`, {
      credentials: 'include', // Include cookies for authentication
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Download failed');
    }
    
    // Get the filename from the Content-Disposition header if available
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = `${dataset}.${format === 'excel' ? 'xlsx' : 'csv'}`;
    
    if (contentDisposition) {
      const filenameMatch = contentDisposition.match(/filename="(.+)"/);
      if (filenameMatch && filenameMatch[1]) {
        filename = filenameMatch[1];
      }
    }
    
    // Convert response to blob and download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    
    return { success: true, filename };
  } catch (error) {
    console.error("Error downloading data:", error);
    throw error;
  }
};

export const fetchVoltammetryData = async (experimentId?: string) => {
  try {
    const url = experimentId 
      ? `${API_BASE_URL}/voltammetry/${experimentId}/` 
      : `${API_BASE_URL}/voltammetry/`;
    
    const response = await fetch(url, {
      credentials: 'include', // Include cookies for authentication
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch voltammetry data');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching voltammetry data:", error);
    throw error;
  }
};

export const fetchRecentDatasets = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/recent-datasets/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch recent datasets');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching recent datasets:", error);
    throw error;
  }
};

// Updated authentication related functions with improved CSRF handling
export const loginUser = async (email: string, password: string) => {
  try {
    // First, get CSRF token
    const csrfResponse = await fetch(`${API_BASE_URL}/auth/csrf/`, {
      method: 'GET',
      credentials: 'include',
    });
    
    await handleResponseErrors(csrfResponse);
    const { csrf_token } = await csrfResponse.json();
    
    // Then perform login with CSRF token
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token,
      },
      credentials: 'include', // Important for cookies
      body: JSON.stringify({ email, password }),
    });

    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const signupUser = async (username: string, email: string, password: string) => {
  try {
    // First, get CSRF token
    const csrfResponse = await fetch(`${API_BASE_URL}/auth/csrf/`, {
      method: 'GET',
      credentials: 'include',
    });
    
    await handleResponseErrors(csrfResponse);
    const { csrf_token } = await csrfResponse.json();
    
    const response = await fetch(`${API_BASE_URL}/auth/signup/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token,
      },
      credentials: 'include',
      body: JSON.stringify({ username, email, password }),
    });

    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    // First, get CSRF token
    const csrfResponse = await fetch(`${API_BASE_URL}/auth/csrf/`, {
      method: 'GET',
      credentials: 'include',
    });
    
    await handleResponseErrors(csrfResponse);
    const { csrf_token } = await csrfResponse.json();
    
    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token,
      },
      credentials: 'include', // Important for cookies
    });

    await handleResponseErrors(response);
    return true;
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/profile/`, {
      credentials: 'include', // Important for cookies
    });

    if (response.status === 401) {
      // Unauthorized, user is not logged in
      return null;
    }
    
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const resetPassword = async (email: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/password-reset/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error || data.message || "Failed to send reset email";
      throw new Error(errorMessage);
    }

    return true;
  } catch (error) {
    console.error('Password reset error:', error);
    throw error;
  }
};

export const confirmResetPassword = async (token: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/password-reset/confirm/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token, password }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.error || data.message || "Failed to reset password";
      throw new Error(errorMessage);
    }

    return true;
  } catch (error) {
    console.error('Password reset confirmation error:', error);
    throw error;
  }
};
