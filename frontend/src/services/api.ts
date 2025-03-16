
// This file handles API requests to the Django backend

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8000/api';

export const fetchPublicationsData = async () => {
  try {
    // Call the Django API to get publications data
    const response = await fetch(`${API_BASE_URL}/publications/`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch publications');
    }
    
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
    
    if (!response.ok) {
      throw new Error('Failed to fetch data types');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching data types:", error);
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
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Upload failed');
    }
    
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
    const response = await fetch(`${API_BASE_URL}/search/?${queryString}`);
    
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
    const response = await fetch(`${API_BASE_URL}/download/?dataset=${encodeURIComponent(dataset)}&format=${format}`);
    
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
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error('Failed to fetch voltammetry data');
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching voltammetry data:", error);
    throw error;
  }
};
