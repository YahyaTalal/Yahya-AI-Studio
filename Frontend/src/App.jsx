import React, { useState, useEffect } from 'react';
import './App.css';
import Editor from './components/Editor';

export default function App() {
  const [appLoading, setAppLoading] = useState(true);
  const [activeProjectId, setActiveProjectId] = useState(() => {
    return localStorage.getItem('activeProjectId') || null;
  });

  // Mock initial startup fade
  useEffect(() => {
    const timer = setTimeout(() => {
      setAppLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Sync active project ID to localStorage
  useEffect(() => {
    if (activeProjectId) {
      localStorage.setItem('activeProjectId', activeProjectId);
    } else {
      localStorage.removeItem('activeProjectId');
    }
  }, [activeProjectId]);

  // 1. Startup Loader Screen
  if (appLoading) {
    return (
      <div className="loading-screen">
        <img src="/logo.jpg" alt="Logo" className="loading-logo" />
        <div className="loading-bar">
          <div className="loading-bar-fill" />
        </div>
      </div>
    );
  }

  // 2. Multi-track Editor Workspace Screen
  return (
    <Editor 
      projectId={activeProjectId} 
      setActiveProjectId={setActiveProjectId}
    />
  );
}
