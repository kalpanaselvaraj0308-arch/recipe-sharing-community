import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import RecipeDetail from './pages/RecipeDetail.jsx';
import RecipeForm from './pages/RecipeForm.jsx';
import Profile from './pages/Profile.jsx';

export default function App() {
  return (
    <>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />
          <Route path="/create" element={<ProtectedRoute><RecipeForm /></ProtectedRoute>} />
          <Route path="/recipes/:id/edit" element={<ProtectedRoute><RecipeForm /></ProtectedRoute>} />
          <Route path="/profile/:username" element={<Profile />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <footer style={{ textAlign: 'center', padding: '2rem', color: 'var(--muted)', fontSize: '0.85rem', borderTop: '1px solid var(--line)' }}>
        Recipe Sharing Community — built with React &amp; Express
      </footer>
    </>
  );
}

function NotFound() {
  return (
    <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
      <h1>Page not found</h1>
      <p style={{ color: 'var(--muted)' }}>The page you're looking for doesn't exist.</p>
    </div>
  );
}
