import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

/** URL-backed filter state so filtered pages are shareable and survive refresh. */
export function useQueryParams() {
  const [params, setParams] = useSearchParams();
  const values = useMemo(() => Object.fromEntries(params.entries()), [params]);
  const set = useCallback(
    (patch, { resetPage = true } = {}) => {
      setParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            if (v === undefined || v === null || v === '' || v === false || (Array.isArray(v) && !v.length)) next.delete(k);
            else next.set(k, Array.isArray(v) ? v.join(',') : String(v));
          }
          if (resetPage && !('page' in patch)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setParams],
  );
  const clear = useCallback(() => setParams(new URLSearchParams(), { replace: true }), [setParams]);
  return [values, set, clear];
}

export const listParam = (v) => (v ? String(v).split(',').filter(Boolean) : []);
