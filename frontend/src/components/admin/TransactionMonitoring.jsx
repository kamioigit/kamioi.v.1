import React, { useState } from 'react'
import { Filter, Download, Eye, Search, CheckCircle, AlertTriangle } from 'lucide-react'
import { useNotifications } from '../../hooks/useNotifications'

const TransactionMonitoring = () => {
  const { addNotification } = useNotifications()
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const transactionsPerPage = 10

  const transactions = [
    { id: 1, user: 'Alex Johnson', merchant: 'Nike', amount: 89.99, roundUp: 0.01, stock: 'NKE', date: '2024-01-20', status: 'Completed', risk: 'Low' },
    { id: 2, user: 'Sarah Miller', merchant: 'Apple Store', amount: 1299.99, roundUp: 0.01, stock: 'AAPL', date: '2024-01-19', status: 'Completed', risk: 'Low' },
    { id: 3, user: 'Mike Chen', merchant: 'Amazon', amount: 45.50, roundUp: 0.50, stock: 'AMZN', date: '2024-01-18', status: 'Flagged', risk: 'High' },
    { id: 4, user: 'Emily Davis', merchant: 'Starbucks', amount: 5.75, roundUp: 0.25, stock: 'SBUX', date: '2024-01-17', status: 'Completed', risk: 'Low' },
    { id: 5, user: 'David Wilson', merchant: 'Walmart', amount: 125.30, roundUp: 0.70, stock: 'WMT', date: '2024-01-16', status: 'Pending', risk: 'Medium' },
    { id: 6, user: 'Lisa Brown', merchant: 'Target', amount: 67.89, roundUp: 0.11, stock: 'TGT', date: '2024-01-15', status: 'Completed', risk: 'Low' },
    { id: 7, user: 'Kevin Garcia', merchant: 'Best Buy', amount: 450.00, roundUp: 0.50, stock: 'BBY', date: '2024-01-14', status: 'Completed', risk: 'Low' },
    { id: 8, user: 'Amy Thompson', merchant: 'Home Depot', amount: 89.45, roundUp: 0.55, stock: 'HD', date: '2024-01-13', status: 'Flagged', risk: 'High' }
  ]

  const filteredTransactions = statusFilter === 'all' 
    ? transactions 
    : transactions.filter(t => t.status.toLowerCase() === statusFilter.toLowerCase())

  const indexOfLastTransaction = currentPage * transactionsPerPage
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage
  const currentTransactions = filteredTransactions.slice(indexOfFirstTransaction, indexOfLastTransaction)
  const totalPages = Math.ceil(filteredTransactions.length / transactionsPerPage)

  const exportToCSV = () => {
    addNotification({
      type: 'success',
      title: 'Export Successful',
      message: 'Transaction data exported successfully!',
      timestamp: new Date()
    })
  }

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Transaction Monitoring</h2>
            <p className="text-gray-300">Monitor and manage platform transactions</p>
          </div>
          <button 
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search transactions..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex space-x-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="flagged">Flagged</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left pb-3 text-gray-400 font-medium">User</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Merchant</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Amount</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Round-Up</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Stock</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Date</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Status</th>
                <th className="text-left pb-3 text-gray-400 font-medium">Risk</th>
                <th className="text-right pb-3 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentTransactions.map(transaction => (
                <tr key={transaction.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-4">
                    <p className="text-white font-medium">{transaction.user}</p>
                  </td>
                  <td className="py-4 text-white">{transaction.merchant}</td>
                  <td className="py-4 text-right text-white">${transaction.amount.toFixed(2)}</td>
                  <td className="py-4 text-right text-green-400">${transaction.roundUp.toFixed(2)}</td>
                  <td className="py-4">
                    <span className="font-mono text-white">{transaction.stock}</span>
                  </td>
                  <td className="py-4 text-gray-300">{transaction.date}</td>
                  <td className="py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      transaction.status === 'Completed' ? 'bg-green-500/20 text-green-400' :
                      transaction.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {transaction.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center space-x-1">
                      {transaction.risk === 'High' ? (
                        <AlertTriangle className="w-4 h-4 text-red-400" />
                      ) : transaction.risk === 'Medium' ? (
                        <AlertTriangle className="w-4 h-4 text-yellow-400" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      <span className={`
                        ${transaction.risk === 'High' ? 'text-red-400' :
                          transaction.risk === 'Medium' ? 'text-yellow-400' :
                          'text-green-400'}
                      `}>
                        {transaction.risk}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <button className="p-1 text-blue-400 hover:text-blue-300" title="View Details">
                      <Eye className="w-4 h-4" />
                    </button>
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

      {/* Transaction Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-green-400 mb-1">$28,450</div>
          <div className="text-gray-400 text-sm">Total Round-ups</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-blue-400 mb-1">12.4k</div>
          <div className="text-gray-400 text-sm">Total Transactions</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400 mb-1">42</div>
          <div className="text-gray-400 text-sm">Flagged Transactions</div>
        </div>
        <div className="glass-card p-4 text-center">
          <div className="text-2xl font-bold text-purple-400 mb-1">98.7%</div>
          <div className="text-gray-400 text-sm">Success Rate</div>
        </div>
      </div>
    </div>
  )
}

export default TransactionMonitoring
