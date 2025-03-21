import { render } from '@react-email/render';
import { resend } from '../lib/resend';
import type { ChangeRequest } from '../types';
import React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
} from '@react-email/components';

interface EmailTemplateProps {
  request: ChangeRequest;
}

const ChangeRequestEmail: React.FC<EmailTemplateProps> = ({ request }) => {
  return (
    <Html>
      <Head />
      <Preview>Change Request: {request.title}</Preview>
      <Body style={main}>
        <Container>
          <Section>
            <Heading as="h1">Change Request: {request.title}</Heading>
            <Section>
              <Text><strong>Description:</strong> {request.description}</Text>
              <Text><strong>Change Type:</strong> {request.changeType}</Text>
              <Text><strong>Impact Level:</strong> {request.impactLevel}</Text>
              <Text><strong>Expected Downtime:</strong> {request.expectedDowntime}</Text>
              <Text><strong>Status:</strong> {request.status}</Text>
              {request.rollbackPlan && (
                <Text><strong>Rollback Plan:</strong> {request.rollbackPlan}</Text>
              )}
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

export async function sendChangeRequestEmail(request: ChangeRequest, recipients: string[]) {
  const emailHtml = render(<ChangeRequestEmail request={request} />);
  
  try {
    await resend.emails.send({
      from: 'change-requests@yourdomain.com',
      to: recipients,
      subject: `Change Request: ${request.title}`,
      html: emailHtml,
    });
    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}