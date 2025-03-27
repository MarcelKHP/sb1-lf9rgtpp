import { Resend } from 'resend';

// Initialize Resend with your API key
// In production, this should come from environment variables
export const resend = new Resend('re_YOUR_API_KEY');