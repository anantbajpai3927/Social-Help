import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, CheckCircle, Loader2, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface AuthPageProps {
  onBack?: () => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onBack }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resetMode, setResetMode] = useState(false);
  const [showEmailVerification, setShowEmailVerification] = useState(false);

  const { signIn, signUp, resetPassword } = useAuth();
  const { user, loading: authLoading } = useAuth();
  
  // Reset loading state when user changes (successful sign in)
  useEffect(() => {
    if (user && !authLoading) {
      setLoading(false);
      // Close the auth page if onBack is provided (for sidebar modal)
      if (onBack) {
        onBack();
      }
    }
  }, [user, authLoading, onBack]);

  // Reset local loading state when auth loading changes
  useEffect(() => {
    if (!authLoading && user) {
      setLoading(false);
    }
  }, [authLoading, user]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (resetMode) {
      setLoading(true);
      const { error } = await resetPassword(email);
      setLoading(false);

      if (error) {
        setError(error.message);
      } else {
        setSuccess('Password reset email sent! Check your inbox.');
        setResetMode(false);
      }
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (isSignUp && !fullName.trim()) {
      setError('Please enter your full name');
      return;
    }

    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          if (error.message.includes('already registered')) {
            setError('An account with this email already exists. Please sign in instead.');
          } else {
            setError(error.message);
          }
        } else {
          // Show email verification screen
          setShowEmailVerification(true);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
            setError('Invalid email or password. If you just signed up, please verify your email first by clicking the link we sent you.');
          } else {
            setError(error.message);
          }
        } else {
          // Sign in successful - the useEffect will handle closing the modal
          console.log('Sign in successful');
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setFullName('');
    setError(null);
    setSuccess(null);
    setResetMode(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    resetForm();
  };

  // Email verification success screen
  if (showEmailVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-white" />
            </div>
            
            {/* Header */}
            <h1 className="text-2xl font-bold text-gray-800 mb-4">
              Check Your Email! 📧
            </h1>
            
            {/* Message */}
            <div className="space-y-4 mb-8">
              <p className="text-gray-600">
                We've sent a verification link to:
              </p>
              <p className="text-lg font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg">
                {email}
              </p>
              <p className="text-gray-600">
                Click the link in your email to activate your Social Help account and access personalized emergency assistance.
              </p>
            </div>
            
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Next Steps:</h3>
              <ol className="text-sm text-blue-700 text-left space-y-1">
                <li>1. Check your email inbox (and spam folder)</li>
                <li>2. Click the "Confirm Email" button in the email</li>
                <li>3. You'll be automatically signed in to Social Help</li>
              </ol>
            </div>
            
            {/* Actions */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowEmailVerification(false);
                  setIsSignUp(false);
                  resetForm();
                }}
                className="w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200"
              >
                Back to Sign In
              </button>
              
              <p className="text-sm text-gray-500">
                Didn't receive the email? Check your spam folder or contact support.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="mb-6 flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to App</span>
          </button>
        )}

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="text-white font-bold text-2xl">SH</div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {resetMode ? 'Reset Password' : isSignUp ? 'Create Account' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {resetMode 
                ? 'Enter your email to receive a password reset link'
                : isSignUp 
                ? 'Join Social Help to get personalized emergency assistance'
                : 'Sign in to access your personalized emergency assistance'
              }
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <span className="text-red-800 text-sm">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
              <span className="text-green-800 text-sm">{success}</span>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name (Sign Up Only) */}
            {isSignUp && !resetMode && (
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            {/* Password */}
            {!resetMode && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {isSignUp && (
                  <p className="mt-1 text-xs text-gray-500">
                    Password must be at least 6 characters long
                  </p>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading && <Loader2 className="w-5 h-5 animate-spin" />}
              <span>
                {loading 
                  ? 'Please wait...' 
                  : resetMode 
                  ? 'Send Reset Email'
                  : isSignUp 
                  ? 'Create Account' 
                  : 'Sign In'
                }
              </span>
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-6 text-center space-y-2">
            {!resetMode && (
              <button
                onClick={() => setResetMode(true)}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                Forgot your password?
              </button>
            )}

            {resetMode ? (
              <button
                onClick={() => setResetMode(false)}
                className="text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
              >
                Back to sign in
              </button>
            ) : (
              <div>
                <span className="text-sm text-gray-600">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </span>
                <button
                  onClick={toggleMode}
                  className="ml-1 text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
                >
                  {isSignUp ? 'Sign in' : 'Sign up'}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Terms and Privacy */}
        <div className="mt-6 text-center text-xs text-gray-500">
          By continuing, you agree to our{' '}
          <a href="#" className="text-blue-600 hover:text-blue-800">Terms of Service</a>
          {' '}and{' '}
          <a href="#" className="text-blue-600 hover:text-blue-800">Privacy Policy</a>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;