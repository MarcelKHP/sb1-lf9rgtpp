export type ChangeType = 'Software' | 'Hardware' | 'Network' | 'Security' | 'Other';
export type ImpactLevel = 'Low' | 'Medium' | 'High';
export type RequestStatus = 'Pending' | 'Approved' | 'Denied' | 'Implemented' | 'Completed';

export interface Attachment {
  name: string;
  url: string;
}

export interface ChangeRequest {
  id: string;
  title: string;
  description: string;
  changeType: ChangeType;
  impactLevel: ImpactLevel;
  expectedDowntime: string;
  rollbackPlan?: string;
  attachments: Attachment[];
  approver: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
}