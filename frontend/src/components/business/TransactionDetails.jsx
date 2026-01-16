import React from 'react'
import { Calendar, Building2, Tag, DollarSign, TrendingUp, Clock, CheckCircle, AlertTriangle, ExternalLink, Info } from 'lucide-react'
import CompanyLogo from '../common/CompanyLogo'

const TransactionDetails = ({ transaction, allocation }) => {
  if (!transaction && !allocation) return null

  // If this is an allocation detail view, render allocation-specific details
  if (allocation && transaction && transaction.transaction) {
    const alloc = allocation
    const parentTransaction = transaction.transaction
    const stockPrice = {
      'AAPL': 150.00, 'AMZN': 140.00, 'GOOGL': 140.00, 'MSFT': 350.00, 'TSLA': 250.00,
      'META': 300.00, 'NFLX': 400.00, 'NVDA': 450.00, 'SBUX': 90.00, 'WMT': 150.00,
      'FL': 40.00, 'NKE': 120.00, 'ADBE': 400.00, 'CRM': 200.00, 'PYPL': 60.00,
      'INTC': 30.00, 'AMD': 100.00, 'ORCL': 100.00, 'IBM': 150.00, 'CSCO': 50.00,
      'JPM': 150.00, 'BAC': 30.00, 'WFC': 40.00, 'GS': 300.00, 'V': 200.00,
      'MA': 300.00, 'JNJ': 150.00, 'PFE': 30.00, 'UNH': 500.00, 'HD': 300.00,
      'LOW': 200.00, 'KO': 60.00, 'PEP': 150.00, 'MCD': 250.00, 'YUM': 100.00,
      'TGT': 150.00, 'COST': 500.00, 'EL': 200.00, 'BURL': 30.00, 'CHTR': 300.00, 'DKS': 100.00
    }
    const price = stockPrice[alloc.stock_symbol] || 100.00
    const shares = (alloc.allocationAmount || 0) / price
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <CompanyLogo 
              symbol={alloc.stock_symbol} 
              name={alloc.companyName} 
              size="w-10 h-10"
            />
            <div>
              <h3 className="text-lg font-semibold text-white">{alloc.companyName}</h3>
              <p className="text-sm text-gray-400">Stock Symbol: {alloc.stock_symbol}</p>
            </div>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Allocation Amount</span>
            <span className="text-xl font-bold text-green-400">
              ${(alloc.allocationAmount || 0).toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Allocation Percentage</span>
            <span className="text-white font-medium">
              {alloc.allocationPercentage.toFixed(1)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Shares</span>
            <span className="text-white font-medium">
              {shares < 0.01 ? '<0.01' : shares.toFixed(3)} shares
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Estimated Price per Share</span>
            <span className="text-gray-300">${price.toFixed(2)}</span>
          </div>
        </div>

        <div className="bg-white/5 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-gray-400 mb-2">Parent Transaction</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Merchant</span>
              <span className="text-white">{parentTransaction.merchant}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Date</span>
              <span className="text-white">{parentTransaction.date}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Purchase Amount</span>
              <span className="text-white">${(parentTransaction.amount || 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Round-Up</span>
              <span className="text-green-400">${(parentTransaction.round_up || 0).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Total Debit</span>
              <span className="text-white">${(parentTransaction.total_debit || 0).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'staged': return <Clock className="w-4 h-4 text-blue-400" />
      case 'failed': return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'needs-recognition': return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'pending': return <Clock className="w-4 h-4 text-orange-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'staged': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'failed': return 'bg-red-500/20 text-red-400 border-red-500/30'
      case 'needs-recognition': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'pending': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  return (
    <div className="space-y-4">
      {/* Compact Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <CompanyLogo 
            symbol={transaction.ticker} 
            name={transaction.merchant} 
            size="w-8 h-8"
          />
          <div>
            <h3 className="text-lg font-semibold text-white">{transaction.merchant}</h3>
            <p className="text-sm text-gray-400">{transaction.category}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-xl font-bold text-white">${transaction.total.toFixed(2)}</div>
          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs ${getStatusColor(transaction.status)}`}>
            {getStatusIcon(transaction.status)}
            <span className="capitalize">{transaction.status.replace('-', ' ')}</span>
          </div>
        </div>
      </div>

      {/* Financial Summary - Compact */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-400 mb-1">Purchase</div>
          <div className="text-lg font-bold text-white">${transaction.purchaseAmount.toFixed(2)}</div>
        </div>
        <div className="bg-white/5 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-400 mb-1">Round-Up</div>
          <div className="text-lg font-bold text-green-400">${transaction.roundUp.toFixed(2)}</div>
        </div>
      </div>

      {/* Investment Info - Only if invested */}
      {transaction.ticker && (
        <div className="bg-white/5 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <CompanyLogo 
                symbol={transaction.ticker} 
                name={transaction.merchant} 
                size="w-6 h-6"
              />
              <span className="text-white font-medium">{transaction.ticker}</span>
            </div>
            <span className="text-green-400 font-semibold">${transaction.investableAmount.toFixed(2)}</span>
          </div>
          <div className="text-sm text-gray-400">
            {transaction.shares.toFixed(4)} shares • ${transaction.shares > 0 ? (transaction.investableAmount / transaction.shares).toFixed(2) : 'N/A'} per share
          </div>
        </div>
      )}

      {/* Date and Status */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2 text-gray-400">
          <Calendar className="w-4 h-4" />
          <span>{transaction.date}</span>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <Building2 className="w-4 h-4" />
          <span>{transaction.merchant}</span>
        </div>
      </div>

      {/* User ID Display */}
      {transaction.user_id && (
        <div className="bg-white/5 rounded-lg p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">User ID</span>
            <span className="text-white font-mono">{transaction.user_id}</span>
          </div>
        </div>
      )}

      {/* Action Buttons - Compact */}
      {transaction.status === 'needs-recognition' && (
        <div className="pt-2">
          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-all text-sm flex items-center justify-center space-x-1">
            <Tag className="w-3 h-3" />
            <span>Edit Mapping</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default TransactionDetails
