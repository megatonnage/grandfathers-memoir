'use client';

import React from 'react';
import { useAuth } from '../lib/AuthContext';
import { UserRole } from '../types';
import { Lock } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  fallback?: React.ReactNode;
}

export default function ProtectedRoute({ 
  children, 
  requiredRoles = ['user', 'moderator', 'admin'],
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, userProfile, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    if (fallback) return <>{fallback}</>;
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center space-y-4">
          <Lock className="w-16 h-16 text-outline mx-auto" />
          <h1 className="font-headline text-2xl text-on-surface">Access Required</h1>
          <p className="text-outline max-w-md">
            Please sign in to access this archive. If you don't have an account, 
            you'll need an invitation from the family historian.
          </p>
        </div>
      </div>
    );
  }

  if (!hasRole(requiredRoles)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface">
        <div className="text-center space-y-4">
          <Lock className="w-16 h-16 text-red-400 mx-auto" />
          <h1 className="font-headline text-2xl text-on-surface">Insufficient Permissions</h1>
          <p className="text-outline max-w-md">
            You don't have the required permissions to access this area.
            Please contact the family historian if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
