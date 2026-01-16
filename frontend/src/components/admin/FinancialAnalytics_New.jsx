import React, { useState, useEffect, useCallback } from 'react'
import { DollarSign, TrendingUp, TrendingDown, Users, CreditCard, FileText, Download, Filter, Calendar, Eye, Edit, CheckCircle, AlertCircle, Calculator, BookOpen, BarChart3, PieChart, LineChart, Plus, X, Trash2, Upload, Lock, Unlock, RefreshCw, Clock, Target, Zap, Building, Home, User, Brain, Database, Shield, Settings, ChevronDown, ChevronRight, Search, Save, AlertTriangle, Cloud } from 'lucide-react'
import RechartsChart from '../common/RechartsChart'

const FinancialAnalytics_New = ({ user }) => {
  // State Management
  const [activeTab, setActiveTab] = useState('executive')
  const [selectedPeriod, setSelectedPeriod] = useState('month')
  const [loading, setLoading] = useState(false)
  const [financialData, setFinancialData] = useState(null)
  const [kpiData, setKpiData] = useState(null)
  const [glAccounts, setGlAccounts] = useState([])
  const [journalEntries, setJournalEntries] = useState([])
  const [transactions, setTransactions] = useState([])
  
  // Journal Entry State
  const [showJournalEntry, setShowJournalEntry] = useState(false)
  const [journalEntry, setJournalEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    description: '',
    location: '',
    department: '',
    entries: [{ account: '', debit: 0, credit: 0, description: '' }],
    totalDebit: 0,
    totalCredit: 0,
    status: 'draft'
  })

  // GL Chart of Accounts (Complete)
  const glChartOfAccounts = {
    assets: [
      { code: '10100', name: 'Cash  Bank of America', type: 'asset', normal: 'debit' },
      { code: '10150', name: 'Petty Cash', type: 'asset', normal: 'debit' },
      { code: '11000', name: 'Accounts Receivable', type: 'asset', normal: 'debit' },
      { code: '12000', name: 'Prepaid Expenses', type: 'asset', normal: 'debit' },
      { code: '13000', name: 'Investments  Short Term', type: 'asset', normal: 'debit' },
      { code: '14000', name: 'Equipment & Computers', type: 'asset', normal: 'debit' },
      { code: '14100', name: 'Accumulated Depreciation', type: 'asset', normal: 'debit' },
      { code: '15001', name: 'Software & Development Assets', type: 'asset', normal: 'debit' },
      { code: '15100', name: 'Cloud Credits / Deferred Tech Assets', type: 'asset', normal: 'debit' },
      { code: '15200', name: 'LLM Data Assets', type: 'asset', normal: 'debit' },
      { code: '16000', name: 'Security Deposits', type: 'asset', normal: 'debit' },
      { code: '17000', name: 'Intercompany Receivable  Basketball LLC', type: 'asset', normal: 'debit' }
    ],
    liabilities: [
      { code: '20000', name: 'Accounts Payable', type: 'liability', normal: 'credit' },
      { code: '20100', name: 'Credit Card Payable', type: 'liability', normal: 'credit' },
      { code: '21000', name: 'Accrued Expenses', type: 'liability', normal: 'credit' },
      { code: '22000', name: 'Payroll Liabilities', type: 'liability', normal: 'credit' },
      { code: '23000', name: 'Deferred Revenue', type: 'liability', normal: 'credit' },
      { code: '24000', name: 'Taxes Payable', type: 'liability', normal: 'credit' },
      { code: '25001', name: 'Intercompany Payable  Basketball LLC', type: 'liability', normal: 'credit' },
      { code: '26000', name: 'Customer Deposits', type: 'liability', normal: 'credit' }
    ],
    equity: [
      { code: '30000', name: 'Common Stock', type: 'equity', normal: 'credit' },
      { code: '30100', name: 'Additional Paid-In Capital', type: 'equity', normal: 'credit' },
      { code: '30200', name: 'Owner Contributions', type: 'equity', normal: 'credit' },
      { code: '31000', name: 'Retained Earnings', type: 'equity', normal: 'credit' },
      { code: '32000', name: 'Current Year Earnings', type: 'equity', normal: 'credit' }
    ],
    revenue: [
      { code: '40100', name: 'Revenue  Individual Accounts', type: 'revenue', normal: 'credit' },
      { code: '40200', name: 'Revenue  Family Accounts', type: 'revenue', normal: 'credit' },
      { code: '40300', name: 'Revenue  Business Accounts', type: 'revenue', normal: 'credit' },
      { code: '40400', name: 'Subscription Revenue', type: 'revenue', normal: 'credit' },
      { code: '40500', name: 'AI Insight Revenue', type: 'revenue', normal: 'credit' },
      { code: '40600', name: 'Advertisement Revenue', type: 'revenue', normal: 'credit' },
      { code: '40700', name: 'Platform Fee Revenue', type: 'revenue', normal: 'credit' },
      { code: '40800', name: 'Data Licensing / API Revenue', type: 'revenue', normal: 'credit' },
      { code: '40900', name: 'Other Revenue', type: 'revenue', normal: 'credit' }
    ],
    cogs: [
      { code: '50100', name: 'Cloud Compute (AWS, Azure, GCP)', type: 'cogs', normal: 'debit' },
      { code: '50200', name: 'Data Acquisition & Labeling', type: 'cogs', normal: 'debit' },
      { code: '50300', name: 'AI/LLM Training Costs', type: 'cogs', normal: 'debit' },
      { code: '50400', name: 'Model Hosting & API Costs', type: 'cogs', normal: 'debit' },
      { code: '50500', name: 'Payment Processing Fees (Visa/Stripe/etc.)', type: 'cogs', normal: 'debit' },
      { code: '50600', name: 'Content Moderation & Review', type: 'cogs', normal: 'debit' },
      { code: '50700', name: 'Direct DevOps Support', type: 'cogs', normal: 'debit' },
      { code: '50800', name: 'Data Storage', type: 'cogs', normal: 'debit' },
      { code: '50900', name: 'AI Compute Hardware Depreciation', type: 'cogs', normal: 'debit' }
    ],
    expenses: [
      { code: '60100', name: 'Salaries  Full-Time Employees', type: 'expense', normal: 'debit' },
      { code: '60110', name: 'Salaries  Founders', type: 'expense', normal: 'debit' },
      { code: '60120', name: 'Contractor Payments', type: 'expense', normal: 'debit' },
      { code: '60130', name: 'Payroll Taxes', type: 'expense', normal: 'debit' },
      { code: '60140', name: 'Employee Benefits', type: 'expense', normal: 'debit' },
      { code: '60150', name: 'Employee Stock Compensation', type: 'expense', normal: 'debit' },
      { code: '60160', name: 'Recruiting & Talent Acquisition', type: 'expense', normal: 'debit' },
      { code: '60170', name: 'Employee Training & Development', type: 'expense', normal: 'debit' },
      { code: '60180', name: 'Employee Wellness & Perks', type: 'expense', normal: 'debit' },
      { code: '61000', name: 'Cloud Services (AWS, Azure, GCP)', type: 'expense', normal: 'debit' },
      { code: '61010', name: 'LLM Hosting & API Costs', type: 'expense', normal: 'debit' },
      { code: '61020', name: 'Data Engineering Infrastructure', type: 'expense', normal: 'debit' },
      { code: '61030', name: 'Development Tools & Platforms', type: 'expense', normal: 'debit' },
      { code: '61040', name: 'Software Licenses', type: 'expense', normal: 'debit' },
      { code: '61050', name: 'Data Storage & Warehousing', type: 'expense', normal: 'debit' },
      { code: '61060', name: 'Monitoring & Observability', type: 'expense', normal: 'debit' },
      { code: '61070', name: 'Network Security & Firewalls', type: 'expense', normal: 'debit' },
      { code: '61080', name: 'DevOps & Automation Tools', type: 'expense', normal: 'debit' },
      { code: '61090', name: 'R&D  Experimental AI/LLM', type: 'expense', normal: 'debit' },
      { code: '62000', name: 'Paid Advertising', type: 'expense', normal: 'debit' },
      { code: '62010', name: 'Social Media Marketing', type: 'expense', normal: 'debit' },
      { code: '62020', name: 'Content Marketing', type: 'expense', normal: 'debit' },
      { code: '62030', name: 'SEO & SEM Tools', type: 'expense', normal: 'debit' },
      { code: '62040', name: 'Brand Design & Assets', type: 'expense', normal: 'debit' },
      { code: '62050', name: 'Event & Sponsorships', type: 'expense', normal: 'debit' },
      { code: '62060', name: 'Customer Referral Incentives', type: 'expense', normal: 'debit' },
      { code: '62070', name: 'Public Relations', type: 'expense', normal: 'debit' },
      { code: '62080', name: 'Marketing Automation Tools', type: 'expense', normal: 'debit' },
      { code: '62090', name: 'Market Research', type: 'expense', normal: 'debit' },
      { code: '63000', name: 'Rent & Office Space', type: 'expense', normal: 'debit' },
      { code: '63010', name: 'Utilities', type: 'expense', normal: 'debit' },
      { code: '63020', name: 'Insurance  General Liability', type: 'expense', normal: 'debit' },
      { code: '63030', name: 'Legal Fees', type: 'expense', normal: 'debit' },
      { code: '63040', name: 'Accounting & Audit', type: 'expense', normal: 'debit' },
      { code: '63050', name: 'Office Supplies', type: 'expense', normal: 'debit' },
      { code: '63060', name: 'Dues & Subscriptions', type: 'expense', normal: 'debit' },
      { code: '63070', name: 'Bank Fees', type: 'expense', normal: 'debit' },
      { code: '63080', name: 'Postage & Delivery', type: 'expense', normal: 'debit' },
      { code: '63090', name: 'Miscellaneous Admin', type: 'expense', normal: 'debit' },
      { code: '64000', name: 'Customer Support & Helpdesk', type: 'expense', normal: 'debit' },
      { code: '64010', name: 'Customer Onboarding', type: 'expense', normal: 'debit' },
      { code: '64020', name: 'Refunds & Adjustments', type: 'expense', normal: 'debit' },
      { code: '64030', name: 'Platform Operations', type: 'expense', normal: 'debit' },
      { code: '64040', name: 'Bug Bounties & Security Testing', type: 'expense', normal: 'debit' },
      { code: '64050', name: 'Incident Response & Mitigation', type: 'expense', normal: 'debit' },
      { code: '65001', name: 'Compliance & Licensing', type: 'expense', normal: 'debit' },
      { code: '65010', name: 'KYC/AML Services', type: 'expense', normal: 'debit' },
      { code: '65020', name: 'Legal Compliance Audits', type: 'expense', normal: 'debit' },
      { code: '65030', name: 'Data Privacy Compliance', type: 'expense', normal: 'debit' },
      { code: '65040', name: 'Risk Management Tools', type: 'expense', normal: 'debit' },
      { code: '65050', name: 'Financial Auditing Services', type: 'expense', normal: 'debit' },
      { code: '66000', name: 'Travel  Business', type: 'expense', normal: 'debit' },
      { code: '66010', name: 'Meals & Entertainment', type: 'expense', normal: 'debit' },
      { code: '66020', name: 'Conferences & Networking', type: 'expense', normal: 'debit' },
      { code: '66030', name: 'Remote Work Stipends', type: 'expense', normal: 'debit' },
      { code: '67000', name: 'Depreciation Expense', type: 'expense', normal: 'debit' },
      { code: '67010', name: 'Amortization Expense', type: 'expense', normal: 'debit' },
      { code: '67020', name: 'Non-Recurring Expense', type: 'expense', normal: 'debit' },
      { code: '67030', name: 'Write-Offs', type: 'expense', normal: 'debit' },
      { code: '68000', name: 'AI Model Development', type: 'expense', normal: 'debit' },
      { code: '68010', name: 'Dataset Labeling', type: 'expense', normal: 'debit' },
      { code: '68020', name: 'Model Evaluation & Testing', type: 'expense', normal: 'debit' },
      { code: '68030', name: 'Experimental Projects', type: 'expense', normal: 'debit' },
      { code: '68040', name: 'Research Staff', type: 'expense', normal: 'debit' },
      { code: '68050', name: 'R&D Cloud Compute', type: 'expense', normal: 'debit' },
      { code: '68060', name: 'Research Tools', type: 'expense', normal: 'debit' },
      { code: '69000', name: 'Investor Relations', type: 'expense', normal: 'debit' },
      { code: '69010', name: 'Fundraising Costs', type: 'expense', normal: 'debit' },
      { code: '69020', name: 'Due Diligence Costs', type: 'expense', normal: 'debit' },
      { code: '69030', name: 'M&A & Strategic Partnerships', type: 'expense', normal: 'debit' },
      { code: '70100', name: 'Interest Income', type: 'expense', normal: 'debit' },
      { code: '70200', name: 'Interest Expense', type: 'expense', normal: 'debit' },
      { code: '70300', name: 'FX Gain/Loss', type: 'expense', normal: 'debit' },
      { code: '70400', name: 'Grant Income', type: 'expense', normal: 'debit' },
      { code: '70500', name: 'Investment Gain/Loss', type: 'expense', normal: 'debit' }
    ]
  }

  // Tab configuration
  const tabs = [
    { id: 'executive', label: 'Executive Dashboard', icon: BarChart3 },
    { id: 'pl', label: 'Profit & Loss', icon: TrendingUp },
    { id: 'bs', label: 'Balance Sheet', icon: BookOpen },
    { id: 'cf', label: 'Cash Flow', icon: DollarSign },
    { id: 'gl', label: 'General Ledger', icon: FileText },
    { id: 'journal', label: 'Journal Entries', icon: Edit },
    { id: 'reconciliation', label: 'Bank Reconciliation', icon: CreditCard },
    { id: 'analytics', label: 'Advanced Analytics', icon: Target },
    { id: 'reports', label: 'Reports & Export', icon: Download },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  // Load financial data
  const loadFinancialData = useCallback(async () => {
    setLoading(true)
    try {
      // This will be replaced with actual API calls
      const mockData = {
        revenue: 125001,
        expenses: 95001,
        netIncome: 30000,
        assets: 500100,
        liabilities: 200000,
        equity: 300000,
        cashFlow: 45001
      }
      setFinancialData(mockData)
      setLoading(false)
    } catch (error) {
      console.error('Error loading financial data:', error)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadFinancialData()
  }, [loadFinancialData])

  // Render Executive Dashboard
  const renderExecutiveDashboard = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-green-500/20 to-green-600/20 p-6 rounded-xl border border-green-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${financialData?.revenue?.toLocaleString() || '0'}</p>
              <p className="text-green-400 text-xs">+12.5% vs last month</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 p-6 rounded-xl border border-blue-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-400 text-sm font-medium">Net Income</p>
              <p className="text-2xl font-bold text-white">${financialData?.netIncome?.toLocaleString() || '0'}</p>
              <p className="text-blue-400 text-xs">+8.2% vs last month</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500/20 to-purple-600/20 p-6 rounded-xl border border-purple-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-400 text-sm font-medium">Total Assets</p>
              <p className="text-2xl font-bold text-white">${financialData?.assets?.toLocaleString() || '0'}</p>
              <p className="text-purple-400 text-xs">+5.1% vs last month</p>
            </div>
            <Building className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-500/20 to-orange-600/20 p-6 rounded-xl border border-orange-500/30">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm font-medium">Cash Flow</p>
              <p className="text-2xl font-bold text-white">${financialData?.cashFlow?.toLocaleString() || '0'}</p>
              <p className="text-orange-400 text-xs">+15.3% vs last month</p>
            </div>
            <Zap className="w-8 h-8 text-orange-400" />
          </div>
        </div>
      </div>

      {/* Advanced KPIs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">Financial KPIs</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Gross Profit Margin</span>
              <span className="text-green-400 font-semibold">24.0%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Net Profit Margin</span>
              <span className="text-green-400 font-semibold">18.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Customer Acquisition Cost</span>
              <span className="text-blue-400 font-semibold">$45.20</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Customer Lifetime Value</span>
              <span className="text-purple-400 font-semibold">$1,250</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">CLV/CAC Ratio</span>
              <span className="text-green-400 font-semibold">27.7x</span>
            </div>
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <h3 className="text-lg font-semibold text-white mb-4">AI & Platform KPIs</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">AI Processing Efficiency</span>
              <span className="text-green-400 font-semibold">94.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">LLM Data Asset Value</span>
              <span className="text-blue-400 font-semibold">$125,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">AI Accuracy Rate</span>
              <span className="text-green-400 font-semibold">87.5%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Platform Uptime</span>
              <span className="text-green-400 font-semibold">99.9%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">AI ROI</span>
              <span className="text-purple-400 font-semibold">340%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render P&L Statement
  const renderPLStatement = () => {
    const plData = {
      revenue: {
        individual: 45001,
        family: 32000,
        business: 28000,
        subscription: 15001,
        aiInsights: 8500,
        advertisement: 12000,
        platformFees: 8000,
        dataLicensing: 5500,
        other: 2000
      },
      cogs: {
        cloudCompute: 8500,
        dataAcquisition: 3200,
        aiTraining: 12000,
        modelHosting: 6800,
        paymentProcessing: 4500,
        contentModeration: 2100,
        devOps: 1800,
        dataStorage: 1200,
        hardwareDepreciation: 800
      },
      expenses: {
        personnel: 45001,
        technology: 18000,
        marketing: 12000,
        administrative: 8500,
        customerSupport: 3200,
        compliance: 2100,
        travel: 1800,
        depreciation: 1200,
        rnd: 8500,
        investorRelations: 1500
      }
    }

    const totalRevenue = Object.values(plData.revenue).reduce((sum, val) => sum + val, 0)
    const totalCOGS = Object.values(plData.cogs).reduce((sum, val) => sum + val, 0)
    const totalExpenses = Object.values(plData.expenses).reduce((sum, val) => sum + val, 0)
    const grossProfit = totalRevenue - totalCOGS
    const netIncome = grossProfit - totalExpenses

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Profit & Loss Statement</h2>
          <div className="flex space-x-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          {/* Revenue Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              REVENUE
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Revenue  Individual Accounts (40100)</span>
                <span className="text-white font-semibold">${plData.revenue.individual.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Revenue  Family Accounts (40200)</span>
                <span className="text-white font-semibold">${plData.revenue.family.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Revenue  Business Accounts (40300)</span>
                <span className="text-white font-semibold">${plData.revenue.business.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Subscription Revenue (40400)</span>
                <span className="text-white font-semibold">${plData.revenue.subscription.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">AI Insight Revenue (40500)</span>
                <span className="text-white font-semibold">${plData.revenue.aiInsights.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Advertisement Revenue (40600)</span>
                <span className="text-white font-semibold">${plData.revenue.advertisement.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Platform Fee Revenue (40700)</span>
                <span className="text-white font-semibold">${plData.revenue.platformFees.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Data Licensing / API Revenue (40800)</span>
                <span className="text-white font-semibold">${plData.revenue.dataLicensing.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Other Revenue (40900)</span>
                <span className="text-white font-semibold">${plData.revenue.other.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-green-500/10 border border-green-500/30 rounded-lg px-4">
                <span className="text-green-400 font-semibold text-lg">TOTAL REVENUE</span>
                <span className="text-green-400 font-bold text-xl">${totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* COGS Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <TrendingDown className="w-5 h-5 mr-2 text-red-400" />
              COST OF GOODS SOLD
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Cloud Compute (50100)</span>
                <span className="text-white font-semibold">${plData.cogs.cloudCompute.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Data Acquisition & Labeling (50200)</span>
                <span className="text-white font-semibold">${plData.cogs.dataAcquisition.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">AI/LLM Training Costs (50300)</span>
                <span className="text-white font-semibold">${plData.cogs.aiTraining.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Model Hosting & API Costs (50400)</span>
                <span className="text-white font-semibold">${plData.cogs.modelHosting.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Payment Processing Fees (50500)</span>
                <span className="text-white font-semibold">${plData.cogs.paymentProcessing.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Content Moderation & Review (50600)</span>
                <span className="text-white font-semibold">${plData.cogs.contentModeration.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Direct DevOps Support (50700)</span>
                <span className="text-white font-semibold">${plData.cogs.devOps.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Data Storage (50800)</span>
                <span className="text-white font-semibold">${plData.cogs.dataStorage.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">AI Compute Hardware Depreciation (50900)</span>
                <span className="text-white font-semibold">${plData.cogs.hardwareDepreciation.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-red-500/10 border border-red-500/30 rounded-lg px-4">
                <span className="text-red-400 font-semibold text-lg">TOTAL COGS</span>
                <span className="text-red-400 font-bold text-xl">${totalCOGS.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Gross Profit */}
          <div className="mb-8">
            <div className="flex justify-between items-center py-4 bg-blue-500/10 border border-blue-500/30 rounded-lg px-4">
              <span className="text-blue-400 font-semibold text-lg">GROSS PROFIT</span>
              <span className="text-blue-400 font-bold text-xl">${grossProfit.toLocaleString()}</span>
            </div>
          </div>

          {/* Operating Expenses */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Calculator className="w-5 h-5 mr-2 text-orange-400" />
              OPERATING EXPENSES
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Personnel (60100-60180)</span>
                <span className="text-white font-semibold">${plData.expenses.personnel.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Technology & Infrastructure (61000-61090)</span>
                <span className="text-white font-semibold">${plData.expenses.technology.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Marketing & Growth (62000-62090)</span>
                <span className="text-white font-semibold">${plData.expenses.marketing.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Administrative (63000-63090)</span>
                <span className="text-white font-semibold">${plData.expenses.administrative.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Customer Support (64000-64050)</span>
                <span className="text-white font-semibold">${plData.expenses.customerSupport.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Compliance (65001-65050)</span>
                <span className="text-white font-semibold">${plData.expenses.compliance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Travel & Entertainment (66000-66030)</span>
                <span className="text-white font-semibold">${plData.expenses.travel.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Depreciation & Amortization (67000-67030)</span>
                <span className="text-white font-semibold">${plData.expenses.depreciation.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">R&D (68000-68060)</span>
                <span className="text-white font-semibold">${plData.expenses.rnd.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Investor Relations (69000-69030)</span>
                <span className="text-white font-semibold">${plData.expenses.investorRelations.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-orange-500/10 border border-orange-500/30 rounded-lg px-4">
                <span className="text-orange-400 font-semibold text-lg">TOTAL OPERATING EXPENSES</span>
                <span className="text-orange-400 font-bold text-xl">${totalExpenses.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Net Income */}
          <div className="mb-8">
            <div className="flex justify-between items-center py-4 bg-green-500/10 border border-green-500/30 rounded-lg px-4">
              <span className="text-green-400 font-semibold text-xl">NET INCOME</span>
              <span className="text-green-400 font-bold text-2xl">${netIncome.toLocaleString()}</span>
            </div>
          </div>

          {/* Key Ratios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Gross Profit Margin</h4>
              <p className="text-2xl font-bold text-green-400">{((grossProfit / totalRevenue) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Net Profit Margin</h4>
              <p className="text-2xl font-bold text-blue-400">{((netIncome / totalRevenue) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-white/5 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-400 mb-2">Operating Margin</h4>
              <p className="text-2xl font-bold text-purple-400">{(((grossProfit - totalExpenses) / totalRevenue) * 100).toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Balance Sheet
  const renderBalanceSheet = () => {
    const bsData = {
      assets: {
        current: {
          cash: 125001,
          accountsReceivable: 45001,
          prepaidExpenses: 12000,
          shortTermInvestments: 25001
        },
        fixed: {
          equipment: 85001,
          accumulatedDepreciation: -15001,
          softwareAssets: 125001,
          cloudCredits: 15001,
          llmDataAssets: 125001
        },
        other: {
          securityDeposits: 5001,
          intercompanyReceivable: 10000
        }
      },
      liabilities: {
        current: {
          accountsPayable: 25001,
          creditCardPayable: 8000,
          accruedExpenses: 12000,
          payrollLiabilities: 15001,
          deferredRevenue: 20000,
          taxesPayable: 8000,
          customerDeposits: 5001
        },
        longTerm: {
          intercompanyPayable: 15001
        }
      },
      equity: {
        commonStock: 100000,
        additionalPaidIn: 200000,
        ownerContributions: 50010,
        retainedEarnings: 150010,
        currentYearEarnings: 30000
      }
    }

    const totalCurrentAssets = Object.values(bsData.assets.current).reduce((sum, val) => sum + val, 0)
    const totalFixedAssets = Object.values(bsData.assets.fixed).reduce((sum, val) => sum + val, 0)
    const totalOtherAssets = Object.values(bsData.assets.other).reduce((sum, val) => sum + val, 0)
    const totalAssets = totalCurrentAssets + totalFixedAssets + totalOtherAssets

    const totalCurrentLiabilities = Object.values(bsData.liabilities.current).reduce((sum, val) => sum + val, 0)
    const totalLongTermLiabilities = Object.values(bsData.liabilities.longTerm).reduce((sum, val) => sum + val, 0)
    const totalLiabilities = totalCurrentLiabilities + totalLongTermLiabilities

    const totalEquity = Object.values(bsData.equity).reduce((sum, val) => sum + val, 0)

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Balance Sheet</h2>
          <div className="flex space-x-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assets */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-green-400" />
              ASSETS
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-blue-400 mb-2">Current Assets</h4>
                <div className="space-y-1 ml-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Cash  Bank of America (10100)</span>
                    <span className="text-white">${bsData.assets.current.cash.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Accounts Receivable (11000)</span>
                    <span className="text-white">${bsData.assets.current.accountsReceivable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Prepaid Expenses (12000)</span>
                    <span className="text-white">${bsData.assets.current.prepaidExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Short-term Investments (13000)</span>
                    <span className="text-white">${bsData.assets.current.shortTermInvestments.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/20 pt-2">
                    <span className="text-blue-400 font-semibold">Total Current Assets</span>
                    <span className="text-blue-400 font-bold">${totalCurrentAssets.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-purple-400 mb-2">Fixed Assets</h4>
                <div className="space-y-1 ml-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Equipment & Computers (14000)</span>
                    <span className="text-white">${bsData.assets.fixed.equipment.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Accumulated Depreciation (14100)</span>
                    <span className="text-white">${bsData.assets.fixed.accumulatedDepreciation.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Software & Development Assets (15001)</span>
                    <span className="text-white">${bsData.assets.fixed.softwareAssets.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Cloud Credits (15100)</span>
                    <span className="text-white">${bsData.assets.fixed.cloudCredits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">LLM Data Assets (15200)</span>
                    <span className="text-white">${bsData.assets.fixed.llmDataAssets.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/20 pt-2">
                    <span className="text-purple-400 font-semibold">Total Fixed Assets</span>
                    <span className="text-purple-400 font-bold">${totalFixedAssets.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-orange-400 mb-2">Other Assets</h4>
                <div className="space-y-1 ml-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Security Deposits (16000)</span>
                    <span className="text-white">${bsData.assets.other.securityDeposits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Intercompany Receivable (17000)</span>
                    <span className="text-white">${bsData.assets.other.intercompanyReceivable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/20 pt-2">
                    <span className="text-orange-400 font-semibold">Total Other Assets</span>
                    <span className="text-orange-400 font-bold">${totalOtherAssets.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between py-3 bg-green-500/10 border border-green-500/30 rounded-lg px-4">
                <span className="text-green-400 font-semibold text-lg">TOTAL ASSETS</span>
                <span className="text-green-400 font-bold text-xl">${totalAssets.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Liabilities & Equity */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-red-400" />
              LIABILITIES & EQUITY
            </h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-medium text-red-400 mb-2">Current Liabilities</h4>
                <div className="space-y-1 ml-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Accounts Payable (20000)</span>
                    <span className="text-white">${bsData.liabilities.current.accountsPayable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Credit Card Payable (20100)</span>
                    <span className="text-white">${bsData.liabilities.current.creditCardPayable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Accrued Expenses (21000)</span>
                    <span className="text-white">${bsData.liabilities.current.accruedExpenses.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Payroll Liabilities (22000)</span>
                    <span className="text-white">${bsData.liabilities.current.payrollLiabilities.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Deferred Revenue (23000)</span>
                    <span className="text-white">${bsData.liabilities.current.deferredRevenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Taxes Payable (24000)</span>
                    <span className="text-white">${bsData.liabilities.current.taxesPayable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Customer Deposits (26000)</span>
                    <span className="text-white">${bsData.liabilities.current.customerDeposits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/20 pt-2">
                    <span className="text-red-400 font-semibold">Total Current Liabilities</span>
                    <span className="text-red-400 font-bold">${totalCurrentLiabilities.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-yellow-400 mb-2">Long-term Liabilities</h4>
                <div className="space-y-1 ml-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Intercompany Payable (25001)</span>
                    <span className="text-white">${bsData.liabilities.longTerm.intercompanyPayable.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/20 pt-2">
                    <span className="text-yellow-400 font-semibold">Total Long-term Liabilities</span>
                    <span className="text-yellow-400 font-bold">${totalLongTermLiabilities.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium text-blue-400 mb-2">Equity</h4>
                <div className="space-y-1 ml-4">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Common Stock (30000)</span>
                    <span className="text-white">${bsData.equity.commonStock.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Additional Paid-in Capital (30100)</span>
                    <span className="text-white">${bsData.equity.additionalPaidIn.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Owner Contributions (30200)</span>
                    <span className="text-white">${bsData.equity.ownerContributions.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Retained Earnings (31000)</span>
                    <span className="text-white">${bsData.equity.retainedEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Current Year Earnings (32000)</span>
                    <span className="text-white">${bsData.equity.currentYearEarnings.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-white/20 pt-2">
                    <span className="text-blue-400 font-semibold">Total Equity</span>
                    <span className="text-blue-400 font-bold">${totalEquity.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex justify-between py-3 bg-green-500/10 border border-green-500/30 rounded-lg px-4">
                <span className="text-green-400 font-semibold text-lg">TOTAL LIABILITIES & EQUITY</span>
                <span className="text-green-400 font-bold text-xl">${(totalLiabilities + totalEquity).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Cash Flow Statement
  const renderCashFlowStatement = () => {
    const cfData = {
      operating: {
        netIncome: 30000,
        depreciation: 1200,
        amortization: 800,
        accountsReceivable: -5001,
        inventory: 0,
        accountsPayable: 3000,
        accruedExpenses: 2000,
        deferredRevenue: 5001,
        otherOperating: 1000
      },
      investing: {
        equipmentPurchases: -15001,
        softwareDevelopment: -25001,
        llmDataAcquisition: -12000,
        cloudInfrastructure: -8000,
        otherInvestments: -2000,
        investmentSales: 0
      },
      financing: {
        ownerContributions: 20000,
        loanProceeds: 0,
        loanPayments: 0,
        dividendPayments: 0,
        stockIssuance: 0
      }
    }

    const operatingCashFlow = Object.values(cfData.operating).reduce((sum, val) => sum + val, 0)
    const investingCashFlow = Object.values(cfData.investing).reduce((sum, val) => sum + val, 0)
    const financingCashFlow = Object.values(cfData.financing).reduce((sum, val) => sum + val, 0)
    const netCashFlow = operatingCashFlow + investingCashFlow + financingCashFlow

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">Cash Flow Statement</h2>
          <div className="flex space-x-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          {/* Operating Activities */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-green-400" />
              CASH FLOW FROM OPERATING ACTIVITIES
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Net Income</span>
                <span className="text-white font-semibold">${cfData.operating.netIncome.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Depreciation & Amortization</span>
                <span className="text-white font-semibold">${(cfData.operating.depreciation + cfData.operating.amortization).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Changes in Accounts Receivable</span>
                <span className="text-white font-semibold">${cfData.operating.accountsReceivable.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Changes in Accounts Payable</span>
                <span className="text-white font-semibold">${cfData.operating.accountsPayable.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Changes in Accrued Expenses</span>
                <span className="text-white font-semibold">${cfData.operating.accruedExpenses.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Changes in Deferred Revenue</span>
                <span className="text-white font-semibold">${cfData.operating.deferredRevenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Other Operating Activities</span>
                <span className="text-white font-semibold">${cfData.operating.otherOperating.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-green-500/10 border border-green-500/30 rounded-lg px-4">
                <span className="text-green-400 font-semibold text-lg">NET CASH FROM OPERATING ACTIVITIES</span>
                <span className="text-green-400 font-bold text-xl">${operatingCashFlow.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Investing Activities */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-blue-400" />
              CASH FLOW FROM INVESTING ACTIVITIES
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Equipment & Computer Purchases</span>
                <span className="text-white font-semibold">${cfData.investing.equipmentPurchases.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Software Development & Assets</span>
                <span className="text-white font-semibold">${cfData.investing.softwareDevelopment.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">LLM Data Acquisition</span>
                <span className="text-white font-semibold">${cfData.investing.llmDataAcquisition.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Cloud Infrastructure Investment</span>
                <span className="text-white font-semibold">${cfData.investing.cloudInfrastructure.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Other Investments</span>
                <span className="text-white font-semibold">${cfData.investing.otherInvestments.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Investment Sales</span>
                <span className="text-white font-semibold">${cfData.investing.investmentSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-blue-500/10 border border-blue-500/30 rounded-lg px-4">
                <span className="text-blue-400 font-semibold text-lg">NET CASH FROM INVESTING ACTIVITIES</span>
                <span className="text-blue-400 font-bold text-xl">${investingCashFlow.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Financing Activities */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-purple-400" />
              CASH FLOW FROM FINANCING ACTIVITIES
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Owner Contributions</span>
                <span className="text-white font-semibold">${cfData.financing.ownerContributions.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Loan Proceeds</span>
                <span className="text-white font-semibold">${cfData.financing.loanProceeds.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Loan Payments</span>
                <span className="text-white font-semibold">${cfData.financing.loanPayments.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Dividend Payments</span>
                <span className="text-white font-semibold">${cfData.financing.dividendPayments.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-white/10">
                <span className="text-gray-300">Stock Issuance</span>
                <span className="text-white font-semibold">${cfData.financing.stockIssuance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 bg-purple-500/10 border border-purple-500/30 rounded-lg px-4">
                <span className="text-purple-400 font-semibold text-lg">NET CASH FROM FINANCING ACTIVITIES</span>
                <span className="text-purple-400 font-bold text-xl">${financingCashFlow.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Net Cash Flow */}
          <div className="mb-8">
            <div className="flex justify-between items-center py-4 bg-green-500/10 border border-green-500/30 rounded-lg px-4">
              <span className="text-green-400 font-semibold text-xl">NET INCREASE (DECREASE) IN CASH</span>
              <span className="text-green-400 font-bold text-2xl">${netCashFlow.toLocaleString()}</span>
            </div>
          </div>

          {/* Cash Flow Forecasting */}
          <div className="bg-white/5 p-6 rounded-xl border border-white/10">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-yellow-400" />
              CASH FLOW FORECASTING
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-400 mb-2">Next Month Forecast</h4>
                <p className="text-2xl font-bold text-green-400">${(netCashFlow * 1.1).toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">+10% growth projection</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-400 mb-2">3-Month Forecast</h4>
                <p className="text-2xl font-bold text-blue-400">${(netCashFlow * 3.2).toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Seasonal adjustments</p>
              </div>
              <div className="bg-white/5 p-4 rounded-lg">
                <h4 className="text-sm font-medium text-gray-400 mb-2">12-Month Forecast</h4>
                <p className="text-2xl font-bold text-purple-400">${(netCashFlow * 12.5).toLocaleString()}</p>
                <p className="text-xs text-gray-400 mt-1">Annual projection</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render General Ledger
  const renderGeneralLedger = () => {
    const glAccounts = [
      // Assets
      { code: '10100', name: 'Cash  Bank of America', type: 'Asset', normal: 'Debit', balance: 125001 },
      { code: '11000', name: 'Accounts Receivable', type: 'Asset', normal: 'Debit', balance: 45001 },
      { code: '12000', name: 'Prepaid Expenses', type: 'Asset', normal: 'Debit', balance: 12000 },
      { code: '13000', name: 'Short-term Investments', type: 'Asset', normal: 'Debit', balance: 25001 },
      { code: '14000', name: 'Equipment & Computers', type: 'Asset', normal: 'Debit', balance: 85001 },
      { code: '14100', name: 'Accumulated Depreciation', type: 'Asset', normal: 'Credit', balance: -15001 },
      { code: '15001', name: 'Software & Development Assets', type: 'Asset', normal: 'Debit', balance: 125001 },
      { code: '15100', name: 'Cloud Credits', type: 'Asset', normal: 'Debit', balance: 15001 },
      { code: '15200', name: 'LLM Data Assets', type: 'Asset', normal: 'Debit', balance: 125001 },
      
      // Liabilities
      { code: '20000', name: 'Accounts Payable', type: 'Liability', normal: 'Credit', balance: 25001 },
      { code: '20100', name: 'Credit Card Payable', type: 'Liability', normal: 'Credit', balance: 8000 },
      { code: '21000', name: 'Accrued Expenses', type: 'Liability', normal: 'Credit', balance: 12000 },
      { code: '22000', name: 'Payroll Liabilities', type: 'Liability', normal: 'Credit', balance: 15001 },
      { code: '23000', name: 'Deferred Revenue', type: 'Liability', normal: 'Credit', balance: 20000 },
      { code: '24000', name: 'Taxes Payable', type: 'Liability', normal: 'Credit', balance: 8000 },
      
      // Equity
      { code: '30000', name: 'Common Stock', type: 'Equity', normal: 'Credit', balance: 100000 },
      { code: '30100', name: 'Additional Paid-in Capital', type: 'Equity', normal: 'Credit', balance: 200000 },
      { code: '30200', name: 'Owner Contributions', type: 'Equity', normal: 'Credit', balance: 50010 },
      { code: '31000', name: 'Retained Earnings', type: 'Equity', normal: 'Credit', balance: 150010 },
      { code: '32000', name: 'Current Year Earnings', type: 'Equity', normal: 'Credit', balance: 30000 },
      
      // Revenue
      { code: '40100', name: 'Revenue  Individual Accounts', type: 'Revenue', normal: 'Credit', balance: 45001 },
      { code: '40200', name: 'Revenue  Family Accounts', type: 'Revenue', normal: 'Credit', balance: 32000 },
      { code: '40300', name: 'Revenue  Business Accounts', type: 'Revenue', normal: 'Credit', balance: 28000 },
      { code: '40400', name: 'Subscription Revenue', type: 'Revenue', normal: 'Credit', balance: 15001 },
      { code: '40500', name: 'AI Insight Revenue', type: 'Revenue', normal: 'Credit', balance: 8500 },
      { code: '40600', name: 'Advertisement Revenue', type: 'Revenue', normal: 'Credit', balance: 12000 },
      { code: '40700', name: 'Platform Fee Revenue', type: 'Revenue', normal: 'Credit', balance: 8000 },
      { code: '40800', name: 'Data Licensing / API Revenue', type: 'Revenue', normal: 'Credit', balance: 5500 },
      
      // COGS
      { code: '50100', name: 'Cloud Compute', type: 'COGS', normal: 'Debit', balance: 8500 },
      { code: '50200', name: 'Data Acquisition & Labeling', type: 'COGS', normal: 'Debit', balance: 3200 },
      { code: '50300', name: 'AI/LLM Training Costs', type: 'COGS', normal: 'Debit', balance: 12000 },
      { code: '50400', name: 'Model Hosting & API Costs', type: 'COGS', normal: 'Debit', balance: 6800 },
      { code: '50500', name: 'Payment Processing Fees', type: 'COGS', normal: 'Debit', balance: 4500 },
      
      // Operating Expenses
      { code: '60100', name: 'Personnel', type: 'Expense', normal: 'Debit', balance: 45001 },
      { code: '61000', name: 'Technology & Infrastructure', type: 'Expense', normal: 'Debit', balance: 18000 },
      { code: '62000', name: 'Marketing & Growth', type: 'Expense', normal: 'Debit', balance: 12000 },
      { code: '63000', name: 'Administrative', type: 'Expense', normal: 'Debit', balance: 8500 },
      { code: '64000', name: 'Customer Support', type: 'Expense', normal: 'Debit', balance: 3200 },
      { code: '65001', name: 'Compliance', type: 'Expense', normal: 'Debit', balance: 2100 },
      { code: '68000', name: 'R&D', type: 'Expense', normal: 'Debit', balance: 8500 }
    ]

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-white">General Ledger</h2>
          <div className="flex space-x-2">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Export PDF</span>
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Export Excel</span>
            </button>
            <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
              <Search className="w-4 h-4" />
              <span>Search Accounts</span>
            </button>
          </div>
        </div>

        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Account Categories */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-white mb-4">Account Categories</h3>
              <div className="space-y-2">
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <h4 className="text-green-400 font-medium">Assets</h4>
                  <p className="text-sm text-gray-400">10100-19999</p>
                </div>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <h4 className="text-red-400 font-medium">Liabilities</h4>
                  <p className="text-sm text-gray-400">20000-29999</p>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <h4 className="text-blue-400 font-medium">Equity</h4>
                  <p className="text-sm text-gray-400">30000-39999</p>
                </div>
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                  <h4 className="text-yellow-400 font-medium">Revenue</h4>
                  <p className="text-sm text-gray-400">40000-49999</p>
                </div>
                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                  <h4 className="text-orange-400 font-medium">COGS</h4>
                  <p className="text-sm text-gray-400">50010-59999</p>
                </div>
                <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <h4 className="text-purple-400 font-medium">Expenses</h4>
                  <p className="text-sm text-gray-400">60000-79999</p>
                </div>
              </div>
            </div>

            {/* Chart of Accounts */}
            <div className="lg:col-span-3">
              <h3 className="text-lg font-semibold text-white mb-4">Chart of Accounts</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left py-3 px-4 text-gray-400">Code</th>
                      <th className="text-left py-3 px-4 text-gray-400">Account Name</th>
                      <th className="text-left py-3 px-4 text-gray-400">Type</th>
                      <th className="text-left py-3 px-4 text-gray-400">Normal</th>
                      <th className="text-right py-3 px-4 text-gray-400">Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {glAccounts.map((account, index) => (
                      <tr key={index} className="border-b border-white/10 hover:bg-white/5">
                        <td className="py-3 px-4 font-mono text-sm text-gray-300">{account.code}</td>
                        <td className="py-3 px-4 text-white">{account.name}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            account.type === 'Asset' ? 'bg-green-500/20 text-green-400' :
                            account.type === 'Liability' ? 'bg-red-500/20 text-red-400' :
                            account.type === 'Equity' ? 'bg-blue-500/20 text-blue-400' :
                            account.type === 'Revenue' ? 'bg-yellow-500/20 text-yellow-400' :
                            account.type === 'COGS' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-purple-500/20 text-purple-400'
                          }`}>
                            {account.type}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300">{account.normal}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-semibold ${
                            account.balance >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            ${account.balance.toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Render Journal Entry System
  const renderJournalEntrySystem = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Journal Entry System</h2>
        <button
          onClick={() => setShowJournalEntry(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Journal Entry</span>
        </button>
      </div>

      {/* Journal Entry Form */}
      {showJournalEntry && (
        <div className="bg-white/5 p-6 rounded-xl border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
              <input
                type="date"
                value={journalEntry.date}
                onChange={(e) => setJournalEntry({...journalEntry, date: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Reference</label>
              <input
                type="text"
                value={journalEntry.reference}
                onChange={(e) => setJournalEntry({...journalEntry, reference: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                placeholder="JE-2025-001"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
              <select
                value={journalEntry.location}
                onChange={(e) => setJournalEntry({...journalEntry, location: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="">Select Location</option>
                <option value="headquarters">Headquarters</option>
                <option value="remote">Remote</option>
                <option value="field">Field Office</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Department</label>
              <select
                value={journalEntry.department}
                onChange={(e) => setJournalEntry({...journalEntry, department: e.target.value})}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              >
                <option value="">Select Department</option>
                <option value="engineering">Engineering</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="operations">Operations</option>
                <option value="finance">Finance</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              value={journalEntry.description}
              onChange={(e) => setJournalEntry({...journalEntry, description: e.target.value})}
              className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
              rows={3}
              placeholder="Enter journal entry description..."
            />
          </div>

          {/* Journal Entry Lines */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Journal Entry Lines</h3>
            {journalEntry.entries.map((entry, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white/5 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Account</label>
                  <select
                    value={entry.account}
                    onChange={(e) => {
                      const newEntries = [...journalEntry.entries]
                      newEntries[index].account = e.target.value
                      setJournalEntry({...journalEntry, entries: newEntries})
                    }}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="">Select Account</option>
                    {Object.values(glChartOfAccounts).flat().map(account => (
                      <option key={account.code} value={account.code}>
                        {account.code} - {account.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Debit</label>
                  <input
                    type="number"
                    value={entry.debit}
                    onChange={(e) => {
                      const newEntries = [...journalEntry.entries]
                      newEntries[index].debit = parseFloat(e.target.value) || 0
                      setJournalEntry({...journalEntry, entries: newEntries})
                    }}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Credit</label>
                  <input
                    type="number"
                    value={entry.credit}
                    onChange={(e) => {
                      const newEntries = [...journalEntry.entries]
                      newEntries[index].credit = parseFloat(e.target.value) || 0
                      setJournalEntry({...journalEntry, entries: newEntries})
                    }}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Line Description</label>
                  <input
                    type="text"
                    value={entry.description}
                    onChange={(e) => {
                      const newEntries = [...journalEntry.entries]
                      newEntries[index].description = e.target.value
                      setJournalEntry({...journalEntry, entries: newEntries})
                    }}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="Line description..."
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Entry Totals */}
          <div className="mt-6 p-4 bg-white/5 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-400">Total Debit: </span>
                <span className="text-white font-semibold">
                  ${journalEntry.entries.reduce((sum, entry) => sum + (entry.debit || 0), 0).toFixed(2)}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Total Credit: </span>
                <span className="text-white font-semibold">
                  ${journalEntry.entries.reduce((sum, entry) => sum + (entry.credit || 0), 0).toFixed(2)}
                </span>
              </div>
            </div>
            <div className="mt-2">
              <span className="text-gray-400">Balance: </span>
              <span className={`font-semibold ${
                Math.abs(journalEntry.entries.reduce((sum, entry) => sum + (entry.debit || 0) - (entry.credit || 0), 0)) < 0.01 
                  ? 'text-green-400' : 'text-red-400'
              }`}>
                ${Math.abs(journalEntry.entries.reduce((sum, entry) => sum + (entry.debit || 0) - (entry.credit || 0), 0)).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              onClick={() => setShowJournalEntry(false)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                // Save journal entry logic here
                console.log('Saving journal entry:', journalEntry)
                setShowJournalEntry(false)
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save Entry</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // Render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'executive':
        return renderExecutiveDashboard()
      case 'pl':
        return renderPLStatement()
      case 'bs':
        return renderBalanceSheet()
      case 'cf':
        return renderCashFlowStatement()
      case 'gl':
        return renderGeneralLedger()
      case 'journal':
        return renderJournalEntrySystem()
      default:
        return (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
              <p className="text-gray-400">This section is under development</p>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Financial Analytics</h1>
          <p className="text-gray-400">Comprehensive financial management and reporting system</p>
        </div>

        {/* Period Selector */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2">
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2 text-gray-400">Loading financial data...</span>
            </div>
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </div>
  )
}

export default FinancialAnalytics_New


