import React, { useState, useRef } from 'react'
import { 
  Upload, 
  Download, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  CreditCard, 
  Banknote,
  Link,
  Unlink,
  Settings,
  Eye,
  EyeOff,
  X,
  Plus,
  Trash2,
  Edit,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  Search
} from 'lucide-react'

const BankUploadSync = ({ onTransactionProcessed }) => {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [processingStatus, setProcessingStatus] = useState(null)
  const [extractedTransactions, setExtractedTransactions] = useState([])
  const [selectedTransactions, setSelectedTransactions] = useState([])
  const [showPreview, setShowPreview] = useState(false)
  const [syncStatus, setSyncStatus] = useState('disconnected')
  const [connectedBanks, setConnectedBanks] = useState([])
  const [showBankConnection, setShowBankConnection] = useState(false)
  const fileInputRef = useRef(null)

  // Initialize with mock banks for demonstration
  const [mockBanks, setMockBanks] = useState([
    {
      id: 'chase',
      name: 'Chase Bank',
      logo: '🏦',
      type: 'Checking'
    },
    {
      id: 'bankofamerica',
      name: 'Bank of America',
      logo: '🏛️',
      type: 'Checking'
    },
    {
      id: 'wellsfargo',
      name: 'Wells Fargo',
      logo: '🏪',
      type: 'Checking'
    },
    {
      id: 'citibank',
      name: 'Citibank',
      logo: '🏢',
      type: 'Checking'
    }
  ])

  const handleFileUpload = async (file) => {
    if (!file) return

    setIsUploading(true)
    setProcessingStatus('uploading')
    setUploadedFile(file)

    try {
      // Simulate file processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      setProcessingStatus('processing')

      // Simulate transaction extraction
      await new Promise(resolve => setTimeout(resolve, 3000))
      setProcessingStatus('analyzing')

      // Generate sample transactions based on file
      const sampleTransactions = [
        {
          id: Date.now() + 1,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'AMAZON.COM AMZN.COM/BILL WA',
          amount: -45.67,
          category: 'Online Shopping',
          account: 'Chase Checking',
          type: 'debit',
          roundUp: 1.33,
          investmentAllocation: {
            'AMZN': 0.67,
            'AAPL': 0.33
          }
        },
        {
          id: Date.now() + 2,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'STARBUCKS COFFEE #1234',
          amount: -8.45,
          category: 'Food & Dining',
          account: 'Chase Checking',
          type: 'debit',
          roundUp: 1.55,
          investmentAllocation: {
            'SBUX': 1.00,
            'AAPL': 0.55
          }
        },
        {
          id: Date.now() + 3,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'NETFLIX.COM NETFLIX.COM',
          amount: -15.99,
          category: 'Entertainment',
          account: 'Chase Checking',
          type: 'debit',
          roundUp: 0.01,
          investmentAllocation: {
            'NFLX': 0.01
          }
        },
        {
          id: Date.now() + 4,
          date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          description: 'APPLE.COM/BILL 866-712-7753 CA',
          amount: -29.99,
          category: 'Technology',
          account: 'Chase Checking',
          type: 'debit',
          roundUp: 0.01,
          investmentAllocation: {
            'AAPL': 0.01
          }
        },
        {
          id: Date.now() + 5,
          date: new Date().toISOString().split('T')[0],
          description: 'GOOGLE *GOOGLE STORAGE',
          amount: -2.99,
          category: 'Technology',
          account: 'Chase Checking',
          type: 'debit',
          roundUp: 0.01,
          investmentAllocation: {
            'GOOGL': 0.01
          }
        }
      ]

      setExtractedTransactions(sampleTransactions)
      setProcessingStatus('completed')
      setShowPreview(true)

    } catch (error) {
      console.error('Bank file processing error:', error)
      setProcessingStatus('error')
    } finally {
      setIsUploading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileUpload(files[0])
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const connectBank = async (bankId) => {
    setSyncStatus('connecting')
    
    // Simulate bank connection
    await new Promise(resolve => setTimeout(resolve, 3000))
    
    const bank = mockBanks.find(b => b.id === bankId)
    setConnectedBanks(prev => [...prev, { ...bank, connectedAt: new Date() }])
    setSyncStatus('connected')
    setShowBankConnection(false)
  }

  const disconnectBank = (bankId) => {
    setConnectedBanks(prev => prev.filter(b => b.id !== bankId))
    if (connectedBanks.length === 1) {
      setSyncStatus('disconnected')
    }
  }

  const syncTransactions = async () => {
    setSyncStatus('syncing')
    
    // Simulate sync process
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Add new transactions from bank sync
    const newTransactions = [
      {
        id: Date.now() + 10,
        date: new Date().toISOString().split('T')[0],
        description: 'WALMART SUPERCENTER #1234',
        amount: -89.99,
        category: 'Retail',
        account: 'Chase Checking',
        type: 'debit',
        roundUp: 0.01,
        investmentAllocation: {
          'WMT': 0.01
        }
      },
      {
        id: Date.now() + 11,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'SHELL OIL 12345',
        amount: -45.20,
        category: 'Gas',
        account: 'Chase Checking',
        type: 'debit',
        roundUp: 0.80,
        investmentAllocation: {
          'XOM': 0.40,
          'CVX': 0.40
        }
      },
      {
        id: Date.now() + 12,
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        description: 'SPOTIFY USA NEW YORK NY',
        amount: -9.99,
        category: 'Entertainment',
        account: 'Chase Checking',
        type: 'debit',
        roundUp: 0.01,
        investmentAllocation: {
          'SPOT': 0.01
        }
      }
    ]
    
    setExtractedTransactions(prev => [...newTransactions, ...prev])
    setSyncStatus('connected')
  }

  const toggleTransactionSelection = (transactionId) => {
    setSelectedTransactions(prev => 
      prev.includes(transactionId) 
        ? prev.filter(id => id !== transactionId)
        : [...prev, transactionId]
    )
  }

  const selectAllTransactions = () => {
    setSelectedTransactions(extractedTransactions.map(t => t.id))
  }

  const deselectAllTransactions = () => {
    setSelectedTransactions([])
  }

  const processSelectedTransactions = async () => {
    const selected = extractedTransactions.filter(t => selectedTransactions.includes(t.id))
    
    try {
      // Process transactions
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      onTransactionProcessed(selected)
      setShowPreview(false)
      setSelectedTransactions([])
      setExtractedTransactions([])
      setUploadedFile(null)
      
    } catch (error) {
      console.error('Transaction processing error:', error)
    }
  }

  const resetUpload = () => {
    setUploadedFile(null)
    setProcessingStatus(null)
    setExtractedTransactions([])
    setSelectedTransactions([])
    setShowPreview(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const renderUploadArea = () => (
    <div
      className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-white/40 transition-colors cursor-pointer"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.ofx,.qfx,.txt"
        onChange={(e) => handleFileUpload(e.target.files[0])}
        className="hidden"
      />
      
      <div className="space-y-4">
        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto">
          <Upload className="w-8 h-8 text-blue-400" />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Upload Bank Statement
          </h3>
          <p className="text-gray-400 text-sm">
            Drag and drop your bank statement here, or click to browse
          </p>
        </div>
        
        <div className="flex justify-center space-x-4 text-xs text-gray-500">
          <span className="flex items-center space-x-1">
            <FileText className="w-4 h-4" />
            <span>CSV, OFX, QFX</span>
          </span>
          <span className="flex items-center space-x-1">
            <CreditCard className="w-4 h-4" />
            <span>Bank statements</span>
          </span>
        </div>
      </div>
    </div>
  )

  const renderProcessingStatus = () => {
    const statusConfig = {
      uploading: { icon: Upload, text: 'Uploading statement...', color: 'text-blue-400' },
      processing: { icon: FileText, text: 'Processing transactions...', color: 'text-yellow-400' },
      analyzing: { icon: TrendingUp, text: 'Analyzing for investments...', color: 'text-purple-400' },
      completed: { icon: CheckCircle, text: 'Processing complete!', color: 'text-green-400' },
      error: { icon: AlertCircle, text: 'Processing failed', color: 'text-red-400' }
    }

    const config = statusConfig[processingStatus]
    const Icon = config.icon

    return (
      <div className="text-center space-y-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
          processingStatus === 'error' ? 'bg-red-500/20' : 'bg-blue-500/20'
        }`}>
          <Icon className={`w-8 h-8 ${config.color} ${
            processingStatus === 'processing' || processingStatus === 'analyzing' ? 'animate-spin' : ''
          }`} />
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            {config.text}
          </h3>
          {processingStatus === 'processing' && (
            <p className="text-gray-400 text-sm">
              Extracting transaction data from your bank statement...
            </p>
          )}
          {processingStatus === 'analyzing' && (
            <p className="text-gray-400 text-sm">
              Analyzing transactions for investment opportunities...
            </p>
          )}
        </div>
      </div>
    )
  }

  const renderTransactionPreview = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Transaction Preview</h3>
        <button
          onClick={resetUpload}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Summary */}
      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-400">Total Transactions:</span>
            <p className="text-white font-medium">{extractedTransactions.length}</p>
          </div>
          <div>
            <span className="text-gray-400">Total Round-ups:</span>
            <p className="text-green-400 font-medium">
              ${extractedTransactions.reduce((sum, t) => sum + t.roundUp, 0).toFixed(2)}
            </p>
          </div>
          <div>
            <span className="text-gray-400">Selected:</span>
            <p className="text-blue-400 font-medium">{selectedTransactions.length}</p>
          </div>
          <div>
            <span className="text-gray-400">Investment Value:</span>
            <p className="text-purple-400 font-medium">
              ${extractedTransactions.reduce((sum, t) => sum + t.roundUp, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Selection Controls */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-3">
          <button
            onClick={selectAllTransactions}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 text-sm transition-all"
          >
            Select All
          </button>
          <button
            onClick={deselectAllTransactions}
            className="bg-gray-500/20 hover:bg-gray-500/30 border border-gray-500/30 rounded-lg px-4 py-2 text-gray-400 text-sm transition-all"
          >
            Deselect All
          </button>
        </div>
        <div className="text-sm text-gray-400">
          {selectedTransactions.length} of {extractedTransactions.length} selected
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white/5 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-white/5">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedTransactions.length === extractedTransactions.length}
                    onChange={selectedTransactions.length === extractedTransactions.length ? deselectAllTransactions : selectAllTransactions}
                    className="rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm">Date</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm">Description</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm">Amount</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm">Round-up</th>
                <th className="px-4 py-3 text-left text-gray-400 text-sm">Investments</th>
              </tr>
            </thead>
            <tbody>
              {extractedTransactions.map((transaction) => (
                <tr key={transaction.id} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedTransactions.includes(transaction.id)}
                      onChange={() => toggleTransactionSelection(transaction.id)}
                      className="rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3 text-white text-sm">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-white text-sm">
                    {transaction.description}
                  </td>
                  <td className={`px-4 py-3 text-sm font-medium ${
                    transaction.amount < 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    ${Math.abs(transaction.amount).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-green-400 text-sm font-medium">
                    ${transaction.roundUp.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(transaction.investmentAllocation).map(([symbol, amount]) => (
                        <span key={symbol} className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                          {symbol}: ${amount.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={resetUpload}
          className="flex-1 bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 px-4 rounded-lg transition-all"
        >
          Upload Another
        </button>
        <button
          onClick={processSelectedTransactions}
          disabled={selectedTransactions.length === 0}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Process {selectedTransactions.length} Transactions
        </button>
      </div>
    </div>
  )

  const renderBankConnection = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Connect Your Bank</h3>
        <button
          onClick={() => setShowBankConnection(false)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockBanks.map((bank) => (
          <div
            key={bank.id}
            className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-all cursor-pointer"
            onClick={() => connectBank(bank.id)}
          >
            <div className="flex items-center space-x-3">
              <div className="text-2xl">{bank.logo}</div>
              <div>
                <h4 className="text-white font-medium">{bank.name}</h4>
                <p className="text-gray-400 text-sm">Click to connect</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Bank Upload & Sync
        </h2>
        <p className="text-gray-400">
          Upload bank statements or connect your bank for automatic transaction sync
        </p>
      </div>

      {/* Connection Status */}
      <div className="bg-white/5 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className={`w-3 h-3 rounded-full ${
              syncStatus === 'connected' ? 'bg-green-400' : 
              syncStatus === 'syncing' ? 'bg-yellow-400 animate-pulse' : 
              'bg-gray-400'
            }`}></div>
            <div>
              <h3 className="text-white font-medium">
                {syncStatus === 'connected' ? 'Bank Connected' : 
                 syncStatus === 'syncing' ? 'Syncing...' : 
                 'Not Connected'}
              </h3>
              <p className="text-gray-400 text-sm">
                {connectedBanks.length} bank{connectedBanks.length !== 1 ? 's' : ''} connected
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {syncStatus === 'connected' && (
              <button
                onClick={syncTransactions}
                className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 text-sm transition-all flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Sync Now</span>
              </button>
            )}
            <button
              onClick={() => setShowBankConnection(true)}
              className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg px-4 py-2 text-green-400 text-sm transition-all flex items-center space-x-2"
            >
              <Link className="w-4 h-4" />
              <span>Connect Bank</span>
            </button>
          </div>
        </div>

        {/* Connected Banks */}
        {connectedBanks.length > 0 && (
          <div className="mt-4 space-y-2">
            {connectedBanks.map((bank) => (
              <div key={bank.id} className="flex justify-between items-center bg-white/5 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <div className="text-xl">{bank.logo}</div>
                  <div>
                    <p className="text-white font-medium">{bank.name}</p>
                    <p className="text-gray-400 text-sm">
                      Connected {bank.connectedAt.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => disconnectBank(bank.id)}
                  className="text-red-400 hover:text-red-300 transition-colors"
                >
                  <Unlink className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upload Area */}
      <div className="bg-white/5 rounded-lg p-6">
        {!uploadedFile && !showPreview && renderUploadArea()}
        {uploadedFile && !showPreview && renderProcessingStatus()}
        {showPreview && renderTransactionPreview()}
      </div>

      {/* Bank Connection Modal */}
      {showBankConnection && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl p-6 w-full max-w-2xl mx-auto shadow-2xl">
            {renderBankConnection()}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-white/5 rounded-lg p-4">
        <h4 className="text-white font-medium mb-3">How it works:</h4>
        <div className="text-sm text-gray-400 space-y-2">
          <p>1. Upload your bank statement (CSV, OFX, QFX format)</p>
          <p>2. AI analyzes transactions for investment opportunities</p>
          <p>3. Round-ups are calculated and allocated to relevant stocks</p>
          <p>4. Review and select transactions to process</p>
          <p>5. Investments are automatically executed</p>
        </div>
        
        <div className="mt-4 p-3 bg-blue-500/10 rounded-lg">
          <p className="text-blue-400 text-sm font-medium">Supported Formats:</p>
          <p className="text-gray-300 text-sm">
            CSV, OFX, QFX, and direct bank connections via secure API
          </p>
        </div>
      </div>
    </div>
  )
}

export default BankUploadSync
