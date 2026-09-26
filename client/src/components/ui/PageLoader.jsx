import { Loader2 } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-label="Loading">
      <Loader2 className="size-7 animate-spin text-forest-600" />
    </div>
  );
}

/** Loading / error fallback for pages whose header floats over a hero image. */
export function DetailFallback({ error, onRetry, ErrorComponent }) {
  return (
    <div>
      <div className="h-[46vh] min-h-72 animate-pulse bg-forest-900" />
      <div className="container-page py-12">{error && ErrorComponent ? <ErrorComponent error={error} onRetry={onRetry} /> : <PageLoader />}</div>
    </div>
  );
}
