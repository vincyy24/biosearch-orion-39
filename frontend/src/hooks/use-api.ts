
import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import apiClient from '@/services/api';

// Generic API query hook with improved typing
export function useApiQuery<TData, TError = Error>(
  queryKey: string | readonly unknown[],
  fetchFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError, TData, unknown[]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: Array.isArray(queryKey) ? queryKey : [queryKey],
    queryFn: fetchFn,
    ...options,
    onError: (error: TError) => {
      // Log error details
      console.error(`Query error for ${Array.isArray(queryKey) ? queryKey[0] : queryKey}:`, error);
      
      // Show toast notification with appropriate error message
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred while fetching data',
        variant: 'destructive',
      });
      
      // Call original onError if provided
      if (options?.onError) {
        options.onError(error);
      }
    }
  });
}

// Generic API mutation hook with improved typing
export function useApiMutation<TData, TVariables, TError = Error>(
  mutationKey: string,
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: Omit<UseMutationOptions<TData, TError, TVariables, unknown>, 'mutationKey' | 'mutationFn'>
) {
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
    onError: (error: TError, variables, context) => {
      console.error(`Mutation error for ${mutationKey}:`, error);
      
      // Show error toast with appropriate error message
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
      
      // Call original onError if provided
      if (options?.onError) {
        options.onError(error, variables, context);
      }
    }
  });
}

// Example specialized hook for experiment data
export function useExperiment<TData>(experimentId: string, options?: UseQueryOptions<TData, Error>) {
  return useApiQuery<TData>(
    ['experiment', experimentId],
    async () => {
      const response = await apiClient.get(`dashboard/voltammetry/${experimentId}/`);
      return response.data;
    },
    options
  );
}
