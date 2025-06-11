import React, { useState } from 'react';
import { Calculator, Settings, User, Bell, LogOut, Brain } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import AIConfigPanel from './AIConfigPanel';
import CountrySelector from './CountrySelector';

interface HeaderProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function Header({ activeView, onViewChange }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [showAIConfig, setShowAIConfig] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Calculator },
    { id: 'upload', label: 'New Project', icon: Calculator },
    { id: 'projects', label: 'Projects', icon: Calculator },
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  const handleCountryChange = () => {
    // Refresh the page to apply new localization settings
    window.location.reload();
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">EstimateAI</h1>
                <p className="text-sm text-gray-500">Smart Construction Estimation</p>
              </div>
            </div>
            
            <nav className="flex space-x-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeView === item.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            {/* Country Selector */}
            <CountrySelector onCountryChange={handleCountryChange} />
            
            <button 
              onClick={() => setShowAIConfig(true)}
              className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
              title="AI Configuration"
            >
              <Brain className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
              <Settings className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {user?.email?.split('@')[0] || 'User'}
              </span>
              <button
                onClick={handleSignOut}
                className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <AIConfigPanel 
        isOpen={showAIConfig} 
        onClose={() => setShowAIConfig(false)} 
      />
    </>
  );
}