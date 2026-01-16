import React from 'react'
import { Download, RefreshCw } from 'lucide-react'

const TransactionReconciliation = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Transactions & Reconciliation</h1>
          <p className="text-gray-400 mt-1">Monitor transaction flow and reconciliation status</p>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all">
            <RefreshCw className="w-4 h-4" />
            <span>Re-run Mapping</span>
          </button>
          <button className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 flex items-center space-x-2 transition-all">
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      <div className="glass-card p-6">
        <p className="text-gray-400 text-center py-8">Transaction Reconciliation component - Funnel view, bulk actions, exports</p>
      </div>
    </div>
  )
}

export default TransactionReconciliation
