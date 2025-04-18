
import apiClient from "./api";

interface ResearchProject {
  id: string;
  title: string;
  description?: string;
  is_public?: boolean;
  status?: string;
}

// Research Project APIs
export const fetchResearchProjects = async (page = 1, pageSize = 10) => {
  try {
    const response = await apiClient.get('research/', {
      params: { page, page_size: pageSize }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching research projects:", error);
    return { results: [], count: 0 };
  }
};

export const fetchPublicResearchProjects = async (page = 1, pageSize = 10) => {
  try {
    const response = await apiClient.get('research/public/', {
      params: { page, page_size: pageSize }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching public research projects:", error);
    return { results: [], count: 0 };
  }
};

export const createResearchProject = async (data: { title: string; description?: string; is_public?: boolean; }) => {
  try {
    const response = await apiClient.post('research/', data);
    return response.data;
  } catch (error) {
    console.error("Error creating research project:", error);
    throw error;
  }
};

export const fetchResearchProjectDetails = async (projectId: string) => {
  try {
    const response = await apiClient.get(`research/${projectId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project ${projectId} details:`, error);
    throw error;
  }
};

export const updateResearchProject = async (
  projectId: string,
  data: { title?: string; description?: string; is_public?: boolean; status?: string; }
) => {
  try {
    const response = await apiClient.put(`research/${projectId}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating project ${projectId}:`, error);
    throw error;
  }
};

// export const updateResearchVisibility = async (projectId: string, isPublic: boolean) => {
//   try {
//     const response = await apiClient.patch(`research/${projectId}/visibility/`, {
//       is_public: isPublic
//     });
//     return response.data;
//   } catch (error) {
//     console.error(`Error updating project ${projectId} visibility:`, error);
//     throw error;
//   }
// };

export const deleteResearchProject = async (projectId: string) => {
  try {
    const response = await apiClient.delete(`research/${projectId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting project ${projectId}:`, error);
    throw error;
  }
};

// Collaborator Management APIs
export const addCollaborator = async (
  projectId: string,
  data: { username_or_email: string; role?: string; }
) => {
  try {
    const response = await apiClient.post(`research/${projectId}/collaborators/add/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error adding collaborator to project ${projectId}:`, error);
    throw error;
  }
};

export const updateCollaborator = async (
  projectId: string,
  collaboratorId: number,
  data: { role: string; }
) => {
  try {
    const response = await apiClient.put(`research/${projectId}/collaborators/${collaboratorId}/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error updating collaborator ${collaboratorId} in project ${projectId}:`, error);
    throw error;
  }
};

export const removeCollaborator = async (projectId: string, collaboratorId: number) => {
  try {
    const response = await apiClient.delete(`research/${projectId}/collaborators/${collaboratorId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error removing collaborator ${collaboratorId} from project ${projectId}:`, error);
    throw error;
  }
};

// Experiment Management APIs
export const assignExperiment = async (projectId: string, experimentId: string) => {
  try {
    const response = await apiClient.post(`research/${projectId}/experiments/assign/`, {
      experiment_id: experimentId
    });
    return response.data;
  } catch (error) {
    console.error(`Error assigning experiment ${experimentId} to project ${projectId}:`, error);
    throw error;
  }
};

// Dataset Comparison APIs
export const createDatasetComparison = async (
  data: {
    title: string;
    description?: string;
    dataset_ids: string[];
    is_public?: boolean;
    research_id?: string;
  }
) => {
  try {
    const url = data.research_id
      ? `research/${data.research_id}/comparisons/`
      : `research/comparisons/`;

    const response = await apiClient.post(url, {
      title: data.title,
      description: data.description,
      dataset_ids: data.dataset_ids,
      is_public: data.is_public
    });
    return response.data;
  } catch (error) {
    console.error("Error creating dataset comparison:", error);
    throw error;
  }
};

export const fetchDatasetComparisons = async (projectId?: string, page = 1, pageSize = 10) => {
  try {
    const url = projectId
      ? `research/${projectId}/comparisons/`
      : `research/comparisons/`;

    const response = await apiClient.get(url, {
      params: { page, page_size: pageSize }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dataset comparisons:", error);
    return { results: [], count: 0 };
  }
};

export const fetchComparisonDetails = async (comparisonId: string) => {
  try {
    const response = await apiClient.get(`research/comparisons/${comparisonId}/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching comparison ${comparisonId} details:`, error);
    throw error;
  }
};

// ORCID Verification APIs
export const initiateOrcidVerification = async (orcidId: string) => {
  try {
    const response = await apiClient.post('orcid/verify/', { orcid_id: orcidId });
    return response.data;
  } catch (error) {
    console.error("Error initiating ORCID verification:", error);
    throw error;
  }
};

export const confirmOrcidVerification = async (verificationCode: string) => {
  try {
    const response = await apiClient.post('orcid/confirm/', { verification_code: verificationCode });
    return response.data;
  } catch (error) {
    console.error("Error confirming ORCID verification:", error);
    throw error;
  }
};

export const getOrcidProfile = async () => {
  try {
    const response = await apiClient.get('orcid/profile/');
    return response.data;
  } catch (error) {
    console.error("Error getting ORCID profile:", error);
    throw error;
  }
};

// Invite collaborator
export const inviteCollaborator = async (projectId: string, data: { email?: string; orcid_id?: string; role?: string; }) => {
  try {
    const response = await apiClient.post(`research/${projectId}/invite/`, data);
    return response.data;
  } catch (error) {
    console.error(`Error inviting collaborator to project ${projectId}:`, error);
    throw error;
  }
};

// Research file management
export const uploadResearchFile = async (projectId: string, formData: FormData) => {
  try {
    const response = await apiClient.post(`research/${projectId}/upload/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  } catch (error) {
    console.error(`Error uploading file to project ${projectId}:`, error);
    throw error;
  }
};

export const fetchResearchVersions = async (projectId: string) => {
  try {
    const response = await apiClient.get(`research/${projectId}/versions/`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching versions for project ${projectId}:`, error);
    throw error;
  }
};
