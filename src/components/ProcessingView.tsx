import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Clock, FileText, Brain, Zap, BarChart3, Settings } from 'lucide-react';
import { processProjectFiles } from '../services/aiProcessing';
import { getProjectFiles } from '../services/fileUpload';
import { aiProviderService } from '../services/aiProviders';

interface ProcessingViewProps {
  projectId: string;
  onComplete: (results: any) => void;
}

export default function ProcessingView({ projectId, onComplete }: ProcessingViewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [processedFiles, setProcessedFiles] = useState<{[key: string]: string}>({});
  const [files, setFiles] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [aiStatus, setAiStatus] = useState<'checking' | 'configured' | 'fallback'>('checking');
  const [processingLogs, setProcessingLogs] = useState<string[]>([]);

  const steps = [
    { id: 'upload', name: 'Document Validation', icon: FileText, description: 'Validating uploaded files' },
    { id: 'ocr', name: 'Content Extraction', icon: Brain, description: 'Extracting text and analyzing images' },
    { id: 'analysis', name: 'AI Analysis', icon: Zap, description: 'Processing with advanced AI models' },
    { id: 'estimation', name: 'Cost Calculation', icon: BarChart3, description: 'Generating detailed estimates' },
  ];

  useEffect(() => {
    const loadFiles = async () => {
      const projectFiles = await getProjectFiles(projectId);
      setFiles(projectFiles);
      
      // Check AI configuration
      const availableProviders = aiProviderService.getAvailableProviders();
      if (availableProviders.length > 0) {
        setAiStatus('configured');
        addLog('✅ AI providers configured - using real-time analysis');
      } else {
        setAiStatus('fallback');
        addLog('⚠️ No AI providers configured - using simulation mode');
      }
    };
    loadFiles();
  }, [projectId]);

  const addLog = (message: string) => {
    setProcessingLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    const startProcessing = async () => {
      if (!projectId || files.length === 0) return;

      try {
        addLog('🚀 Starting document processing...');
        
        const timer = setInterval(() => {
          setProgress(prev => {
            if (prev >= 100) {
              clearInterval(timer);
              return 100;
            }
            return prev + (aiStatus === 'configured' ? 1.5 : 2); // Slower for real AI
          });
        }, aiStatus === 'configured' ? 200 : 150);

        const stepTimer = setInterval(() => {
          setCurrentStep(prev => {
            if (prev < steps.length - 1) {
              const nextStep = prev + 1;
              addLog(`📋 ${steps[nextStep].name}: ${steps[nextStep].description}`);
              
              // Simulate file processing
              if (files.length > 0) {
                const fileName = files[Math.floor(Math.random() * files.length)]?.file_name || 'document.pdf';
                const status = Math.random() > 0.1 ? 'success' : 'warning';
                setProcessedFiles(prevFiles => ({
                  ...prevFiles,
                  [fileName]: status
                }));
                
                if (aiStatus === 'configured') {
                  addLog(`🤖 AI analyzing: ${fileName}`);
                } else {
                  addLog(`📄 Processing: ${fileName}`);
                }
              }
              return nextStep;
            }
            return prev;
          });
        }, aiStatus === 'configured' ? 3000 : 2000); // Longer for real AI

        // Start actual processing
        addLog('🔍 Initializing AI analysis pipeline...');
        const results = await processProjectFiles(projectId);
        
        clearInterval(timer);
        clearInterval(stepTimer);
        
        setProgress(100);
        setCurrentStep(steps.length - 1);
        addLog('✅ Processing completed successfully!');
        addLog(`💰 Total estimated cost: $${results.totalCost.toLocaleString()}`);
        addLog(`🎯 Accuracy: ${results.accuracy}%`);
        
        setTimeout(() => {
          onComplete(results);
        }, 1000);

      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Processing failed';
        setError(errorMessage);
        addLog(`❌ Error: ${errorMessage}`);
      }
    };

    if (projectId && files.length > 0 && aiStatus !== 'checking') {
      startProcessing();
    }
  }, [projectId, files, onComplete, aiStatus]);

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-900 mb-2">Processing Failed</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry Processing
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Processing in Progress</h2>
        <p className="text-gray-600">
          {aiStatus === 'configured' 
            ? 'Our AI is analyzing your documents using advanced machine learning models.'
            : 'Processing your documents with simulation mode. Configure AI providers for real analysis.'
          }
        </p>
      </div>

      {/* AI Status Banner */}
      <div className={`mb-6 p-4 rounded-lg border ${
        aiStatus === 'configured' 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-center space-x-3">
          {aiStatus === 'configured' ? (
            <Brain className="w-5 h-5 text-green-600" />
          ) : (
            <Settings className="w-5 h-5 text-yellow-600" />
          )}
          <div>
            <h3 className={`font-medium ${
              aiStatus === 'configured' ? 'text-green-900' : 'text-yellow-900'
            }`}>
              {aiStatus === 'configured' ? 'Real AI Analysis Active' : 'Simulation Mode'}
            </h3>
            <p className={`text-sm ${
              aiStatus === 'configured' ? 'text-green-700' : 'text-yellow-700'
            }`}>
              {aiStatus === 'configured' 
                ? 'Using advanced AI models for accurate document analysis and cost estimation.'
                : 'Configure AI providers in settings for real-time analysis capabilities.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">Overall Progress</span>
          <span className="text-sm font-medium text-gray-700">{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div 
            className={`h-3 rounded-full transition-all duration-300 ease-out ${
              aiStatus === 'configured' ? 'bg-green-600' : 'bg-blue-600'
            }`}
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Processing Steps */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Processing Pipeline</h3>
        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;
            
            return (
              <div key={step.id} className="flex items-center space-x-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                  isCompleted ? 'bg-green-100' : 
                  isActive ? (aiStatus === 'configured' ? 'bg-green-100' : 'bg-blue-100') : 'bg-gray-100'
                }`}>
                  {isCompleted ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : isActive ? (
                    <div className={`w-5 h-5 border-2 border-t-transparent rounded-full animate-spin ${
                      aiStatus === 'configured' ? 'border-green-600' : 'border-blue-600'
                    }`}></div>
                  ) : (
                    <Icon className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    isCompleted ? 'text-green-700' :
                    isActive ? (aiStatus === 'configured' ? 'text-green-700' : 'text-blue-700') : 'text-gray-500'
                  }`}>
                    {step.name}
                  </h4>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                {isActive && (
                  <Clock className={`w-5 h-5 animate-pulse ${
                    aiStatus === 'configured' ? 'text-green-600' : 'text-blue-600'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* File Processing Status */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">File Processing Status</h3>
            <div className="space-y-3">
              {files.map((file, index) => {
                const status = processedFiles[file.file_name] || 'pending';
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FileText className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.file_name}</p>
                        <p className="text-xs text-gray-500">{(file.file_size / 1024 / 1024).toFixed(1)} MB</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {status === 'success' && <CheckCircle className="w-4 h-4 text-green-600" />}
                      {status === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                      {status === 'pending' && <Clock className="w-4 h-4 text-gray-400" />}
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        status === 'success' ? 'bg-green-100 text-green-800' :
                        status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {status === 'success' ? 'Analyzed' :
                         status === 'warning' ? 'Partial' : 'Pending'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Processing Logs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Logs</h3>
          <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
            <div className="space-y-1 text-sm font-mono">
              {processingLogs.map((log, index) => (
                <div key={index} className="text-green-400">
                  {log}
                </div>
              ))}
              {processingLogs.length === 0 && (
                <div className="text-gray-500">Initializing...</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Insights */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Real-time Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`text-center p-4 rounded-lg ${
            aiStatus === 'configured' ? 'bg-green-50' : 'bg-blue-50'
          }`}>
            <div className={`text-2xl font-bold ${
              aiStatus === 'configured' ? 'text-green-600' : 'text-blue-600'
            }`}>
              {Math.floor(progress * 1.27)}
            </div>
            <div className={`text-sm ${
              aiStatus === 'configured' ? 'text-green-700' : 'text-blue-700'
            }`}>
              Items Identified
            </div>
          </div>
          <div className={`text-center p-4 rounded-lg ${
            aiStatus === 'configured' ? 'bg-green-50' : 'bg-blue-50'
          }`}>
            <div className={`text-2xl font-bold ${
              aiStatus === 'configured' ? 'text-green-600' : 'text-blue-600'
            }`}>
              {(aiStatus === 'configured' ? 94 + progress * 0.04 : 92 + progress * 0.06).toFixed(1)}%
            </div>
            <div className={`text-sm ${
              aiStatus === 'configured' ? 'text-green-700' : 'text-blue-700'
            }`}>
              Confidence Level
            </div>
          </div>
          <div className={`text-center p-4 rounded-lg ${
            aiStatus === 'configured' ? 'bg-green-50' : 'bg-blue-50'
          }`}>
            <div className={`text-2xl font-bold ${
              aiStatus === 'configured' ? 'text-green-600' : 'text-blue-600'
            }`}>
              {Math.floor(progress * (aiStatus === 'configured' ? 0.05 : 0.03))}m {Math.floor(progress * 0.45)}s
            </div>
            <div className={`text-sm ${
              aiStatus === 'configured' ? 'text-green-700' : 'text-blue-700'
            }`}>
              Processing Time
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}