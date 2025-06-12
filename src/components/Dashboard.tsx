import React from 'react';
import { TrendingUp, FileText, DollarSign, Clock, BarChart3, PieChart, Plus } from 'lucide-react';
import { useProjects } from '../hooks/useProjects';
import { useAuth } from '../hooks/useAuth';
import { localizationService } from '../utils/localization';

interface DashboardProps {
  onNewProject: () => void;
}

export default function Dashboard({ onNewProject }: DashboardProps) {
  const { projects, loading } = useProjects();
  const { user } = useAuth();

  const formatCurrency = (amount: number) => {
    return localizationService.formatCurrency(amount);
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const completedProjects = projects.filter(p => p.status === 'completed');
  const totalEstimatedValue = completedProjects.reduce((sum, p) => sum + (p.total_cost || 0), 0);
  const avgAccuracy = completedProjects.length > 0 
    ? completedProjects.reduce((sum, p) => sum + (p.accuracy || 0), 0) / completedProjects.length 
    : 0;
  const avgProcessingTime = completedProjects.length > 0 ? '3.2min' : '0min';

  const stats = [
    { 
      title: 'Projects This Month', 
      value: projects.length.toString(), 
      change: '+12%', 
      icon: FileText, 
      color: 'blue' 
    },
    { 
      title: 'Total Estimates', 
      value: formatCurrency(totalEstimatedValue), 
      change: '+8%', 
      icon: DollarSign, 
      color: 'green' 
    },
    { 
      title: 'Avg Processing Time', 
      value: avgProcessingTime, 
      change: '-15%', 
      icon: Clock, 
      color: 'orange' 
    },
    { 
      title: 'Accuracy Rate', 
      value: `${avgAccuracy.toFixed(1)}%`, 
      change: '+2%', 
      icon: TrendingUp, 
      color: 'purple' 
    },
  ];

  const recentProjects = projects.slice(0, 4).map(project => ({
    name: project.name,
    status: project.status === 'completed' ? 'Completed' : 
            project.status === 'processing' ? 'Processing' : 
            project.status === 'review' ? 'Review' : 'Draft',
    date: new Date(project.created_at).toLocaleDateString(),
    cost: project.total_cost ? formatCurrency(project.total_cost) : 'Pending',
    accuracy: project.accuracy ? `${project.accuracy}%` : 'N/A',
  }));

  const currentCountry = localizationService.getCurrentCountry();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email?.split('@')[0] || 'User'}
          </h2>
          <p className="text-gray-600">
            Here's what's happening with your estimation projects today. 
            <span className="ml-2 text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              {currentCountry.name} • {currentCountry.currency}
            </span>
          </p>
        </div>
        <button
          onClick={onNewProject}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'green' ? 'bg-green-100' :
                  stat.color === 'orange' ? 'bg-orange-100' :
                  'bg-purple-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' :
                    stat.color === 'orange' ? 'text-orange-600' :
                    'text-purple-600'
                  }`} />
                </div>
                <span className={`text-sm font-medium ${
                  stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.title}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Projects */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Projects</h3>
            </div>
            <div className="p-6">
              {recentProjects.length > 0 ? (
                <div className="space-y-4">
                  {recentProjects.map((project, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        <p className="text-sm text-gray-500 mt-1">{project.date}</p>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">{project.cost}</p>
                          <p className="text-sm text-gray-500">{project.accuracy} accuracy</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          project.status === 'Completed' ? 'bg-green-100 text-green-800' :
                          project.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                          project.status === 'Review' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No projects yet</p>
                  <button
                    onClick={onNewProject}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Your First Project
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Quick Analytics */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Cost Distribution</h3>
              <PieChart className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Materials</span>
                <span className="text-sm font-medium">45%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Labor</span>
                <span className="text-sm font-medium">35%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '35%' }}></div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Equipment</span>
                <span className="text-sm font-medium">20%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-orange-600 h-2 rounded-full" style={{ width: '20%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Monthly Trend</h3>
              <BarChart3 className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="text-sm font-medium text-green-600">+12%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Last Month</span>
                <span className="text-sm font-medium text-gray-900">+8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">3 Months Ago</span>
                <span className="text-sm font-medium text-gray-900">+5%</span>
              </div>
            </div>
          </div>

          {/* Currency Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <div className="text-lg">{currentCountry.code === 'US' ? '🇺🇸' : '🌍'}</div>
              <h4 className="font-medium text-blue-900">Regional Settings</h4>
            </div>
            <div className="text-sm text-blue-700 space-y-1">
              <p>Currency: {currentCountry.currency}</p>
              <p>Units: {currentCountry.measurementSystem}</p>
              <p>Market: {currentCountry.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}