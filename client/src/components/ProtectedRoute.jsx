import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-vscode-bg flex items-center justify-center">
        <div className="text-vscode-text">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-vscode-bg flex items-center justify-center">
        <div className="text-vscode-text">Please log in to continue.</div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;