
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
export const fetchPublications = async (page = 1, perPage = 10, query = '', filters = {}): Promise<Publication[]> => {
  try {
    const params = { page, per_page: perPage, query, ...filters };
    const response = await apiClient.get('/api/publications/', { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching publications:", error);
    return [];
  }
};

export const fetchMyPublications = async (page = 1, perPage = 10, query = ''): Promise<Publication[]> => {
  try {
    const params = { page, per_page: perPage, query, owner_only: true };
    const response = await apiClient.get('/api/publications/my/', { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching my publications:", error);
    return [];
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

export const registerPublication = async (data: any) => {
  try {
    const response = await apiClient.post('/api/publications/register/', data);
    return response.data;
  } catch (error) {
    console.error("Error registering publication:", error);
    throw error;
  }
};

export const uploadDatasetToPublication = async (doi: string, formData: FormData) => {
  try {
    const response = await apiClient.post(`/api/publications/${doi}/upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error uploading dataset to publication ${doi}:`, error);
    throw error;
  }
};

export const fetchPublicationAnalysis = async (doi: string) => {
  try {
    const response = await apiClient.get(`/api/publications/${doi}/analysis/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching publication analysis for DOI ${doi}:`, error);
    throw error;
  }
};

export const downloadDataset = async (datasetId: number) => {
  try {
    window.location.href = `${apiClient.defaults.baseURL}/api/datasets/${datasetId}/download/`;
    return true;
  } catch (error) {
    console.error(`Error downloading dataset ${datasetId}:`, error);
    return false;
  }
};

// CrossRef API for DOI verification
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

export interface DatasetTextUploadParams {
  title: string;
  description?: string;
  dataType: string;
  content: string;
  delimiter?: string;
  headers?: string[];
  accessLevel?: 'public' | 'private';
}

export const uploadDatasetAsText = async (doi: string, data: DatasetTextUploadParams) => {
  try {
    const response = await apiClient.post(`/api/publications/${doi}/upload-text/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error uploading text dataset to publication ${doi}:`, error);
    throw error;
  }
};

export const downloadDatasetWithFormat = async (datasetId: number, format: 'csv' | 'tsv' | 'txt', customDelimiter?: string) => {
  try {
    let url = `${apiClient.defaults.baseURL}/api/datasets/${datasetId}/download/?format=${format}`;
    if (format === 'txt' && customDelimiter) {
      url += `&delimiter=${encodeURIComponent(customDelimiter)}`;
    }
    window.location.href = url;
    return true;
  } catch (error) {
    console.error(`Error downloading dataset ${datasetId} with format ${format}:`, error);
    return false;
  }
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
