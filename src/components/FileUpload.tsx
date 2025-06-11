import React, { useState, useCallback, useEffect } from 'react';
import { Upload, File, X, FileText, Image, Calendar, AlertCircle, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { uploadProjectFiles, validateStorageBucket } from '../services/fileUpload';
import { localizationService } from '../utils/localization';

interface FileUploadProps {
  onProcessingStart: (projectId: string, projectName: string, projectType: string) => void;
}

export default function FileUpload({ onProcessingStart }: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [storageStatus, setStorageStatus] = useState<'checking' | 'available' | 'unavailable'>('checking');
  const { createProject } = useProjects();

  // Get localized project types
  const projectTypes = localizationService.getLocalizedProjectTypes();
  
  // Set default project type
  useEffect(() => {
    if (!projectType && projectTypes.length > 0) {
      setProjectType(projectTypes[0]);
    }
  }, [projectTypes, projectType]);

  // Check storage bucket availability on component mount
  useEffect(() => {
    const checkStorage = async () => {
      try {
        const isAvailable = await validateStorageBucket();
        setStorageStatus(isAvailable ? 'available' : 'unavailable');
      } catch (error) {
        console.error('Storage validation error:', error);
        setStorageStatus('unavailable');
      }
    };

    checkStorage();
  }, []);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    validateAndAddFiles(files);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      validateAndAddFiles(files);
    }
  };

  const validateAndAddFiles = (files: File[]) => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach(file => {
      // Check file size (50MB limit)
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        errors.push(`${file.name} is too large (max 50MB)`);
        return;
      }

      // Check file type
      const allowedTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv'
      ];

      const allowedExtensions = ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.dwg', '.dxf', '.docx', '.xlsx', '.txt', '.csv'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        errors.push(`${file.name} is not a supported file type`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join(', '));
    } else {
      setError('');
    }

    setUploadedFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['pdf'].includes(ext || '')) return FileText;
    if (['jpg', 'jpeg', 'png', 'gif', 'dwg', 'dxf'].includes(ext || '')) return Image;
    return File;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleStartProcessing = async () => {
    if (uploadedFiles.length === 0 || !projectName.trim()) {
      setError('Please provide a project name and upload at least one file');
      return;
    }

    if (storageStatus !== 'available') {
      setError('Storage service is not available. Please try again later or contact support.');
      return;
    }

    setUploading(true);
    setError('');

    try {
      console.log('Creating project...');
      
      // Create project
      const project = await createProject({
        name: projectName.trim(),
        type: projectType,
        status: 'draft',
      });

      if (!project) {
        throw new Error('Failed to create project');
      }

      console.log('Project created:', project.id);
      console.log('Uploading files...');

      // Upload files
      const uploadedFileRecords = await uploadProjectFiles(project.id, uploadedFiles);
      
      console.log(`Successfully uploaded ${uploadedFileRecords.length} files`);

      // Start processing
      onProcessingStart(project.id, projectName.trim(), projectType);
    } catch (err) {
      console.error('Error in handleStartProcessing:', err);
      
      let errorMessage = 'Failed to create project';
      if (err instanceof Error) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const currentCountry = localizationService.getCurrentCountry();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create New Estimation Project</h2>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Upload your project documents, drawings, and BOQ sheets for AI-powered cost estimation.</span>
          <span>•</span>
          <span>Localized for {currentCountry.name}</span>
          <span>•</span>
          <span>Costs in {currentCountry.currency}</span>
        </div>
      </div>

      {/* Storage Status */}
      <div className={`mb-6 p-4 rounded-lg border ${
        storageStatus === 'available' ? 'bg-green-50 border-green-200' :
        storageStatus === 'unavailable' ? 'bg-red-50 border-red-200' :
        'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center space-x-3">
          {storageStatus === 'available' ? (
            <Wifi className="w-5 h-5 text-green-600" />
          ) : storageStatus === 'unavailable' ? (
            <WifiOff className="w-5 h-5 text-red-600" />
          ) : (
            <div className="w-5 h-5 border-2 border-yellow-600 border-t-transparent rounded-full animate-spin" />
          )}
          <div>
            <h3 className={`font-medium ${
              storageStatus === 'available' ? 'text-green-900' :
              storageStatus === 'unavailable' ? 'text-red-900' :
              'text-yellow-900'
            }`}>
              {storageStatus === 'available' ? 'Storage Ready' :
               storageStatus === 'unavailable' ? 'Storage Unavailable' :
               'Checking Storage...'}
            </h3>
            <p className={`text-sm ${
              storageStatus === 'available' ? 'text-green-700' :
              storageStatus === 'unavailable' ? 'text-red-700' :
              'text-yellow-700'
            }`}>
              {storageStatus === 'available' ? 'File upload service is ready and operational.' :
               storageStatus === 'unavailable' ? 'File upload service is currently unavailable. Please try again later.' :
               'Verifying file upload service availability...'}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Regional Notice */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">{currentCountry.code === 'US' ? '🇺🇸' : '🌍'}</div>
          <div>
            <h3 className="font-medium text-blue-900 mb-1">Regional Settings Applied</h3>
            <p className="text-sm text-blue-700">
              Your project will be estimated using {currentCountry.name} market rates, {currentCountry.currency} currency, 
              and {currentCountry.measurementSystem} measurement system. Regional cost factors and local building standards will be applied.
            </p>
          </div>
        </div>
      </div>

      {/* Project Details */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Office Complex Phase 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project Type</label>
            <select 
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {projectTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* File Upload Area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Documents</h3>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            dragActive 
              ? 'border-blue-400 bg-blue-50' 
              : storageStatus === 'available'
              ? 'border-gray-300 hover:border-gray-400'
              : 'border-gray-200 bg-gray-50'
          } ${storageStatus !== 'available' ? 'opacity-50 cursor-not-allowed' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-900 mb-2">
            {storageStatus === 'available' 
              ? 'Drop your files here, or click to browse'
              : 'File upload temporarily unavailable'
            }
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supports PDF, CAD files (DWG, DXF), images (JPG, PNG), and Excel sheets (max 50MB each)
          </p>
          <input
            type="file"
            multiple
            accept=".pdf,.dwg,.dxf,.jpg,.jpeg,.png,.xls,.xlsx,.docx,.txt,.csv"
            onChange={handleFileInput}
            className="hidden"
            id="file-upload"
            disabled={storageStatus !== 'available'}
          />
          <label
            htmlFor="file-upload"
            className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors ${
              storageStatus === 'available'
                ? 'bg-blue-600 text-white hover:bg-blue-700 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose Files
          </label>
        </div>

        {/* Supported File Types */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <FileText className="w-4 h-4" />
            <span>PDF Documents</span>
          </div>
          <div className="flex items-center space-x-2">
            <Image className="w-4 h-4" />
            <span>CAD Drawings</span>
          </div>
          <div className="flex items-center space-x-2">
            <File className="w-4 h-4" />
            <span>BOQ Sheets</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <span>Specifications</span>
          </div>
        </div>
      </div>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Uploaded Files ({uploadedFiles.length})</h3>
          <div className="space-y-3">
            {uploadedFiles.map((file, index) => {
              const FileIcon = getFileIcon(file.name);
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <FileIcon className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <button
                      onClick={() => removeFile(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                      disabled={uploading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <button 
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          disabled={uploading}
        >
          Save as Draft
        </button>
        <button
          onClick={handleStartProcessing}
          disabled={uploadedFiles.length === 0 || !projectName.trim() || uploading || storageStatus !== 'available'}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
        >
          {uploading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating Project...</span>
            </>
          ) : (
            <span>Start AI Processing</span>
          )}
        </button>
      </div>
    </div>
  );
}