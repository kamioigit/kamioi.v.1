import React, { useState } from 'react'
import { AlertCircle, ExternalLink, BarChart3, CheckCircle } from 'lucide-react'

const GoogleAnalyticsSetup = () => {
  const [measurementId, setMeasurementId] = useState('G-353505238')
  const [isTracking, setIsTracking] = useState(false)

  const testTracking = () => {
    if (window.trackGAEvent) {
      window.trackGAEvent('test_event', {
        event_category: 'setup',
        event_label: 'admin_dashboard_test',
        value: 1
      })
      setIsTracking(true)
      setTimeout(() => setIsTracking(false), 3000)
    }
  }

  const getTextColor = () => 'text-white'
  const getSubtextClass = () => 'text-gray-400'
  const getCardClass = () => 'bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20'

  return (
    <div className="space-y-6">
      <div className={getCardClass()}>
        <div className="flex items-center mb-4">
          <BarChart3 className="w-6 h-6 text-blue-400 mr-3" />
          <h3 className={`text-xl font-semibold ${getTextColor()}`}>Google Analytics Setup</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${getTextColor()} mb-2`}>
              Google Analytics Measurement ID
            </label>
            <input
              type="text"
              value={measurementId}
              onChange={(e) => setMeasurementId(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="G-XXXXXXXXXX"
            />
            <p className={`${getSubtextClass()} text-sm mt-1`}>
              Find this in Google Analytics → Admin → Data Streams → Web → Measurement ID
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={testTracking}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              {isTracking ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Test Sent!
                </>
              ) : (
                <>
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Test Tracking
                </>
              )}
            </button>
            
            <a
              href="https://analytics.google.com/analytics/web/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Google Analytics
            </a>
          </div>
        </div>
      </div>

      <div className={getCardClass()}>
        <h4 className={`text-lg font-semibold ${getTextColor()} mb-4`}>Setup Instructions</h4>
        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">1</div>
            <div>
              <p className={`${getTextColor()} font-medium`}>Get Your Measurement ID</p>
              <p className={`${getSubtextClass()} text-sm`}>
                Go to Google Analytics → Admin → Data Streams → Web → Copy your Measurement ID
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">2</div>
            <div>
              <p className={`${getTextColor()} font-medium`}>Update the Code</p>
              <p className={`${getSubtextClass()} text-sm`}>
                Replace the Measurement ID in GoogleAnalyticsTracker.jsx with your actual ID
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">3</div>
            <div>
              <p className={`${getTextColor()} font-medium`}>Test the Connection</p>
              <p className={`${getSubtextClass()} text-sm`}>
                Click "Test Tracking" and check Google Analytics Realtime reports
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-bold">4</div>
            <div>
              <p className={`${getTextColor()} font-medium`}>Verify Data</p>
              <p className={`${getSubtextClass()} text-sm`}>
                You should see yourself as 1 active user in Google Analytics Realtime
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className={getCardClass()}>
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-yellow-400 mt-1" />
          <div>
            <h4 className={`${getTextColor()} font-medium mb-2`}>Important Notes</h4>
            <ul className={`${getSubtextClass()} text-sm space-y-1`}>
              <li>• The Measurement ID format is G-XXXXXXXXXX (starts with G-)</li>
              <li>• It may take 5-10 minutes for data to appear in Google Analytics</li>
              <li>• Check the browser console for tracking confirmation messages</li>
              <li>• Make sure your website URL is added to the Google Analytics data stream</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GoogleAnalyticsSetup
