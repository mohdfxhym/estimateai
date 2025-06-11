import { supabase } from '../lib/supabase';

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
}

export async function uploadProjectFiles(
  projectId: string,
  files: File[]
): Promise<UploadedFile[]> {
  const uploadedFiles: UploadedFile[] = [];

  // Validate that we have files to upload
  if (!files || files.length === 0) {
    throw new Error('No files provided for upload');
  }

  // Validate project ID
  if (!projectId) {
    throw new Error('Project ID is required for file upload');
  }

  for (const file of files) {
    try {
      // Validate file
      if (!file || file.size === 0) {
        console.warn(`Skipping invalid file: ${file?.name || 'unknown'}`);
        continue;
      }

      // Check file size (limit to 50MB)
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        throw new Error(`File "${file.name}" is too large. Maximum size is 50MB.`);
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2);
      const fileName = `${projectId}/${timestamp}-${randomId}.${fileExt}`;

      console.log(`Uploading file: ${file.name} as ${fileName}`);

      // Upload file to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('project-files')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        
        // Provide more specific error messages
        if (uploadError.message.includes('Bucket not found')) {
          throw new Error('Storage bucket not found. Please contact support.');
        } else if (uploadError.message.includes('not allowed')) {
          throw new Error('File type not allowed. Please check file permissions.');
        } else if (uploadError.message.includes('too large')) {
          throw new Error(`File "${file.name}" is too large. Please reduce file size.`);
        } else {
          throw new Error(`Failed to upload "${file.name}": ${uploadError.message}`);
        }
      }

      if (!uploadData) {
        throw new Error(`Upload failed for "${file.name}": No data returned`);
      }

      console.log('Upload successful:', uploadData);

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-files')
        .getPublicUrl(fileName);

      if (!publicUrl) {
        throw new Error(`Failed to get public URL for "${file.name}"`);
      }

      console.log('Public URL generated:', publicUrl);

      // Save file record to database
      const { data: fileRecord, error: dbError } = await supabase
        .from('project_files')
        .insert({
          project_id: projectId,
          file_name: file.name,
          file_size: file.size,
          file_type: file.type || 'application/octet-stream',
          file_url: fileName, // Store the storage path, not the full URL
          processing_status: 'pending',
        })
        .select()
        .single();

      if (dbError) {
        console.error('Database error:', dbError);
        
        // Try to clean up uploaded file if database insert fails
        try {
          await supabase.storage
            .from('project-files')
            .remove([fileName]);
        } catch (cleanupError) {
          console.warn('Failed to cleanup uploaded file:', cleanupError);
        }
        
        throw new Error(`Failed to save file record for "${file.name}": ${dbError.message}`);
      }

      if (!fileRecord) {
        throw new Error(`Failed to create file record for "${file.name}"`);
      }

      console.log('File record created:', fileRecord);

      uploadedFiles.push({
        id: fileRecord.id,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        url: publicUrl,
      });

      console.log(`Successfully uploaded: ${file.name}`);

    } catch (error) {
      console.error(`Error uploading file ${file.name}:`, error);
      
      // Re-throw the error with file context
      if (error instanceof Error) {
        throw new Error(`Error uploading file "${file.name}": ${error.message}`);
      } else {
        throw new Error(`Unknown error uploading file "${file.name}"`);
      }
    }
  }

  if (uploadedFiles.length === 0) {
    throw new Error('No files were successfully uploaded');
  }

  console.log(`Successfully uploaded ${uploadedFiles.length} files`);
  return uploadedFiles;
}

export async function getProjectFiles(projectId: string) {
  try {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    const { data, error } = await supabase
      .from('project_files')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching project files:', error);
      throw error;
    }

    console.log(`Found ${data?.length || 0} files for project ${projectId}`);
    return data || [];
  } catch (error) {
    console.error('Error fetching project files:', error);
    return [];
  }
}

export async function deleteProjectFile(fileId: string): Promise<boolean> {
  try {
    if (!fileId) {
      throw new Error('File ID is required');
    }

    // Get file record first to get the storage path
    const { data: fileRecord, error: fetchError } = await supabase
      .from('project_files')
      .select('file_url')
      .eq('id', fileId)
      .single();

    if (fetchError) {
      console.error('Error fetching file record:', fetchError);
      throw fetchError;
    }

    // Delete from storage
    if (fileRecord?.file_url) {
      const { error: storageError } = await supabase.storage
        .from('project-files')
        .remove([fileRecord.file_url]);

      if (storageError) {
        console.warn('Error deleting from storage:', storageError);
        // Continue with database deletion even if storage deletion fails
      }
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('project_files')
      .delete()
      .eq('id', fileId);

    if (dbError) {
      console.error('Error deleting file record:', dbError);
      throw dbError;
    }

    console.log(`Successfully deleted file ${fileId}`);
    return true;
  } catch (error) {
    console.error('Error deleting project file:', error);
    return false;
  }
}

// Utility function to check if storage bucket exists and is accessible
export async function validateStorageBucket(): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from('project-files')
      .list('', { limit: 1 });

    if (error) {
      console.error('Storage bucket validation failed:', error);
      return false;
    }

    console.log('Storage bucket is accessible');
    return true;
  } catch (error) {
    console.error('Storage bucket validation error:', error);
    return false;
  }
}