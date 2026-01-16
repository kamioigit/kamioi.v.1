import React, { Suspense, lazy } from 'react'

// Lazy load the RechartsChart component
const RechartsChart = lazy(() => import('./RechartsChart'))

// Loading fallback component
const ChartLoadingFallback = () => (
  <div className="flex items-center justify-center h-64 bg-gray-100 dark:bg-gray-800 rounded-lg">
    <div className="text-center">
      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <div className="text-sm text-gray-600 dark:text-gray-400">Loading chart...</div>
    </div>
  </div>
)

// Lazy RechartsChart wrapper
const LazyRechartsChart = (props) => {
  return (
    <Suspense fallback={<ChartLoadingFallback />}>
      <RechartsChart {...props} />
    </Suspense>
  )
}

export default LazyRechartsChart

