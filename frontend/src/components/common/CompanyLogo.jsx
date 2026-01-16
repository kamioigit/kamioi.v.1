import React from 'react'

const CompanyLogo = ({ symbol, name, size = 'w-8 h-8', clickable = false }) => {
  // Get company website URL
  const getCompanyWebsite = (symbol) => {
    const websiteMap = {
      'AAPL': 'apple.com',
      'AMZN': 'amazon.com',
      'GOOGL': 'google.com',
      'MSFT': 'microsoft.com',
      'TSLA': 'tesla.com',
      'META': 'meta.com',
      'NFLX': 'netflix.com',
      'NVDA': 'nvidia.com',
      'ADBE': 'adobe.com',
      'FL': 'footlocker.com',
      'BURL': 'burlington.com',
      'CHTR': 'spectrum.com',
      'DKS': 'dickssportinggoods.com',
      'EL': 'esteelauder.com',
      'SBUX': 'starbucks.com',
      'WMT': 'walmart.com',
      'SPOT': 'spotify.com',
      'UBER': 'uber.com',
      'M': 'macys.com',
      'CMG': 'chipotle.com',
      'DIS': 'disney.com',
      'NKE': 'nike.com',
      'CRM': 'salesforce.com',
      'PYPL': 'paypal.com',
      'INTC': 'intel.com',
      'AMD': 'amd.com',
      'ORCL': 'oracle.com',
      'IBM': 'ibm.com',
      'CSCO': 'cisco.com',
      'JPM': 'jpmorganchase.com',
      'BAC': 'bankofamerica.com',
      'WFC': 'wellsfargo.com',
      'GS': 'goldmansachs.com',
      'V': 'visa.com',
      'MA': 'mastercard.com',
      'JNJ': 'jnj.com',
      'PFE': 'pfizer.com',
      'UNH': 'unitedhealthgroup.com',
      'HD': 'homedepot.com',
      'LOW': 'lowes.com',
      'KO': 'coca-cola.com',
      'PEP': 'pepsi.com',
      'MCD': 'mcdonalds.com',
      'YUM': 'yum.com',
      'TGT': 'target.com',
      'COST': 'costco.com'
    }
    
    return websiteMap[symbol] || null
  }

  // Get logo URL using Clearbit
  const getLogoUrl = (symbol) => {
    if (!symbol) return null
    
    const domain = getCompanyWebsite(symbol)
    if (!domain) return null
    
    return `https://logo.clearbit.com/${domain}`
  }

  // Get logo and website URLs early
  const logoUrl = getLogoUrl(symbol || '')
  const websiteUrl = getCompanyWebsite(symbol || '')

  // Debug logging
  console.log('🏢 CompanyLogo - Symbol:', symbol, 'Name:', name, 'Logo URL:', logoUrl)
  
  const handleClick = () => {
    if (clickable && websiteUrl) {
      window.open(`https://www.${websiteUrl}`, '_blank', 'noopener,noreferrer')
    }
  }
  
  if (logoUrl) {
    return (
      <div 
        className={`${size} rounded-lg object-contain bg-white/10 p-1 ${clickable && websiteUrl ? 'cursor-pointer hover:bg-white/20 transition-colors' : ''}`}
        onClick={handleClick}
        title={clickable && websiteUrl ? `Visit ${name} website` : ''}
      >
        <img
          src={logoUrl}
          alt={`${name} logo`}
          className="w-full h-full object-contain"
          onLoad={() => console.log('✅ Logo loaded successfully:', logoUrl)}
          onError={(e) => {
            console.log('❌ Logo failed to load:', logoUrl)
            // Fallback to letter icon if logo fails to load
            e.target.style.display = 'none'
            e.target.nextSibling.style.display = 'flex'
          }}
        />
        <div 
          className={`${size} bg-blue-500/20 rounded-lg flex items-center justify-center hidden`}
          style={{ display: 'none' }}
        >
          <span className="text-blue-400 font-bold text-sm">{symbol.charAt(0)}</span>
        </div>
      </div>
    )
  }

  // Fallback to letter icon
  return (
    <div 
      className={`${size} bg-blue-500/20 rounded-lg flex items-center justify-center ${clickable ? 'cursor-pointer hover:bg-blue-500/30 transition-colors' : ''}`}
      onClick={handleClick}
      title={clickable && websiteUrl ? `Visit ${name} website` : ''}
    >
      <span className="text-blue-400 font-bold text-sm">{symbol ? symbol.charAt(0) : '?'}</span>
    </div>
  )
}

export default CompanyLogo
