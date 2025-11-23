export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-primary-500 border-r-transparent mb-4" />
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
