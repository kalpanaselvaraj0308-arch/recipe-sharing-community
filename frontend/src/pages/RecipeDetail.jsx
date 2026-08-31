import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api, imageUrl } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import StarRating from '../components/StarRating.jsx';

export default function RecipeDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [recipe, setRecipe] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [myRating, setMyRating] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [ratingValue, setRatingValue] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const result = await api.getRecipe(id);
      setRecipe(result.recipe);
      setRatings(result.ratings);
      setMyRating(result.myRating);
      if (result.myRating) {
        setRatingValue(result.myRating.rating);
        setComment(result.myRating.comment || '');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function submitRating(e) {
    e.preventDefault();
    if (!ratingValue) return;
    setSubmitting(true);
    setError('');
    try {
      const result = await api.rateRecipe(id, { rating: ratingValue, comment });
      setRecipe(result.recipe);
      setRatings(result.ratings);
      setMyRating({ rating: ratingValue, comment });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm('Delete this recipe? This cannot be undone.')) return;
    try {
      await api.deleteRecipe(id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}><div className="spinner" /></div>;
  }
  if (error && !recipe) {
    return <div className="container" style={{ padding: '2rem 1.25rem' }}><div className="error-banner">{error}</div></div>;
  }
  if (!recipe) return null;

  const isOwner = user && user.id === recipe.user_id;

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(260px, 1fr)', gap: '2.5rem' }}>
      <div>
        <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--tomato)', fontWeight: 700 }}>
          {recipe.category}
        </span>
        <h1>{recipe.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <StarRating value={recipe.avg_rating} count={recipe.rating_count} readOnly />
          <span style={{ color: 'var(--muted)' }}>·</span>
          <span style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>
            by <Link to={`/profile/${recipe.author_username}`}>{recipe.author_username}</Link>
          </span>
          {recipe.cook_time_minutes > 0 && <><span style={{ color: 'var(--muted)' }}>·</span><span style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>{recipe.cook_time_minutes} min</span></>}
          {recipe.servings > 0 && <><span style={{ color: 'var(--muted)' }}>·</span><span style={{ color: 'var(--muted)', fontSize: '0.92rem' }}>Serves {recipe.servings}</span></>}
        </div>

        {recipe.image_url && (
          <img src={imageUrl(recipe.image_url)} alt={recipe.title} style={{ width: '100%', borderRadius: 'var(--radius)', marginBottom: '1.25rem', maxHeight: 420, objectFit: 'cover' }} />
        )}

        {recipe.description && <p style={{ fontSize: '1.05rem' }}>{recipe.description}</p>}

        {isOwner && (
          <div style={{ display: 'flex', gap: '0.6rem', margin: '1rem 0 2rem' }}>
            <button className="btn btn-outline btn-sm" onClick={() => navigate(`/recipes/${id}/edit`)}>Edit recipe</button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>Delete</button>
          </div>
        )}

        <section style={{ marginTop: '2rem' }}>
          <h2>Instructions</h2>
          <ol style={{ paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recipe.instructions.map((step, i) => (
              <li key={i} style={{ paddingLeft: '0.25rem' }}>{step}</li>
            ))}
          </ol>
        </section>

        <section style={{ marginTop: '2.5rem' }}>
          <h2>Ratings &amp; reviews</h2>

          {user ? (
            <form onSubmit={submitRating} className="card" style={{ padding: '1.25rem', marginBottom: '1.5rem' }}>
              <p style={{ margin: '0 0 0.5rem', fontWeight: 600 }}>{myRating ? 'Update your rating' : 'Rate this recipe'}</p>
              <StarRating value={ratingValue} onRate={setRatingValue} size={26} />
              <div className="field" style={{ marginTop: '0.9rem' }}>
                <label htmlFor="comment">Comment (optional)</label>
                <textarea id="comment" rows={3} value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How did it turn out?" />
              </div>
              <button className="btn btn-sm" type="submit" disabled={submitting || !ratingValue}>
                {submitting ? 'Saving…' : myRating ? 'Update rating' : 'Submit rating'}
              </button>
            </form>
          ) : (
            <p style={{ color: 'var(--muted)' }}><Link to="/login">Log in</Link> to rate this recipe.</p>
          )}

          {ratings.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>No reviews yet. Be the first to try it and share your thoughts.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {ratings.map((r) => (
                <div key={r.id} className="card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>{r.username}</strong>
                    <StarRating value={r.rating} readOnly size={15} />
                  </div>
                  {r.comment && <p style={{ margin: '0.5rem 0 0', color: 'var(--muted)' }}>{r.comment}</p>}
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      <aside>
        <div className="card" style={{ padding: '1.25rem', position: 'sticky', top: '1.25rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Ingredients</h3>
          <ul style={{ paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0 }}>
            {recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)}
          </ul>
        </div>
      </aside>
    </div>
  );
}
