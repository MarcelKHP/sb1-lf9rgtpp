import { supabase } from './src/lib/supabase';

async function fetchChangeRequests() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
            throw new Error('No active session');
        }

        // Ensure we're using the session token
        const { data, error } = await supabase
            .from('change_requests')
            .select('*, attachments(id,name,url)')
            .order('created_at', { ascending: false })
            .throwOnError();

        if (error) {
            console.error('Query error:', error);
            throw error;
        }

        return data;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}

export { fetchChangeRequests };
