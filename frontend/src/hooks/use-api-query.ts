
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/services/api';

// Generic API query hook
export function useApiQuery<T>(
  queryKey: string | readonly unknown[],
  fetchFn: () => Promise<T>,
  options?: Pick<UseQueryOptions<T, Error, T, any>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: fetchFn,
    ...options,
    onError: (error) => {
      console.error(`Query error for ${Array.isArray(queryKey) ? queryKey[0] : queryKey}:`, error);

      // Show toast notification
      toast({
        title: 'Error',
        description: error.message || 'An error occurred while fetching data',
        variant: 'destructive',
      });

      // Call original onError if provided
      if (options && typeof options.onError === 'function') {
        options.onError(error);
      }
    }
  });
}

// Generic API mutation hook
export function useApiMutation<TData, TVariables>(
  mutationKey: string,
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, Error, TVariables, unknown>, 'mutationKey' | 'mutationFn'>
) {
  // Removed unused queryClient declaration

  return useMutation({
    mutationKey: [mutationKey],
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      // Show success toast unless explicitly disabled
      if (options?.meta?.suppressSuccessToast !== true) {
        toast({
          title: 'Success',
          description: String(options?.meta?.successMessage || 'Operation completed successfully'),
        });
      }

      // Call original onSuccess if provided
      if (options?.onSuccess) {
        options.onSuccess(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      console.error(`Mutation error for ${mutationKey}:`, error);

      // Show error toast
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      });

      // Call original onError if provided
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    }
  });
}

// Specialized hook for experiments
export function useExperiment(experimentId: string, options?: UseQueryOptions) {
  return useApiQuery(
    ['experiment', experimentId],
    async () => {
      const response = await apiClient.get(`dashboard/voltammetry/${experimentId}/`);
      return response.data;
    },
    options
  );
}

// Specialized hook for experiment data export
export function useExportExperiment(experimentId: string, format: 'csv' | 'json' | 'excel') {
  return useApiMutation<{ success: boolean; }, void>(
    'exportExperiment',
    async () => {
      const response = await apiClient.get(`experiment-export/${experimentId}/?format=${format}`, {
        responseType: 'blob'
      });

      // For file downloads, we need to handle the response as a blob
      const blob = await response.data.blob();
      const url = window.URL.createObjectURL(blob);

      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers['content-disposition'];
      let filename = `experiment_${experimentId}.${format}`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }

      // Create a link element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { success: true };
    },
    {
      meta: {
        successMessage: `Experiment exported successfully as ${format}`,
      }
    }
  );
}

// Research projects hooks
export function useResearchProjects(page = 1, pageSize = 10) {
  return useApiQuery(
    ['researchProjects', page, pageSize],
    async () => {
      const response = await apiClient.get('research/projects/', {
        params: { page, page_size: pageSize }
      });
      return response.data;
    }
  );
}

export function useResearchProject(projectId: string) {
  return useApiQuery(
    ['researchProject', projectId],
    async () => {
      const response = await apiClient.get(`research/projects/${projectId}/`);
      return response.data;
    }
  );
}

// Publications hooks
export function usePublications(page = 1, perPage = 10, query = '', filters = {}) {
  return useApiQuery(
    ['publications', page, perPage, query, filters],
    async () => {
      const params = { page, per_page: perPage, query, ...filters };
      const response = await apiClient.get('publications/', { params });
      return response.data;
    }
  );
}

export function usePublication(doi: string) {
  return useApiQuery(
    ['publication', doi],
    async () => {
      const response = await apiClient.get(`publications/${doi}/`);
      return response.data;
    }
  );
}

// User profile and settings hooks
export function useUserProfile(username: string) {
  return useApiQuery(
    ['userProfile', username],
    async () => {
      const response = await apiClient.get(`users/profile/${username}/`);
      return response.data;
    }
  );
}

export function useUserSettings() {
  return useApiQuery(
    ['userSettings'],
    async () => {
      const response = await apiClient.get('users/settings/');
      return response.data;
    }
  );
}

export function useUserNotifications(page = 1, perPage = 10) {
  return useApiQuery(
    ['userNotifications', page, perPage],
    async () => {
      const response = await apiClient.get('users/notifications/', {
        params: { page, per_page: perPage }
      });
      return response.data;
    }
  );
}
