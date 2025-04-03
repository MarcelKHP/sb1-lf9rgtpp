import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Filter, Search } from 'lucide-react';
import { supabase } from '../supabaseClient';

export function useChangeRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRequests() {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('change_requests')
          .select('*,attachments(id,name,url)')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setRequests(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRequests();
  }, []);

  return { requests, isLoading, error };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { requests, isLoading, error } = useChangeRequests();
  const [filter, setFilter] = React.useState('all');
  const [search, setSearch] = React.useState('');

  const filteredRequests = requests?.filter(request => {
    const matchesFilter = filter === 'all' || request.status.toLowerCase() === filter;
    const matchesSearch = request.title.toLowerCase().includes(search.toLowerCase()) ||
      request.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (isLoading) return <div className="flex justify-center p-8">Loading...</div>;
  if (error) return <div className="text-red-600 p-8">Error loading requests</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Change Requests</h1>
        <button
          onClick={() => navigate('/new')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          New Request
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search requests..."
            className="pl-10 pr-4 py-2 w-full border rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <select
            className="pl-10 pr-4 py-2 border rounded-lg appearance-none bg-white"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="denied">Denied</option>
            <option value="implemented">Implemented</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {filteredRequests?.length === 0 ? (
        <div className="text-gray-500 text-center">No requests found matching the criteria.</div>
      ) : (
        <div className="grid gap-4">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              onClick={() => navigate(`/request/${request.id}`)}
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-lg">{request.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{request.description}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                  <FileText className="h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-sm text-gray-500">
                <span>Type: {request.change_type}</span>
                <span>Impact: {request.impact_level}</span>
                <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
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