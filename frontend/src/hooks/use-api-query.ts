
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { ApiResponse } from '@/types/common';

// Generic API query hook
export function useApiQuery<T>(
  queryKey: string | readonly unknown[],
  fetchFn: () => Promise<T>,
  options?: Omit<UseQueryOptions<T, Error, T, any>, 'queryKey' | 'queryFn'>
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
      if (options?.onError) {
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
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationKey: [mutationKey],
    mutationFn,
    ...options,
    onSuccess: (data, variables, context) => {
      // Show success toast unless explicitly disabled
      if (options?.meta?.suppressSuccessToast !== true) {
        toast({
          title: 'Success',
          description: options?.meta?.successMessage || 'Operation completed successfully',
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
      const response = await fetch(`/api/voltammetry/${experimentId}/`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch experiment');
      }
      return await response.json();
    },
    options
  );
}

// Specialized hook for experiment data export
export function useExportExperiment(experimentId: string, format: 'csv' | 'json' | 'excel') {
  return useApiMutation<{ success: boolean }, void>(
    'exportExperiment',
    async () => {
      const response = await fetch(`/api/experiment-export/${experimentId}/?format=${format}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to export experiment as ${format}`);
      }
      
      // For file downloads, we need to handle the response as a blob
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Get filename from Content-Disposition header if available
      const contentDisposition = response.headers.get('Content-Disposition');
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
