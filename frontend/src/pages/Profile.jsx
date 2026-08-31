import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { api, imageUrl } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import RecipeCard from '../components/RecipeCard.jsx';

export default function Profile() {
  const { username } = useParams();
  const { user, refreshUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const isMe = user && user.username === username;

  async function load() {
    setLoading(true);
    setError('');
    try {
      const { user: found } = await api.getUserByUsername(username);
      setProfile(found);
      setBio(found.bio || '');
      const result = await api.searchRecipes({ userId: found.id, sort: 'newest', limit: 24 });
      setRecipes(result.recipes);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [username]);

  async function saveProfile(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const formData = new FormData();
      formData.append('bio', bio);
      if (avatarFile) formData.append('avatar', avatarFile);
      await api.updateProfile(formData);
      await refreshUser();
      await load();
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;
  if (error) return <div className="container" style={{ padding: '2rem 1.25rem' }}><div className="error-banner">{error}</div></div>;
  if (!profile) return null;

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <div className="card" style={{ padding: '1.5rem', display: 'flex', gap: '1.25rem', alignItems: 'center', marginBottom: '2rem' }}>
        <div style={{ width: 84, height: 84, borderRadius: '50%', overflow: 'hidden', background: '#EFE7D3', flexShrink: 0 }}>
          {profile.avatar_url ? (
            <img src={imageUrl(profile.avatar_url)} alt={profile.username} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--basil)' }}>
              {profile.username[0].toUpperCase()}
            </div>
          )}
        </div>
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: '0.2rem' }}>{profile.username}</h2>
          {!editing && <p style={{ margin: 0, color: 'var(--muted)' }}>{profile.bio || (isMe ? 'Add a bio to tell the community about yourself.' : 'No bio yet.')}</p>}
        </div>
        {isMe && !editing && (
          <button className="btn btn-outline btn-sm" onClick={() => setEditing(true)}>Edit profile</button>
        )}
      </div>

      {editing && (
        <form onSubmit={saveProfile} className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
          <div className="field">
            <label htmlFor="bio">Bio</label>
            <textarea id="bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="avatar">Profile photo</label>
            <input id="avatar" type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} />
          </div>
          <div style={{ display: 'flex', gap: '0.6rem' }}>
            <button className="btn btn-sm" type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
            <button className="btn btn-outline btn-sm" type="button" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </form>
      )}

      <h2>{isMe ? 'Your recipes' : `${profile.username}'s recipes`}</h2>
      {recipes.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>No recipes shared yet.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
        </div>
      )}
    </div>
  );
}
