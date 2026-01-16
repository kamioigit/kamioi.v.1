import React, { useEffect, useState } from 'react'

const PerformanceMonitor = ({ enabled = false }) => {
  const [metrics, setMetrics] = useState({
    loadTime: 0,
    bundleSize: 0,
    renderTime: 0
  })

  useEffect(() => {
    if (!enabled) return

    // Measure page load time
    const loadTime = performance.now()
    setMetrics(prev => ({ ...prev, loadTime }))

    // Measure bundle size (approximate)
    const scripts = document.querySelectorAll('script[src]')
    let totalSize = 0
    scripts.forEach(script => {
      // This is an approximation - in real implementation you'd fetch and measure
      totalSize += 100 // KB approximation per script
    })
    setMetrics(prev => ({ ...prev, bundleSize: totalSize }))

    // Measure render time
    const renderStart = performance.now()
    requestAnimationFrame(() => {
      const renderTime = performance.now() - renderStart
      setMetrics(prev => ({ ...prev, renderTime }))
    })

    // Log performance metrics in development
    if (process.env.NODE_ENV === 'development') {
      console.log('🚀 Performance Metrics:', {
        loadTime: `${loadTime.toFixed(2)}ms`,
        bundleSize: `${totalSize}KB`,
        renderTime: `${metrics.renderTime.toFixed(2)}ms`
      })
    }
  }, [enabled])

  if (!enabled) return null

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded-lg text-xs font-mono z-50">
      <div className="font-bold mb-1">Performance Monitor</div>
      <div>Load: {metrics.loadTime.toFixed(0)}ms</div>
      <div>Bundle: ~{metrics.bundleSize}KB</div>
      <div>Render: {metrics.renderTime.toFixed(0)}ms</div>
    </div>
  )
}

export default PerformanceMonitor

