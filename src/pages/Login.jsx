import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const trimmedId = userId.trim();
    if (!trimmedId || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    // Simulate brief network delay for realism
    setTimeout(() => {
      const result = login(trimmedId, password);
      setLoading(false);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    }, 400);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-card__header">
          <div className="auth-card__logo">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span>AffiliateX</span>
          </div>
          <h1 className="auth-card__title">Welcome Back</h1>
          <p className="auth-card__subtitle">Log in to manage your affiliate links</p>
        </div>

        {error && (
          <div className="auth-card__error" role="alert">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-card__form">
          <div className="form-group">
            <label htmlFor="userId">User ID</label>
            <input
              type="text"
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="e.g., harih"
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="btn-primary-auth"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-card__footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>

        <div className="auth-card__limitation-badge">
          <span>Prototype Environment (Client-side simulation only)</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
