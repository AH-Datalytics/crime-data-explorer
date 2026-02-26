export function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
      <p className="text-xs text-muted-foreground">Loading data...</p>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-navy border-t-transparent" />
    </div>
  );
}

export function LoadingCard() {
  return (
    <div className="animate-pulse rounded-lg border border-border bg-white p-4">
      <div className="mb-3 h-4 w-1/3 rounded bg-muted" />
      <div className="h-[320px] rounded bg-muted" />
    </div>
  );
}

export function LoadingKPIBanner() {
  return (
    <div className="animate-pulse rounded-lg bg-navy/80 p-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="text-center">
            <div className="mx-auto mb-2 h-3 w-16 rounded bg-white/20" />
            <div className="mx-auto h-7 w-20 rounded bg-white/20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
      <p className="text-sm text-destructive">{message}</p>
    </div>
  );
}
