import { Navigate, useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../app/hooks';
import { clearSelectedItem } from '../features/items/itemsSlice';

/**
 * Page 2 — Item Detail.
 *
 * ✅ ZERO `useEffect` hooks for fetching.
 * ✅ ZERO loading spinners.
 *
 * Data is read synchronously from the Redux store, which was populated
 * BEFORE this page was navigated to (fetch-before-render).
 *
 * Fallback: If the store is empty (e.g., direct URL access or hard refresh),
 * we redirect the user back to the list page.
 */
export default function ItemDetailPage() {
  const selectedItem = useAppSelector((state) => state.items.selectedItem);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // ─── Edge case: direct URL access with empty store ─────────────────────
  if (!selectedItem) {
    return <Navigate to="/" replace />;
  }

  const handleBack = () => {
    dispatch(clearSelectedItem());
    navigate('/');
  };

  return (
    <div className="page detail-page">
      <button className="btn btn--back" onClick={handleBack}>
        ← Back to List
      </button>

      <div className="detail-hero">
        <span className="detail-hero__icon">{selectedItem.icon}</span>
        <div>
          <h1 className="detail-hero__title">{selectedItem.title}</h1>
          <p className="detail-hero__subtitle">{selectedItem.subtitle}</p>
        </div>
      </div>

      <p className="detail-description">{selectedItem.description}</p>

      <div className="detail-stats">
        {selectedItem.stats.map((stat) => (
          <div key={stat.label} className="stat-card">
            <span className="stat-card__value">{stat.value}</span>
            <span className="stat-card__label">{stat.label}</span>
          </div>
        ))}
      </div>

      <div className="detail-tags">
        {selectedItem.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <p className="detail-meta">Created: {selectedItem.createdAt}</p>
    </div>
  );
}
