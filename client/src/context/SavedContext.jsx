import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints } from '../services/api';
import { useAuth } from './AuthContext';

const SavedContext = createContext(null);
const GUEST_KEY = 'kt_guest_saved';

function readGuest() {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || '[]');
  } catch {
    return [];
  }
}
function writeGuest(items) {
  try {
    localStorage.setItem(GUEST_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

/**
 * Guests save to localStorage (with a small cached card so the Saved page works
 * offline-ish); signed-in users save to their account. On sign-in, guest saves are
 * merged into the account once.
 */
export function SavedProvider({ children }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [guest, setGuest] = useState(readGuest);

  const { data: serverIds = [] } = useQuery({
    queryKey: ['me', 'savedIds'],
    queryFn: endpoints.savedIds,
    enabled: Boolean(user),
  });

  useEffect(() => {
    if (!user || !guest.length) return;
    endpoints
      .syncSaved(guest.map(({ targetType, targetId }) => ({ targetType, targetId })))
      .then(() => {
        setGuest([]);
        writeGuest([]);
        qc.invalidateQueries({ queryKey: ['me'] });
      })
      .catch(() => {});
  }, [user, guest, qc]);

  const ids = useMemo(() => new Set(user ? serverIds : guest.map((g) => `${g.targetType}:${g.targetId}`)), [user, serverIds, guest]);

  const isSaved = useCallback((type, id) => ids.has(`${type}:${id}`), [ids]);

  const toggle = useCallback(
    async (type, doc) => {
      const id = String(doc._id);
      const key = `${type}:${id}`;
      const saved = ids.has(key);
      if (!user) {
        const next = saved
          ? guest.filter((g) => `${g.targetType}:${g.targetId}` !== key)
          : [...guest, { targetType: type, targetId: id, item: { _id: id, name: doc.name || doc.title, title: doc.title, slug: doc.slug, district: doc.district, images: doc.images?.slice(0, 1) || [], isDemo: doc.isDemo }, savedAt: new Date().toISOString() }];
        setGuest(next);
        writeGuest(next);
        return { saved: !saved, guest: true };
      }
      qc.setQueryData(['me', 'savedIds'], (old = []) => (saved ? old.filter((k) => k !== key) : [...old, key]));
      try {
        if (saved) await endpoints.unsave(type, id);
        else await endpoints.save({ targetType: type, targetId: id });
      } finally {
        qc.invalidateQueries({ queryKey: ['me'] });
      }
      return { saved: !saved, guest: false };
    },
    [ids, user, guest, qc],
  );

  const value = useMemo(() => ({ isSaved, toggle, guestItems: guest, count: ids.size }), [isSaved, toggle, guest, ids]);
  return <SavedContext.Provider value={value}>{children}</SavedContext.Provider>;
}

export function useSaved() {
  const ctx = useContext(SavedContext);
  if (!ctx) throw new Error('useSaved must be used inside SavedProvider');
  return ctx;
}
