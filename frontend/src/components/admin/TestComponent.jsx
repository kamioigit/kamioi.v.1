import React, { useEffect } from 'react'

const TestComponent = () => {
  useEffect(() => {
    console.log('TestComponent - Component mounted!')
    console.log('TestComponent - This proves the component is being rendered')
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white mb-4">
        🧪 Test Component
      </h1>
      <p className="text-white">
        If you can see this component, the frontend is working!
      </p>
      <p className="text-white">
        Check the browser console for the mount log.
      </p>
    </div>
  )
}

export default TestComponent
