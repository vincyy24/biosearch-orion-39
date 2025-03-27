
// Common types used throughout the application

// User-related types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  profile_image?: string;
  date_joined: string;
  is_staff: boolean;
  orcid_id?: string;
  orcid_verified?: boolean;
  is_researcher?: boolean;
}

// Experiment-related types
export interface Experiment {
  experiment_id: string;
  title: string;
  description?: string;
  experiment_type: string;
  date_created: string;
  date_updated: string;
  scan_rate: number;
  electrode_material?: string;
  electrolyte?: string;
  temperature?: number;
  peak_anodic_current?: number;
  peak_cathodic_current?: number;
  peak_anodic_potential?: number;
  peak_cathodic_potential?: number;
  data_points: DataPoint[];
  version: number;
  is_latest_version: boolean;
  research_project_id?: string;
}

export interface DataPoint {
  potential: number;
  current: number;
  time: number;
}

// Search-related types
export interface SearchFilters {
  experiment_type?: string;
  electrode_material?: string;
  date_from?: string;
  date_to?: string;
  scan_rate_min?: number;
  scan_rate_max?: number;
}

export interface SearchResult {
  experiment_id: string;
  title: string;
  experiment_type: string;
  electrode_material?: string;
  date_created: string;
  scan_rate?: number;
}

export interface SearchResponse {
  results: SearchResult[];
  count: number;
}

// Publication-related types
export interface Publication {
  id: number;
  title: string;
  author: string;
  year: number;
  citations: number;
  doi?: string;
  abstract?: string;
}

// Analysis-related types
export interface AnalysisStep {
  type: string;
  parameters: Record<string, any>;
}

export interface AnalysisPipeline {
  id: number;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  analysis_steps: AnalysisStep[];
  config_options: Record<string, any>;
  created_by: number;
  is_public: boolean;
}

// API response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  count: number;
  num_pages: number;
  current_page: number;
  has_next: boolean;
  has_previous: boolean;
  results: T[];
}

// Form submission types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface ResetPasswordFormData {
  email: string;
}

export interface NewPasswordFormData {
  token: string;
  password: string;
  confirm_password: string;
}

// Notification types
export interface Notification {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

// New Research Project types
export interface ResearchProject {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  updated_at: string;
  head_researcher: User;
  collaborators: ResearchCollaborator[];
  status: 'active' | 'completed' | 'archived';
  is_public: boolean;
  related_publications?: Publication[];
}

export interface ResearchCollaborator {
  id: number;
  user: User;
  project: ResearchProject;
  role: 'viewer' | 'contributor' | 'manager';
  joined_at: string;
}

export interface DatasetComparison {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  datasets: string[]; // Array of experiment_ids
  comparison_results: Record<string, any>;
  created_by: number;
}

export interface OrcidVerificationRequest {
  orcid_id: string;
  verification_code?: string;
}

export interface OrcidProfile {
  orcid_id: string;
  name: string;
  biography?: string;
  education?: string[];
  employment?: string[];
  works?: {
    title: string;
    type: string;
    year: number;
    url?: string;
  }[];
}
