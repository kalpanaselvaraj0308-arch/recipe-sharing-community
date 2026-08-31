import React from 'react';
import { Link } from 'react-router-dom';
import { imageUrl } from '../api.js';
import StarRating from './StarRating.jsx';

export default function RecipeCard({ recipe }) {
  return (
    <Link
      to={`/recipes/${recipe.id}`}
      className="card"
      style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', textDecoration: 'none', color: 'inherit', height: '100%' }}
    >
      <div style={{ aspectRatio: '4 / 3', background: '#EFE7D3', overflow: 'hidden' }}>
        {recipe.image_url ? (
          <img
            src={imageUrl(recipe.image_url)}
            alt={recipe.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--muted)', fontFamily: 'var(--font-display)', fontSize: '1.1rem' }}>
            No photo yet
          </div>
        )}
      </div>
      <div style={{ padding: '0.9rem 1rem 1.1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
        <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--tomato)', fontWeight: 700 }}>
          {recipe.category}
        </span>
        <h3 style={{ margin: 0 }}>{recipe.title}</h3>
        <p style={{ margin: 0, color: 'var(--muted)', fontSize: '0.9rem', flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
          {recipe.description || 'No description provided.'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.3rem' }}>
          <StarRating value={recipe.avg_rating} count={recipe.rating_count} size={15} readOnly />
          <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
            {recipe.cook_time_minutes ? `${recipe.cook_time_minutes} min` : ''}
          </span>
        </div>
        <span style={{ fontSize: '0.82rem', color: 'var(--muted)' }}>by {recipe.author_username}</span>
      </div>
    </Link>
  );
}
