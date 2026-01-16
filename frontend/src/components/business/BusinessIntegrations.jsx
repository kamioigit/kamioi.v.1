import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Link, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download,
  Plus,
  Trash2,
  Edit,
  Eye,
  EyeOff
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const BusinessIntegrations = ({ user }) => {
  const [selectedFile, setSelectedFile] = useState(null)
   const { isLightMode } = useTheme()
  const [transactions, setTransactions] = useState([])
  const [selectedTransactions, setSelectedTransactions] = useState(new Set())
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  // Mock data for demonstration
  const mockTransactions = [
    {
      id: 1,
      date: '2025-10-05',
      description: 'Starbucks Coffee',
      amount: 4.50,
      roundUp: 0.50,
      category: 'Food & Dining',
      selected: false
    },
    {
      id: 2,
      date: '2025-10-04',
      description: 'Office Supplies Store',
      amount: 89.99,
      roundUp: 0.01,
      category: 'Business Expenses',
      selected: false
    },
    {
      id: 3,
      date: '2025-10-03',
      description: 'Gas Station',
      amount: 45.20,
      roundUp: 0.80,
      category: 'Transportation',
      selected: false
    }
  ]

  const handleFileUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      setSelectedFile(file)
      setTransactions(mockTransactions)
      setShowPreview(true)
    }
  }

  const handleSelectAll = () => {
    const allIds = transactions.map(t => t.id)
    setSelectedTransactions(new Set(allIds))
  }

  const handleDeselectAll = () => {
    setSelectedTransactions(new Set())
  }

  const handleToggleTransaction = (id) => {
    const newSelected = new Set(selectedTransactions)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedTransactions(newSelected)
  }

  const handleProcessTransactions = () => {
    setIsProcessing(true)
    // Simulate processing
    setTimeout(() => {
      setIsProcessing(false)
      alert(`Processed ${selectedTransactions.size} transactions successfully!`)
    }, 2000)
  }

  const getTextClass = () => {
    return isLightMode ? 'text-gray-800' : 'text-white'
  }

  const getSubtextClass = () => {
    return isLightMode ? 'text-gray-600' : 'text-white/70'
  }

  const getCardClass = () => {
    return isLightMode 
      ? 'bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200 shadow-lg'
      : 'bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 shadow-lg'
  }

  const getButtonClass = () => {
    return isLightMode
      ? 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors'
      : 'bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors'
  }

  const getSecondaryButtonClass = () => {
    return isLightMode
      ? 'bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition-colors'
      : 'bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors'
  }

  const totalRoundUps = transactions.reduce((sum, t) => sum + t.roundUp, 0)
  const selectedCount = selectedTransactions.size

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className={`text-3xl font-bold ${getTextClass()} mb-2`}>Bank Upload & Sync</h1>
        <p className={`text-lg ${getSubtextClass()}`}>
          Upload bank statements or connect your bank for automatic transaction sync.
        </p>
      </div>

      {/* Connection Status */}
      <div className={getCardClass()}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className={`${getTextClass()} font-medium`}>Not Connected</span>
          </div>
          <button className={getButtonClass()}>
            <Link className="w-4 h-4 mr-2" />
            Connect Bank
          </button>
        </div>
        <p className={`${getSubtextClass()} text-sm`}>0 banks connected</p>
      </div>

      {/* File Upload */}
      <div className={getCardClass()}>
        <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Upload Bank Statement</h3>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className={`${getTextClass()} mb-2`}>Drop your bank statement here or click to browse</p>
          <p className={`${getSubtextClass()} text-sm mb-4`}>Supports CSV, OFX, QFX formats</p>
          <input
            type="file"
            accept=".csv,.ofx,.qfx"
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className={getButtonClass() + " cursor-pointer inline-flex items-center"}>
            <Upload className="w-4 h-4 mr-2" />
            Choose File
          </label>
        </div>
      </div>

      {/* Transaction Preview */}
      {showPreview && (
        <div className={getCardClass()}>
          <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Transaction Preview</h3>
          
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <p className={`${getSubtextClass()} text-sm`}>Total Transactions</p>
              <p className={`${getTextClass()} text-lg font-semibold`}>{transactions.length}</p>
            </div>
            <div className="text-center">
              <p className={`${getSubtextClass()} text-sm`}>Total Round-ups</p>
              <p className="text-green-400 text-lg font-semibold">${totalRoundUps.toFixed(2)}</p>
            </div>
            <div className="text-center">
              <p className={`${getSubtextClass()} text-sm`}>Selected</p>
              <p className="text-blue-400 text-lg font-semibold">{selectedCount}</p>
            </div>
            <div className="text-center">
              <p className={`${getSubtextClass()} text-sm`}>Investment Value</p>
              <p className="text-purple-400 text-lg font-semibold">${totalRoundUps.toFixed(2)}</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex space-x-2">
              <button onClick={handleSelectAll} className={getSecondaryButtonClass()}>
                Select All
              </button>
              <button onClick={handleDeselectAll} className={getSecondaryButtonClass()}>
                Deselect All
              </button>
            </div>
            <span className={`${getSubtextClass()} text-sm`}>
              {selectedCount} of {transactions.length} selected
            </span>
          </div>

          {/* Transaction Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-gray-400">Date</th>
                  <th className="text-left py-3 px-4 text-gray-400">Description</th>
                  <th className="text-right py-3 px-4 text-gray-400">Amount</th>
                  <th className="text-right py-3 px-4 text-gray-400">Round-up</th>
                  <th className="text-center py-3 px-4 text-gray-400">Investments</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4 text-white">{transaction.date}</td>
                    <td className="py-3 px-4 text-white">{transaction.description}</td>
                    <td className="py-3 px-4 text-right text-white">${transaction.amount.toFixed(2)}</td>
                    <td className="py-3 px-4 text-right text-green-400">${transaction.roundUp.toFixed(2)}</td>
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedTransactions.has(transaction.id)}
                        onChange={() => handleToggleTransaction(transaction.id)}
                        className="w-4 h-4 text-blue-600 rounded"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <button className={getSecondaryButtonClass()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Another
            </button>
            <button 
              onClick={handleProcessTransactions}
              disabled={selectedCount === 0 || isProcessing}
              className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white px-6 py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Processing...' : `Process ${selectedCount} Transactions`}
            </button>
          </div>
        </div>
      )}

      {/* How it works */}
      <div className={getCardClass()}>
        <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>How it works</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <FileText className="w-6 h-6 text-blue-400" />
            </div>
            <h4 className={`${getTextClass()} font-medium mb-2`}>1. Upload Statement</h4>
            <p className={`${getSubtextClass()} text-sm`}>Upload your bank statement (CSV, OFX, QFX format)</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
            </div>
            <h4 className={`${getTextClass()} font-medium mb-2`}>2. AI Analysis</h4>
            <p className={`${getSubtextClass()} text-sm`}>AI analyzes transactions for investment opportunities</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Plus className="w-6 h-6 text-purple-400" />
            </div>
            <h4 className={`${getTextClass()} font-medium mb-2`}>3. Round-up Calculation</h4>
            <p className={`${getSubtextClass()} text-sm`}>Round-ups are calculated and allocated to relevant stocks</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Eye className="w-6 h-6 text-orange-400" />
            </div>
            <h4 className={`${getTextClass()} font-medium mb-2`}>4. Review & Process</h4>
            <p className={`${getSubtextClass()} text-sm`}>Review and select transactions to process</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default BusinessIntegrations
