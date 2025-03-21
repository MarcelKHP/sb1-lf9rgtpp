import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, Mail, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { generateChangeRequestDoc } from '../utils/docx';
import { sendChangeRequestEmail } from '../utils/email';
import { ApprovalWorkflow } from './ApprovalWorkflow';
import { FileUpload } from './FileUpload';
import type { ChangeRequest } from '../types';

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [request, setRequest] = React.useState<ChangeRequest | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function fetchRequest() {
      try {
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
          .eq('id', id)
          .single();

        if (error) throw error;
        setRequest(data);
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

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      const { error } = await supabase
        .from('change_requests')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;

      setRequest(prev => prev ? { ...prev, status: newStatus } : null);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDownload = async () => {
    if (request) {
      await generateChangeRequestDoc(request);
    }
  };

  const handleSendEmail = async () => {
    if (request) {
      const result = await sendChangeRequestEmail(request, [request.approver_email]);
      if (result.success) {
        alert('Email sent successfully');
      } else {
        alert('Failed to send email');
      }
    }
  };

  if (loading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error) return <div className="text-red-600 p-8">{error}</div>;
  if (!request) return <div className="text-gray-600 p-8">Request not found</div>;

  return (
    <div className="max-w-4xl mx-auto p-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </button>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{request.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
              {request.status}
            </span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleDownload}
              className="flex items-center px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <Download className="h-4 w-4 mr-2" />
              Download DOCX
            </button>
            <button
              onClick={handleSendEmail}
              className="flex items-center px-3 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <Mail className="h-4 w-4 mr-2" />
              Send Email
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-semibold mb-2">Change Type</h3>
            <p className="text-gray-700">{request.change_type}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Impact Level</h3>
            <p className="text-gray-700">{request.impact_level}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Expected Downtime</h3>
            <p className="text-gray-700">{request.expected_downtime}</p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Approver</h3>
            <p className="text-gray-700">{request.approver_email}</p>
          </div>
        </div>

        <div className="mb-6">
          <h3 className="font-semibold mb-2">Description</h3>
          <p className="text-gray-700 whitespace-pre-wrap">{request.description}</p>
        </div>

        {request.rollback_plan && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Rollback Plan</h3>
            <p className="text-gray-700 whitespace-pre-wrap">{request.rollback_plan}</p>
          </div>
        )}

        <div className="mb-6">
          <h3 className="font-semibold mb-4">Attachments</h3>
          <FileUpload requestId={request.id} />
        </div>

        <div className="border-t pt-6">
          <h3 className="font-semibold mb-4">Approval Workflow</h3>
          <ApprovalWorkflow
            currentStatus={request.status}
            onUpdateStatus={handleStatusUpdate}
            isApprover={request.approver_email === (supabase.auth.user()?.email ?? '')}
          />
        </div>
      </div>
    </div>
  );
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'approved':
      return 'bg-green-100 text-green-800';
    case 'denied':
      return 'bg-red-100 text-red-800';
    case 'implemented':
      return 'bg-blue-100 text-blue-800';
    case 'completed':
      return 'bg-purple-100 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}