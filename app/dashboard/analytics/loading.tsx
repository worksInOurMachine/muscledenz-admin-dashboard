export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="h-10 w-40 bg-gray-700 rounded animate-pulse" />
      </div>

      {/* KPI Cards Loading */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
              <div className="h-4 w-4 bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-20 bg-gray-700 rounded animate-pulse" />
              <div className="h-3 w-32 bg-gray-700 rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>

      {/* Charts Loading */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <div className="h-6 w-32 bg-gray-700 rounded animate-pulse mb-4" />
            <div className="h-64 bg-gray-700 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
