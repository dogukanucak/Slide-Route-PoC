import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../../app/hooks';
import { fetchItemDetailThunk } from '../itemsSlice';

/**
 * Custom hook that encapsulates the "Fetch-Before-Render" pattern:
 *
 * 1. Dispatches fetchItemDetailThunk to load item data.
 * 2. Awaits the thunk via `.unwrap()`.
 * 3. Only navigates to `/details` on success.
 * 4. On failure, the user stays on the current page.
 *
 * Business logic is fully separated from UI components.
 */
export function useFetchAndNavigate() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const loadingItemId = useAppSelector((state) => state.items.loadingItemId);

  const handleItemClick = useCallback(
    async (id: string) => {
      // Guard: don't dispatch if already loading
      if (loadingItemId) return;

      try {
        await dispatch(fetchItemDetailThunk(id)).unwrap();
        navigate('/details');
      } catch {
        // Thunk rejected — error is already in Redux state.
        // User stays on Page 1; the UI can show an error toast if desired.
      }
    },
    [dispatch, navigate, loadingItemId],
  );

  return { handleItemClick, loadingItemId };
}
