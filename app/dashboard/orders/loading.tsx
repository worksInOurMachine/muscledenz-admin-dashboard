export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-gray-700 rounded animate-pulse" />
          <div className="h-4 w-64 bg-gray-700 rounded animate-pulse" />
        </div>
        <div className="h-10 w-24 bg-gray-700 rounded animate-pulse" />
      </div>

      <div className="flex gap-4">
        <div className="h-10 flex-1 bg-gray-700 rounded animate-pulse" />
        <div className="h-10 w-40 bg-gray-700 rounded animate-pulse" />
        <div className="h-10 w-40 bg-gray-700 rounded animate-pulse" />
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-10 w-32 bg-gray-700 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-700 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-gray-700 rounded animate-pulse" />
                <div className="h-3 w-32 bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="h-6 w-20 bg-gray-700 rounded animate-pulse" />
              <div className="h-6 w-16 bg-gray-700 rounded animate-pulse" />
              <div className="h-8 w-8 bg-gray-700 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
