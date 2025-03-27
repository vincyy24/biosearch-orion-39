
import { useState, useEffect, useCallback } from 'react';
import { PaginatedResponse } from '@/types/common';

interface UsePaginationProps<T> {
  fetchFn: (page: number, pageSize: number) => Promise<PaginatedResponse<T>>;
  initialPage?: number;
  initialPageSize?: number;
  deps?: any[];
}

interface UsePaginationResult<T> {
  data: T[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isLoading: boolean;
  error: Error | null;
  goToPage: (page: number) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  setItemsPerPage: (size: number) => void;
  refresh: () => void;
}

export function usePagination<T>({
  fetchFn,
  initialPage = 1,
  initialPageSize = 10,
  deps = []
}: UsePaginationProps<T>): UsePaginationResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [hasPreviousPage, setHasPreviousPage] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetchFn(currentPage, pageSize);
      
      setData(response.results);
      setTotalItems(response.count);
      setTotalPages(response.num_pages);
      setHasNextPage(response.has_next);
      setHasPreviousPage(response.has_previous);
    } catch (err) {
      console.error('Error fetching paginated data:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch data'));
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, currentPage, pageSize]);

  useEffect(() => {
    fetchData();
  }, [fetchData, ...deps]);

  const goToPage = useCallback((page: number) => {
    if (page < 1 || (totalPages > 0 && page > totalPages)) {
      return;
    }
    setCurrentPage(page);
  }, [totalPages]);

  const goToNextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const goToPreviousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const setItemsPerPage = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1); // Reset to first page when changing page size
  }, []);

  const refresh = useCallback(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    totalItems,
    totalPages,
    currentPage,
    pageSize,
    hasNextPage,
    hasPreviousPage,
    isLoading,
    error,
    goToPage,
    goToNextPage,
    goToPreviousPage,
    setItemsPerPage,
    refresh
  };
}
