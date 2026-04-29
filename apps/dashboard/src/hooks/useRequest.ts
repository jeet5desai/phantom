import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { apiRequest } from '@/lib/api';
import { useCallback } from 'react';

export function useRequest() {
  const token = useSelector((state: RootState) => state.auth.token);

  const request = useCallback(
    async (method: string, path: string, body?: unknown) => {
      return apiRequest(method, path, body, token || undefined);
    },
    [token],
  );

  return request;
}
