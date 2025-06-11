import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import AuthForm from './components/AuthForm';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import ProjectsList from './components/ProjectsList';
import FileUpload from './components/FileUpload';
import ProcessingView from './components/ProcessingView';
import EstimationResults from './components/EstimationResults';
import { useProjects } from './hooks/useProjects';

type ViewType = 'dashboard' | 'upload' | 'processing' | 'results' | 'projects';

function App() {
  const { user, loading } = useAuth();
  const { getProjectEstimation } = useProjects();
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [currentProjectName, setCurrentProjectName] = useState<string>('');
  const [currentProjectType, setCurrentProjectType] = useState<string>('');
  const [estimationResults, setEstimationResults] = useState<any>(null);

  const handleFileUpload = (projectId: string, projectName: string, projectType: string) => {
    setCurrentProjectId(projectId);
    setCurrentProjectName(projectName);
    setCurrentProjectType(projectType);
    setActiveView('processing');
  };

  const handleProcessingComplete = async (results: any) => {
    setEstimationResults(results);
    setActiveView('results');
  };

  const handleViewProject = (projectId: string, results: any) => {
    setCurrentProjectId(projectId);
    setEstimationResults(results);
    setActiveView('results');
  };

  const renderCurrentView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard onNewProject={() => setActiveView('upload')} />;
      case 'projects':
        return (
          <ProjectsList 
            onNewProject={() => setActiveView('upload')}
            onViewProject={handleViewProject}
          />
        );
      case 'upload':
        return <FileUpload onProcessingStart={handleFileUpload} />;
      case 'processing':
        return (
          <ProcessingView 
            projectId={currentProjectId} 
            onComplete={handleProcessingComplete} 
          />
        );
      case 'results':
        return estimationResults ? (
          <EstimationResults 
            results={estimationResults}
            projectName={currentProjectName}
            projectType={currentProjectType}
          />
        ) : (
          <Dashboard onNewProject={() => setActiveView('upload')} />
        );
      default:
        return <Dashboard onNewProject={() => setActiveView('upload')} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthForm />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header activeView={activeView} onViewChange={setActiveView} />
      <main className="min-h-[calc(100vh-80px)]">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;