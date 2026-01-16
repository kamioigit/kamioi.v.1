import React, { useState, useEffect } from 'react'

/**
 * TimeOfDay Component
 * Displays animated sun/moon icons based on current time with smooth transitions
 * Matches the 24-hour cycle chart provided
 */
const TimeOfDay = ({ className = '' }) => {
  const [timePeriod, setTimePeriod] = useState('midday')
  const [currentHour, setCurrentHour] = useState(new Date().getHours())

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hour = now.getHours()
      const minute = now.getMinutes()
      setCurrentHour(hour)
      
      // Determine time period based on hour
      // Dawn: 5:30 AM - 6:30 AM
      // Morning: 6:30 AM - 12 PM
      // Midday: 12 PM - 2 PM
      // Afternoon: 2 PM - 5:30 PM
      // Dusk: 5:30 PM - 6:30 PM
      // Evening: 6:30 PM - 10 PM
      // Night: 10 PM - 12 AM
      // Midnight: 12 AM - 5:30 AM
      
      const timeInMinutes = hour * 60 + minute
      
      if (timeInMinutes >= 330 && timeInMinutes < 390) {
        // 5:30 AM - 6:30 AM: Dawn
        setTimePeriod('dawn')
      } else if (timeInMinutes >= 390 && timeInMinutes < 720) {
        // 6:30 AM - 12 PM: Morning
        setTimePeriod('morning')
      } else if (timeInMinutes >= 720 && timeInMinutes < 840) {
        // 12 PM - 2 PM: Midday
        setTimePeriod('midday')
      } else if (timeInMinutes >= 840 && timeInMinutes < 1050) {
        // 2 PM - 5:30 PM: Afternoon
        setTimePeriod('afternoon')
      } else if (timeInMinutes >= 1050 && timeInMinutes < 1110) {
        // 5:30 PM - 6:30 PM: Dusk
        setTimePeriod('dusk')
      } else if (timeInMinutes >= 1110 && timeInMinutes < 1320) {
        // 6:30 PM - 10 PM: Evening
        setTimePeriod('evening')
      } else if (timeInMinutes >= 1320 && timeInMinutes < 1440) {
        // 10 PM - 12 AM: Night
        setTimePeriod('night')
      } else {
        // 12 AM - 5:30 AM: Midnight
        setTimePeriod('midnight')
      }
    }

    updateTime()
    const interval = setInterval(updateTime, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  // Render Dawn icon (5:30 AM - 6:30 AM)
  const renderDawn = () => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-yellow-300"
    >
      {/* Horizon line */}
      <line x1="0" y1="25" x2="40" y2="25" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      {/* Rising sun partially above horizon */}
      <circle cx="20" cy="25" r="8" fill="currentColor" className="animate-pulse" />
      {/* Three rays above sun */}
      <line x1="20" y1="5" x2="20" y2="17" stroke="currentColor" strokeWidth="2" className="animate-pulse" style={{ animationDelay: '0s' }} />
      <line x1="5" y1="12" x2="15" y2="20" stroke="currentColor" strokeWidth="2" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
      <line x1="35" y1="12" x2="25" y2="20" stroke="currentColor" strokeWidth="2" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
    </svg>
  )

  // Render Morning icon (6:30 AM - 12 PM)
  const renderMorning = () => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-yellow-400"
    >
      {/* Sun circle */}
      <circle cx="20" cy="20" r="7" fill="currentColor" className="animate-spin-slow" />
      {/* Sun rays - 8 triangular rays evenly spaced */}
      <polygon points="20,3 21,7 19,7" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0s' }} />
      <polygon points="32.5,7.5 29,10 30.5,8.5" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.1s' }} />
      <polygon points="37,20 33,21 33,19" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
      <polygon points="32.5,32.5 29,30 30.5,31.5" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.3s' }} />
      <polygon points="20,37 21,33 19,33" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
      <polygon points="7.5,32.5 11,30 9.5,31.5" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
      <polygon points="3,20 7,21 7,19" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.6s' }} />
      <polygon points="7.5,7.5 11,10 9.5,8.5" fill="currentColor" className="animate-pulse" style={{ animationDelay: '0.7s' }} />
    </svg>
  )

  // Render Midday icon (12 PM - 2 PM)
  const renderMidday = () => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-yellow-400"
    >
      {/* Bright sun circle */}
      <circle cx="20" cy="20" r="8" fill="currentColor" className="animate-pulse" />
      {/* 8 prominent rays */}
      <polygon points="20,2 21.5,8 18.5,8" fill="currentColor" />
      <polygon points="33,7 28,10 30,8" fill="currentColor" />
      <polygon points="38,20 32,21 32,19" fill="currentColor" />
      <polygon points="33,33 28,30 30,32" fill="currentColor" />
      <polygon points="20,38 21.5,32 18.5,32" fill="currentColor" />
      <polygon points="7,33 12,30 10,32" fill="currentColor" />
      <polygon points="2,20 8,21 8,19" fill="currentColor" />
      <polygon points="7,7 12,10 10,8" fill="currentColor" />
    </svg>
  )

  // Render Afternoon icon (2 PM - 5:30 PM)
  const renderAfternoon = () => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-yellow-400"
    >
      {/* Sun circle (slightly dimmed) */}
      <circle cx="20" cy="20" r="7" fill="currentColor" opacity="0.9" />
      {/* 8 rays */}
      <polygon points="20,3 21,7 19,7" fill="currentColor" opacity="0.9" />
      <polygon points="32.5,7.5 29,10 30.5,8.5" fill="currentColor" opacity="0.9" />
      <polygon points="37,20 33,21 33,19" fill="currentColor" opacity="0.9" />
      <polygon points="32.5,32.5 29,30 30.5,31.5" fill="currentColor" opacity="0.9" />
      <polygon points="20,37 21,33 19,33" fill="currentColor" opacity="0.9" />
      <polygon points="7.5,32.5 11,30 9.5,31.5" fill="currentColor" opacity="0.9" />
      <polygon points="3,20 7,21 7,19" fill="currentColor" opacity="0.9" />
      <polygon points="7.5,7.5 11,10 9.5,8.5" fill="currentColor" opacity="0.9" />
      {/* Small stars appearing */}
      <circle cx="30" cy="8" r="1" fill="currentColor" className="animate-twinkle" style={{ animationDelay: '0s' }} />
      <circle cx="32" cy="10" r="1.2" fill="currentColor" className="animate-twinkle" style={{ animationDelay: '0.3s' }} />
    </svg>
  )

  // Render Dusk icon (5:30 PM - 6:30 PM)
  const renderDusk = () => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-yellow-300"
    >
      {/* Horizon line */}
      <line x1="0" y1="25" x2="40" y2="25" stroke="currentColor" strokeWidth="1" opacity="0.3" />
      {/* Setting sun partially below horizon */}
      <circle cx="20" cy="25" r="8" fill="currentColor" className="animate-pulse" />
      {/* Three rays above sun */}
      <line x1="20" y1="5" x2="20" y2="17" stroke="currentColor" strokeWidth="2" className="animate-pulse" style={{ animationDelay: '0s' }} />
      <line x1="5" y1="12" x2="15" y2="20" stroke="currentColor" strokeWidth="2" className="animate-pulse" style={{ animationDelay: '0.2s' }} />
      <line x1="35" y1="12" x2="25" y2="20" stroke="currentColor" strokeWidth="2" className="animate-pulse" style={{ animationDelay: '0.4s' }} />
    </svg>
  )

  // Render Evening icon (6:30 PM - 10 PM)
  const renderEvening = () => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-yellow-400"
    >
      {/* Crescent moon (facing left) */}
      <path
        d="M12 10 C8 10 5 13 5 17 C5 21 8 24 12 24 C14.5 24 16.5 22.5 17.5 20.5 C16 21 14.5 21.5 13 21.5 C9.5 21.5 6.5 18.5 6.5 15 C6.5 13 7 11.5 8 10.5 C7.5 10 6.5 10 12 10 Z"
        fill="currentColor"
      />
      {/* Three stars arranged in diagonal curve */}
      <g className="animate-twinkle" style={{ animationDelay: '0s' }}>
        <polygon points="22,12 22.5,13 22,13.5 21.5,13" fill="currentColor" />
        <polygon points="21.5,12.25 22.5,12.25 22,13.5 22,12" fill="currentColor" />
      </g>
      <g className="animate-twinkle" style={{ animationDelay: '0.3s' }}>
        <polygon points="25,14 25.6,15 25,15.8 24.4,15" fill="currentColor" />
        <polygon points="24.4,14.4 25.6,14.4 25,15.8 25,14" fill="currentColor" />
      </g>
      <g className="animate-twinkle" style={{ animationDelay: '0.6s' }}>
        <polygon points="27.5,16.5 28.3,17.8 27.5,18.8 26.7,17.8" fill="currentColor" />
        <polygon points="26.7,16.9 28.3,16.9 27.5,18.8 27.5,16.5" fill="currentColor" />
      </g>
    </svg>
  )

  // Render Night icon (10 PM - 12 AM)
  const renderNight = () => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-yellow-400"
    >
      {/* Crescent moon */}
      <path
        d="M10 10 C6 10 3 13 3 17 C3 21 6 24 10 24 C12.5 24 14.5 22.5 15.5 20.5 C14 21 12.5 21.5 11 21.5 C7.5 21.5 4.5 18.5 4.5 15 C4.5 13 5 11.5 6 10.5 C5.5 10 4.5 10 10 10 Z"
        fill="currentColor"
      />
      {/* More stars */}
      <g className="animate-twinkle" style={{ animationDelay: '0s' }}>
        <polygon points="22,10 22.4,11 22,11.5 21.6,11" fill="currentColor" />
        <polygon points="21.6,10.25 22.4,10.25 22,11.5 22,10" fill="currentColor" />
      </g>
      <g className="animate-twinkle" style={{ animationDelay: '0.2s' }}>
        <polygon points="25,12 25.5,13 25,13.8 24.5,13" fill="currentColor" />
        <polygon points="24.5,12.4 25.5,12.4 25,13.8 25,12" fill="currentColor" />
      </g>
      <g className="animate-twinkle" style={{ animationDelay: '0.4s' }}>
        <polygon points="27.5,14.5 28.2,15.8 27.5,16.8 26.8,15.8" fill="currentColor" />
        <polygon points="26.8,14.9 28.2,14.9 27.5,16.8 27.5,14.5" fill="currentColor" />
      </g>
      <g className="animate-twinkle" style={{ animationDelay: '0.6s' }}>
        <polygon points="24,18 24.5,19 24,19.8 23.5,19" fill="currentColor" />
        <polygon points="23.5,18.4 24.5,18.4 24,19.8 24,18" fill="currentColor" />
      </g>
    </svg>
  )

  // Render Midnight icon (12 AM - 5:30 AM)
  const renderMidnight = () => (
    <svg
      width="80"
      height="80"
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-yellow-300"
    >
      {/* White crescent moon (facing left) */}
      <path
        d="M10 10 C6 10 3 13 3 17 C3 21 6 24 10 24 C12.5 24 14.5 22.5 15.5 20.5 C14 21 12.5 21.5 11 21.5 C7.5 21.5 4.5 18.5 4.5 15 C4.5 13 5 11.5 6 10.5 C5.5 10 4.5 10 10 10 Z"
        fill="currentColor"
        className="animate-pulse"
      />
      {/* Many stars */}
      <g className="animate-twinkle" style={{ animationDelay: '0s' }}>
        <polygon points="22,8 22.3,9 22,9.5 21.7,9" fill="currentColor" />
        <polygon points="21.7,8.25 22.3,8.25 22,9.5 22,8" fill="currentColor" />
      </g>
      <g className="animate-twinkle" style={{ animationDelay: '0.15s' }}>
        <polygon points="26,10 26.4,11 26,11.8 25.6,11" fill="currentColor" />
        <polygon points="25.6,10.4 26.4,10.4 26,11.8 26,10" fill="currentColor" />
      </g>
      <g className="animate-twinkle" style={{ animationDelay: '0.3s' }}>
        <polygon points="28,12.5 28.5,13.8 28,14.8 27.5,13.8" fill="currentColor" />
        <polygon points="27.5,12.9 28.5,12.9 28,14.8 28,12.5" fill="currentColor" />
      </g>
      <g className="animate-twinkle" style={{ animationDelay: '0.45s' }}>
        <polygon points="24,16 24.4,17 24,17.8 23.6,17" fill="currentColor" />
        <polygon points="23.6,16.4 24.4,16.4 24,17.8 24,16" fill="currentColor" />
      </g>
      <g className="animate-twinkle" style={{ animationDelay: '0.6s' }}>
        <polygon points="30,14 30.5,15.2 30,16.2 29.5,15.2" fill="currentColor" />
        <polygon points="29.5,14.4 30.5,14.4 30,16.2 30,14" fill="currentColor" />
      </g>
    </svg>
  )

  return (
    <span className={`inline-block align-middle ${className}`} style={{ verticalAlign: 'middle', lineHeight: 1 }}>
      <span className="relative inline-block w-20 h-20" style={{ verticalAlign: 'middle', marginLeft: '0.25rem' }}>
        {/* Animated transition container */}
        <span className="relative block w-full h-full">
          {/* Dawn */}
          {timePeriod === 'dawn' && (
            <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
              {renderDawn()}
            </div>
          )}
          
          {/* Morning */}
          {timePeriod === 'morning' && (
            <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
              {renderMorning()}
            </div>
          )}
          
          {/* Midday */}
          {timePeriod === 'midday' && (
            <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
              {renderMidday()}
            </div>
          )}
          
          {/* Afternoon */}
          {timePeriod === 'afternoon' && (
            <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
              {renderAfternoon()}
            </div>
          )}
          
          {/* Dusk */}
          {timePeriod === 'dusk' && (
            <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
              {renderDusk()}
            </div>
          )}
          
          {/* Evening */}
          {timePeriod === 'evening' && (
            <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
              {renderEvening()}
            </div>
          )}
          
          {/* Night */}
          {timePeriod === 'night' && (
            <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
              {renderNight()}
            </div>
          )}
          
          {/* Midnight */}
          {timePeriod === 'midnight' && (
            <div className="absolute inset-0 transition-all duration-1000 ease-in-out">
              {renderMidnight()}
            </div>
          )}
        </span>
      </span>
    </span>
  )
}

export default TimeOfDay
