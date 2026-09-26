import { lazy, Suspense } from 'react';
import { Skeleton } from '../ui/Skeleton';

// Leaflet is loaded in its own chunk, only on pages that show a map.
const MapView = lazy(() => import('./MapView'));

export default function LazyMap(props) {
  return (
    <Suspense fallback={<Skeleton className={`${props.className || 'h-80'} rounded-[var(--radius-card)]`} />}>
      <MapView {...props} />
    </Suspense>
  );
}
export { toMarker } from './markers';
