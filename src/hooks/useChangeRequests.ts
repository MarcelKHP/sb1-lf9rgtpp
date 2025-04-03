import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { ChangeRequest } from '../types';

export function useChangeRequests() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      try {
        const user = await supabase.auth.getUser();
        console.log('Authenticated user:', user);

        const { data, error } = await supabase
          .from('change_requests')
          .select(`
            *,
            attachments (
              id,
              name,
              url
            )
          `)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching change requests:', error);
          throw error;
        }

        setRequests(data);
      } catch (err) {
        console.error('Failed to fetch requests:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch requests'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchRequests();
  }, []);

  return { requests, isLoading, error };
}