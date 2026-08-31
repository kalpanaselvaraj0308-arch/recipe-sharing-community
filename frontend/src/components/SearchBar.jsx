import React, { useState, useEffect } from 'react';

export default function SearchBar({ initialQuery = '', categories = [], filters, onChange }) {
  const [text, setText] = useState(initialQuery);

  useEffect(() => setText(initialQuery), [initialQuery]);

  function submit(e) {
    e.preventDefault();
    onChange({ ...filters, q: text, page: 1 });
  }

  return (
    <form onSubmit={submit} className="card" style={{ padding: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'flex-end' }}>
      <div style={{ flex: '1 1 220px' }}>
        <label htmlFor="q" style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>
          Search recipes
        </label>
        <input
          id="q"
          type="text"
          placeholder="Try &quot;lemon pasta&quot; or an ingredient..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ width: '100%', padding: '0.6em 0.75em', border: '1.5px solid var(--line)', borderRadius: 8 }}
        />
      </div>

      <div>
        <label htmlFor="category" style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>
          Category
        </label>
        <select
          id="category"
          value={filters.category || 'All'}
          onChange={(e) => onChange({ ...filters, category: e.target.value, page: 1 })}
          style={{ padding: '0.6em 0.75em', border: '1.5px solid var(--line)', borderRadius: 8 }}
        >
          <option value="All">All</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label htmlFor="sort" style={{ fontWeight: 600, fontSize: '0.85rem', display: 'block', marginBottom: '0.3rem' }}>
          Sort by
        </label>
        <select
          id="sort"
          value={filters.sort || 'newest'}
          onChange={(e) => onChange({ ...filters, sort: e.target.value, page: 1 })}
          style={{ padding: '0.6em 0.75em', border: '1.5px solid var(--line)', borderRadius: 8 }}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="top_rated">Top rated</option>
          <option value="most_rated">Most rated</option>
        </select>
      </div>

      <button type="submit" className="btn">Search</button>
    </form>
  );
}
