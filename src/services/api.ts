
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
