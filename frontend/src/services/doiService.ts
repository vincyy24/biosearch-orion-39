
import axios from 'axios';

interface DOIMetadata {
  title: string;
  authors: { given: string; family: string }[];
  publisher: string;
  'container-title': string; // journal name
  issued: { 'date-parts': number[][] };
  URL: string;
  type: string;
}

export const verifyDOI = async (doi: string): Promise<DOIMetadata | null> => {
  try {
    // DOI.org API endpoint
    const response = await axios.get(`https://api.crossref.org/works/${doi}`, {
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
  
  return {
    title: metadata.title?.[0] || 'Unknown Title',
    authors: metadata.authors?.map(author => `${author.given} ${author.family}`).join(', ') || 'Unknown Authors',
    publisher: metadata.publisher || 'Unknown Publisher',
    journal: metadata['container-title']?.[0] || 'Unknown Journal',
    year: metadata.issued?.['date-parts']?.[0]?.[0] || 'Unknown Year',
    url: metadata.URL || '',
    type: metadata.type || 'Unknown Type'
  };
};
