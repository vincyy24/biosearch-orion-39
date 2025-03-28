
import axios from 'axios';

export interface CrossrefAuthor {
  given: string;
  family: string;
  sequence?: string;
  affiliation?: { name: string }[];
}

export interface DOIMetadata {
  title?: string[];
  author?: CrossrefAuthor[];
  publisher?: string;
  'container-title'?: string[]; // journal name
  issued?: { 'date-parts': number[][] };
  URL?: string;
  type?: string;
  abstract?: string;
  DOI?: string;
  subject?: string[];
  reference?: any[];
  'reference-count'?: number;
}

export const verifyDOI = async (doi: string): Promise<DOIMetadata | null> => {
  try {
    // Clean the DOI - remove any URL prefixes if present
    const cleanDoi = doi.replace(/^https?:\/\/doi.org\//, '');
    
    // Call Crossref API
    const response = await axios.get(`https://api.crossref.org/works/${cleanDoi}`, {
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

export const formatDOIMetadata = (metadata: DOIMetadata | null) => {
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
      affiliation: author.affiliation?.[0]?.name
    })) || [],
    publisher: metadata.publisher || 'Unknown Publisher',
    journal: metadata['container-title']?.[0] || 'Unknown Journal',
    year: metadata.issued?.['date-parts']?.[0]?.[0] || 'Unknown Year',
    url: metadata.URL || `https://doi.org/${metadata.DOI}`,
    type: metadata.type || 'Unknown Type',
    abstract: metadata.abstract || '',
    subjects: metadata.subject || [],
    doi: metadata.DOI || '',
    referenceCount: metadata['reference-count'] || 0
  };
};

export const searchPublicationsByDOI = async (doiList: string[]): Promise<any[]> => {
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
  
  return results.filter(Boolean);
};

export const getResearcherPublications = async (orcidId: string): Promise<any[]> => {
  try {
    // In a real implementation, this would query the Crossref API with the ORCID ID
    // For now, we'll simulate it with a dummy response
    // This would be replaced with actual Crossref API integration
    const response = await axios.get(`https://api.crossref.org/works?filter=orcid:${orcidId}`);
    
    if (response.status === 200 && response.data.message?.items) {
      return response.data.message.items.map(item => formatDOIMetadata(item));
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching researcher publications:', error);
    return [];
  }
};
