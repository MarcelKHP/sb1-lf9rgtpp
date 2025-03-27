import { useState, useEffect } from 'react';

export function useChangeRequests() {
  const [requests, setRequests] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const response = await fetch('/api/change-requests'); // Replace with your API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch change requests');
        }
        const data = await response.json();
        setRequests(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRequests();
  }, []);

  return { requests, isLoading, error };
}