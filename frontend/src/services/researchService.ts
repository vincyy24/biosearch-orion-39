
import apiClient from "./api";

// Research Project APIs
export const fetchResearchProjects = async (page = 1, pageSize = 10) => {
  const response = await apiClient.get('/api/research/projects/', {
    params: { page, page_size: pageSize }
  });
  return response.data;
};

export const createResearchProject = async (data: { title: string; description?: string; is_public?: boolean }) => {
  const response = await apiClient.post('/api/research/projects/', data);
  return response.data;
};

export const fetchResearchProjectDetails = async (projectId: string) => {
  const response = await apiClient.get(`/api/research/projects/${projectId}/`);
  return response.data;
};

export const updateResearchProject = async (
  projectId: string,
  data: { title?: string; description?: string; is_public?: boolean; status?: string }
) => {
  const response = await apiClient.put(`/api/research/projects/${projectId}/`, data);
  return response.data;
};

export const deleteResearchProject = async (projectId: string) => {
  const response = await apiClient.delete(`/api/research/projects/${projectId}/`);
  return response.data;
};

// Collaborator Management APIs
export const addCollaborator = async (
  projectId: string,
  data: { username_or_email: string; role?: string }
) => {
  const response = await apiClient.post(`/api/research/projects/${projectId}/collaborators/add/`, data);
  return response.data;
};

export const updateCollaborator = async (
  projectId: string,
  collaboratorId: number,
  data: { role: string }
) => {
  const response = await apiClient.put(`/api/research/projects/${projectId}/collaborators/${collaboratorId}/`, data);
  return response.data;
};

export const removeCollaborator = async (projectId: string, collaboratorId: number) => {
  const response = await apiClient.delete(`/api/research/projects/${projectId}/collaborators/${collaboratorId}/`);
  return response.data;
};

// Experiment Management APIs
export const assignExperiment = async (projectId: string, experimentId: string) => {
  const response = await apiClient.post(`/api/research/projects/${projectId}/experiments/assign/`, { 
    experiment_id: experimentId 
  });
  return response.data;
};

// Dataset Comparison APIs
export const createDatasetComparison = async (
  data: {
    title: string;
    description?: string;
    dataset_ids: string[];
    is_public?: boolean;
    project_id?: string;
  }
) => {
  const url = data.project_id
    ? `/api/research/projects/${data.project_id}/comparisons/`
    : `/api/research/comparisons/`;

  const response = await apiClient.post(url, {
    title: data.title,
    description: data.description,
    dataset_ids: data.dataset_ids,
    is_public: data.is_public
  });
  return response.data;
};

export const fetchDatasetComparisons = async (projectId?: string, page = 1, pageSize = 10) => {
  const url = projectId
    ? `/api/research/projects/${projectId}/comparisons/`
    : `/api/research/comparisons/`;

  const response = await apiClient.get(url, {
    params: { page, page_size: pageSize }
  });
  return response.data;
};

export const fetchComparisonDetails = async (comparisonId: string) => {
  const response = await apiClient.get(`/api/research/comparisons/${comparisonId}/`);
  return response.data;
};

// ORCID Verification APIs
export const initiateOrcidVerification = async (orcidId: string) => {
  const response = await apiClient.post('/api/orcid/verify/', { orcid_id: orcidId });
  return response.data;
};

export const confirmOrcidVerification = async (verificationCode: string) => {
  const response = await apiClient.post('/api/orcid/confirm/', { verification_code: verificationCode });
  return response.data;
};

export const getOrcidProfile = async () => {
  const response = await apiClient.get('/api/orcid/profile/');
  return response.data;
};

// Invite collaborator
export const inviteCollaborator = async (projectId: string, data: { email?: string; orcid_id?: string; role?: string }) => {
  const response = await apiClient.post(`/api/research/projects/${projectId}/invite/`, data);
  return response.data;
};

// Research file management
export const uploadResearchFile = async (projectId: string, formData: FormData) => {
  const response = await apiClient.post(`/api/research/projects/${projectId}/upload/`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  });
  return response.data;
};

export const fetchResearchVersions = async (projectId: string) => {
  const response = await apiClient.get(`/api/research/projects/${projectId}/versions/`);
  return response.data;
};
