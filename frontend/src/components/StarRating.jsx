import React, { useState } from 'react';

/**
 * Displays stars. If `onRate` is provided, becomes an interactive input.
 */
export default function StarRating({ value = 0, count, onRate, size = 20, readOnly = false }) {
  const [hover, setHover] = useState(0);
  const display = hover || value;
  const interactive = !readOnly && typeof onRate === 'function';

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
      <div
        role={interactive ? 'radiogroup' : undefined}
        aria-label={interactive ? 'Rate this recipe' : `Rated ${value} out of 5`}
        style={{ display: 'inline-flex' }}
      >
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            onMouseEnter={() => interactive && setHover(n)}
            onMouseLeave={() => interactive && setHover(0)}
            onClick={() => interactive && onRate(n)}
            role={interactive ? 'button' : undefined}
            aria-label={interactive ? `${n} star${n > 1 ? 's' : ''}` : undefined}
            tabIndex={interactive ? 0 : -1}
            onKeyDown={(e) => {
              if (interactive && (e.key === 'Enter' || e.key === ' ')) onRate(n);
            }}
            style={{
              fontSize: size,
              lineHeight: 1,
              color: n <= display ? 'var(--mustard)' : '#DDD3BB',
              cursor: interactive ? 'pointer' : 'default',
              userSelect: 'none',
            }}
          >
            ★
          </span>
        ))}
      </div>
      {typeof count === 'number' && (
        <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
          {value > 0 ? `${value.toFixed(1)}` : 'No ratings yet'}{count > 0 ? ` (${count})` : ''}
        </span>
      )}
    </div>
  );
}
