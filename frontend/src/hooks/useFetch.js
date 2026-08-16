import { useState, useCallback } from 'react';

export const useFetch = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiFunc(...args);
      setData(response);
      return response;
    } catch (err) {
      const errMsg = err.detail || err.message || "An error occurred while fetching data.";
      setError(errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFunc]);

  const clearError = useCallback(() => setError(null), []);

  return { data, loading, error, request, clearError };
};
