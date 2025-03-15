
// This file will handle API requests to the Django backend

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:8000/api';

export const fetchPublicationsData = async () => {
  try {
    // In development, this will call the Django API
    // For now, we'll return mock data until the Django backend is set up
    const mockData = [
      { id: 1, title: "Advancements in Genomic Research", author: "Dr. Jane Smith", year: 2023, citations: 45 },
      { id: 2, title: "Clinical Applications of CRISPR", author: "Dr. John Doe", year: 2022, citations: 78 },
      { id: 3, title: "New Frontiers in Cancer Treatment", author: "Dr. Sarah Johnson", year: 2023, citations: 32 },
      { id: 4, title: "Biomarkers for Early Disease Detection", author: "Dr. Michael Chen", year: 2021, citations: 102 },
      { id: 5, title: "Machine Learning in Drug Discovery", author: "Dr. Emily Brown", year: 2022, citations: 64 }
    ];
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockData;
    
    // Once Django backend is set up, uncomment this:
    // const response = await fetch(`${API_BASE_URL}/publications/`);
    // if (!response.ok) throw new Error('Failed to fetch publications');
    // return await response.json();
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
    // Simulate API call to get data types
    // In a real app, this would fetch from the Django backend
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock data types for now
    return [
      { id: 'protein', name: 'Protein' },
      { id: 'genome', name: 'Genome' },
      { id: 'pathway', name: 'Pathway' },
      { id: 'dataset', name: 'Dataset' },
      { id: 'voltammetry', name: 'Voltammetry Data' }
    ];
    
    // Once Django backend is set up, uncomment this:
    // const response = await fetch(`${API_BASE_URL}/data-types/`);
    // if (!response.ok) throw new Error('Failed to fetch data types');
    // return await response.json();
  } catch (error) {
    console.error("Error fetching data types:", error);
    throw error;
  }
};

export const uploadFile = async (formData: FormData, token: string) => {
  try {
    // In a real app, this would upload to the Django backend
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate successful upload
    return {
      message: 'File uploaded successfully',
      fileName: formData.get('file') ? (formData.get('file') as File).name : 'unknown',
      dataType: formData.get('dataType'),
    };
    
    // Once Django backend is set up, uncomment this:
    // const response = await fetch(`${API_BASE_URL}/upload/`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${token}`,
    //   },
    //   body: formData,
    // });
    
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.error || 'Upload failed');
    // }
    
    // return await response.json();
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};
