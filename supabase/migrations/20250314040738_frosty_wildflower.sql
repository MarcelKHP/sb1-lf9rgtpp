/*
  # Change Request Management Schema

  1. New Tables
    - `change_requests`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `change_type` (enum)
      - `impact_level` (enum)
      - `expected_downtime` (text)
      - `rollback_plan` (text)
      - `approver_email` (text)
      - `status` (enum)
      - `user_id` (uuid, foreign key)
      - Timestamps (created_at, updated_at)
    
    - `attachments`
      - `id` (uuid, primary key)
      - `change_request_id` (uuid, foreign key)
      - `name` (text)
      - `url` (text)
      - `user_id` (uuid, foreign key)
      - Timestamps (created_at)

  2. Security
    - Enable RLS on all tables
    - Policies for user access control
    - Policies for approver access
*/

-- Create enum types
CREATE TYPE change_type AS ENUM ('Software', 'Hardware', 'Network', 'Security', 'Other');
CREATE TYPE impact_level AS ENUM ('Low', 'Medium', 'High');
CREATE TYPE request_status AS ENUM ('Pending', 'Approved', 'Denied', 'Implemented', 'Completed');

-- Create change_requests table
CREATE TABLE IF NOT EXISTS change_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  change_type change_type NOT NULL,
  impact_level impact_level NOT NULL,
  expected_downtime text NOT NULL,
  rollback_plan text,
  approver_email text NOT NULL,
  status request_status NOT NULL DEFAULT 'Pending',
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  change_request_id uuid NOT NULL REFERENCES change_requests(id) ON DELETE CASCADE,
  name text NOT NULL,
  url text NOT NULL,
  user_id uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE change_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

-- Policies for change_requests
CREATE POLICY "Users can view their own requests"
  ON change_requests
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    approver_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

CREATE POLICY "Users can create their own requests"
  ON change_requests
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own pending requests"
  ON change_requests
  FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() AND 
    status = 'Pending'
  );

-- Policies for attachments
CREATE POLICY "Users can view attachments for their requests"
  ON attachments
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR 
    change_request_id IN (
      SELECT id FROM change_requests 
      WHERE approver_email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

CREATE POLICY "Users can upload attachments to their requests"
  ON attachments
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for updating timestamp
CREATE TRIGGER update_change_requests_updated_at
    BEFORE UPDATE ON change_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();