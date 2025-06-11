/*
  # Construction Estimation Database Schema

  1. New Tables
    - `projects` - Main project table with cost estimation data
      - `id` (uuid, primary key)
      - `name` (text, project name)
      - `type` (text, project type)
      - `status` (text, processing status)
      - `total_cost` (numeric, estimated total cost)
      - `accuracy` (numeric, AI confidence percentage)
      - `processing_time` (text, time taken for processing)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
      - `user_id` (uuid, foreign key to auth.users)

    - `project_files` - File storage metadata
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `file_name` (text, original filename)
      - `file_size` (integer, file size in bytes)
      - `file_type` (text, MIME type)
      - `file_url` (text, storage URL)
      - `processing_status` (text, file processing status)
      - `created_at` (timestamp)

    - `estimation_items` - Individual cost line items
      - `id` (uuid, primary key)
      - `project_id` (uuid, foreign key to projects)
      - `category` (text, cost category)
      - `description` (text, item description)
      - `quantity` (numeric, quantity amount)
      - `unit` (text, unit of measurement)
      - `rate` (numeric, unit rate/price)
      - `amount` (numeric, total amount)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access only their own data
    - Foreign key constraints for data integrity

  3. Performance
    - Indexes on frequently queried columns
    - Automatic timestamp updates via triggers
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'processing', 'completed', 'review')),
  total_cost numeric DEFAULT 0,
  accuracy numeric DEFAULT 0,
  processing_time text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create project_files table
CREATE TABLE IF NOT EXISTS project_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_size integer NOT NULL DEFAULT 0,
  file_type text NOT NULL,
  file_url text NOT NULL,
  processing_status text NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'error')),
  created_at timestamptz DEFAULT now()
);

-- Create estimation_items table
CREATE TABLE IF NOT EXISTS estimation_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  category text NOT NULL,
  description text NOT NULL,
  quantity numeric NOT NULL DEFAULT 0,
  unit text NOT NULL,
  rate numeric NOT NULL DEFAULT 0,
  amount numeric NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_files_project_id ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_estimation_items_project_id ON estimation_items(project_id);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimation_items ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for projects table
CREATE POLICY "Users can read own projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create RLS policies for project_files table
CREATE POLICY "Users can read files from own projects"
  ON project_files
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_files.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert files to own projects"
  ON project_files
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_files.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update files from own projects"
  ON project_files
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_files.project_id 
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_files.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete files from own projects"
  ON project_files
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_files.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create RLS policies for estimation_items table
CREATE POLICY "Users can read estimation items from own projects"
  ON estimation_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = estimation_items.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert estimation items to own projects"
  ON estimation_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = estimation_items.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update estimation items from own projects"
  ON estimation_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = estimation_items.project_id 
      AND projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = estimation_items.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete estimation items from own projects"
  ON estimation_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = estimation_items.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at on projects table
CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();