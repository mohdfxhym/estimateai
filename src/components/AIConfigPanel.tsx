import React, { useState, useEffect } from 'react';
import { Settings, Brain, Key, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { aiProviderService } from '../services/aiProviders';

interface AIConfigPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIConfigPanel({ isOpen, onClose }: AIConfigPanelProps) {
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [currentProvider, setCurrentProvider] = useState<string>('');
  const [showApiKeys, setShowApiKeys] = useState(false);

  useEffect(() => {
    const providers = aiProviderService.getAvailableProviders();
    setAvailableProviders(providers);
    setCurrentProvider(import.meta.env.VITE_AI_PROVIDER || providers[0] || 'none');
  }, []);

  if (!isOpen) return null;

  const providerInfo = {
    openai: {
      name: 'OpenAI GPT-4 Vision',
      description: 'Advanced vision and text analysis for construction documents',
      models: ['gpt-4o', 'gpt-4-turbo', 'gpt-4'],
      strengths: ['Excellent image analysis', 'Detailed cost breakdowns', 'High accuracy'],
      apiKeyEnv: 'VITE_OPENAI_API_KEY'
    },
    anthropic: {
      name: 'Anthropic Claude',
      description: 'Sophisticated reasoning for complex construction analysis',
      models: ['claude-3-sonnet-20240229', 'claude-3-opus-20240229'],
      strengths: ['Deep reasoning', 'Context understanding', 'Risk assessment'],
      apiKeyEnv: 'VITE_ANTHROPIC_API_KEY'
    },
    google: {
      name: 'Google Gemini',
      description: 'Multimodal AI for comprehensive document understanding',
      models: ['gemini-pro-vision', 'gemini-pro'],
      strengths: ['Fast processing', 'Multi-language support', 'Cost effective'],
      apiKeyEnv: 'VITE_GOOGLE_AI_API_KEY'
    }
  };

  const hasApiKey = (provider: string) => {
    const info = providerInfo[provider as keyof typeof providerInfo];
    return !!import.meta.env[info?.apiKeyEnv];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">AI Configuration</h2>
                <p className="text-sm text-gray-600">Configure AI providers for document analysis</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6">
          {/* Current Status */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-900">Current Configuration</h3>
            </div>
            <div className="text-sm text-blue-700">
              {availableProviders.length > 0 ? (
                <>
                  <p>✅ AI providers configured: {availableProviders.length}</p>
                  <p>🤖 Active provider: {currentProvider}</p>
                  <p>📊 Real-time analysis: Enabled</p>
                </>
              ) : (
                <>
                  <p>⚠️ No AI providers configured</p>
                  <p>🔄 Using fallback simulation mode</p>
                  <p>💡 Add API keys below to enable real AI analysis</p>
                </>
              )}
            </div>
          </div>

          {/* Provider Cards */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Available AI Providers</h3>
            
            {Object.entries(providerInfo).map(([key, info]) => (
              <div key={key} className={`border rounded-lg p-4 ${
                hasApiKey(key) ? 'border-green-200 bg-green-50' : 'border-gray-200'
              }`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h4 className="font-medium text-gray-900">{info.name}</h4>
                      {hasApiKey(key) ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{info.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h5 className="text-xs font-medium text-gray-700 mb-1">Supported Models</h5>
                        <div className="flex flex-wrap gap-1">
                          {info.models.map(model => (
                            <span key={model} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                              {model}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h5 className="text-xs font-medium text-gray-700 mb-1">Key Strengths</h5>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {info.strengths.map(strength => (
                            <li key={strength}>• {strength}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
                
                {!hasApiKey(key) && (
                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                    <div className="flex items-center space-x-2">
                      <Key className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm font-medium text-yellow-800">API Key Required</span>
                    </div>
                    <p className="text-xs text-yellow-700 mt-1">
                      Add <code className="bg-yellow-100 px-1 rounded">{info.apiKeyEnv}</code> to your environment variables
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Setup Instructions */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-3">Setup Instructions</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div>
                <h4 className="font-medium text-gray-800">1. Get API Keys</h4>
                <ul className="ml-4 space-y-1">
                  <li>• OpenAI: <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">platform.openai.com/api-keys</a></li>
                  <li>• Anthropic: <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">console.anthropic.com</a></li>
                  <li>• Google AI: <a href="https://makersuite.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">makersuite.google.com/app/apikey</a></li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-800">2. Add Environment Variables</h4>
                <p>Create a <code className="bg-gray-200 px-1 rounded">.env</code> file in your project root:</p>
                <pre className="mt-2 p-2 bg-gray-800 text-green-400 rounded text-xs overflow-x-auto">
{`# Choose your preferred AI provider
VITE_AI_PROVIDER=openai
VITE_AI_MODEL=gpt-4o

# Add your API keys (you only need one)
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_ANTHROPIC_API_KEY=your_anthropic_api_key
VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key`}
                </pre>
              </div>

              <div>
                <h4 className="font-medium text-gray-800">3. Restart Development Server</h4>
                <p>After adding environment variables, restart your development server to apply changes.</p>
              </div>
            </div>
          </div>

          {/* API Key Visibility Toggle */}
          <div className="mt-4 flex items-center justify-between">
            <button
              onClick={() => setShowApiKeys(!showApiKeys)}
              className="text-sm text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <Key className="w-4 h-4" />
              <span>{showApiKeys ? 'Hide' : 'Show'} Current API Keys</span>
            </button>
          </div>

          {showApiKeys && (
            <div className="mt-3 p-3 bg-gray-100 rounded text-xs font-mono">
              <div>OpenAI: {import.meta.env.VITE_OPENAI_API_KEY ? '••••••••' + import.meta.env.VITE_OPENAI_API_KEY.slice(-4) : 'Not set'}</div>
              <div>Anthropic: {import.meta.env.VITE_ANTHROPIC_API_KEY ? '••••••••' + import.meta.env.VITE_ANTHROPIC_API_KEY.slice(-4) : 'Not set'}</div>
              <div>Google: {import.meta.env.VITE_GOOGLE_AI_API_KEY ? '••••••••' + import.meta.env.VITE_GOOGLE_AI_API_KEY.slice(-4) : 'Not set'}</div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}