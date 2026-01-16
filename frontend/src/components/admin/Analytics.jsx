import React, { useState } from 'react'
import { TrendingUp, Users, Download, PieChart, BarChart3, User, DollarSign } from 'lucide-react'
import RechartsChart from '../common/RechartsChart'

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('30d')

  const analyticsData = {
    userGrowth: [],
    revenue: [],
    transactions: []
  }

  const sectorDistribution = {
    series: [],
    options: {
      labels: [],
      colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280']
    }
  }

  const newUsers = analyticsData.userGrowth.length
    ? analyticsData.userGrowth[analyticsData.userGrowth.length - 1]?.value || 0
    : 0
  const revenueTotal = analyticsData.revenue.reduce((sum, item) => sum + (item?.value || 0), 0)
  const growthRate = analyticsData.userGrowth.length > 1
    ? ((newUsers - (analyticsData.userGrowth[0]?.value || 0)) / Math.max(analyticsData.userGrowth[0]?.value || 1, 1)) * 100
    : 0
  const revenueProgress = revenueTotal > 0 ? 100 : 0

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="glass-card p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Platform Analytics</h2>
            <p className="text-gray-300">Deep insights into platform performance and user behavior</p>
          </div>
          <div className="flex items-center space-x-4">
            <select 
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            <button className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg">
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="glass-card p-4">
            <div className="flex items-center space-x-3 mb-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">New Users</p>
                <p className="text-2xl font-bold text-white">{newUsers}</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.min(Math.max(growthRate, 0), 100)}%` }}></div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center space-x-3 mb-3">
              <DollarSign className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-gray-400 text-sm">Revenue</p>
                <p className="text-2xl font-bold text-white">${revenueTotal.toLocaleString()}</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${revenueProgress}%` }}></div>
            </div>
          </div>

          <div className="glass-card p-4">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-gray-400 text-sm">Growth Rate</p>
                <p className="text-2xl font-bold text-white">{growthRate.toFixed(1)}%</p>
              </div>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min(Math.max(growthRate, 0), 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="glass-card p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <span>User Growth & Revenue</span>
            </h3>
            <RechartsChart 
              type="line"
              height={300}
              series={[
                { name: 'Total Users', data: analyticsData.userGrowth },
                { name: 'Monthly Revenue', data: analyticsData.revenue }
              ]}
              options={{
                yaxis: {
                  labels: {
                    formatter: function (value) {
                      if (value >= 1000) return (value / 1000).toFixed(0) + 'k'
                      return value
                    }
                  }
                }
              }}
            />
          </div>

          <div className="glass-card p-4">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-green-400" />
              <span>Investment Sector Distribution</span>
            </h3>
            <RechartsChart 
              type="donut"
              height={300}
              series={sectorDistribution.series}
              options={sectorDistribution.options}
            />
          </div>
        </div>

        {/* Additional Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card p-4">
            <h4 className="font-bold text-white mb-3">Transaction Volume</h4>
            <RechartsChart 
              type="bar"
              height={200}
              series={[{ name: 'Transactions', data: analyticsData.transactions }]}
            />
          </div>

          <div className="glass-card p-4">
            <h4 className="font-bold text-white mb-3">User Engagement</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">Daily Active Users</span>
                <span className="text-white">1,245</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Session Duration</span>
                <span className="text-white">8.2min</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Retention Rate</span>
                <span className="text-green-400">0%</span>
              </div>
            </div>
          </div>

          <div className="glass-card p-4">
            <h4 className="font-bold text-white mb-3">Performance Metrics</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-400">API Response Time</span>
                <span className="text-green-400">128ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Uptime</span>
                <span className="text-green-400">99.98%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Error Rate</span>
                <span className="text-yellow-400">0.12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Analytics
