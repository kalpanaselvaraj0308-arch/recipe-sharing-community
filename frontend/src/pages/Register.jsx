import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: 420, padding: '3rem 1.25rem' }}>
      <h1>Join the community</h1>
      <p style={{ color: 'var(--muted)', marginTop: '-0.5rem' }}>Create an account to start sharing recipes.</p>

      {error && <div className="error-banner">{error}</div>}

      <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
        <div className="field">
          <label htmlFor="username">Username</label>
          <input id="username" required minLength={3} value={username} onChange={(e) => setUsername(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
          <span className="hint">At least 6 characters.</span>
        </div>
        <button className="btn" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p style={{ marginTop: '1rem', color: 'var(--muted)' }}>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  );
}
