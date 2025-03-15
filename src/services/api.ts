
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
