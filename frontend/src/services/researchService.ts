import apiClient from "./api";

const API_BASE_URL = '/api';

// Helper function to handle response errors consistently
const handleResponseErrors = async (response) => {
  if (!response.ok) {
    const contentType = response.headers.get("content-type");

    if (contentType && contentType.indexOf("application/json") !== -1) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || response.statusText);
    } else {
      throw new Error(response.statusText);
    }
  }
  return response;
};

// Research Project APIs
export const fetchResearchProjects = async (page = 1, pageSize = 10) => {
  try {
    const response = await fetch(`${API_BASE_URL}/research/projects/?page=${page}&page_size=${pageSize}`, {
      credentials: 'include',
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching research projects:", error);
    throw error;
  }
};

export const createResearchProject = async (data: { title: string; description?: string; is_public?: boolean }) => {
  try {
    // const csrf_token = getCookie("csrftoken");
    const response = await apiClient.post('/research/projects/', {...data}, {withCredentials: true});
    return await response.data;
  } catch (error) {
    console.error("Error creating research project:", error);
    throw error;
  }
};

export const fetchResearchProjectDetails = async (projectId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/research/projects/${projectId}/`, {
      credentials: 'include',
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching research project details:", error);
    throw error;
  }
};

export const updateResearchProject = async (
  projectId: string,
  data: { title?: string; description?: string; is_public?: boolean; status?: string }
) => {
  try {
    // const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/research/projects/${projectId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error updating research project:", error);
    throw error;
  }
};

export const deleteResearchProject = async (projectId: string) => {
  try {
    // const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/research/projects/${projectId}/`, {
      method: 'DELETE',
      headers: {
        // 'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error deleting research project:", error);
    throw error;
  }
};

// Collaborator Management APIs
export const addCollaborator = async (
  projectId: string,
  data: { username_or_email: string; role?: string }
) => {
  try {
    // const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/research/projects/${projectId}/collaborators/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error adding collaborator:", error);
    throw error;
  }
};

export const updateCollaborator = async (
  projectId: string,
  collaboratorId: number,
  data: { role: string }
) => {
  try {
    // const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/research/projects/${projectId}/collaborators/${collaboratorId}/`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error updating collaborator:", error);
    throw error;
  }
};

export const removeCollaborator = async (projectId: string, collaboratorId: number) => {
  try {
    // const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/research/projects/${projectId}/collaborators/${collaboratorId}/`, {
      method: 'DELETE',
      headers: {
        // 'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error removing collaborator:", error);
    throw error;
  }
};

// Experiment Management APIs
export const assignExperiment = async (projectId: string, experimentId: string) => {
  try {
    // const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/research/projects/${projectId}/experiments/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
      body: JSON.stringify({ experiment_id: experimentId }),
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error assigning experiment:", error);
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
    project_id?: string;
  }
) => {
  try {
    // const csrf_token = getCookie("csrftoken");
    const url = data.project_id
      ? `${API_BASE_URL}/research/projects/${data.project_id}/comparisons/`
      : `${API_BASE_URL}/research/comparisons/`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        dataset_ids: data.dataset_ids,
        is_public: data.is_public
      }),
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error creating dataset comparison:", error);
    throw error;
  }
};

export const fetchDatasetComparisons = async (projectId?: string, page = 1, pageSize = 10) => {
  try {
    const url = projectId
      ? `${API_BASE_URL}/research/projects/${projectId}/comparisons/?page=${page}&page_size=${pageSize}`
      : `${API_BASE_URL}/research/comparisons/?page=${page}&page_size=${pageSize}`;

    const response = await fetch(url, {
      credentials: 'include',
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching dataset comparisons:", error);
    throw error;
  }
};

export const fetchComparisonDetails = async (comparisonId: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/research/comparisons/${comparisonId}/`, {
      credentials: 'include',
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching comparison details:", error);
    throw error;
  }
};

// ORCID Verification APIs
export const initiateOrcidVerification = async (orcidId: string) => {
  try {
    // const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/orcid/verify/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
      body: JSON.stringify({ orcid_id: orcidId }),
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error initiating ORCID verification:", error);
    throw error;
  }
};

export const confirmOrcidVerification = async (verificationCode: string) => {
  try {
    // const csrf_token = getCookie("csrftoken");
    const response = await fetch(`${API_BASE_URL}/orcid/confirm/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'X-CSRFToken': csrf_token || '',
      },
      credentials: 'include',
      body: JSON.stringify({ verification_code: verificationCode }),
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error confirming ORCID verification:", error);
    throw error;
  }
};

export const getOrcidProfile = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/orcid/profile/`, {
      credentials: 'include',
    });
    await handleResponseErrors(response);
    return await response.json();
  } catch (error) {
    console.error("Error fetching ORCID profile:", error);
    throw error;
  }
};
