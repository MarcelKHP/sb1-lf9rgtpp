import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ApprovalWorkflow } from './ApprovalWorkflow';
import type { RequestStatus, ChangeRequest } from '../types';

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = React.useState<ChangeRequest | null>(null);
  const [isApprover, setIsApprover] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchRequest() {
      try {
        const { data, error } = await supabase
          .from('change_requests')
          .select(`*, attachments (id, name, url)`)
          .eq('id', id)
          .single();

        if (error) throw error;
        setRequest(data);

        const { data: userData } = await supabase.auth.getUser();
        setIsApprover(data?.approver === userData?.user?.email);
      } catch (err) {
        setError('Failed to load request details');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchRequest();
    }
  }, [id]);

  const handleStatusUpdate = async (newStatus: RequestStatus) => {
    try {
      const { error } = await supabase
        .from('change_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setRequest((prev) => (prev ? { ...prev, status: newStatus } : null));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!request) return <div>Request not found</div>;

  return (
    <div>
      <h1>{request.title}</h1>
      <ApprovalWorkflow
        currentStatus={request.status}
        onUpdateStatus={handleStatusUpdate}
        isApprover={isApprover}
      />
    </div>
  );
}