import fetch from 'cross-fetch'; // Use cross-fetch for compatibility

interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  status: string;
  submittedBy: string;
  submittedDate: string;
}

const formatRequestAsTable = (request: ChangeRequest): string => {
  return `
    <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
      <tr><th style="border:1px solid #ddd; padding:8px;">Field</th><th style="border:1px solid #ddd; padding:8px;">Value</th></tr>
      <tr><td style="border:1px solid #ddd; padding:8px;">Request ID</td><td style="border:1px solid #ddd; padding:8px;">${request.id}</td></tr>
      <tr><td style="border:1px solid #ddd; padding:8px;">Title</td><td style="border:1px solid #ddd; padding:8px;">${request.title}</td></tr>
      <tr><td style="border:1px solid #ddd; padding:8px;">Description</td><td style="border:1px solid #ddd; padding:8px;">${request.description}</td></tr>
      <tr><td style="border:1px solid #ddd; padding:8px;">Status</td><td style="border:1px solid #ddd; padding:8px;">${request.status}</td></tr>
      <tr><td style="border:1px solid #ddd; padding:8px;">Submitted By</td><td style="border:1px solid #ddd; padding:8px;">${request.submittedBy}</td></tr>
      <tr><td style="border:1px solid #ddd; padding:8px;">Date</td><td style="border:1px solid #ddd; padding:8px;">${request.submittedDate}</td></tr>
    </table>`;
};

const generatePrintableRequest = (request: ChangeRequest): string => {
  return `
    <div style="padding: 20px;">
      <h2>Change Request #${request.id}</h2>
      ${formatRequestAsTable(request)}
      <div style="margin-top: 40px;">
        <p>Approver Decision: ☐ Approved &nbsp;&nbsp; ☐ Rejected</p>
        <p>Comments: _________________________________________________</p>
        <div style="margin-top: 30px;">
          <p>Signature: _________________________</p>
          <p>Date: _____________________________</p>
        </div>
      </div>
    </div>`;
};

export const sendApprovalRequest = async (request: ChangeRequest, approverEmail: string) => {
  const emailContent = `
    <h2>New Change Request Requiring Your Approval</h2>
    <p>A new change request has been submitted for your review:</p>
    ${formatRequestAsTable(request)}
    <p>Please review and approve/reject this request at your earliest convenience.</p>
  `;

  return resend.emails.send({
    from: 'changecontrol@company.com',
    to: [approverEmail],
    subject: `Change Request #${request.id} Pending Approval`,
    html: emailContent
  });
};

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