export default function PostSkeleton() {
  return (
    <div className="card p-5">
      <div className="flex items-center gap-3">
        <div className="skeleton h-11 w-11 rounded-full" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-32" />
          <div className="skeleton h-3 w-24" />
        </div>
      </div>
      <div className="mt-4 space-y-2">
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-4/5" />
      </div>
      <div className="skeleton mt-3 h-52 w-full rounded-2xl" />
      <div className="mt-4 flex gap-6">
        <div className="skeleton h-4 w-12" />
        <div className="skeleton h-4 w-12" />
        <div className="skeleton h-4 w-12" />
      </div>
    </div>
  );
}
