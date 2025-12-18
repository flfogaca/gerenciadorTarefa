import { AxiosResponse } from 'axios';

export function normalizeApiResponse<T>(response: AxiosResponse): T {
  if (response.data?.success && response.data?.data) {
    return response.data.data as T;
  }
  return response.data as T;
}

export function extractData<T>(response: AxiosResponse, path?: string): T {
  const normalized = normalizeApiResponse(response);
  if (path) {
    return (normalized as any)[path] as T;
  }
  return normalized as T;
}



