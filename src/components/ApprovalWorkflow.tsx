import React from 'react';
import { CheckCircle, XCircle, AlertCircle, PlayCircle, CheckCircle2 } from 'lucide-react';

interface ApprovalWorkflowProps {
  currentStatus: string;
  onUpdateStatus: (status: string) => Promise<void>;
  isApprover: boolean;
}

export function ApprovalWorkflow({ currentStatus, onUpdateStatus, isApprover }: ApprovalWorkflowProps) {
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(newStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderApproverActions = () => {
    if (!isApprover) return null;

    switch (currentStatus.toLowerCase()) {
      case 'pending':
        return (
          <div className="flex gap-2">
            <button
              onClick={() => handleStatusChange('Approved')}
              disabled={isUpdating}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </button>
            <button
              onClick={() => handleStatusChange('Denied')}
              disabled={isUpdating}
              className="flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Deny
            </button>
          </div>
        );
      case 'approved':
        return (
          <button
            onClick={() => handleStatusChange('Implemented')}
            disabled={isUpdating}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <PlayCircle className="h-4 w-4 mr-2" />
            Mark as Implemented
          </button>
        );
      case 'implemented':
        return (
          <button
            onClick={() => handleStatusChange('Completed')}
            disabled={isUpdating}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Mark as Completed
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <div className="flex items-center">
          <AlertCircle className={`h-5 w-5 ${currentStatus === 'Pending' ? 'text-yellow-500' : 'text-gray-300'}`} />
          <div className={`ml-2 ${currentStatus === 'Pending' ? 'font-semibold' : ''}`}>Pending</div>
        </div>
        <div className="h-px w-8 bg-gray-300" />
        <div className="flex items-center">
          <CheckCircle className={`h-5 w-5 ${currentStatus === 'Approved' ? 'text-green-500' : 'text-gray-300'}`} />
          <div className={`ml-2 ${currentStatus === 'Approved' ? 'font-semibold' : ''}`}>Approved</div>
        </div>
        <div className="h-px w-8 bg-gray-300" />
        <div className="flex items-center">
          <PlayCircle className={`h-5 w-5 ${currentStatus === 'Implemented' ? 'text-blue-500' : 'text-gray-300'}`} />
          <div className={`ml-2 ${currentStatus === 'Implemented' ? 'font-semibold' : ''}`}>Implemented</div>
        </div>
        <div className="h-px w-8 bg-gray-300" />
        <div className="flex items-center">
          <CheckCircle2 className={`h-5 w-5 ${currentStatus === 'Completed' ? 'text-purple-500' : 'text-gray-300'}`} />
          <div className={`ml-2 ${currentStatus === 'Completed' ? 'font-semibold' : ''}`}>Completed</div>
        </div>
      </div>

      {renderApproverActions()}
    </div>
  );
}