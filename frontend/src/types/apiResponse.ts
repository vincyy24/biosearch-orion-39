
export interface CrossrefAuthor {
  given: string;
  family: string;
  sequence: string;
  affiliation: Array<{
    name: string;
  }>;
  ORCID?: string;
}

export interface CrossrefLink {
  URL: string;
  "content-type": string;
  "content-version": string;
  "intended-application": string;
}

export interface CrossrefFunder {
  DOI?: string;
  name: string;
  "doi-asserted-by"?: string;
  award?: string[];
}

export interface CrossrefReference {
  key: string;
  doi?: string;
  "doi-asserted-by"?: string;
  unstructured?: string;
  volume?: string;
  "journal-title"?: string;
  "article-title"?: string;
  year?: string;
  author?: string;
  issue?: string;
  "first-page"?: string;
}

export interface CrossrefPublicationItem {
  title: string[];
  abstract?: string;
  author: CrossrefAuthor[];
  published: {
    'date-parts': number[][];
  };
  'container-title': string[];
  DOI: string;
  URL: string;
  publisher: string;
  type: string;
  page?: string;
  volume?: string;
  issue?: string;
  'is-referenced-by-count'?: number;
  'references-count'?: number;
  link?: CrossrefLink[];
  funder?: CrossrefFunder[];
  reference?: CrossrefReference[];
}

export interface CrossrefApiResponse {
  status: string;
  'message-type': string;
  'message-version': string;
  message: {
    items: CrossrefPublicationItem[];
    'items-per-page': number;
    query: {
      'start-index': number;
      'search-terms': string;
    };
    'total-results': number;
  };
}
