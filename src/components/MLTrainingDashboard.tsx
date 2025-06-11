import React, { useState, useEffect } from 'react';
import { Brain, Database, TrendingUp, Users, Download, Upload, Settings, AlertCircle, CheckCircle } from 'lucide-react';
import { dataCollectionService } from '../services/dataCollectionService';

interface TrainingStats {
  totalProjects: number;
  totalDocuments: number;
  totalAnnotations: number;
  avgQualityScore: number;
  dataByRegion: { [region: string]: number };
  dataByType: { [type: string]: number };
}

export default function MLTrainingDashboard() {
  const [stats, setStats] = useState<TrainingStats>({
    totalProjects: 0,
    totalDocuments: 0,
    totalAnnotations: 0,
    avgQualityScore: 0,
    dataByRegion: {},
    dataByType: {}
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [trainingStatus, setTrainingStatus] = useState<'idle' | 'collecting' | 'training' | 'completed'>('idle');

  useEffect(() => {
    loadTrainingStats();
  }, []);

  const loadTrainingStats = async () => {
    try {
      const trainingStats = await dataCollectionService.getTrainingDataStats();
      setStats(trainingStats);
    } catch (error) {
      console.error('Error loading training stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async (format: 'json' | 'csv') => {
    try {
      const data = await dataCollectionService.exportTrainingData(format);
      const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `training_data.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const handleStartTraining = async () => {
    setTrainingStatus('collecting');
    
    // Simulate training process
    setTimeout(() => setTrainingStatus('training'), 2000);
    setTimeout(() => setTrainingStatus('completed'), 8000);
    setTimeout(() => setTrainingStatus('idle'), 12000);
  };

  const tabs = [
    { id: 'overview', name: 'Overview', icon: TrendingUp },
    { id: 'data', name: 'Training Data', icon: Database },
    { id: 'models', name: 'Models', icon: Brain },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">ML Training Dashboard</h2>
        <p className="text-gray-600">Manage custom machine learning models and training data</p>
      </div>

      {/* Training Status Banner */}
      {trainingStatus !== 'idle' && (
        <div className={`mb-6 p-4 rounded-lg border ${
          trainingStatus === 'completed' 
            ? 'bg-green-50 border-green-200' 
            : 'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center space-x-3">
            {trainingStatus === 'completed' ? (
              <CheckCircle className="w-5 h-5 text-green-600" />
            ) : (
              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            )}
            <div>
              <h3 className={`font-medium ${
                trainingStatus === 'completed' ? 'text-green-900' : 'text-blue-900'
              }`}>
                {trainingStatus === 'collecting' && 'Collecting Training Data...'}
                {trainingStatus === 'training' && 'Training Models...'}
                {trainingStatus === 'completed' && 'Training Completed Successfully!'}
              </h3>
              <p className={`text-sm ${
                trainingStatus === 'completed' ? 'text-green-700' : 'text-blue-700'
              }`}>
                {trainingStatus === 'collecting' && 'Gathering data from completed projects and user annotations.'}
                {trainingStatus === 'training' && 'Training document analysis, quantity extraction, and cost prediction models.'}
                {trainingStatus === 'completed' && 'New models are ready for deployment. Accuracy improved by 3.2%.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Training Projects</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjects.toLocaleString()}</p>
            </div>
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Projects with complete data</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Documents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDocuments.toLocaleString()}</p>
            </div>
            <Brain className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Annotated documents</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">User Annotations</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAnnotations.toLocaleString()}</p>
            </div>
            <Users className="w-8 h-8 text-purple-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Manual corrections & verifications</p>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Data Quality</p>
              <p className="text-2xl font-bold text-gray-900">{(stats.avgQualityScore * 100).toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-xs text-gray-500 mt-2">Average quality score</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Training Progress */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Training Progress</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Data Collection Status</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Projects with complete data</span>
                        <span className="text-sm font-medium">{stats.totalProjects}/1000 target</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((stats.totalProjects / 1000) * 100, 100)}%` }}
                        ></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Document annotations</span>
                        <span className="text-sm font-medium">{stats.totalDocuments}/5000 target</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((stats.totalDocuments / 5000) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">Model Performance</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Document Classification</span>
                        <span className="text-sm font-medium text-green-600">94.2%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-green-600 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Quantity Extraction</span>
                        <span className="text-sm font-medium text-yellow-600">87.8%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '87.8%' }}></div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Cost Prediction</span>
                        <span className="text-sm font-medium text-blue-600">91.5%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: '91.5%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Distribution */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Distribution</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">By Region</h4>
                    <div className="space-y-2">
                      {Object.entries(stats.dataByRegion).map(([region, count]) => (
                        <div key={region} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{region}</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3">By Project Type</h4>
                    <div className="space-y-2">
                      {Object.entries(stats.dataByType).map(([type, count]) => (
                        <div key={type} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{type}</span>
                          <span className="text-sm font-medium">{count}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Training Data Management</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleExportData('json')}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export JSON</span>
                  </button>
                  <button
                    onClick={() => handleExportData('csv')}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Data Collection in Progress</h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      We're continuously collecting training data from completed projects and user feedback. 
                      The more data we collect, the better our models become.
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Document Types</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>CAD Drawings</span>
                      <span className="font-medium">{Math.floor(stats.totalDocuments * 0.4)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>BOQ Sheets</span>
                      <span className="font-medium">{Math.floor(stats.totalDocuments * 0.3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Specifications</span>
                      <span className="font-medium">{Math.floor(stats.totalDocuments * 0.2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Other</span>
                      <span className="font-medium">{Math.floor(stats.totalDocuments * 0.1)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Annotation Quality</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>High Quality (>90%)</span>
                      <span className="font-medium text-green-600">65%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medium Quality (70-90%)</span>
                      <span className="font-medium text-yellow-600">25%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Low Quality (<70%)</span>
                      <span className="font-medium text-red-600">10%</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Recent Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="text-gray-600">
                      <span className="font-medium">+15</span> new projects today
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">+42</span> annotations this week
                    </div>
                    <div className="text-gray-600">
                      <span className="font-medium">+128</span> corrections this month
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'models' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Model Management</h3>
                <button
                  onClick={handleStartTraining}
                  disabled={trainingStatus !== 'idle'}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  <Brain className="w-4 h-4" />
                  <span>Start Training</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Document Analysis</h4>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Version</span>
                      <span className="font-medium">v2.1.0</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Accuracy</span>
                      <span className="font-medium text-green-600">94.2%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="font-medium">2 days ago</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Training Data</span>
                      <span className="font-medium">2,847 docs</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Quantity Extraction</h4>
                    <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                      Training
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Version</span>
                      <span className="font-medium">v1.8.3</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Accuracy</span>
                      <span className="font-medium text-yellow-600">87.8%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="font-medium">5 days ago</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Training Data</span>
                      <span className="font-medium">1,923 docs</span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-gray-900">Cost Prediction</h4>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                      Active
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Version</span>
                      <span className="font-medium">v3.0.1</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Accuracy</span>
                      <span className="font-medium text-green-600">91.5%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Last Updated</span>
                      <span className="font-medium">1 day ago</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Training Data</span>
                      <span className="font-medium">3,156 projects</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Training Recommendations</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Collect more BOQ documents to improve quantity extraction accuracy</li>
                  <li>• Add regional cost data for better international predictions</li>
                  <li>• Increase annotation quality for complex project types</li>
                  <li>• Consider ensemble methods for improved overall accuracy</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Training Configuration</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Data Collection Settings</h4>
                  
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Auto-collect from completed projects</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                      <span className="ml-2 text-sm text-gray-700">Include user corrections in training</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                      <span className="ml-2 text-sm text-gray-700">Enable synthetic data generation</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Training Parameters</h4>
                  
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Minimum Data Quality Score
                      </label>
                      <input 
                        type="range" 
                        min="0.5" 
                        max="1.0" 
                        step="0.1" 
                        defaultValue="0.8"
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>50%</span>
                        <span>80%</span>
                        <span>100%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Training Frequency
                      </label>
                      <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                        <option>Weekly</option>
                        <option>Bi-weekly</option>
                        <option>Monthly</option>
                        <option>Manual</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="font-medium text-gray-900 mb-4">Advanced Settings</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">Enable Continuous Learning</h5>
                      <p className="text-sm text-gray-600">Automatically retrain models with new data</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">Data Privacy Mode</h5>
                      <p className="text-sm text-gray-600">Anonymize all training data</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}