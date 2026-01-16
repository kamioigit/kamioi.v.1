import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Clock, Users, DollarSign, Brain, Globe, AlertTriangle, CheckCircle, ArrowRight, BookOpen, Settings, Database, Shield, Zap, TrendingUp, MessageSquare, BarChart3, Activity, RefreshCw, Download, Upload, Eye, Edit, Trash2, Save, Play, Pause, RotateCcw, UserPlus, Building2, Megaphone, CreditCard, MapPin, User, Search } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const StandardOperatingProcedures = () => {
  const { isLightMode, isDarkMode, isCloudMode } = useTheme()
  const [activeSection, setActiveSection] = useState('daily')

  // Dispatch page load completion event (no data fetching needed)
  React.useEffect(() => {
    // Small delay to ensure AdminDashboard listener is ready
    const timer = setTimeout(() => {
      console.log('📊 SOP - Dispatching admin-page-load-complete for sop')
      window.dispatchEvent(new CustomEvent('admin-page-load-complete', {
        detail: { pageId: 'sop' }
      }))
    }, 100)
    return () => clearTimeout(timer)
  }, [])

  const getTextColor = () => (isLightMode ? 'text-gray-800' : 'text-white')
  const getSubtextClass = () => (isLightMode ? 'text-gray-600' : 'text-gray-400')
  const getCardClass = () => `bg-white/10 backdrop-blur-xl rounded-lg shadow-lg p-6 border border-white/20 ${isLightMode ? 'bg-opacity-80' : 'bg-opacity-10'}`
  const getHoverCardClass = () => `${getCardClass()} transition-all duration-300 hover:bg-white/15 hover:shadow-xl hover:scale-[1.02] cursor-pointer`

  const sections = [
    { id: 'daily', label: 'Daily Operations', icon: Clock, color: 'text-blue-400' },
    { id: 'users', label: 'User Management', icon: Users, color: 'text-green-400' },
    { id: 'financial', label: 'Financial Operations', icon: DollarSign, color: 'text-yellow-400' },
    { id: 'ai', label: 'AI/ML Management', icon: Brain, color: 'text-purple-400' },
    { id: 'content', label: 'Content Management', icon: Globe, color: 'text-pink-400' },
    { id: 'emergency', label: 'Emergency Procedures', icon: AlertTriangle, color: 'text-red-400' },
    { id: 'database', label: 'Database Operations', icon: Database, color: 'text-cyan-400' }
  ]

  const procedures = {
    daily: [
      {
        title: 'System Health Check',
        steps: [
          'Navigate to System Settings → System Health',
          'Review system status indicators (green = healthy, yellow = warning, red = critical)',
          'Check database connectivity status',
          'Verify API response times are under 500ms',
          'Review error logs for any critical issues',
          'Document any anomalies in the admin log'
        ],
        icon: Activity,
        color: 'bg-blue-500/20'
      },
      {
        title: 'Transaction Queue Review',
        steps: [
          'Go to Investment Processing Dashboard',
          'Review staged transactions (mapped but not processed)',
          'Check for any transactions stuck in "pending-mapping" status',
          'Verify processing success rate is above 95%',
          'Approve or reject any flagged transactions',
          'Monitor average processing time (should be under 5 seconds)'
        ],
        icon: TrendingUp,
        color: 'bg-green-500/20'
      },
      {
        title: 'Investment Processing',
        steps: [
          'Review Investment Processing Dashboard',
          'Check staged transactions ready for investment',
          'Verify stock prices are current',
          'Review portfolio allocations',
          'Approve batch processing if queue is ready',
          'Monitor completion status and error rates'
        ],
        icon: Zap,
        color: 'bg-yellow-500/20'
      },
      {
        title: 'Revenue Monitoring',
        steps: [
          'Navigate to Financial Analytics',
          'Review daily revenue from subscription accounts',
          'Check for any payment failures or declined subscriptions',
          'Verify subscription renewals processed correctly',
          'Review revenue trends and compare to previous periods',
          'Export revenue reports if needed'
        ],
        icon: DollarSign,
        color: 'bg-purple-500/20'
      }
    ],
    users: [
      {
        title: 'User Account Creation',
        steps: [
          'Navigate to User Management → Consolidated Users',
          'Click "Add New User" button',
          'Fill in required fields: email, name, password, account type',
          'Select account type: Individual, Family, or Business',
          'Verify email is unique and properly formatted',
          'Set initial subscription plan',
          'Save user account',
          'Send welcome email notification'
        ],
        icon: UserPlus,
        color: 'bg-blue-500/20'
      },
      {
        title: 'User Account Modification',
        steps: [
          'Search for user in User Management',
          'Click on user to view details',
          'Click "Edit" button',
          'Modify necessary fields (name, email, subscription plan, etc.)',
          'Verify changes are correct before saving',
          'Save changes',
          'Notify user of account changes if significant'
        ],
        icon: Edit,
        color: 'bg-green-500/20'
      },
      {
        title: 'Account Migration',
        steps: [
          'Navigate to User Management',
          'Select user requiring migration',
          'For account number migration: Use "Migrate Account Numbers" tool',
          'For address migration: Use "Migrate Address Fields" tool',
          'Review migration preview before executing',
          'Backup user data before migration',
          'Execute migration',
          'Verify data integrity after migration',
          'Test user login and dashboard access'
        ],
        icon: RefreshCw,
        color: 'bg-yellow-500/20'
      },
      {
        title: 'User Account Deletion',
        steps: [
          '⚠️ WARNING: This action is IRREVERSIBLE',
          'Navigate to User Management',
          'Search for user to delete',
          'Review user\'s transaction history and account balance',
          'Export user data for records if needed',
          'Verify user has no pending investments',
          'Cancel any active subscriptions',
          'Click "Delete User" button',
          'Confirm deletion in popup dialog',
          'Document reason for deletion in admin log'
        ],
        icon: Trash2,
        color: 'bg-red-500/20'
      },
      {
        title: 'Family Account Management',
        steps: [
          'Navigate to Family Management',
          'View all family accounts and members',
          'Add or remove family members as needed',
          'Manage family subscription and billing',
          'Review family portfolio and transactions',
          'Handle family-specific settings and permissions'
        ],
        icon: Users,
        color: 'bg-purple-500/20'
      },
      {
        title: 'Business Account Management',
        steps: [
          'Navigate to Business Management',
          'Review business account details',
          'Manage business employees',
          'Handle business subscription and billing',
          'Review business portfolio and transactions',
          'Manage business-specific settings'
        ],
        icon: Building2,
        color: 'bg-indigo-500/20'
      }
    ],
    financial: [
      {
        title: 'Transaction Processing Workflow',
        steps: [
          'Navigate to Transactions tab',
          'Review pending transactions',
          'Check transaction categorization accuracy',
          'Verify merchant mappings are correct',
          'Approve transactions for investment processing',
          'Monitor transaction processing status',
          'Resolve any failed transactions',
          'Verify round-up calculations are accurate'
        ],
        icon: FileText,
        color: 'bg-blue-500/20'
      },
      {
        title: 'Investment Approval Process',
        steps: [
          'Go to Investment Processing Dashboard',
          'Review staged transactions ready for investment',
          'Verify stock ticker mappings are correct',
          'Check current stock prices',
          'Review investment amounts and share calculations',
          'Approve investments individually or in batch',
          'Monitor investment execution status',
          'Verify portfolio updates after processing'
        ],
        icon: TrendingUp,
        color: 'bg-green-500/20'
      },
      {
        title: 'Ledger Reconciliation',
        steps: [
          'Navigate to Financial Analytics → Ledger Consistency',
          'Run ledger consistency check',
          'Review any discrepancies found',
          'Compare transaction totals with ledger balances',
          'Verify round-up totals match investment totals',
          'Investigate and resolve any inconsistencies',
          'Document reconciliation results',
          'Schedule next reconciliation (weekly recommended)'
        ],
        icon: BarChart3,
        color: 'bg-yellow-500/20'
      },
      {
        title: 'Subscription Revenue Tracking',
        steps: [
          'Navigate to Subscriptions tab',
          'Review active subscriptions',
          'Check for failed payments or declined cards',
          'Review subscription renewal queue',
          'Process manual renewals if needed',
          'Update subscription revenue in Financial Analytics',
          'Export revenue reports for accounting',
          'Monitor subscription churn rate'
        ],
        icon: DollarSign,
        color: 'bg-purple-500/20'
      },
      {
        title: 'Financial Reporting',
        steps: [
          'Navigate to Financial Analytics',
          'Select reporting period (daily, weekly, monthly)',
          'Review key metrics: revenue, transactions, investments',
          'Export financial reports as needed',
          'Review revenue by account type',
          'Analyze investment performance',
          'Generate custom reports if required',
          'Archive reports for record keeping'
        ],
        icon: Download,
        color: 'bg-cyan-500/20'
      }
    ],
    ai: [
      {
        title: 'LLM Mapping Approval',
        steps: [
          'Navigate to LLM Center',
          'Review pending merchant-to-ticker mappings',
          'Verify mapping accuracy (merchant name → stock ticker)',
          'Check company name matches ticker symbol',
          'Approve correct mappings',
          'Reject incorrect mappings with reason',
          'Update merchant mapping rules if needed',
          'Monitor mapping accuracy rate'
        ],
        icon: CheckCircle,
        color: 'bg-blue-500/20'
      },
      {
        title: 'Model Training',
        steps: [
          'Navigate to ML Dashboard',
          'Review training data quality',
          'Export training data if needed',
          'Initiate model training session',
          'Monitor training progress',
          'Review training metrics and accuracy',
          'Test model performance on validation set',
          'Deploy new model if performance improved',
          'Document training session results'
        ],
        icon: Brain,
        color: 'bg-purple-500/20'
      },
      {
        title: 'Transaction Categorization Review',
        steps: [
          'Go to LLM Data Management',
          'Review transaction categorization results',
          'Check for mis-categorized transactions',
          'Update categorization rules if needed',
          'Approve or correct category assignments',
          'Monitor categorization accuracy',
          'Train model on corrections if necessary'
        ],
        icon: Eye,
        color: 'bg-green-500/20'
      },
      {
        title: 'AI Processing Queue Management',
        steps: [
          'Navigate to LLM Center → Queue',
          'Review processing queue status',
          'Check for stuck or failed processing jobs',
          'Restart failed jobs if needed',
          'Monitor processing throughput',
          'Adjust processing rate if needed',
          'Review processing logs for errors',
          'Optimize queue performance'
        ],
        icon: Activity,
        color: 'bg-yellow-500/20'
      },
      {
        title: 'Merchant Mapping Standards',
        steps: [
          'Review merchant mapping guidelines',
          'Ensure consistent naming conventions',
          'Verify ticker symbols are correct',
          'Check for duplicate merchant entries',
          'Update merchant database regularly',
          'Document new merchant mappings',
          'Review and approve merchant suggestions'
        ],
        icon: MapPin,
        color: 'bg-pink-500/20'
      }
    ],
    content: [
      {
        title: 'Blog Post Publishing',
        steps: [
          'Navigate to Content Management → Blog',
          'Click "Create New Post"',
          'Enter post title and content',
          'Add featured image if needed',
          'Set SEO meta title and description',
          'Use AI SEO Optimization if desired',
          'Preview post before publishing',
          'Set publish date (immediate or scheduled)',
          'Click "Publish" button',
          'Verify post appears on blog listing page'
        ],
        icon: FileText,
        color: 'bg-blue-500/20'
      },
      {
        title: 'Frontend Content Updates',
        steps: [
          'Navigate to Content Management → Frontend Content',
          'Select content section to update',
          'Edit content fields as needed',
          'Update statistics if required',
          'Preview changes before saving',
          'Save changes',
          'Verify updates on homepage',
          'Test responsive design on mobile devices'
        ],
        icon: Globe,
        color: 'bg-green-500/20'
      },
      {
        title: 'SEO Optimization',
        steps: [
          'Navigate to Content Management → SEO Settings',
          'Review current SEO configuration',
          'Update meta titles and descriptions',
          'Optimize keywords for target audience',
          'Update Open Graph tags',
          'Verify structured data (JSON-LD)',
          'Test SEO with preview tools',
          'Save SEO settings',
          'Monitor SEO performance in Google Analytics'
        ],
        icon: TrendingUp,
        color: 'bg-yellow-500/20'
      },
      {
        title: 'Advertisement Campaign Management',
        steps: [
          'Navigate to Advertisement module',
          'Create new ad campaign or edit existing',
          'Set campaign targeting and budget',
          'Upload ad creative assets',
          'Set campaign start and end dates',
          'Review ad placements',
          'Activate campaign',
          'Monitor campaign performance',
          'Adjust targeting or budget as needed'
        ],
        icon: Megaphone,
        color: 'bg-purple-500/20'
      }
    ],
    emergency: [
      {
        title: 'System Downtime Protocol',
        steps: [
          '⚠️ IMMEDIATE ACTION REQUIRED',
          'Check System Health dashboard for error details',
          'Review error logs in System Settings',
          'Identify root cause of downtime',
          'Notify team members via emergency channel',
          'Post status update on system status page',
          'Attempt system restart if safe',
          'Contact hosting provider if infrastructure issue',
          'Document incident details',
          'Post-mortem review after resolution'
        ],
        icon: AlertTriangle,
        color: 'bg-red-500/20'
      },
      {
        title: 'Data Recovery Procedure',
        steps: [
          '⚠️ CRITICAL: Do not make changes during recovery',
          'Stop all processing operations immediately',
          'Identify data loss scope and timeframe',
          'Locate most recent backup',
          'Verify backup integrity',
          'Restore database from backup',
          'Verify data integrity after restoration',
          'Test critical functions',
          'Resume operations gradually',
          'Document recovery process and lessons learned'
        ],
        icon: RotateCcw,
        color: 'bg-red-500/20'
      },
      {
        title: 'Security Incident Response',
        steps: [
          '⚠️ SECURITY ALERT: Immediate action required',
          'Isolate affected systems immediately',
          'Preserve evidence (logs, screenshots)',
          'Notify security team and management',
          'Assess scope of breach',
          'Change all admin passwords',
          'Review access logs for unauthorized access',
          'Notify affected users if data compromised',
          'Document incident details',
          'Implement security patches',
          'Post-incident security review'
        ],
        icon: Shield,
        color: 'bg-red-500/20'
      },
      {
        title: 'Payment Processing Failure',
        steps: [
          'Check Stripe dashboard for payment status',
          'Review payment error logs',
          'Identify affected users and transactions',
          'Verify Stripe API connectivity',
          'Check API keys are valid',
          'Retry failed payments if appropriate',
          'Notify affected users of payment issues',
          'Process manual payments if critical',
          'Document payment failures',
          'Review and update payment processing logic'
        ],
        icon: CreditCard,
        color: 'bg-yellow-500/20'
      },
      {
        title: 'Database Corruption',
        steps: [
          '⚠️ CRITICAL: Stop all database operations',
          'Do not attempt repairs without backup',
          'Create immediate backup of current state',
          'Review database logs for errors',
          'Run database integrity checks',
          'Restore from last known good backup',
          'Verify data consistency after restore',
          'Gradually resume operations',
          'Monitor database health closely',
          'Document corruption cause and resolution'
        ],
        icon: Database,
        color: 'bg-red-500/20'
      }
    ],
    database: [
      {
        title: 'Database Backup Procedure',
        steps: [
          'Navigate to System Settings → Database',
          'Verify last backup timestamp',
          'Initiate manual backup if needed',
          'Verify backup file was created successfully',
          'Test backup restoration on test environment',
          'Store backup in secure location',
          'Document backup completion',
          'Schedule regular automated backups (daily recommended)'
        ],
        icon: Save,
        color: 'bg-blue-500/20'
      },
      {
        title: 'Database Cleanup Operations',
        steps: [
          '⚠️ CAUTION: Review before executing',
          'Navigate to System Settings → Database Cleanup',
          'Review what will be deleted',
          'Export data to be deleted for records',
          'Verify test data identification is correct',
          'Execute cleanup operation',
          'Verify cleanup completed successfully',
          'Review database size reduction',
          'Document cleanup operation'
        ],
        icon: Trash2,
        color: 'bg-yellow-500/20'
      },
      {
        title: 'Database Performance Monitoring',
        steps: [
          'Navigate to Database → Performance',
          'Review query performance metrics',
          'Check for slow queries (>1 second)',
          'Review database connection pool usage',
          'Monitor database size and growth',
          'Check index usage and optimization',
          'Review table statistics',
          'Optimize slow queries if needed',
          'Document performance improvements'
        ],
        icon: Activity,
        color: 'bg-green-500/20'
      },
      {
        title: 'Data Quality Checks',
        steps: [
          'Navigate to Database → Data Quality',
          'Run data quality assessment',
          'Review data completeness scores',
          'Check for duplicate records',
          'Verify referential integrity',
          'Review data consistency',
          'Fix data quality issues found',
          'Re-run quality checks',
          'Document data quality improvements'
        ],
        icon: CheckCircle,
        color: 'bg-purple-500/20'
      },
      {
        title: 'Schema Migration',
        steps: [
          '⚠️ CRITICAL: Backup database before migration',
          'Review migration script thoroughly',
          'Test migration on development environment',
          'Schedule migration during low-traffic period',
          'Notify users of maintenance window',
          'Execute migration script',
          'Verify schema changes applied correctly',
          'Test application functionality',
          'Monitor for errors post-migration',
          'Document migration completion'
        ],
        icon: Database,
        color: 'bg-cyan-500/20'
      }
    ]
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  }

  const sectionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: 0.2
      }
    }
  }

  const currentProcedures = procedures[activeSection] || []

  return (
    <div className={`min-h-screen p-6 ${isLightMode ? 'bg-gray-50' : 'bg-gradient-to-br from-gray-900 via-gray-800 to-black'}`}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className={`${getCardClass()} mb-6`}>
            <div className="flex items-center space-x-4 mb-4">
              <div className={`p-3 rounded-lg bg-blue-500/20 ${isLightMode ? 'bg-blue-100' : ''}`}>
                <BookOpen className={`w-8 h-8 ${getTextColor()}`} />
              </div>
              <div>
                <h1 className={`text-3xl font-bold ${getTextColor()} mb-2`}>
                  Standard Operating Procedures
                </h1>
                <p className={getSubtextClass()}>
                  Comprehensive guide for admin operations and workflows
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Section Tabs */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className={`${getCardClass()} p-4`}>
            <div className="flex flex-wrap gap-3">
              {sections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id
                return (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-300
                      ${isActive 
                        ? `${isLightMode ? 'bg-blue-500 text-white shadow-lg' : 'bg-white/20 text-white shadow-lg'}`
                        : `${isLightMode ? 'bg-white/50 text-gray-700 hover:bg-white/70' : 'bg-white/5 text-white/70 hover:bg-white/10'}`
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{section.label}</span>
                  </motion.button>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Procedures Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-6"
          >
            {currentProcedures.length === 0 ? (
              <motion.div
                variants={itemVariants}
                className={`${getCardClass()} text-center py-12`}
              >
                <FileText className={`w-16 h-16 mx-auto mb-4 ${getSubtextClass()}`} />
                <p className={`text-xl ${getSubtextClass()}`}>
                  No procedures available for this section
                </p>
              </motion.div>
            ) : (
              currentProcedures.map((procedure, index) => {
                const ProcedureIcon = procedure.icon || FileText
                return (
                  <motion.div
                    key={index}
                    variants={itemVariants}
                    className={getHoverCardClass()}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${procedure.color} flex-shrink-0`}>
                        <ProcedureIcon className={`w-6 h-6 ${getTextColor()}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className={`text-xl font-bold ${getTextColor()} mb-4`}>
                          {procedure.title}
                        </h3>
                        <ol className="space-y-3">
                          {procedure.steps.map((step, stepIndex) => (
                            <motion.li
                              key={stepIndex}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: stepIndex * 0.05 }}
                              className={`flex items-start space-x-3 ${getTextColor()}`}
                            >
                              <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${
                                step.startsWith('⚠️') 
                                  ? 'bg-red-500 text-white' 
                                  : isLightMode 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-blue-500/30 text-blue-300'
                              }`}>
                                {stepIndex + 1}
                              </span>
                              <span className={`flex-1 ${step.startsWith('⚠️') ? 'font-semibold text-red-400' : ''}`}>
                                {step}
                              </span>
                            </motion.li>
                          ))}
                        </ol>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer Note */}
        <motion.div
          variants={itemVariants}
          className={`${getCardClass()} mt-8 text-center`}
        >
          <p className={getSubtextClass()}>
            <Shield className="w-4 h-4 inline mr-2" />
            Last updated: {new Date().toLocaleDateString()} | 
            For questions or updates, contact the development team
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default StandardOperatingProcedures

