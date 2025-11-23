export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-judicial-primary" />
        <p className="text-gray-500 dark:text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
