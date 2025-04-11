import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function CreateRequest() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [changeType, setChangeType] = useState('');
    const [impactLevel, setImpactLevel] = useState('');
    const [downtime, setDowntime] = useState('');
    const [rollbackPlan, setRollbackPlan] = useState('');
    const [approver, setApprover] = useState('');
    const [attachments, setAttachments] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setAttachments(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Get the logged-in user's ID
            const { data: { session } } = await supabase.auth.getSession();
            if (!session || !session.user) {
                throw new Error('User is not logged in');
            }

            // Insert the change request
            const { data: changeRequest, error: changeRequestError } = await supabase
                .from('change_requests')
                .insert([
                    {
                        title,
                        description,
                        change_type: changeType,
                        impact_level: impactLevel,
                        expected_downtime: downtime,
                        rollback_plan: rollbackPlan,
                        approver_email: approver,
                        user_id: session.user.id,
                    },
                ])
                .select()
                .single();

            if (changeRequestError) {
                console.error('Change request insert error:', changeRequestError);
                throw changeRequestError;
            }

            // Insert attachments linked to the change request
            if (attachments.length > 0) {
                const attachmentData = attachments.map((file) => ({
                    name: file.name,
                    change_request_id: changeRequest.id,
                }));

                const { error: attachmentError } = await supabase
                    .from('attachments')
                    .insert(attachmentData);

                if (attachmentError) {
                    console.error('Attachment insert error:', attachmentError);
                    throw attachmentError;
                }
            }

            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to create request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 max-w-2xl">
            <h1 className="text-2xl font-bold mb-4">Change Request Creator</h1>
            <p className="mb-6 text-gray-600">Create and manage IT change requests efficiently</p>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                        Request Title
                    </label>
                    <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="changeType" className="block text-sm font-medium text-gray-700">
                            Change Type
                        </label>
                        <select
                            id="changeType"
                            value={changeType}
                            onChange={(e) => setChangeType(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            required
                        >
                            <option value="">Select type</option>
                            <option value="Software">Software</option>
                            <option value="Hardware">Hardware</option>
                            <option value="Network">Network</option>
                            <option value="Security">Security</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label htmlFor="impactLevel" className="block text-sm font-medium text-gray-700">
                            Impact Level
                        </label>
                        <select
                            id="impactLevel"
                            value={impactLevel}
                            onChange={(e) => setImpactLevel(e.target.value)}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            required
                        >
                            <option value="">Select impact</option>
                            <option value="Low">Low</option>
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="downtime" className="block text-sm font-medium text-gray-700">
                        Expected Downtime
                    </label>
                    <input
                        type="text"
                        id="downtime"
                        value={downtime}
                        onChange={(e) => setDowntime(e.target.value)}
                        placeholder="e.g., 2 hours"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <div>
                    <label htmlFor="rollbackPlan" className="block text-sm font-medium text-gray-700">
                        Rollback Plan (Optional)
                    </label>
                    <textarea
                        id="rollbackPlan"
                        value={rollbackPlan}
                        onChange={(e) => setRollbackPlan(e.target.value)}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    />
                </div>

                <div>
                    <label htmlFor="approver" className="block text-sm font-medium text-gray-700">
                        Approver
                    </label>
                    <input
                        type="email"
                        id="approver"
                        value={approver}
                        onChange={(e) => setApprover(e.target.value)}
                        placeholder="approver@company.com"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                        required
                    />
                </div>

                <div>
                    <label htmlFor="attachments" className="block text-sm font-medium text-gray-700">
                        Attachments
                    </label>
                    <input
                        type="file"
                        id="attachments"
                        multiple
                        onChange={handleFileUpload}
                        className="mt-1 block w-full text-gray-500"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
                >
                    {loading ? 'Submitting...' : 'Submit Request'}
                </button>
            </form>
        </div>
    );
}