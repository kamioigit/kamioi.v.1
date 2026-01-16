import React from 'react'
import { Trophy, Star, Award, Zap, Target, TrendingUp, Users, Shield, Info } from 'lucide-react'

const BadgesSystem = ({ user }) => {
  const badges = [
    {
      id: 1,
      name: 'First Investment',
      description: 'Made your first stock purchase',
      icon: Trophy,
      color: 'from-yellow-500 to-orange-500',
      earned: true,
      progress: 100,
      date: '2024-01-15'
    },
    {
      id: 2,
      name: 'Consistent Investor',
      description: 'Invested for 3 consecutive months',
      icon: Star,
      color: 'from-blue-500 to-purple-500',
      earned: true,
      progress: 100,
      date: '2024-03-15'
    },
    {
      id: 3,
      name: 'Diversification Pro',
      description: 'Hold 5+ different stocks',
      icon: Award,
      color: 'from-green-500 to-teal-500',
      earned: true,
      progress: 100,
      date: '2024-02-20'
    },
    {
      id: 4,
      name: 'Market Explorer',
      description: 'Invest in 3 different sectors',
      icon: Zap,
      color: 'from-red-500 to-pink-500',
      earned: false,
      progress: 66,
      date: null
    },
    {
      id: 5,
      name: 'Goal Getter',
      description: 'Reach portfolio value milestone',
      icon: Target,
      color: 'from-purple-500 to-indigo-500',
      earned: false,
      progress: 25,
      date: null
    },
    {
      id: 6,
      name: 'Growth Champion',
      description: 'Achieve portfolio growth milestone',
      icon: TrendingUp,
      color: 'from-emerald-500 to-green-500',
      earned: false,
      progress: 18,
      date: null
    }
  ]

  const achievements = [
    { name: 'Total Badges Earned', value: '0/12', icon: Trophy },
    { name: 'Current Streak', value: '0 days', icon: Zap },
    { name: 'Investment Rank', value: 'Not ranked', icon: TrendingUp },
    { name: 'Community Points', value: '0', icon: Users }
  ]

  return (
    <div className="space-y-6">
      {/* Badges Header */}
      <div className="glass-card p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
            <Trophy className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Achievements & Badges</h2>
            <p className="text-gray-300">Track your investment journey and earn rewards</p>
          </div>
        </div>

        {/* Achievement Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {achievements.map((achievement, index) => (
            <div key={index} className="bg-white/5 rounded-lg p-4 text-center">
              <achievement.icon className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white mb-1">{achievement.value}</div>
              <div className="text-gray-400 text-sm">{achievement.name}</div>
            </div>
          ))}
        </div>

        {/* Progress Overview */}
        <div className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-white mb-1">Next Milestone: Growth Champion</h4>
              <p className="text-gray-300 text-sm">18% progress toward 25% portfolio growth</p>
            </div>
            <div className="w-24 bg-gray-600 rounded-full h-2">
              <div className="bg-gradient-to-r from-yellow-500 to-orange-500 h-2 rounded-full" style={{ width: '18%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="glass-card p-6">
        <h3 className="text-xl font-bold text-white mb-6">Your Badges</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map(badge => (
            <div key={badge.id} className={`relative p-6 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
              badge.earned 
                ? `bg-gradient-to-br ${badge.color} border-transparent`
                : 'bg-white/5 border-white/10'
            }`}>
              {/* Badge Icon */}
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                badge.earned ? 'bg-white/20' : 'bg-gray-600/20'
              }`}>
                <badge.icon className={`w-8 h-8 ${badge.earned ? 'text-white' : 'text-gray-400'}`} />
              </div>

              {/* Badge Info */}
              <h4 className={`font-bold text-lg mb-2 ${badge.earned ? 'text-white' : 'text-white'}`}>
                {badge.name}
              </h4>
              <p className={`text-sm mb-4 ${badge.earned ? 'text-white/80' : 'text-gray-400'}`}>
                {badge.description}
              </p>

              {/* Progress/Status */}
              {badge.earned ? (
                <div className="flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-white" />
                  <span className="text-white text-sm">Earned on {badge.date}</span>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{badge.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-600 rounded-full h-2">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full" style={{ width: `${badge.progress}%` }}></div>
                  </div>
                </div>
              )}

              {/* Earned Ribbon */}
              {badge.earned && (
                <div className="absolute top-4 right-4">
                  <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                    EARNED
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <h4 className="font-bold text-white mb-4">Available Rewards</h4>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">Free Stock Trade</p>
                <p className="text-gray-400 text-sm">Unlocks at 5 badges</p>
              </div>
              <span className="text-yellow-400">3/5</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">Premium Analytics</p>
                <p className="text-gray-400 text-sm">Unlocks at 8 badges</p>
              </div>
              <span className="text-gray-400">3/8</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="text-white font-medium">AI Advisor Pro</p>
                <p className="text-gray-400 text-sm">Unlocks at 12 badges</p>
              </div>
              <span className="text-gray-400">3/12</span>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h4 className="font-bold text-white mb-4">Learning Path</h4>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-green-400 text-sm">?</span>
              </div>
              <span className="text-white">Investment Basics</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                <span className="text-green-400 text-sm">?</span>
              </div>
              <span className="text-white">Portfolio Diversification</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <span className="text-blue-400 text-sm">?</span>
              </div>
              <span className="text-white">Advanced Strategies</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-500/20 rounded-full flex items-center justify-center">
                <span className="text-gray-400 text-sm">?</span>
              </div>
              <span className="text-gray-400">Risk Management</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BadgesSystem
