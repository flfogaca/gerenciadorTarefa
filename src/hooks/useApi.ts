import { useState, useEffect, useCallback } from 'react';
import { showToast } from '../utils/toast';

interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  showErrorToast?: boolean;
}

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
) {
  const {
    immediate = true,
    onSuccess,
    onError,
    showErrorToast = true,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
      if (onSuccess) {
        onSuccess(result);
      }
      return result;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      if (showErrorToast) {
        const message = err?.response?.data?.message || err?.message || 'Erro ao carregar dados';
        showToast.error(message);
      }
      if (onError) {
        onError(err);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiCall, onSuccess, onError, showErrorToast]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]);

  const refetch = useCallback(() => {
    return execute();
  }, [execute]);

  return { data, loading, error, refetch, execute };
}

