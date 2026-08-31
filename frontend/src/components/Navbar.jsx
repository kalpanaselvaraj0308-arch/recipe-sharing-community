import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header style={{ background: 'var(--basil)', borderBottom: '1px solid var(--basil-dark)' }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.9rem 1.25rem' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', textDecoration: 'none' }}>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.4rem', color: '#fff' }}>
            Recipe Sharing Community
          </span>
        </Link>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={navLinkStyle}>Browse</Link>
          {user ? (
            <>
              <Link to="/create" style={navLinkStyle}>Share a Recipe</Link>
              <Link to={`/profile/${user.username}`} style={navLinkStyle}>{user.username}</Link>
              <button
                className="btn btn-sm"
                style={{ background: 'var(--mustard)', borderColor: 'var(--mustard)', color: 'var(--basil-dark)' }}
                onClick={() => { logout(); navigate('/'); }}
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={navLinkStyle}>Log in</Link>
              <Link to="/register" className="btn btn-sm" style={{ background: 'var(--mustard)', borderColor: 'var(--mustard)', color: 'var(--basil-dark)' }}>
                Join
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

const navLinkStyle = { color: '#F1ECDD', fontWeight: 600, fontSize: '0.95rem' };
