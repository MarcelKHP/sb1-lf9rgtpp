import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface ChangeRequest {
    id: number;
    title: string;
    description: string;
    status: string;
    created_at: string;
}

export default function Dashboard() {
    const [requests, setRequests] = useState<ChangeRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRequests();
    }, []);

    async function fetchRequests() {
        try {
            const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
            if (sessionError || !sessionData.session) {
                throw new Error('Please log in to view requests');
            }

            const { data, error } = await supabase
                .from('change_requests')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRequests(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load requests');
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    }

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    const handleNewRequest = () => {
        navigate('/new');
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="container mx-auto p-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Change Requests</h1>
                <div className="space-x-4">
                    <button
                        onClick={handleNewRequest}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        New Request
                    </button>
                    <button
                        onClick={handleLogout}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white shadow-md rounded my-6">
                <table className="min-w-full table-auto">
                    <thead>
                        <tr className="bg-gray-200 text-gray-600 uppercase text-sm">
                            <th className="py-3 px-4 text-left">Title</th>
                            <th className="py-3 px-4 text-left">Description</th>
                            <th className="py-3 px-4 text-left">Status</th>
                            <th className="py-3 px-4 text-left">Created At</th>
                        </tr>
                    </thead>
                    <tbody className="text-gray-600">
                        {requests.map((request) => (
                            <tr key={request.id} className="border-b border-gray-200 hover:bg-gray-100">
                                <td className="py-3 px-4">{request.title}</td>
                                <td className="py-3 px-4">{request.description}</td>
                                <td className="py-3 px-4">{request.status}</td>
                                <td className="py-3 px-4">
                                    {new Date(request.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                        {requests.length === 0 && !loading && (
                            <tr>
                                <td colSpan={4} className="py-4 px-4 text-center">
                                    No requests found
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}