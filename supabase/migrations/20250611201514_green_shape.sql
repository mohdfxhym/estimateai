/*
  # Fix RLS policies for file upload functionality

  1. Storage Policies
    - Create policy to allow authenticated users to upload files to their own project folders
    - Create policy to allow authenticated users to read files from their own project folders
    - Create policy to allow authenticated users to delete files from their own project folders

  2. Database Policies
    - The existing policies for project_files table should work, but we'll ensure they're correct
    - Users can only insert/read/update/delete files for projects they own

  3. Security
    - All policies check that the user owns the project before allowing operations
    - Storage policies use folder-based access control matching project IDs
*/

-- Storage policies for project-files bucket
-- Allow authenticated users to upload files to their own project folders
CREATE POLICY "Allow authenticated users to upload to their own project folders"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'project-files' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to read files from their own project folders
CREATE POLICY "Allow authenticated users to read their own project files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'project-files' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- Allow authenticated users to delete files from their own project folders
CREATE POLICY "Allow authenticated users to delete their own project files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'project-files' 
  AND (storage.foldername(name))[1]::uuid IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

-- Ensure the project_files table policies are correct
-- Drop existing policies if they exist and recreate them to ensure they're correct
DROP POLICY IF EXISTS "Users can insert files to own projects" ON public.project_files;
DROP POLICY IF EXISTS "Users can read files from own projects" ON public.project_files;
DROP POLICY IF EXISTS "Users can update files from own projects" ON public.project_files;
DROP POLICY IF EXISTS "Users can delete files from own projects" ON public.project_files;

-- Recreate project_files table policies
CREATE POLICY "Users can insert files to own projects"
ON public.project_files
FOR INSERT
TO authenticated
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can read files from own projects"
ON public.project_files
FOR SELECT
TO authenticated
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update files from own projects"
ON public.project_files
FOR UPDATE
TO authenticated
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
)
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete files from own projects"
ON public.project_files
FOR DELETE
TO authenticated
USING (
  project_id IN (
    SELECT id FROM public.projects WHERE user_id = auth.uid()
  )
);