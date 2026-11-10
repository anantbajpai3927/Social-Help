import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import AuthPage from './AuthPage';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutes in seconds

  useEffect(() => {
    // Check if user has already used their trial time
    const trialStartTime = localStorage.getItem('socialhelp-trial-start');
    const trialExpired = localStorage.getItem('socialhelp-trial-expired');
    
    if (user) {
      // User is authenticated, clear trial data
      localStorage.removeItem('socialhelp-trial-start');
      localStorage.removeItem('socialhelp-trial-expired');
      setShowAuthPage(false);
      return;
    }

    if (trialExpired === 'true') {
      // Trial has already expired, show auth page immediately
      setShowAuthPage(true);
      return;
    }

    if (!trialStartTime) {
      // First time visitor, start trial
      localStorage.setItem('socialhelp-trial-start', Date.now().toString());
    }

    // Calculate remaining time
    const startTime = parseInt(trialStartTime || Date.now().toString());
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, 1200 - elapsed); // 20 minutes = 1200 seconds

    if (remaining <= 0) {
      // Trial expired
      localStorage.setItem('socialhelp-trial-expired', 'true');
      setShowAuthPage(true);
    } else {
      setTimeRemaining(remaining);
    }
  }, [user]);

  useEffect(() => {
    if (!user && !showAuthPage && timeRemaining > 0) {
      // Start countdown timer
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            localStorage.setItem('socialhelp-trial-expired', 'true');
            setShowAuthPage(true);
            clearInterval(timer);
            return 0;
          }
          return newTime;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [user, showAuthPage, timeRemaining]);

  if (loading) {
    return <LoadingSpinner message="Checking authentication..." />;
  }

  // Show auth page if user is not authenticated and trial expired
  if (!user && showAuthPage) {
    return <AuthPage />;
  }

  // Show children with trial timer if not authenticated but trial active
  return (
    <>
      {children}
      {!user && !showAuthPage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg">
          <div className="text-center">
            <div className="text-lg font-bold">
              Trial: {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <div className="text-sm opacity-90">
              Sign in for unlimited access
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProtectedRoute;