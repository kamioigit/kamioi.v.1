/**
 * Number and currency formatting utilities
 */

/**
 * Format a number with commas for thousands separators
 * @param {number|string} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number with commas
 */
export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined || value === '') return '0'
  
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })
}

/**
 * Format a number as currency with commas
 * @param {number|string} value - The number to format
 * @param {string} currency - Currency symbol (default: '$')
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value, currency = '$', decimals = 0) => {
  if (value === null || value === undefined || value === '') return `${currency}0`
  
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return `${currency}0`
  
  return `${currency}${num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`
}

/**
 * Format a number as percentage with commas for large numbers
 * @param {number|string} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted percentage string
 */
export const formatPercentage = (value, decimals = 1) => {
  if (value === null || value === undefined || value === '') return '0%'
  
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0%'
  
  return `${num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}%`
}

/**
 * Format a large number with appropriate suffixes (K, M, B)
 * @param {number|string} value - The number to format
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted number with suffix
 */
export const formatLargeNumber = (value, decimals = 1) => {
  if (value === null || value === undefined || value === '') return '0'
  
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return '0'
  
  if (num >= 1000000000) {
    return `${(num / 1000000000).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}B`
  } else if (num >= 1000000) {
    return `${(num / 1000000).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}K`
  } else {
    return num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })
  }
}

/**
 * Format a currency value with large number suffixes
 * @param {number|string} value - The number to format
 * @param {string} currency - Currency symbol (default: '$')
 * @param {number} decimals - Number of decimal places (default: 0)
 * @returns {string} Formatted currency with suffix
 */
export const formatCurrencyLarge = (value, currency = '$', decimals = 0) => {
  if (value === null || value === undefined || value === '') return `${currency}0`
  
  const num = typeof value === 'string' ? parseFloat(value) : value
  if (isNaN(num)) return `${currency}0`
  
  if (num >= 1000000000) {
    return `${currency}${(num / 1000000000).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}B`
  } else if (num >= 1000000) {
    return `${currency}${(num / 1000000).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}M`
  } else if (num >= 1000) {
    return `${currency}${(num / 1000).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}K`
  } else {
    return `${currency}${num.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    })}`
  }
}

/**
 * Format a date string for display
 * @param {string|Date} dateValue - The date to format
 * @param {string} format - Format type ('short', 'long', 'time') (default: 'short')
 * @returns {string} Formatted date string
 */
export const formatDate = (dateValue, format = 'short') => {
  if (!dateValue || dateValue === '') return ''
  
  try {
    let date
    
    // Handle different date formats from CSV
    if (typeof dateValue === 'string') {
      // Try to parse common date formats
      const dateStr = dateValue.trim()
      
      // Handle MM/DD/YYYY format
      if (dateStr.includes('/')) {
        const parts = dateStr.split('/')
        if (parts.length === 3) {
          date = new Date(parts[2], parts[0] - 1, parts[1])
        }
      }
      // Handle YYYY-MM-DD format
      else if (dateStr.includes('-')) {
        date = new Date(dateStr)
      }
      // Handle other formats
      else {
        date = new Date(dateStr)
      }
    } else {
      date = new Date(dateValue)
    }
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateValue // Return original if can't parse
    }
    
    // Format based on requested format
    switch (format) {
      case 'long':
        return date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      case 'time':
        return date.toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        })
      case 'short':
      default:
        return date.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        })
    }
  } catch (error) {
    console.warn('Date formatting error:', error, 'Original value:', dateValue)
    return dateValue // Return original if formatting fails
  }
}
