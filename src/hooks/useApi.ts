import { useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { ApiError } from '../services/api';
import { AppDispatch } from '../store';

type ApiStatus = {
  loading: boolean;
  error: string | null;
  success: boolean;
};

const initialStatus: ApiStatus = {
  loading: false,
  error: null,
  success: false,
};

/**
 * Custom hook for handling API requests with loading and error states
 */
export function useApi() {
  const dispatch = useDispatch<AppDispatch>();
  const [status, setStatus] = useState<ApiStatus>(initialStatus);

  const callApi = useCallback(
    async <T>(
      apiAction: any,
      params?: any,
      options?: {
        onSuccess?: (data: T) => void;
        onError?: (error: string) => void;
      }
    ): Promise<T | undefined> => {
      setStatus({ ...initialStatus, loading: true });

      try {
        const resultAction = await dispatch(
          params !== undefined ? apiAction(params) : apiAction()
        );

        if (resultAction.meta.requestStatus === 'rejected') {
          const errorMessage =
            typeof resultAction.payload === 'string'
              ? resultAction.payload
              : 'Ocorreu um erro na requisição.';

          setStatus({
            loading: false,
            error: errorMessage,
            success: false,
          });

          if (options?.onError) {
            options.onError(errorMessage);
          }

          return undefined;
        }

        const data = resultAction.payload as T;
        setStatus({
          loading: false,
          error: null,
          success: true,
        });

        if (options?.onSuccess && data) {
          options.onSuccess(data);
        }

        return data;
      } catch (error) {
        const errorMessage =
          error instanceof ApiError
            ? error.message
            : error instanceof Error
              ? error.message
              : 'Ocorreu um erro na requisição.';

        setStatus({
          loading: false,
          error: errorMessage,
          success: false,
        });

        if (options?.onError) {
          options.onError(errorMessage);
        }

        return undefined;
      }
    },
    [dispatch]
  );

  const resetStatus = useCallback(() => {
    setStatus(initialStatus);
  }, []);

  return {
    ...status,
    callApi,
    resetStatus,
  };
}
