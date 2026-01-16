import React, { useState } from 'react'
import { TrendingUp, TrendingDown, Filter, Calendar, Download } from 'lucide-react'
import RechartsChart from '../common/RechartsChart'

const InvestmentHistory = () => {
  const [currentPage, setCurrentPage] = useState(1)
  const [filter, setFilter] = useState('all')
  const transactionsPerPage = 8

  const transactions = []

  const filteredTransactions = filter === 'all' 
    ? transactions 
    : transactions.filter(t => t.type.toLowerCase() === filter.toLowerCase())

  const indexOfLastTransaction = currentPage * transactionsPerPage
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction)
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage)

  const exportToCSV = () => {
    // CSV export functionality would go here
    alert('Export feature coming soon!')
  }

  return (
    <div className="space-y-6">
      {/* Header with Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Investment Growth</h3>
          <RechartsChart 
            type="area" 
            height={200}
            series={[{
              name: 'Portfolio Value',
              data: [12000, 14500, 16800, 19200, 21500, 23800, 25430]
            }]}
          />
        </div>
        
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4">Monthly Activity</h3>
          <RechartsChart 
            type="bar" 
            height={200}
            series={[{
              name: 'Transactions',
              data: [12, 15, 8, 14, 10, 18, 22, 19, 15, 12, 16, 20]
            }]}
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Investment History</h2>
            <p className="text-gray-300">Track your investment journey</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Transactions</option>
                <option value="purchase">Purchases</option>
                <option value="sale">Sales</option>
                <option value="round-up">Round-ups</option>
              </select>
            </div>
            
            <button 
              onClick={exportToCSV}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left pb-3 text-gray-400 font-medium">Date</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Type</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Asset</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Shares</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Price</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Total</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Performance</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map(transaction => (
                <tr key={transaction.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      <span className="text-white">{transaction.date}</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      transaction.type === 'Purchase' ? 'bg-green-500/20 text-green-400' :
                      transaction.type === 'Sale' ? 'bg-red-500/20 text-red-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-4">
                    <span className="font-mono text-white">{transaction.symbol}</span>
                  </td>
                  <td className="text-right py-4 text-white">{transaction.shares}</td>
                  <td className="text-right py-4 text-white">${transaction.price.toFixed(2)}</td>
                  <td className="text-right py-4 text-white">${transaction.total.toFixed(2)}</td>
                  <td className="text-right py-4">
                    <div className="flex items-center justify-end space-x-1">
                      {transaction.change.startsWith('+') ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                      <span className={transaction.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}>
                        {transaction.change}
                      </span>
                    </div>
                  </td>
                  <td className="text-right py-4">
                    <span className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400">
                      {transaction.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <span>Previous</span>
            </button>
            
            <span className="text-gray-300">
              Page {currentPage} of {totalPages}
            </span>
            
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <span>Next</span>
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">0</div>
          <div className="text-gray-400 text-sm">Total Transactions</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">$0</div>
          <div className="text-gray-400 text-sm">Total Invested</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400 mb-1">0%</div>
          <div className="text-gray-400 text-sm">Average Return</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">0</div>
          <div className="text-gray-400 text-sm">Assets Held</div>
        </div>
      </div>
    </div>
  )
}

export default InvestmentHistory
