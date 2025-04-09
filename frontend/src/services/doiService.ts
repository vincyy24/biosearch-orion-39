import axios from 'axios';
import { CrossrefApiResponse } from '@/types/apiResponse';
import apiClient from './api';

export interface CrossrefAuthor {
  given: string;
  family: string;
  sequence?: string;
  affiliation?: { name: string }[];
  ORCID?: string;
  "authenticated-orcid"?: boolean;
}

export interface DOIMetadata {
  title?: string[];
  author?: CrossrefAuthor[];
  publisher?: string;
  'container-title'?: string[];
  issued?: { 'date-parts': number[][] };
  URL?: string;
  type?: string;
  abstract?: string;
  DOI?: string;
  subject?: string[];
  reference?: any[];
  'reference-count'?: number;
  funder?: {
    DOI: string;
    name: string;
    "doi-asserted-by": string;
    award?: string[];
  }[];
}

export const verifyDOI = async (doi: string): Promise<DOIMetadata | null> => {
  try {
    // Clean the DOI - remove any URL prefixes if present
    const cleanDoi = doi.replace(/^https?:\/\/doi.org\//, '');
    
    // Call Crossref API - external API so we keep using axios directly
    const response = await axios.get<CrossrefApiResponse>(`https://api.crossref.org/works/${cleanDoi}`, {
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (response.status === 200 && response.data.message) {
      return response.data.message as DOIMetadata;
    }
    
    return null;
  } catch (error) {
    console.error('Error verifying DOI:', error);
    return null;
  }
};

export interface FormattedDOIMetadata {
  title: string;
  mainAuthor: string;
  authors: {
    name: string;
    isMain: boolean;
    affiliation?: string;
    ORCID?: string;
  }[];
  publisher: string;
  journal: string;
  year: number | string;
  url: string;
  type: string;
  abstract: string;
  subjects: string[];
  doi: string;
  referenceCount: number;
  funders?: {
    name: string;
    award?: string[];
  }[];
}

export const formatDOIMetadata = (metadata: DOIMetadata | null): FormattedDOIMetadata | null => {
  if (!metadata) return null;
  
  // Get main author (sequence=first) or the first author in the list
  const mainAuthor = metadata.author?.find(a => a.sequence === 'first') || metadata.author?.[0];
  const otherAuthors = metadata.author?.filter(a => a !== mainAuthor) || [];
  
  return {
    title: metadata.title?.[0] || 'Unknown Title',
    mainAuthor: mainAuthor ? `${mainAuthor.given} ${mainAuthor.family}` : 'Unknown Author',
    authors: metadata.author?.map(author => ({
      name: `${author.given} ${author.family}`,
      isMain: author === mainAuthor,
      affiliation: author.affiliation?.[0]?.name,
      ORCID: author.ORCID
    })) || [],
    publisher: metadata.publisher || 'Unknown Publisher',
    journal: metadata['container-title']?.[0] || 'Unknown Journal',
    year: metadata.issued?.['date-parts']?.[0]?.[0] || 'Unknown Year',
    url: metadata.URL || `https://doi.org/${metadata.DOI}`,
    type: metadata.type || 'Unknown Type',
    abstract: metadata.abstract || '',
    subjects: metadata.subject || [],
    doi: metadata.DOI || '',
    referenceCount: metadata['reference-count'] || 0,
    funders: metadata.funder?.map(funder => ({
      name: funder.name,
      award: funder.award
    }))
  };
};

export const searchPublicationsByDOI = async (doiList: string[]): Promise<FormattedDOIMetadata[]> => {
  const results = await Promise.all(
    doiList.map(async (doi) => {
      try {
        const metadata = await verifyDOI(doi);
        return metadata ? formatDOIMetadata(metadata) : null;
      } catch (error) {
        console.error(`Error fetching DOI ${doi}:`, error);
        return null;
      }
    })
  );
  
  return results.filter(Boolean) as FormattedDOIMetadata[];
};

export const getResearcherPublications = async (orcidId: string): Promise<FormattedDOIMetadata[]> => {
  try {
    // For ORCID publications, call our backend API
    const response = await apiClient.get(`/api/orcid/publications/${orcidId}`);
    
    if (response.status === 200 && response.data) {
      return response.data.items.map((item: any) => formatDOIMetadata(item)).filter(Boolean) as FormattedDOIMetadata[];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching researcher publications:', error);
    return [];
  }
};
