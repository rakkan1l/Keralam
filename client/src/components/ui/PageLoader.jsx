import { Loader2 } from 'lucide-react';

export function PageLoader() {
  return (
    <div className="grid min-h-[50vh] place-items-center" role="status" aria-label="Loading">
      <Loader2 className="size-7 animate-spin text-forest-600" />
    </div>
  );
}
