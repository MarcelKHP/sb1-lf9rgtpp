import { createClient } from '@supabase/supabase-js';

// Use import.meta.env for Vite or process.env for Create React App
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Sets the Supabase client to use the provided access token for authenticated requests.
 * @param accessToken - The user's access token.
 */
export const setAuthToken = (accessToken: string) => {
    supabase.auth.setSession({ access_token: accessToken, refresh_token: '' });
};
