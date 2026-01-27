import React, { useState } from 'react'

const CompanyLogo = ({ symbol, name, size = 'w-8 h-8', clickable = false }) => {
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // Get company website URL
  const getCompanyWebsite = (symbol) => {
    const websiteMap = {
      'AAPL': 'apple.com',
      'AMZN': 'amazon.com',
      'GOOGL': 'google.com',
      'GOOG': 'google.com',
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
      'COST': 'costco.com',
      'CVS': 'cvs.com',
      'ABNB': 'airbnb.com',
      'SQ': 'squareup.com',
      'SHOP': 'shopify.com',
      'SNAP': 'snap.com',
      'TWTR': 'twitter.com',
      'ZM': 'zoom.us',
      'DOCU': 'docusign.com',
      'PINS': 'pinterest.com',
      'LYFT': 'lyft.com',
      'DASH': 'doordash.com',
      'RBLX': 'roblox.com',
      'COIN': 'coinbase.com',
      'HOOD': 'robinhood.com',
      'SYK': 'stryker.com',
      'ABBV': 'abbvie.com',
      'MRK': 'merck.com',
      'LLY': 'lilly.com',
      'BMY': 'bms.com',
      'GILD': 'gilead.com',
      'AMGN': 'amgen.com',
      'BIIB': 'biogen.com',
      'REGN': 'regeneron.com',
      'VRTX': 'vrtx.com',
      'MRNA': 'modernatx.com',
      'BNTX': 'biontech.de',
      'BA': 'boeing.com',
      'LMT': 'lockheedmartin.com',
      'RTX': 'rtx.com',
      'NOC': 'northropgrumman.com',
      'GD': 'gd.com',
      'CAT': 'caterpillar.com',
      'DE': 'deere.com',
      'MMM': '3m.com',
      'HON': 'honeywell.com',
      'GE': 'ge.com',
      'UPS': 'ups.com',
      'FDX': 'fedex.com',
      'DAL': 'delta.com',
      'UAL': 'united.com',
      'AAL': 'aa.com',
      'LUV': 'southwest.com',
      'MAR': 'marriott.com',
      'HLT': 'hilton.com',
      'MGM': 'mgmresorts.com',
      'WYNN': 'wynnresorts.com',
      'DRI': 'darden.com',
      'CAKE': 'thecheesecakefactory.com',
      'T': 'att.com',
      'VZ': 'verizon.com',
      'TMUS': 't-mobile.com',
      'CMCSA': 'comcast.com',
      'DG': 'dollargeneral.com',
      'DLTR': 'dollartree.com',
      'ROST': 'rossstores.com',
      'TJX': 'tjx.com',
      'GPS': 'gap.com',
      'ANF': 'abercrombie.com',
      'AEO': 'ae.com',
      'LULU': 'lululemon.com',
      'UA': 'underarmour.com',
      'SKX': 'skechers.com',
      'CROX': 'crocs.com',
      'PVH': 'pvh.com',
      'RL': 'ralphlauren.com',
      'TPR': 'tapestry.com',
      'VFC': 'vfc.com',
      'ETSY': 'etsy.com',
      'EBAY': 'ebay.com',
      'W': 'wayfair.com',
      'CHWY': 'chewy.com',
      'BKNG': 'booking.com',
      'EXPE': 'expedia.com',
      'TRIP': 'tripadvisor.com',
      'ATVI': 'activision.com',
      'EA': 'ea.com',
      'TTWO': 'take2games.com',
      'NTDOY': 'nintendo.com',
      'SNE': 'sony.com',
      'SONY': 'sony.com'
    }

    return websiteMap[symbol?.toUpperCase()] || null
  }

  // Get logo URL using Clearbit
  const getLogoUrl = (symbol) => {
    if (!symbol) return null

    const domain = getCompanyWebsite(symbol)
    if (!domain) return null

    return `https://logo.clearbit.com/${domain}`
  }

  // Get logo and website URLs
  const logoUrl = getLogoUrl(symbol || '')
  const websiteUrl = getCompanyWebsite(symbol || '')

  const handleClick = () => {
    if (clickable && websiteUrl) {
      window.open(`https://www.${websiteUrl}`, '_blank', 'noopener,noreferrer')
    }
  }

  const handleImageLoad = () => {
    setImageLoaded(true)
    setImageError(false)
  }

  const handleImageError = () => {
    setImageError(true)
    setImageLoaded(false)
  }

  // Render fallback letter icon
  const renderFallback = () => (
    <div
      className={`${size} bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-lg flex items-center justify-center ${clickable ? 'cursor-pointer hover:from-blue-500/40 hover:to-purple-500/40 transition-colors' : ''}`}
      onClick={handleClick}
      title={clickable && websiteUrl ? `Visit ${name} website` : name || symbol}
    >
      <span className="text-white font-bold text-sm">{symbol ? symbol.charAt(0).toUpperCase() : '?'}</span>
    </div>
  )

  // If no logo URL available, show fallback immediately
  if (!logoUrl || imageError) {
    return renderFallback()
  }

  return (
    <div
      className={`${size} rounded-lg overflow-hidden bg-white p-0.5 ${clickable && websiteUrl ? 'cursor-pointer hover:ring-2 hover:ring-blue-400 transition-all' : ''}`}
      onClick={handleClick}
      title={clickable && websiteUrl ? `Visit ${name} website` : name || symbol}
    >
      {/* Show loading placeholder until image loads */}
      {!imageLoaded && !imageError && (
        <div className={`${size} bg-gray-200 rounded animate-pulse flex items-center justify-center`}>
          <span className="text-gray-400 font-bold text-xs">{symbol?.charAt(0)}</span>
        </div>
      )}
      <img
        src={logoUrl}
        alt={`${name || symbol} logo`}
        className={`w-full h-full object-contain ${imageLoaded ? 'block' : 'hidden'}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        crossOrigin="anonymous"
      />
    </div>
  )
}

export default CompanyLogo
