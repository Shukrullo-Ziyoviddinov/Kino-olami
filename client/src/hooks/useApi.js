import { useCallback, useState } from 'react';
import { normalizeApiError } from '../utils/errorHandler';

export const useApi = (apiFn, { initialData = null } = {}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFn(...args);
        setData(result);
        return result;
      } catch (err) {
        const normalized = normalizeApiError(err);
        setError(normalized);
        throw normalized;
      } finally {
        setLoading(false);
      }
    },
    [apiFn]
  );

  return { data, loading, error, execute, setData };
};
