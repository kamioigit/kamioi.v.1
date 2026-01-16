import React, { useState } from 'react'
import { 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target, 
  Brain, 
  Download,
  ArrowLeft,
  Calendar,
  Filter,
  BarChart3,
  PieChart,
  LineChart,
  Award,
  Lightbulb,
  UserCheck,
  UserX
} from 'lucide-react'
import RechartsChart from '../common/RechartsChart'
import { useData } from '../../context/DataContext'
import { useTheme } from '../../context/ThemeContext'

const FamilyAnalytics = ({ user, onBack }) => {
  const { portfolioValue, totalRoundUps, holdings } = useData()
   const { isLightMode } = useTheme()
  const [selectedTimeframe, setSelectedTimeframe] = useState('3m')
  const [activeTab, setActiveTab] = useState('overview')

  // Safe placeholders to satisfy references in export and notifications
  const familyData = { members: [], totalValue: 0, monthlyGrowth: 0, totalInvestments: 0, goals: [], recentTransactions: [] }
  const notificationService = { addNotification: async () => {} }

  // Use clean data from DataContext (no hardcoded family members)
  const [familyMembers, setFamilyMembers] = useState([])

  const totalFamilyContributions = 0

  // Use clean data from DataContext (no hardcoded spending data)
  const [familySpendingByCategory, setFamilySpendingByCategory] = useState({})

  // Use clean data from DataContext (no hardcoded round-up data)
  const [familyRoundUpImpact, setFamilyRoundUpImpact] = useState({
    totalRoundUps: 0,
    totalInvestments: 0,
    averageRoundUp: 0,
    topPerformingMember: '',
    monthlyGrowth: 0
  })

  // Use clean data from DataContext (no hardcoded AI insights)
  const [familyAIInsights, setFamilyAIInsights] = useState([])

  const getTextClass = () => {
    if (isLightMode) return 'text-gray-800'
    return 'text-white'
  }

  const getSubtextClass = () => {
    if (isLightMode) return 'text-gray-600'
    return 'text-white/90'
  }

  const getCardClass = () => {
    if (isLightMode) return 'bg-white/80 backdrop-blur-lg rounded-2xl p-6 border border-gray-200'
    return 'bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20'
  }

  const exportData = async (format) => {
    try {
      // Prepare analytics data for export
      const exportData = {
        familyName: 'Johnson Family', // This would come from family context
        exportDate: new Date().toISOString(),
        totalMembers: familyData.members?.length || 0,
        totalPortfolioValue: familyData.totalValue || 0,
        monthlyGrowth: familyData.monthlyGrowth || 0,
        totalInvestments: familyData.totalInvestments || 0,
        members: familyData.members || [],
        goals: familyData.goals || [],
        transactions: familyData.recentTransactions || []
      }
      
      if (format === 'csv') {
        // Create CSV content
        const csvHeaders = ['Metric', 'Value']
        const csvData = [
          ['Family Name', exportData.familyName],
          ['Export Date', new Date(exportData.exportDate).toLocaleDateString()],
          ['Total Members', exportData.totalMembers],
          ['Total Portfolio Value', `$${exportData.totalPortfolioValue.toLocaleString()}`],
          ['Monthly Growth', `${exportData.monthlyGrowth}%`],
          ['Total Investments', exportData.totalInvestments],
          ['', ''], // Empty row
          ['=== MEMBERS ===', ''],
          ...exportData.members.map(member => [member.name, `$${member.portfolioValue?.toLocaleString() || '0'}`]),
          ['', ''], // Empty row
          ['=== GOALS ===', ''],
          ...exportData.goals.map(goal => [goal.title, `${goal.progress || 0}% complete`])
        ]
        
        const csvContent = [
          csvHeaders.join(','),
          ...csvData.map(row => row.map(cell => 
            typeof cell === 'string' && (cell.includes(',') || cell.includes('"')) 
              ? `"${cell.replace(/"/g, '""')}"` 
              : cell
          ).join(','))
        ].join('\n')
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `family-analytics-${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        await notificationService.addNotification({
          type: 'success',
          title: 'Export Successful',
          message: 'Family analytics exported to CSV successfully!',
          timestamp: new Date().toISOString()
        })
      } else if (format === 'json') {
        // Export as JSON
        const jsonContent = JSON.stringify(exportData, null, 2)
        const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)
        link.setAttribute('href', url)
        link.setAttribute('download', `family-analytics-${new Date().toISOString().split('T')[0]}.json`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        await notificationService.addNotification({
          type: 'success',
          title: 'Export Successful',
          message: 'Family analytics exported to JSON successfully!',
          timestamp: new Date().toISOString()
        })
      }
      
    } catch (error) {
      console.error('Export failed:', error)
      await notificationService.addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export family analytics. Please try again.',
        timestamp: new Date().toISOString()
      })
    }
  }

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Family KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className={getCardClass()}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${getSubtextClass()} text-sm`}>Family Portfolio Value</p>
              <p className={`text-2xl font-bold ${getTextClass()} mt-1`}>
                ${portfolioValue.toLocaleString()}
              </p>
              <p className="text-blue-400 text-sm mt-1">Total family wealth</p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${getSubtextClass()} text-sm`}>Total Round-Ups</p>
              <p className={`text-2xl font-bold ${getTextClass()} mt-1`}>
                ${totalRoundUps.toLocaleString()}
              </p>
              <p className="text-green-400 text-sm mt-1">Family contributions</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${getSubtextClass()} text-sm`}>Active Members</p>
              <p className={`text-2xl font-bold ${getTextClass()} mt-1`}>
                {familyMembers.filter(m => m.status === 'Active').length}
              </p>
              <p className="text-purple-400 text-sm mt-1">Of {familyMembers.length} total</p>
            </div>
            <Users className="w-8 h-8 text-purple-400" />
          </div>
        </div>

        <div className={getCardClass()}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`${getSubtextClass()} text-sm`}>Avg per Member</p>
              <p className={`text-2xl font-bold ${getTextClass()} mt-1`}>
                ${Math.round(totalFamilyContributions / familyMembers.length)}
              </p>
              <p className="text-yellow-400 text-sm mt-1">Monthly contribution</p>
            </div>
            <BarChart3 className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Family Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className={getCardClass()}>
          <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Family Portfolio Growth</h3>
          <RechartsChart 
            type="line" 
            height={300}
            data={[
              { name: 'Jan', value: portfolioValue * 0.6 },
              { name: 'Feb', value: portfolioValue * 0.7 },
              { name: 'Mar', value: portfolioValue * 0.8 },
              { name: 'Apr', value: portfolioValue * 0.9 },
              { name: 'May', value: portfolioValue }
            ]}
            series={[{ dataKey: 'value', name: 'Family Portfolio' }]}
          />
        </div>

        <div className={getCardClass()}>
          <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Sector Allocation</h3>
          {holdings.length > 0 ? (
            <RechartsChart 
              type="donut" 
              height={300}
              data={holdings.map(h => ({ name: h.symbol, value: h.allocation }))}
            />
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                <p className={`${getSubtextClass()}`}>No investments yet</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Family Spending */}
      <div className={getCardClass()}>
        <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Family Spending by Category</h3>
        <RechartsChart 
          type="donut" 
          height={300}
          data={Object.entries(familySpendingByCategory).map(([name, value]) => ({ name, value }))}
        />
      </div>
    </div>
  )

  const renderMembers = () => (
    <div className="space-y-6">
      {/* Member Contributions */}
      <div className={getCardClass()}>
        <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Member Contributions</h3>
        {familyMembers.length > 0 ? (
          <RechartsChart 
            type="bar" 
            height={300}
            data={familyMembers.map(member => ({ 
              name: member.name.split(' ')[0], // Use first name only for better display
              value: member.contributions, // Use 'value' as the key for the chart
              contributions: member.contributions,
              fullName: member.name
            }))}
            barKey="value"
            xAxisKey="name"
            yAxisKey="value"
            showTooltip={true}
            showGrid={true}
            showLegend={false}
            colors={['#8B5CF6']}
          />
        ) : (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
              <p className={`${getSubtextClass()}`}>No member data available</p>
            </div>
          </div>
        )}
      </div>

      {/* Member Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {familyMembers.map((member, index) => (
          <div key={index} className={getCardClass()}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <h4 className={`${getTextClass()} font-semibold`}>{member.name}</h4>
                  <p className={`${getSubtextClass()} text-sm`}>{member.role}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {member.status === 'Active' ? (
                  <UserCheck className="w-5 h-5 text-green-400" />
                ) : (
                  <UserX className="w-5 h-5 text-gray-400" />
                )}
                <span className={`text-sm ${member.status === 'Active' ? 'text-green-400' : 'text-gray-400'}`}>
                  {member.status}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={getSubtextClass()}>Contributions</span>
                <span className={`${getTextClass()} font-semibold`}>${member.contributions}</span>
              </div>
              <div className="flex justify-between">
                <span className={getSubtextClass()}>Transactions</span>
                <span className={`${getTextClass()} font-semibold`}>{member.transactions}</span>
              </div>
              <div className="flex justify-between">
                <span className={getSubtextClass()}>Avg per Transaction</span>
                <span className={`${getTextClass()} font-semibold`}>
                  ${(member.contributions / member.transactions).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Family Leaderboard */}
      <div className={getCardClass()}>
        <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Family Leaderboard</h3>
        <div className="space-y-3">
          {familyMembers
            .sort((a, b) => b.contributions - a.contributions)
            .map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className={`${getTextClass()} font-medium`}>{member.name}</p>
                    <p className={`${getSubtextClass()} text-sm`}>{member.role}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`${getTextClass()} font-semibold`}>${member.contributions}</p>
                  <p className={`${getSubtextClass()} text-sm`}>{member.transactions} transactions</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )

  const renderGoals = () => (
    <div className="space-y-6">
      <div className={getCardClass()}>
        <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Family Goals & Milestones</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/5 rounded-lg p-4">
            <h4 className={`${getTextClass()} font-medium mb-2`}>Collective Portfolio Target</h4>
            <div className="w-full bg-white/10 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: '65%' }}></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className={getSubtextClass()}>$0 / $0</span>
              <span className="text-blue-400">0%</span>
            </div>
          </div>

          <div className="bg-white/5 rounded-lg p-4">
            <h4 className={`${getTextClass()} font-medium mb-2`}>Round-Ups Target</h4>
            <div className="w-full bg-white/10 rounded-full h-2 mb-2">
              <div className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full" style={{ width: '42%' }}></div>
            </div>
            <div className="flex justify-between text-sm">
              <span className={getSubtextClass()}>$0 / $0</span>
              <span className="text-green-400">42%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAIInsights = () => (
    <div className="space-y-6">
      <div className={getCardClass()}>
        <h3 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Family AI Insights</h3>
        <div className="space-y-4">
          {familyAIInsights.map((insight, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 border-l-4 border-blue-500">
              <div className="flex justify-between items-start mb-2">
                <h4 className={`${getTextClass()} font-medium`}>{insight.title}</h4>
                <span className="text-sm text-blue-400">{insight.confidence}% confidence</span>
              </div>
              <p className={`${getSubtextClass()} mb-2`}>{insight.description}</p>
              <div className="flex items-center space-x-2">
                <span className="text-green-400 text-sm font-medium">{insight.impact}</span>
                <button className="text-blue-400 hover:text-blue-300 text-sm">Learn More →</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div>
            <h1 className={`text-3xl font-bold ${getTextClass()}`}>Family Analytics</h1>
            <p className={`${getSubtextClass()} mt-1`}>Comprehensive insights into your family's collective investment journey</p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <select 
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className={`${isLightMode ? 'bg-white/80 border-gray-300 text-gray-800' : 'bg-white/10 border-white/20 text-white'} backdrop-blur-lg rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
            style={{
              backgroundColor: isLightMode ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.1)',
              color: isLightMode ? '#374151' : '#ffffff'
            }}
          >
            <option 
              value="1m" 
              style={{ 
                backgroundColor: isLightMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.8)', 
                color: isLightMode ? '#374151' : '#ffffff' 
              }}
            >
              1 Month
            </option>
            <option 
              value="3m" 
              style={{ 
                backgroundColor: isLightMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.8)', 
                color: isLightMode ? '#374151' : '#ffffff' 
              }}
            >
              3 Months
            </option>
            <option 
              value="6m" 
              style={{ 
                backgroundColor: isLightMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.8)', 
                color: isLightMode ? '#374151' : '#ffffff' 
              }}
            >
              6 Months
            </option>
            <option 
              value="1y" 
              style={{ 
                backgroundColor: isLightMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.8)', 
                color: isLightMode ? '#374151' : '#ffffff' 
              }}
            >
              1 Year
            </option>
            <option 
              value="all" 
              style={{ 
                backgroundColor: isLightMode ? 'rgba(255,255,255,0.95)' : 'rgba(0,0,0,0.8)', 
                color: isLightMode ? '#374151' : '#ffffff' 
              }}
            >
              All Time
            </option>
          </select>
          <button 
            onClick={() => exportData('csv')}
            className="bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg px-4 py-2 text-blue-400 flex items-center space-x-2 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Family Overview', icon: BarChart3 },
          { id: 'members', label: 'Member Contributions', icon: Users },
          { id: 'goals', label: 'Goals & Milestones', icon: Target },
          { id: 'ai', label: 'AI Insights', icon: Brain }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            <span className="font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'overview' && renderOverview()}
      {activeTab === 'members' && renderMembers()}
      {activeTab === 'goals' && renderGoals()}
      {activeTab === 'ai' && renderAIInsights()}
    </div>
  )
}

export default FamilyAnalytics
