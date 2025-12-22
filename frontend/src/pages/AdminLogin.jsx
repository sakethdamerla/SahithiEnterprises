import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * AdminLogin page - client-side only demo auth using hard-coded credentials.
 * Replace login() implementation with real API call (JWT/session) for production.
 */
export function AdminLogin() {
  const { isAdmin, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const success = login(username.trim(), password.trim());
    if (success) {
      navigate('/admin', { replace: true });
    } else {
      setError('Invalid credentials. Try admin / admin123 for demo.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide">Admin Portal</p>
          <h1 className="text-3xl font-bold text-gray-900">Sign in</h1>
          <p className="text-gray-600 text-sm">
            Demo-only client auth. Replace with real backend later.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" aria-label="Admin login form">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field mt-1"
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field mt-1"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm" role="alert">
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary w-full">
            Sign in
          </button>
        </form>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm text-gray-600">
          <p className="font-semibold text-gray-800 mb-1">Production note</p>
          <p>
            Replace the hard-coded check with a backend login endpoint that returns a JWT
            or sets an HttpOnly session cookie. Store only non-sensitive metadata in
            localStorage.
          </p>
        </div>
      </div>
    </div>
  );
}

