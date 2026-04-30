import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Provides a back-navigation handler that falls back to a safe route when the browser
 * history stack is empty (for example when a user lands on a deep link directly).
 */
export function useSafeBackNavigation(fallback: string = '/home') {
  const navigate = useNavigate();

  return useCallback(() => {
    if (typeof window !== 'undefined') {
      const historyState = window.history.state as { idx?: number } | null;
      const hasIndex = typeof historyState?.idx === 'number';
      const stateIndex = hasIndex ? historyState?.idx ?? null : null;
      const canGoBack =
        typeof stateIndex === 'number'
          ? stateIndex > 0
          : window.history.length > 1;

      if (canGoBack) {
        navigate(-1);
        return;
      }
    }

    navigate(fallback, { replace: true });
  }, [fallback, navigate]);
}
