import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { fetchChangeRequests } from '../../fetch';

const Page = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const data = await fetchChangeRequests();
            setRequests(data || []);
        } catch (err) {
            setError('Error loading requests');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error logging out:', error);
        }
        window.location.href = '/login';
    };

    return (
        <div className="container">
            <div className="header">
                <h1>Change Requests</h1>
                <button onClick={handleLogout} className="logout-button">Log Out</button>
            </div>

            {loading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}
            
            <div className="requests-list">
                {requests.map((request) => (
                    <div key={request.id} className="request-item">
                        <h3>{request.title}</h3>
                        <p>{request.description}</p>
                    </div>
                ))}
            </div>

            <style jsx>{`
                .container {
                    padding: 20px;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                }
                .logout-button {
                    padding: 8px 16px;
                    background-color: #f44336;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                }
                .error {
                    color: red;
                }
                .requests-list {
                    display: grid;
                    gap: 20px;
                }
                .request-item {
                    padding: 16px;
                    border: 1px solid #ddd;
                    border-radius: 4px;
                }
            `}</style>
        </div>
    );
};

export default Page;