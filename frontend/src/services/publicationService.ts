
import { Publication } from '@/types/common';
import apiClient from './api';
import { CrossrefApiResponse } from '@/types/apiResponse';
import axios from 'axios';

export interface PublicationFilters {
  is_public?: boolean;
  year?: number;
  sort_by?: string;
}

// Publication APIs
export const fetchPublications = async (page = 1, perPage = 10, query = '', filters = {}): Promise<Publication[] | null> => {
  try {
    const params = { page, per_page: perPage, query, ...filters };
    const response = await apiClient.get('/api/publications/', { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching publications:", error);
    return null;
  }
};

export const fetchMyPublications = async (page = 1, perPage = 10, query = ''): Promise<Publication[] | null> => {
  try {
    const params = { page, per_page: perPage, query, owner_only: true };
    const response = await apiClient.get('/api/publications/my/', { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching my publications:", error);
    return null;
  }
};

export const fetchPublicationDetails = async (doi: string): Promise<Publication | null> => {
  try {
    const response = await apiClient.get(`/api/publications/${doi}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching publication details for DOI ${doi}:`, error);
    return null;
  }
};

export const registerPublication = async (data) => {
  const response = await apiClient.post('/api/publications/register/', data);
  return response.data;
};

export const uploadDatasetToPublication = async (doi: string, formData: FormData) => {
  const response = await apiClient.post(`/api/publications/${doi}/upload/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
  return response.data;
};

export const fetchPublicationAnalysis = async (doi: string) => {
  const response = await apiClient.get(`/api/publications/${doi}/analysis/`);
  return response.data;
};

export const downloadDataset = async (datasetId: number) => {
  // For direct downloads, we'll use window.location
  window.location.href = `${apiClient.defaults.baseURL}/api/datasets/${datasetId}/download/`;
  return true;
};

// CrossRef API for DOI verification - these are external API calls, so we'll keep using axios directly
export const verifyDOI = async (doi: string): Promise<CrossrefApiResponse> => {
  try {
    const response = await axios.get(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
    return response.data;
  } catch (error) {
    console.error("Error verifying DOI:", error);
    throw error;
  }
};

export const searchCrossRefByDOI = async (doi: string): Promise<CrossrefApiResponse> => {
  try {
    const response = await axios.get(`https://api.crossref.org/works?filter=doi:${encodeURIComponent(doi)}`);
    return response.data;
  } catch (error) {
    console.error("Error searching DOI:", error);
    throw error;
  }
};

export const uploadDatasetAsText = async (
  doi: string,
  data: {
    title: string;
    description?: string;
    dataType: string;
    content: string;
    delimiter?: string;
    headers?: string[];
    accessLevel?: 'public' | 'private';
  }
) => {
  const response = await apiClient.post(`/api/publications/${doi}/upload-text/`, data);
  return response.data;
};

export const downloadDatasetWithFormat = async (datasetId: number, format: 'csv' | 'tsv' | 'txt', customDelimiter?: string) => {
  let url = `${apiClient.defaults.baseURL}/api/datasets/${datasetId}/download/?format=${format}`;
  if (format === 'txt' && customDelimiter) {
    url += `&delimiter=${encodeURIComponent(customDelimiter)}`;
  }
  window.location.href = url;
  return true;
};

export const updatePublicationVisibility = async (doi: string, isPublic: boolean) => {
  try {
    const response = await apiClient.patch(`/api/publications/${doi}/visibility/`, {
      is_public: isPublic
    });
    return response.data;
  } catch (error) {
    console.error(`Error updating publication visibility for DOI ${doi}:`, error);
    throw error;
  }
};
