import React, { useState } from 'react';
import { Calculator, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, signUp } = useAuth();

  const getErrorMessage = (error: any) => {
    if (error?.message?.includes('Invalid login credentials')) {
      return isSignUp 
        ? 'This email is already registered. Try signing in instead.'
        : 'Invalid email or password. Please check your credentials and try again.';
    }
    if (error?.message?.includes('Email not confirmed')) {
      return 'Please check your email and click the confirmation link before signing in.';
    }
    if (error?.message?.includes('User already registered')) {
      return 'This email is already registered. Try signing in instead.';
    }
    if (error?.message?.includes('Password should be at least')) {
      return 'Password must be at least 6 characters long.';
    }
    if (error?.message?.includes('Invalid email')) {
      return 'Please enter a valid email address.';
    }
    return error?.message || 'An unexpected error occurred. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error } = isSignUp 
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) {
        setError(getErrorMessage(error));
      } else if (isSignUp) {
        setError('');
        // Show success message for sign up
        setError('Account created successfully! You can now sign in.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calculator className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EstimateAI</h1>
          <p className="text-gray-600">Smart Construction Estimation Platform</p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isSignUp ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="text-gray-600">
              {isSignUp 
                ? 'Start your journey with AI-powered estimation' 
                : 'Sign in to access your projects'
              }
            </p>
          </div>

          {error && (
            <div className={`mb-4 p-3 border rounded-lg flex items-center space-x-2 ${
              error.includes('successfully') 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <AlertCircle className={`w-4 h-4 ${
                error.includes('successfully') ? 'text-green-600' : 'text-red-600'
              }`} />
              <span className={`text-sm ${
                error.includes('successfully') ? 'text-green-700' : 'text-red-700'
              }`}>
                {error}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your password"
                  required
                  minLength={6}
                />
              </div>
              {isSignUp && (
                <p className="text-xs text-gray-500 mt-1">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <User className="w-4 h-4" />
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(''); // Clear error when switching modes
              }}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignUp 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Sign up"
              }
            </button>
          </div>

          {!isSignUp && (
            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account yet? Click "Sign up" above to create one.
              </p>
            </div>
          )}
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Calculator className="w-4 h-4 text-blue-600" />
            </div>
            <p className="text-xs text-gray-600">AI-Powered Analysis</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <User className="w-4 h-4 text-green-600" />
            </div>
            <p className="text-xs text-gray-600">Team Collaboration</p>
          </div>
          <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
              <Mail className="w-4 h-4 text-purple-600" />
            </div>
            <p className="text-xs text-gray-600">Real-time Updates</p>
          </div>
        </div>
      </div>
    </div>
  );
}