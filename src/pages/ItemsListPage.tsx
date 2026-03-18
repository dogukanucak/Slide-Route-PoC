import { useCallback } from 'react';
import { useFetchAndNavigate } from '../hooks/useFetchAndNavigate';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { fetchItemDetailThunk } from '../features/items/itemsSlice';
import { ITEMS } from '../api/mockApi';

export default function ItemsListPage() {
  const dispatch = useAppDispatch();
  const fetchAndNavigate = useFetchAndNavigate();
  const loadingItemId = useAppSelector((state) => state.items.loadingItemId);
  const error = useAppSelector((state) => state.items.error);

  const handleItemClick = useCallback(
    (id: string) => {
      if (loadingItemId) return;
      fetchAndNavigate(
        () => dispatch(fetchItemDetailThunk(id)).unwrap(),
        '/details',
      );
    },
    [dispatch, fetchAndNavigate, loadingItemId],
  );

  return (
    <div className="page items-list-page">
      <header className="page-header">
        <h1>
          <span className="gradient-text">Explore</span> Products
        </h1>
        <p className="page-subtitle">
          Click any card to fetch its details — you'll stay here while we load.
        </p>
      </header>

      {error && (
        <div className="error-banner">
          <span>⚠️</span> {error}
        </div>
      )}

      <div className="items-grid">
        {ITEMS.map((item) => {
          const isLoading = loadingItemId === item.id;
          const isDisabled = loadingItemId !== null;

          return (
            <article key={item.id} className={`item-card ${isLoading ? 'item-card--loading' : ''}`}>
              <div className="item-card__icon">{item.icon}</div>
              <div className="item-card__content">
                <h2 className="item-card__title">{item.title}</h2>
                <p className="item-card__subtitle">{item.subtitle}</p>
              </div>
              <button
                className={`btn btn--primary ${isLoading ? 'btn--spinner' : ''}`}
                onClick={() => handleItemClick(item.id)}
                disabled={isDisabled}
              >
                {isLoading ? (
                  <>
                    <span className="spinner" />
                    Loading…
                  </>
                ) : (
                  'View Details →'
                )}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}
