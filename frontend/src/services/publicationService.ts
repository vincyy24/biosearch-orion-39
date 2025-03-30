import { Publication } from '@/types/common';
import { getCookie } from './api';
import { CrossrefApiResponse } from '@/types/apiResponse';

export interface PublicationFilters {
  is_public?: boolean;
  year?: number;
  sort_by?: string;
}
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

// Publication APIs
export const fetchPublications: (page: number, perPage: number, query: string, filters: ) => Promise<Publication[]> = async (page = 1, perPage = 10, query = '', filters = {}) => {
  try {
    let url = `${API_BASE_URL}/publications/?page=${page}&per_page=${perPage}`;
    if (query) {
      url += `&query=${encodeURIComponent(query)}`;
    }
    
    // Add filters as query parameters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url += `&${key}=${encodeURIComponent(String(value))}`;
      }
    });
    
    const response = await fetch(url, {
      credentials: 'include',
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching publications:", error);
    throw error;
  }
};

export const fetchPublicationDetails = async (doi: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/publications/${doi}/`, {
      credentials: 'include',
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching publication details:", error);
    throw error;
  }
};

export const registerPublication = async (data: {
  doi: string;
  title: string;
  abstract?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  year?: number;
  publisher?: string;
  url?: string;
  is_public?: boolean;
  is_peer_reviewed?: boolean;
  researchers?: Array<{
    name: string;
    institution?: string;
    email?: string;
    orcid_id?: string;
  }>;
}) => {
  try {
    const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/publications/register/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error registering publication:", error);
    throw error;
  }
};

export const uploadDatasetToPublication = async (
  doi: string,
  formData: FormData
) => {
  try {
    const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/publications/${doi}/upload/`, {
      method: 'POST',
      headers: {
        'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
      body: formData,
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error uploading dataset to publication:", error);
    throw error;
  }
};

export const fetchPublicationAnalysis = async (doi: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/publications/${doi}/analysis/`, {
      credentials: 'include',
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching publication analysis:", error);
    throw error;
  }
};

export const downloadDataset = async (datasetId: number) => {
  try {
    // For direct downloads, we use window.location to trigger the browser's download
    window.location.href = `${API_BASE_URL}/datasets/${datasetId}/download/`;
    return true;
  } catch (error) {
    console.error("Error downloading dataset:", error);
    throw error;
  }
};

// CrossRef API for DOI verification
export const verifyDOI = async (doi: string): Promise<CrossrefApiResponse> => {
  try {
    const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
    if (!response.ok) {
      throw new Error(`DOI verification failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error verifying DOI:", error);
    throw error;
  }
};

export const searchCrossRefByDOI = async (doi: string): Promise<CrossrefApiResponse> => {
  try {
    const response = await fetch(`https://api.crossref.org/works?filter=doi:${encodeURIComponent(doi)}`);
    if (!response.ok) {
      throw new Error(`DOI search failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error searching DOI:", error);
    throw error;
  }
};

// Add a new function to upload data as text instead of file
export const uploadDatasetAsText = async (
  doi: string,
  data: {
    title: string;
    description?: string;
    dataType: string;
    content: string; // The parsed text content of the file
    delimiter?: string; // CSV, TSV or custom delimiter
    headers?: string[]; // Column headers if available
    accessLevel?: 'public' | 'private';
  }
) => {
  try {
    const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/publications/${doi}/upload-text/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error uploading dataset:", error);
    throw error;
  }
};

// Add a new function to download dataset in specific format
export const downloadDatasetWithFormat = async (datasetId: number, format: 'csv' | 'tsv' | 'txt', customDelimiter?: string) => {
  try {
    let url = `${API_BASE_URL}/datasets/${datasetId}/download/?format=${format}`;
    if (format === 'txt' && customDelimiter) {
      url += `&delimiter=${encodeURIComponent(customDelimiter)}`;
    }
    window.location.href = url;
    return true;
  } catch (error) {
    console.error("Error downloading dataset:", error);
    throw error;
  }
};
