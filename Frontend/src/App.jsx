import React, { useState, useEffect } from 'react';
import './App.css';
import Editor from './components/Editor';
import { AuthProvider, useAuth } from './auth/AuthContext';
import Login from './auth/Login';
import Signup from './auth/Signup';
import Account from './auth/Account';

function AppShell() {
  const { user, loading } = useAuth();
  const [splashDone, setSplashDone] = useState(false);
  const [authView, setAuthView] = useState('login');
  const [showAccount, setShowAccount] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(() => {
    return localStorage.getItem('activeProjectId') || null;
  });

  // Mock initial startup fade
  useEffect(() => {
    const timer = setTimeout(() => {
      setSplashDone(true);
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

  // Reset auth view when the user signs out
  useEffect(() => {
    if (!user) setAuthView('login');
  }, [user]);

  // 1. Startup Loader Screen (also covers auth check)
  if (!splashDone || loading) {
    return (
      <div className="loading-screen">
        <img src="/logo.jpg" alt="Logo" className="loading-logo" />
        <div className="loading-bar">
          <div className="loading-bar-fill" />
        </div>
      </div>
    );
  }

  // 2. Not signed in → Login / Signup screens
  if (!user) {
    return authView === 'login'
      ? <Login onSwitchToSignup={() => setAuthView('signup')} />
      : <Signup onSwitchToLogin={() => setAuthView('login')} />;
  }

  // 3. Signed in (or bypass mode) → Multi-track Editor Workspace Screen
  return (
    <>
      <Editor
        projectId={activeProjectId}
        setActiveProjectId={setActiveProjectId}
        onAccountClick={() => setShowAccount(true)}
      />
      {showAccount && <Account onClose={() => setShowAccount(false)} />}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
