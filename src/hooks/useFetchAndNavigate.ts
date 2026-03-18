import { useCallback, useRef } from 'react';
import { useNavigate, type NavigateOptions } from 'react-router-dom';

/**
 * Generic "Fetch-Before-Render" navigation hook.
 *
 * Accepts any async operation and a target route. The operation runs to
 * completion; only on success does programmatic navigation occur.
 *
 * **Fully decoupled from any feature slice or data layer.** The caller
 * decides what the async operation does — dispatch a Redux thunk, call a
 * REST API, hit a GraphQL endpoint, etc.
 *
 * Includes a built-in concurrency guard to prevent duplicate in-flight
 * requests from rapid clicks.
 *
 * @returns A stable `fetchAndNavigate` function.
 *
 * @example
 * const fetchAndNavigate = useFetchAndNavigate();
 *
 * // With Redux Toolkit
 * fetchAndNavigate(() => dispatch(fetchUser(id)).unwrap(), '/profile');
 *
 * // With a plain API call
 * fetchAndNavigate(() => api.getProduct(slug), '/product');
 *
 * // With React Query
 * fetchAndNavigate(() => queryClient.fetchQuery({ queryKey: ['user', id] }), '/user');
 */
export function useFetchAndNavigate() {
  const navigate = useNavigate();
  const inflightRef = useRef(false);

  const fetchAndNavigate = useCallback(
    async <T = void>(
      asyncOperation: () => Promise<T>,
      to: string,
      options?: NavigateOptions,
    ): Promise<T | undefined> => {
      if (inflightRef.current) return undefined;
      inflightRef.current = true;

      try {
        const result = await asyncOperation();
        navigate(to, options);
        return result;
      } catch {
        // Operation failed — user stays on the current page.
        // Errors are expected to be handled by the caller's data layer
        // (e.g., Redux rejected case sets an error in the store).
        return undefined;
      } finally {
        inflightRef.current = false;
      }
    },
    [navigate],
  );

  return fetchAndNavigate;
}
