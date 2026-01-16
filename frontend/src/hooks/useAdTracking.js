import { useRef, useCallback } from 'react'

export const useAdTracking = () => {
  const trackingQueue = useRef([])
  const batchTimeout = useRef(null)

  // Batch tracking events for better performance
  const flushTrackingQueue = useCallback(async () => {
    if (trackingQueue.current.length === 0) return

    const events = [...trackingQueue.current]
    trackingQueue.current = []

    try {
      await fetch('/api/ads/track/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('kamioi_token')}`
        },
        body: JSON.stringify({ events })
      })
    } catch (error) {
      console.error('Batch tracking error:', error)
      // Re-queue failed events
      trackingQueue.current.unshift(...events)
    }
  }, [])

  const scheduleFlush = useCallback(() => {
    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current)
    }
    batchTimeout.current = setTimeout(flushTrackingQueue, 1000) // Batch every 1 second
  }, [flushTrackingQueue])

  const trackEvent = useCallback((eventType, data) => {
    const event = {
      event: `ad.${eventType}.v1`,
      ts: new Date().toISOString(),
      ...data
    }

    trackingQueue.current.push(event)
    scheduleFlush()
  }, [scheduleFlush])

  const trackImpression = useCallback((data) => {
    trackEvent('imp', data)
  }, [trackEvent])

  const trackClick = useCallback((data) => {
    trackEvent('click', data)
  }, [trackEvent])

  const trackConversion = useCallback((data) => {
    trackEvent('conv', data)
  }, [trackEvent])

  const trackViewability = useCallback((data) => {
    trackEvent('viewability', data)
  }, [trackEvent])

  // Immediate flush for critical events
  const flushImmediate = useCallback(() => {
    if (batchTimeout.current) {
      clearTimeout(batchTimeout.current)
      batchTimeout.current = null
    }
    flushTrackingQueue()
  }, [flushTrackingQueue])

  return {
    trackImpression,
    trackClick,
    trackConversion,
    trackViewability,
    flushImmediate
  }
}

export const useAdConsent = () => {
  const getConsentStatus = useCallback(() => {
    const consent = localStorage.getItem('kamioi_ad_consent')
    return consent ? JSON.parse(consent) : {
      personalized: true,
      dataUsage: true,
      lastUpdated: null
    }
  }, [])

  const updateConsent = useCallback((consentData) => {
    const updatedConsent = {
      ...consentData,
      lastUpdated: new Date().toISOString()
    }
    localStorage.setItem('kamioi_ad_consent', JSON.stringify(updatedConsent))
    
    // Notify ad system of consent changes
    fetch('/api/ads/consent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('kamioi_token')}`
      },
      body: JSON.stringify(updatedConsent)
    }).catch(error => {
      console.error('Consent update error:', error)
    })
  }, [])

  const hasPersonalizedAdsConsent = useCallback(() => {
    const consent = getConsentStatus()
    return consent.personalized
  }, [getConsentStatus])

  return {
    getConsentStatus,
    updateConsent,
    hasPersonalizedAdsConsent
  }
}

export const useAdContext = (pageType, moduleContext = []) => {
  const generatePageContext = useCallback(() => {
    const context = [pageType]
    
    // Add module context
    context.push(...moduleContext)
    
    // Add time-based context
    const hour = new Date().getHours()
    if (hour >= 6 && hour < 12) context.push('morning')
    else if (hour >= 12 && hour < 18) context.push('afternoon')
    else if (hour >= 18 && hour < 22) context.push('evening')
    else context.push('night')
    
    // Add device context
    const isMobile = window.innerWidth < 768
    context.push(isMobile ? 'mobile' : 'desktop')
    
    // Add session context from URL params or state
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('ref')) context.push(`ref_${urlParams.get('ref')}`)
    
    return context
  }, [pageType, moduleContext])

  return {
    generatePageContext
  }
}

