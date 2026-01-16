import React, { useState, useEffect, useRef } from 'react'
import { ExternalLink, Info, X } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const AdSlot = ({ 
  slotId, 
  slotType = 'inline_card',
  pageContext = [],
  userId,
  familyId,
  sessionId,
  className = '',
  onAdLoad,
  onAdClick,
  onAdImpression
}) => {
  const { isLightMode } = useTheme()
  const [adData, setAdData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [impressionTracked, setImpressionTracked] = useState(false)
  const adRef = useRef(null)
  const observerRef = useRef(null)

  // Fetch ad content
  useEffect(() => {
    fetchAd()
  }, [slotId, userId, familyId, pageContext])

  // Setup intersection observer for impression tracking
  useEffect(() => {
    if (adRef.current && adData && !impressionTracked) {
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
              trackImpression()
              setImpressionTracked(true)
            }
          })
        },
        { threshold: 0.5 }
      )

      observerRef.current.observe(adRef.current)
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [adData, impressionTracked])

  const fetchAd = async () => {
    try {
      setLoading(true)
      setError(null)

      const viewport = {
        w: window.innerWidth,
        h: window.innerHeight
      }

      const requestPayload = {
        slot_id: slotId,
        viewport,
        theme: isLightMode ? 'light' : 'dark',
        page_context: pageContext,
        user_id: userId,
        family_id: familyId,
        session_id: sessionId || `s_${Date.now()}`
      }

      const response = await fetch('/api/ads/serve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kamioi_token')}`
        },
        body: JSON.stringify(requestPayload)
      })

      if (!response.ok) {
        throw new Error('Failed to fetch ad')
      }

      const data = await response.json()
      setAdData(data.creative)
      onAdLoad && onAdLoad(data.creative)

    } catch (err) {
      console.error('Ad fetch error:', err)
      setError(err.message)
      // Show PSA fallback
      setAdData({
        creative_id: 'psa_fallback',
        markup_type: 'card',
        headline: 'Kamioi Tips',
        body: 'Did you know? Round-ups help build wealth automatically with every purchase.',
        cta: { text: 'Learn More', href: '/education' },
        media: { img: null, alt: 'Kamioi' },
        disclosure: 'Educational content',
        theme_hint: isLightMode ? 'light' : 'dark',
        explanation: 'Showing educational content as no ads are available.',
        tracking: null
      })
    } finally {
      setLoading(false)
    }
  }

  const trackImpression = async () => {
    if (!adData || !adData.tracking?.imp) return

    try {
      await fetch('/api/ads/track/imp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kamioi_token')}`
        },
        body: JSON.stringify({
          creative_id: adData.creative_id,
          slot_id: slotId,
          user_id: userId,
          family_id: familyId,
          session_id: sessionId,
          timestamp: new Date().toISOString()
        })
      })

      onAdImpression && onAdImpression(adData)
    } catch (err) {
      console.error('Impression tracking error:', err)
    }
  }

  const handleAdClick = async (e) => {
    if (!adData) return

    // Track click
    try {
      await fetch('/api/ads/track/click', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kamioi_token')}`
        },
        body: JSON.stringify({
          creative_id: adData.creative_id,
          slot_id: slotId,
          user_id: userId,
          family_id: familyId,
          session_id: sessionId,
          href: adData.cta?.href,
          timestamp: new Date().toISOString()
        })
      })

      onAdClick && onAdClick(adData)
    } catch (err) {
      console.error('Click tracking error:', err)
    }

    // Handle navigation
    if (adData.cta?.href) {
      if (adData.cta.href.startsWith('http')) {
        window.open(adData.cta.href, '_blank', 'noopener,noreferrer')
      } else {
        window.location.href = adData.cta.href
      }
    }
  }

  const getSlotStyles = () => {
    const baseStyles = `transition-all duration-200 ${className}`
    
    switch (slotType) {
      case 'top_banner':
        return `${baseStyles} w-full h-24 mb-6`
      case 'sidebar_card':
        return `${baseStyles} w-full max-w-sm`
      case 'inline_card':
        return `${baseStyles} w-full max-w-2xl mx-auto my-4`
      case 'footer_strip':
        return `${baseStyles} w-full h-16`
      case 'goal_card':
        return `${baseStyles} w-full max-w-md`
      default:
        return `${baseStyles} w-full`
    }
  }

  const getCardStyles = () => {
    const themeStyles = isLightMode 
      ? 'bg-white border border-gray-200 text-gray-900'
      : 'bg-white/10 backdrop-blur-lg border border-white/20 text-white'
    
    return `${themeStyles} rounded-lg shadow-lg hover:shadow-xl transition-all duration-200`
  }

  if (loading) {
    return (
      <div className={getSlotStyles()}>
        <div className={`${getCardStyles()} p-4 animate-pulse`}>
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-300 rounded-lg"></div>
            <div className="flex-1">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !adData) {
    return null // Fail silently for better UX
  }

  if (!adData) {
    return null
  }

  return (
    <div ref={adRef} className={getSlotStyles()}>
      <div className={`${getCardStyles()} p-4 cursor-pointer group relative`} onClick={handleAdClick}>
        {/* Ad Label */}
        <div className="absolute top-2 right-2 flex items-center space-x-1">
          <span className={`text-xs px-2 py-1 rounded ${
            isLightMode ? 'bg-gray-100 text-gray-600' : 'bg-white/10 text-gray-400'
          }`}>
            Ad
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation()
              setShowExplanation(!showExplanation)
            }}
            className={`p-1 rounded hover:bg-white/10 transition-colors ${
              isLightMode ? 'text-gray-500 hover:text-gray-700' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Info className="w-3 h-3" />
          </button>
        </div>

        {/* Ad Content */}
        <div className="flex items-start space-x-4 pr-16">
          {adData.media?.img && (
            <div className="flex-shrink-0">
              <img
                src={adData.media.img}
                alt={adData.media.alt}
                className="w-12 h-12 rounded-lg object-cover"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className={`font-semibold text-sm mb-1 group-hover:underline ${
              isLightMode ? 'text-gray-900' : 'text-white'
            }`}>
              {adData.headline}
            </h3>
            
            <p className={`text-sm mb-2 line-clamp-2 ${
              isLightMode ? 'text-gray-600' : 'text-gray-300'
            }`}>
              {adData.body}
            </p>
            
            {adData.cta && (
              <div className="flex items-center space-x-1 text-blue-500 text-sm font-medium">
                <span>{adData.cta.text}</span>
                <ExternalLink className="w-3 h-3" />
              </div>
            )}
            
            {adData.disclosure && (
              <p className={`text-xs mt-2 ${
                isLightMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {adData.disclosure}
              </p>
            )}
          </div>
        </div>

        {/* Why This Ad Explanation */}
        {showExplanation && adData.explanation && (
          <div className={`absolute top-full left-0 right-0 mt-2 p-3 rounded-lg shadow-lg z-10 ${
            isLightMode ? 'bg-white border border-gray-200' : 'bg-gray-800 border border-gray-600'
          }`}>
            <div className="flex justify-between items-start mb-2">
              <h4 className={`font-medium text-sm ${
                isLightMode ? 'text-gray-900' : 'text-white'
              }`}>
                Why this ad?
              </h4>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowExplanation(false)
                }}
                className={`p-1 hover:bg-gray-100 rounded ${
                  isLightMode ? 'text-gray-500' : 'text-gray-400'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
            <p className={`text-xs ${
              isLightMode ? 'text-gray-600' : 'text-gray-300'
            }`}>
              {adData.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdSlot

