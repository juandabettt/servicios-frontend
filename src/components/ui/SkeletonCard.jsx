export default function SkeletonCard() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 bg-surface-container-high rounded-xl" />
        <div className="w-20 h-5 bg-surface-container-high rounded-full" />
      </div>
      <div className="w-32 h-4 bg-surface-container-high rounded mb-2" />
      <div className="w-24 h-7 bg-surface-container-high rounded mb-4" />
      <div className="flex justify-between items-center">
        <div className="w-28 h-3 bg-surface-container-high rounded" />
        <div className="w-16 h-3 bg-surface-container-high rounded" />
      </div>
    </div>
  );
}

export function SkeletonInvoiceCard() {
  return (
    <div className="bg-surface-container-lowest p-5 rounded-xl border-l-4 border-surface-container-high shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-surface-container-high rounded-lg" />
          <div>
            <div className="w-24 h-4 bg-surface-container-high rounded mb-1" />
            <div className="w-32 h-3 bg-surface-container-high rounded" />
          </div>
        </div>
        <div className="w-16 h-5 bg-surface-container-high rounded-full" />
      </div>
      <div className="flex justify-between items-end">
        <div className="w-20 h-4 bg-surface-container-high rounded" />
        <div className="w-16 h-6 bg-surface-container-high rounded" />
      </div>
    </div>
  );
}
