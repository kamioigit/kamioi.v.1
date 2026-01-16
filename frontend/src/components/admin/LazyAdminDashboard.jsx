import React, { Suspense, lazy } from 'react'

// Lazy load the AdminDashboard component
const AdminDashboard = lazy(() => import('../../pages/AdminDashboard'))

// Loading fallback component
const AdminDashboardLoadingFallback = () => (
  <div className="min-h-screen gradient-bg flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <div className="text-white text-xl">Loading Admin Dashboard...</div>
      <div className="text-gray-300 text-sm mt-2">This may take a moment for first load</div>
    </div>
  </div>
)

// Lazy AdminDashboard wrapper
const LazyAdminDashboard = (props) => {
  return (
    <Suspense fallback={<AdminDashboardLoadingFallback />}>
      <AdminDashboard {...props} />
    </Suspense>
  )
}

export default LazyAdminDashboard

