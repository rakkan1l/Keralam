import { useEffect } from 'react';
import { site } from '../../config/site.js';

export function usePageMeta(title, description) {
  useEffect(() => {
    document.title = title ? `${title} — ${site.name}` : `${site.name} — Pre-launch`;
    if (description) {
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
    }
  }, [title, description]);
}
