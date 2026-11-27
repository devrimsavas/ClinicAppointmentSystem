export default function Loading() {
  return (
    <div className="flex justify-center py-16" role="status" aria-label="Loading">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-soft border-t-primary" />
    </div>
  );
}
