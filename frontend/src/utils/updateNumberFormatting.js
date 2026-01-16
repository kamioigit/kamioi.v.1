/**
 * Script to help identify and update number formatting throughout the application
 * This is a utility script to help with the number formatting update
 */

// Common patterns to look for in components
export const numberPatterns = [
  // Currency patterns
  /\$\{[^}]+\}/g,
  /\$[0-9,]+/g,
  /\$\s*[0-9,]+/g,
  
  // Number patterns with toFixed
  /\.toFixed\([0-9]+\)/g,
  /\.toLocaleString\(/g,
  
  // Direct number displays
  /\{[^}]*[0-9]+[^}]*\}/g,
  
  // Percentage patterns
  /[0-9]+\.[0-9]+%/g,
  /[0-9]+%/g
]

// Components that likely need updating
export const priorityComponents = [
  'components/user/UserTransactions.jsx',
  'components/user/PortfolioOverview.jsx',
  'components/user/InvestmentHistory.jsx',
  'components/business/BusinessPortfolio.jsx',
  'components/business/BusinessTransactions.jsx',
  'components/family/FamilyPortfolio.jsx',
  'components/family/FamilyTransactions.jsx',
  'components/admin/FinancialAnalytics.jsx',
  'components/admin/TransactionsReconciliation.jsx',
  'components/analytics/AdvancedAnalytics.jsx'
]

// Helper function to check if a component needs number formatting updates
export const needsNumberFormatting = (content) => {
  return numberPatterns.some(pattern => pattern.test(content))
}

// Helper function to suggest replacements
export const suggestReplacements = (content) => {
  const suggestions = []
  
  // Find currency patterns
  const currencyMatches = content.match(/\$\{[^}]+\}/g) || []
  currencyMatches.forEach(match => {
    const variable = match.slice(2, -1) // Remove ${ and }
    suggestions.push({
      original: match,
      replacement: `{formatCurrency(${variable})}`,
      type: 'currency'
    })
  })
  
  // Find toFixed patterns
  const toFixedMatches = content.match(/[a-zA-Z_$][a-zA-Z0-9_$]*\.toFixed\([0-9]+\)/g) || []
  toFixedMatches.forEach(match => {
    const variable = match.split('.')[0]
    suggestions.push({
      original: match,
      replacement: `formatCurrency(${variable})`,
      type: 'currency'
    })
  })
  
  // Find toLocaleString patterns
  const localeMatches = content.match(/[a-zA-Z_$][a-zA-Z0-9_$]*\.toLocaleString\([^)]*\)/g) || []
  localeMatches.forEach(match => {
    const variable = match.split('.')[0]
    suggestions.push({
      original: match,
      replacement: `formatNumber(${variable})`,
      type: 'number'
    })
  })
  
  return suggestions
}
