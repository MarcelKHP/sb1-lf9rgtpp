import fetch from 'cross-fetch'; // Use cross-fetch for compatibility

export const resend = {
  emails: {
    send: async ({ from, to, subject, html }: { from: string; to: string[]; subject: string; html: string }) => {
      console.log('Sending email:', { from, to, subject, html });
      // Simulate email sending
      return Promise.resolve({ success: true });
    },
  },
};

const SUPABASE_URL = 'https://sdoxcggelyqnxcjboafx.supabase.co';
const SUPABASE_API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY; // Use Vite's environment variables

export const supabaseRequest = async (endpoint: string, options: RequestInit) => {
  const url = `${SUPABASE_URL}${endpoint}`;
  const headers = {
    ...options.headers,
    Authorization: `Bearer ${SUPABASE_API_KEY}`,
    'Content-Type': 'application/json',
  };

  console.log('Making request to Supabase:', { url, headers, options }); // Debugging log

  try {
    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      console.error(`Error: ${response.status} - ${response.statusText}`);
      const errorDetails = await response.text(); // Capture error details
      console.error('Response details:', errorDetails); // Log error details
      throw new Error(`Failed to fetch: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Supabase request failed:', error);
    throw error;
  }
};