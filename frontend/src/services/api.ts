// This file handles API requests to the Django backend

const API_BASE_URL = '/api';

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

export function getCookie(name: string) {
  let cookieValue: string = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

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
    return await response.json().then(data => data.data_types);
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
    const response = await fetch(`${API_BASE_URL}/dashboard/recent-datasets/`);

    if (!response.ok) {
      throw new Error('Failed to fetch recent datasets');
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching recent datasets:", error);
    throw error;
  }
};

// Authentication related functions
export const loginUser = async (email: string, password: string) => {
  try {
    const csrf_token = getCookie("csrftoken");

    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
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
    const csrf_token = getCookie("csrftoken");
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
    const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/auth/logout/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token,
      },
      credentials: 'include',
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

// ORCID related functions
export const verifyOrcidId = async (orcidId: string) => {
  try {
    const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/orcid/verify/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
      body: JSON.stringify({ orcid_id: orcidId }),
    });

    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error initiating ORCID verification:", error);
    throw error;
  }
};

export const confirmOrcidVerification = async (verificationCode: string) => {
  try {
    const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/orcid/confirm/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
      body: JSON.stringify({ verification_code: verificationCode }),
    });

    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error confirming ORCID verification:", error);
    throw error;
  }
};

export const fetchUserOrcidProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/orcid/profile/`, {
      credentials: 'include',
    });

    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching ORCID profile:", error);
    throw error;
  }
};

// DOI and publication related functions
export const fetchPublicationByDoi = async (doi: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/publications/doi/${doi}/`, {
      credentials: 'include',
    });
    
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching publication by DOI:", error);
    throw error;
  }
};

export const searchPublications = async (query: string, filters?: Record<string, string>) => {
  try {
    let url = `${API_BASE_URL}/publications/search/?query=${encodeURIComponent(query)}`;
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          url += `&${key}=${encodeURIComponent(value)}`;
        }
      });
    }
    
    const response = await fetch(url, {
      credentials: 'include',
    });
    
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error searching publications:", error);
    throw error;
  }
};

export const savePublicationToLibrary = async (publicationId: string) => {
  try {
    const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/publications/${publicationId}/save/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
    });
    
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error saving publication to library:", error);
    throw error;
  }
};

export const fetchUserSettings = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/settings/`, {
      credentials: 'include',
    });
    
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching user settings:", error);
    throw error;
  }
};

export const updateUserSettings = async (settings: Record<string, any>) => {
  try {
    const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/user/settings/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
      body: JSON.stringify(settings),
    });
    
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error updating user settings:", error);
    throw error;
  }
};

export const updatePassword = async (currentPassword: string, newPassword: string) => {
  try {
    const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/auth/password/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
      body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
    });
    
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};

export const registerPublication = async (publicationData) => {
  try {
    const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/publications/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
      body: JSON.stringify(publicationData),
    });

    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error registering publication:", error);
    throw error;
  }
};
