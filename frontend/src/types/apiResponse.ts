interface DateParts {
    "date-parts": number[][];
    "date-time"?: string;
    timestamp?: number;
    version?: string;
}

interface Funder {
    DOI: string;
    name: string;
    "doi-asserted-by": string;
    award?: string[];
    id: Array<{
        id: string;
        "id-type": string;
        "asserted-by": string;
    }>;
}

interface ContentDomain {
    domain: string[];
    "crossmark-restriction": boolean;
}

interface Author {
    given: string;
    family: string;
    sequence: string;
    affiliation: Array<{ name: string }>;
    ORCID?: string;
    "authenticated-orcid"?: boolean;
}

interface Reference {
    key: string;
    "doi-asserted-by"?: string;
    DOI?: string;
    "volume-title"?: string;
    volume?: string;
    author?: string;
    year?: string;
    "journal-title"?: string;
    "first-page"?: string;
    unstructured?: string;
}

interface Link {
    URL: string;
    "content-type"?: string;
    "content-version"?: string;
    "intended-application"?: string;
}

interface Resource {
    primary: {
        URL: string;
    };
}

interface IssnType {
    type: string;
    value: string;
}

interface Assertion {
    value: string;
    order: number;
    name: string;
    label: string;
    group: {
        name: string;
        label: string;
    };
}

interface Message {
    indexed: DateParts;
    "reference-count": number;
    publisher: string;
    issue?: string;
    funder?: Funder[];
    "content-domain": ContentDomain;
    "short-container-title": string[];
    "published-print": DateParts;
    DOI: string;
    type: string;
    created: DateParts;
    page: string;
    source: string;
    "is-referenced-by-count": number;
    title: string[];
    prefix: string;
    volume: string;
    author: Author[];
    member: string;
    "published-online": DateParts;
    reference?: Reference[];
    "container-title": string[];
    "original-title": string[];
    language: string;
    link: Link[];
    deposited: DateParts;
    score: number;
    resource: Resource;
    subtitle: string[];
    "short-title": string[];
    issued: DateParts;
    "references-count": number;
    "journal-issue"?: {
        issue: string;
        "published-print"?: DateParts;
    };
    "alternative-id": string[];
    URL: string;
    relation: Record<string, unknown>;
    ISSN?: string[];
    "issn-type"?: IssnType[];
    subject: string[];
    published: DateParts;
    
    // Optional fields from second version
    license?: Array<{
        start: DateParts;
        "content-version": string;
        "delay-in-days": number;
        URL: string;
    }>;
    abstract?: string;
    "update-policy"?: string;
    archive?: string[];
    assertion?: Assertion[];
}

export interface ApiResponse {
    status: string;
    "message-type": string;
    "message-version": string;
    message: Message;
}