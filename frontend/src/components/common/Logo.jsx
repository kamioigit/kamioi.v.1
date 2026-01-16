import React from 'react'

const Logo = ({ className = "w-8 h-8", showText = true, textClassName = "" }) => {
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Kamioi Logo - Actual design with stylized K and upward arrow */}
      <div className="relative">
        <svg 
          width="32" 
          height="32" 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-8 h-8"
        >
          {/* Vertical bar of K */}
          <rect x="4" y="4" width="4" height="24" fill="url(#kamioiGradient)" rx="2"/>
          
          {/* Lower diagonal of K */}
          <rect x="8" y="20" width="4" height="4" fill="url(#kamioiGradient)" rx="2" transform="rotate(45 10 22)"/>
          
          {/* Upper diagonal of K */}
          <rect x="8" y="8" width="4" height="4" fill="url(#kamioiGradient)" rx="2" transform="rotate(45 10 10)"/>
          
          {/* Upward arrow head - prominent and clear */}
          <path d="M20 6 L26 12 L24 14 L20 10 Z" fill="url(#kamioiGradient)"/>
          
          <defs>
            <linearGradient id="kamioiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00D4FF" />
              <stop offset="100%" stopColor="#0099CC" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      {showText && (
        <span className={`text-xl font-bold ${textClassName}`}>
          KAMIOI
        </span>
      )}
    </div>
  )
}

export default Logo
