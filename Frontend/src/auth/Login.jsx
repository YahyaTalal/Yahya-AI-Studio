import React, { useState } from 'react';
import { useAuth } from './AuthContext';

export default function Login({ onSwitchToSignup }) {
  const { signIn, configError } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) { setError('Enter your email and password.'); return; }
    setBusy(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Sign in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <img src="/logo.jpg" alt="Yahya AI Studio" className="auth-logo" />
        <div className="auth-title">Welcome back</div>
        <div className="auth-subtitle">Sign in to your Yahya AI Studio account</div>

        <form onSubmit={handleSubmit} className="auth-form">
          <input
            className="auth-input"
            type="email"
            placeholder="Email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="auth-input"
            type="password"
            placeholder="Password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {(error || configError) && <div className="auth-error">⚠️ {error || configError}</div>}
          <button type="submit" className="auth-btn" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-switch">
          New to Yahya AI Studio?{' '}
          <button type="button" className="auth-link" onClick={onSwitchToSignup}>Create an account</button>
        </div>
      </div>
    </div>
  );
}
