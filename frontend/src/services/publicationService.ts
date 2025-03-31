
import apiClient from './api';
import { CrossrefApiResponse } from '@/types/apiResponse';

export interface PublicationFilters {
  is_public?: boolean;
  year?: number;
  sort_by?: string;
}

// Publication APIs
export const fetchPublications = async (page = 1, perPage = 10, query = '', filters = {}) => {
  const params = { page, per_page: perPage, query, ...filters };
  const response = await apiClient.get('/api/publications/', { params });
  return response.data;
};

export const fetchPublicationDetails = async (doi: string) => {
  const response = await apiClient.get(`/api/publications/${doi}/`);
  return response.data;
};

export const registerPublication = async (data) => {
  const response = await apiClient.post('/api/publications/register/', data);
  return response.data;
};

export const uploadDatasetToPublication = async (doi: string, formData: FormData) => {
  const response = await apiClient.post(`/api/publications/${doi}/upload/`, formData);
  return response.data;
};

export const fetchPublicationAnalysis = async (doi: string) => {
  const response = await apiClient.get(`/api/publications/${doi}/analysis/`);
  return response.data;
};

export const downloadDataset = async (datasetId: number) => {
  // For direct downloads, we use window.location to trigger the browser's download
  window.location.href = `/api/datasets/${datasetId}/download/`;
  return true;
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
  const response = await apiClient.post(`/api/publications/${doi}/upload-text/`, data);
  return response.data;
};

// Add a new function to download dataset in specific format
export const downloadDatasetWithFormat = async (datasetId: number, format: 'csv' | 'tsv' | 'txt', customDelimiter?: string) => {
  let url = `/api/datasets/${datasetId}/download/?format=${format}`;
  if (format === 'txt' && customDelimiter) {
    url += `&delimiter=${encodeURIComponent(customDelimiter)}`;
  }
  window.location.href = url;
  return true;
};
