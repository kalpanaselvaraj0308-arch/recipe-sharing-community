import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import RecipeCard from '../components/RecipeCard.jsx';
import SearchBar from '../components/SearchBar.jsx';

export default function Home() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ recipes: [], total: 0, page: 1, totalPages: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const filters = {
    q: searchParams.get('q') || '',
    category: searchParams.get('category') || 'All',
    sort: searchParams.get('sort') || 'newest',
    page: parseInt(searchParams.get('page') || '1', 10),
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await api.searchRecipes(filters);
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    api.getCategories().then((r) => setCategories(r.categories)).catch(() => {});
  }, []);

  function handleFilterChange(next) {
    const params = {};
    if (next.q) params.q = next.q;
    if (next.category && next.category !== 'All') params.category = next.category;
    if (next.sort && next.sort !== 'newest') params.sort = next.sort;
    if (next.page && next.page !== 1) params.page = next.page;
    setSearchParams(params);
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.25rem 4rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1>Cook something someone loves</h1>
        <p style={{ color: 'var(--muted)', maxWidth: 560 }}>
          Browse recipes shared by home cooks in the community, filter by category, and rate the ones you try.
        </p>
      </div>

      <SearchBar initialQuery={filters.q} categories={categories} filters={filters} onChange={handleFilterChange} />

      <div style={{ marginTop: '2rem' }}>
        {error && <div className="error-banner">{error}</div>}

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}>
            <div className="spinner" />
          </div>
        ) : data.recipes.length === 0 ? (
          <div className="empty-state">
            <h3>No recipes found</h3>
            <p>Try a different search term or category — or be the first to share one.</p>
          </div>
        ) : (
          <>
            <p style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>{data.total} recipe{data.total !== 1 ? 's' : ''}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem', marginTop: '0.75rem' }}>
              {data.recipes.map((r) => <RecipeCard key={r.id} recipe={r} />)}
            </div>

            {data.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={filters.page <= 1}
                  onClick={() => handleFilterChange({ ...filters, page: filters.page - 1 })}
                >
                  ← Previous
                </button>
                <span style={{ alignSelf: 'center', color: 'var(--muted)', fontSize: '0.9rem' }}>
                  Page {data.page} of {data.totalPages}
                </span>
                <button
                  className="btn btn-outline btn-sm"
                  disabled={filters.page >= data.totalPages}
                  onClick={() => handleFilterChange({ ...filters, page: filters.page + 1 })}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
