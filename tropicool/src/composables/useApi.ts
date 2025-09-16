import { ref } from 'vue';
import axios, { AxiosResponse, AxiosError } from 'axios';
import { useErrorHandler } from './useErrorHandler';

export function useApi() {
  const { handleError } = useErrorHandler();
  const loading = ref(false);

  const apiCall = async <T = any>(
    apiFunction: () => Promise<AxiosResponse<T>>,
    errorMessage?: string
  ): Promise<T | null> => {
    loading.value = true;
    try {
      const response = await apiFunction();
      return response.data;
    } catch (error) {
      handleError(error, errorMessage);
      return null;
    } finally {
      loading.value = false;
    }
  };

  const get = async <T = any>(url: string, errorMessage?: string): Promise<T | null> => {
    return apiCall<T>(() => axios.get(url), errorMessage);
  };

  const post = async <T = any>(url: string, data?: any, errorMessage?: string): Promise<T | null> => {
    return apiCall<T>(() => axios.post(url, data), errorMessage);
  };

  const put = async <T = any>(url: string, data?: any, errorMessage?: string): Promise<T | null> => {
    return apiCall<T>(() => axios.put(url, data), errorMessage);
  };

  const patch = async <T = any>(url: string, data?: any, errorMessage?: string): Promise<T | null> => {
    return apiCall<T>(() => axios.patch(url, data), errorMessage);
  };

  const del = async <T = any>(url: string, errorMessage?: string): Promise<T | null> => {
    return apiCall<T>(() => axios.delete(url), errorMessage);
  };

  return {
    loading,
    apiCall,
    get,
    post,
    put,
    patch,
    delete: del,
  };
}
