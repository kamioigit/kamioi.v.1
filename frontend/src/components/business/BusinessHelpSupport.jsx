import React, { useState } from 'react'
import { MessageCircle, ExternalLink, Star, Download, Upload, ChevronRight, Mail, Phone, User, FileText, HelpCircle, BookOpen, Video, Search } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const BusinessHelpSupport = ({ user }) => {
  const [searchQuery, setSearchQuery] = useState('')
   const { isLightMode } = useTheme()
  const [selectedCategory, setSelectedCategory] = useState('all')

  const getTextClass = () => isLightMode ? 'text-gray-900' : 'text-white'
  const getSubtextClass = () => isLightMode ? 'text-gray-600' : 'text-gray-400'
  const getCardClass = () => isLightMode ? 'bg-white border-gray-200' : 'bg-white/10 border-white/20'
  const getInputClass = () => isLightMode 
    ? 'bg-white border-gray-300 text-gray-900 placeholder-gray-500' 
    : 'bg-white/10 border-white/20 text-white placeholder-gray-400'

  const helpCategories = [
    { id: 'all', name: 'All Topics', icon: BookOpen },
    { id: 'getting-started', name: 'Getting Started', icon: Star },
    { id: 'investments', name: 'Investments', icon: FileText },
    { id: 'team-management', name: 'Team Management', icon: MessageCircle },
    { id: 'reports', name: 'Reports & Analytics', icon: FileText },
    { id: 'technical', name: 'Technical Support', icon: HelpCircle }
  ]

  const helpArticles = [
    {
      id: 1,
      title: 'How to Set Up Business Investment Goals',
      category: 'getting-started',
      description: 'Learn how to create and manage investment goals for your business.',
      readTime: '5 min read',
      difficulty: 'Beginner',
      featured: true
    },
    {
      id: 2,
      title: 'Understanding Business Portfolio Analytics',
      category: 'investments',
      description: 'Get insights into your business investment performance and analytics.',
      readTime: '8 min read',
      difficulty: 'Intermediate',
      featured: true
    },
    {
      id: 3,
      title: 'Managing Team Members and Permissions',
      category: 'team-management',
      description: 'Learn how to add team members and set appropriate permissions.',
      readTime: '6 min read',
      difficulty: 'Beginner',
      featured: false
    },
    {
      id: 4,
      title: 'Generating Business Reports',
      category: 'reports',
      description: 'Create comprehensive reports for your business investments.',
      readTime: '7 min read',
      difficulty: 'Intermediate',
      featured: false
    },
    {
      id: 5,
      title: 'Troubleshooting Upload Issues',
      category: 'technical',
      description: 'Common solutions for bank file upload problems.',
      readTime: '4 min read',
      difficulty: 'Beginner',
      featured: false
    },
    {
      id: 6,
      title: 'API Integration Guide',
      category: 'technical',
      description: 'How to integrate Kamioi with your existing business systems.',
      readTime: '12 min read',
      difficulty: 'Advanced',
      featured: false
    }
  ]

  const contactMethods = [
    {
      name: 'Live Chat',
      description: 'Get instant help from our support team',
      icon: MessageCircle,
      action: 'Start Chat',
      available: true
    },
    {
      name: 'Email Support',
      description: 'Send us a detailed message',
      icon: Mail,
      action: 'Send Email',
      available: true
    },
    {
      name: 'Phone Support',
      description: 'Speak with a business specialist',
      icon: Phone,
      action: 'Call Now',
      available: true
    }
  ]

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        article.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-400 bg-green-400/20'
      case 'Intermediate': return 'text-yellow-400 bg-yellow-400/20'
      case 'Advanced': return 'text-red-400 bg-red-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900/20 via-purple-900/20 to-pink-900/20 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-3xl font-bold ${getTextClass()} mb-2`}>
            Business Help & Support
          </h1>
          <p className={`${getSubtextClass()}`}>
            Get help with your business investment platform and team management.
          </p>
        </div>

        {/* Search and Categories */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-3 ${getInputClass()} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {helpCategories.map((category) => {
              const Icon = category.icon
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-500 text-white'
                      : `${getCardClass()} ${getTextClass()} hover:bg-white/20`
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{category.name}</span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Help Articles */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${getTextClass()}`}>
                Help Articles
              </h2>
              <span className={`text-sm ${getSubtextClass()}`}>
                {filteredArticles.length} articles found
              </span>
            </div>

            <div className="space-y-4">
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className={`${getCardClass()} backdrop-blur-lg rounded-xl p-6 border transition-all hover:shadow-lg cursor-pointer`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className={`text-lg font-semibold ${getTextClass()}`}>
                          {article.title}
                        </h3>
                        {article.featured && (
                          <span className="px-2 py-1 bg-yellow-400/20 text-yellow-400 text-xs font-medium rounded-full">
                            Featured
                          </span>
                        )}
                      </div>
                      <p className={`${getSubtextClass()} mb-3`}>
                        {article.description}
                      </p>
                      <div className="flex items-center space-x-4">
                        <span className={`text-sm ${getSubtextClass()}`}>
                          {article.readTime}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(article.difficulty)}`}>
                          {article.difficulty}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Support */}
          <div className="lg:col-span-1">
            <h2 className={`text-xl font-semibold ${getTextClass()} mb-6`}>
              Contact Support
            </h2>
            
            <div className="space-y-4 mb-8">
              {contactMethods.map((method, index) => {
                const Icon = method.icon
                return (
                  <div
                    key={index}
                    className={`${getCardClass()} backdrop-blur-lg rounded-xl p-6 border transition-all hover:shadow-lg cursor-pointer`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <Icon className="w-6 h-6 text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold ${getTextClass()} mb-1`}>
                          {method.name}
                        </h3>
                        <p className={`text-sm ${getSubtextClass()} mb-3`}>
                          {method.description}
                        </p>
                        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center space-x-1">
                          <span>{method.action}</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className={`${getCardClass()} backdrop-blur-lg rounded-xl p-6 border`}>
              <h3 className={`font-semibold ${getTextClass()} mb-4`}>
                Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
                  <Download className="w-4 h-4 text-blue-400" />
                  <span className={`${getTextClass()}`}>Download User Guide</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
                  <Video className="w-4 h-4 text-blue-400" />
                  <span className={`${getTextClass()}`}>Watch Tutorial Videos</span>
                </button>
                <button className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-white/10 transition-colors">
                  <Star className="w-4 h-4 text-blue-400" />
                  <span className={`${getTextClass()}`}>Feature Requests</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessHelpSupport

