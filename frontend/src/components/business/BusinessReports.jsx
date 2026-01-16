import React, { useState, useEffect } from 'react'
import { FileText, Download, Loader2, Clock } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useModal } from '../../context/ModalContext'
import { useNotifications } from '../../hooks/useNotifications'

const BusinessReports = ({ user }) => {
  const { isBlackMode, isLightMode } = useTheme()
  const { showSuccessModal, showErrorModal } = useModal()
  const { addNotification } = useNotifications()
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [generatingReport, setGeneratingReport] = useState(null)

  // Fetch reports data on component mount
  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const authToken = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
        const response = await fetch(`${apiBaseUrl}/api/business/reports`, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        const reportsList = result.reports || result.data?.reports || []
        setReports(Array.isArray(reportsList) ? reportsList : [])
      } else {
        setReports([])
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
      setReports([])
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (type) => {
    try {
      setGeneratingReport(type)
      
      // Prepare report parameters based on type
      const reportParams = {
        type: type,
        format: 'PDF'
      }
      
      // Add period for monthly/quarterly reports
      if (type === 'monthly') {
        const now = new Date()
        reportParams.period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
        reportParams.period_type = 'monthly'
      } else if (type === 'quarterly') {
        const now = new Date()
        const quarter = Math.floor(now.getMonth() / 3) + 1
        reportParams.period = `${now.getFullYear()}-Q${quarter}`
        reportParams.period_type = 'quarterly'
      }
      
      const authToken = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
            const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
        const response = await fetch(`${apiBaseUrl}/api/business/reports/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(reportParams)
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          const reportTypeName = type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')
          showSuccessModal('Success', `${reportTypeName} report generated successfully!`)
          addNotification({
            type: 'success',
            title: 'Report Generated',
            message: `Your ${reportTypeName} report is ready for download.`,
            timestamp: new Date().toISOString()
          })
          
          // Refresh reports list
          await fetchReports()
        } else {
          throw new Error(result.message || 'Failed to generate report')
        }
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Failed to generate report' }))
        throw new Error(errorData.message || 'Failed to generate report')
      }
    } catch (error) {
      console.error('Error generating report:', error)
      showErrorModal('Error', error.message || 'Failed to generate report. Please try again.')
      addNotification({
        type: 'error',
        title: 'Generation Failed',
        message: error.message || 'Failed to generate report.',
        timestamp: new Date().toISOString()
      })
    } finally {
      setGeneratingReport(null)
    }
  }

  const handleDownload = async (report) => {
    try {
      const authToken = localStorage.getItem('kamioi_business_token') || localStorage.getItem('kamioi_user_token') || localStorage.getItem('kamioi_token')
      
      // Always fetch the download endpoint with auth to get the actual file
      const reportId = report.report_id || report.id
      const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
      const response = await fetch(`${apiBaseUrl}/api/business/reports/${reportId}/download`, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      })

      if (response.ok) {
        // Check if response is a file (PDF or HTML) or JSON
        const contentType = response.headers.get('content-type') || ''
        
        if (contentType.includes('application/pdf') || contentType.includes('text/html')) {
          // It's a file - download it directly
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          
          // Get filename from Content-Disposition header or use report name
          const contentDisposition = response.headers.get('content-disposition')
          let filename = `${report.name || 'report'}.${contentType.includes('pdf') ? 'pdf' : 'html'}`
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/)
            if (filenameMatch && filenameMatch[1]) {
              filename = filenameMatch[1].replace(/['"]/g, '')
            }
          }
          
          a.download = filename
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          document.body.removeChild(a)
          
          addNotification({
            type: 'success',
            title: 'Download Complete',
            message: `${report.name || 'Report'} downloaded successfully.`,
            timestamp: new Date().toISOString()
          })
        } else {
          // It's JSON - parse it and extract download URL
          try {
            const result = await response.json()
            const downloadUrl = result.download_url || result.data?.download_url
            if (downloadUrl) {
              // Open the download URL (which now includes token in query string)
              window.open(downloadUrl, '_blank')
              addNotification({
                type: 'success',
                title: 'Download Started',
                message: `Downloading ${report.name || 'report'}...`,
                timestamp: new Date().toISOString()
              })
            } else {
              throw new Error('No download URL or file data available')
            }
          } catch (jsonError) {
            // If JSON parsing fails, the response might be HTML/PDF - try to download it
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `${report.name || 'report'}.html`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
            
            addNotification({
              type: 'success',
              title: 'Download Complete',
              message: `${report.name || 'Report'} downloaded successfully.`,
              timestamp: new Date().toISOString()
            })
          }
        }
      } else {
        // Error response - try to parse as JSON
        let errorMessage = 'Failed to download report'
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorData.error || errorMessage
        } catch {
          // If not JSON, use status text
          errorMessage = response.statusText || errorMessage
        }
        throw new Error(errorMessage)
      }
    } catch (error) {
      console.error('Error downloading report:', error)
      showErrorModal('Error', error.message || 'Failed to download report. Please try again.')
      addNotification({
        type: 'error',
        title: 'Download Failed',
        message: error.message || 'Failed to download report.',
        timestamp: new Date().toISOString()
      })
    }
  }

  const getReportStatusBadge = (status) => {
    const statusLower = (status || 'completed').toLowerCase()
    if (statusLower === 'generating' || statusLower === 'pending') {
      return 'bg-yellow-500/20 text-yellow-400'
    } else if (statusLower === 'completed' || statusLower === 'ready') {
      return 'bg-green-500/20 text-green-400'
    } else if (statusLower === 'failed' || statusLower === 'error') {
      return 'bg-red-500/20 text-red-400'
    }
    return 'bg-blue-500/20 text-blue-400'
  }

  const getCardClass = () => {
    if (isBlackMode) return 'bg-black/20 backdrop-blur-xl border border-white/10'
    if (isLightMode) return 'bg-white/80 backdrop-blur-xl border border-gray-200/50'
    return 'bg-white/10 backdrop-blur-xl border border-white/20'
  }

  const getTextClass = () => {
    if (isLightMode) return 'text-gray-800'
    return 'text-white'
  }

  const getSubtextClass = () => {
    if (isLightMode) return 'text-gray-600'
    return 'text-white/60'
  }

  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className={`text-2xl font-bold ${getTextClass()}`}>Business Reports</h1>
            <p className={`text-sm ${getSubtextClass()}`}>Generate and manage your business reports</p>
          </div>
        </div>
        <div className={`${getCardClass()} rounded-xl p-12 text-center`}>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className={`${getSubtextClass()}`}>Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-bold ${getTextClass()}`}>Business Reports</h1>
          <p className={`text-sm ${getSubtextClass()}`}>Generate and manage your business reports</p>
        </div>
      </div>

      {/* Report Generation Section */}
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <h2 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Generate New Report</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => generateReport('financial')}
            disabled={generatingReport !== null}
            className={`p-4 border-2 border-dashed border-blue-300 rounded-lg transition-colors ${
              generatingReport === 'financial'
                ? 'border-blue-500 bg-blue-50/20 cursor-wait'
                : 'hover:border-blue-500 hover:bg-blue-50/10'
            } ${generatingReport !== null && generatingReport !== 'financial' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {generatingReport === 'financial' ? (
              <Loader2 className="w-8 h-8 mx-auto mb-2 text-blue-400 animate-spin" />
            ) : (
              <FileText className={`w-8 h-8 mx-auto mb-2 text-blue-400`} />
            )}
            <h3 className={`font-medium ${getTextClass()}`}>
              {generatingReport === 'financial' ? 'Generating...' : 'Financial Report'}
            </h3>
            <p className={`text-sm ${getSubtextClass()}`}>Revenue, expenses, and profit analysis</p>
          </button>
          
          <button 
            onClick={() => generateReport('performance')}
            disabled={generatingReport !== null}
            className={`p-4 border-2 border-dashed border-green-300 rounded-lg transition-colors ${
              generatingReport === 'performance'
                ? 'border-green-500 bg-green-50/20 cursor-wait'
                : 'hover:border-green-500 hover:bg-green-50/10'
            } ${generatingReport !== null && generatingReport !== 'performance' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {generatingReport === 'performance' ? (
              <Loader2 className="w-8 h-8 mx-auto mb-2 text-green-400 animate-spin" />
            ) : (
              <FileText className={`w-8 h-8 mx-auto mb-2 text-green-400`} />
            )}
            <h3 className={`font-medium ${getTextClass()}`}>
              {generatingReport === 'performance' ? 'Generating...' : 'Performance Report'}
            </h3>
            <p className={`text-sm ${getSubtextClass()}`}>Team productivity and goal tracking</p>
          </button>
          
          <button 
            onClick={() => generateReport('analytics')}
            disabled={generatingReport !== null}
            className={`p-4 border-2 border-dashed border-purple-300 rounded-lg transition-colors ${
              generatingReport === 'analytics'
                ? 'border-purple-500 bg-purple-50/20 cursor-wait'
                : 'hover:border-purple-500 hover:bg-purple-50/10'
            } ${generatingReport !== null && generatingReport !== 'analytics' ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {generatingReport === 'analytics' ? (
              <Loader2 className="w-8 h-8 mx-auto mb-2 text-purple-400 animate-spin" />
            ) : (
              <FileText className={`w-8 h-8 mx-auto mb-2 text-purple-400`} />
            )}
            <h3 className={`font-medium ${getTextClass()}`}>
              {generatingReport === 'analytics' ? 'Generating...' : 'Analytics Report'}
            </h3>
            <p className={`text-sm ${getSubtextClass()}`}>Business insights and trends</p>
          </button>
        </div>
      </div>

      {/* Recent Reports Section */}
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <h2 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Recent Reports</h2>
        
        {reports.length > 0 ? (
          <div className="space-y-4">
            {reports.map((report, index) => (
              <div key={report.id || index} className="flex items-center justify-between p-4 border border-white/10 rounded-lg hover:bg-white/5 transition-colors">
                <div className="flex items-center space-x-4">
                  <FileText className={`w-8 h-8 text-blue-400`} />
                  <div>
                    <h3 className={`font-medium ${getTextClass()}`}>
                      {report.name || report.type || `Report ${index + 1}`}
                    </h3>
                    <p className={`text-sm ${getSubtextClass()}`}>
                      {report.created_at || report.date 
                        ? `Generated on ${new Date(report.created_at || report.date).toLocaleDateString()}`
                        : `Generated on ${new Date().toLocaleDateString()}`
                      }
                      {report.type && (
                        <span className="ml-2 capitalize">({report.type.replace('_', ' ')})</span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <span className={`text-sm px-2 py-1 rounded-full ${getReportStatusBadge(report.status)}`}>
                    {report.status || 'Completed'}
                  </span>
                  {(report.status === 'completed' || report.status === 'ready' || !report.status) && (
                    <button 
                      onClick={() => handleDownload(report)}
                      className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                      title="Download Report"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  )}
                  {report.status === 'generating' && (
                    <div className="p-2 text-yellow-400">
                      <Clock className="w-4 h-4 animate-pulse" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className={`w-16 h-16 mx-auto mb-4 ${getSubtextClass()}`} />
            <h3 className={`text-lg font-medium ${getTextClass()} mb-2`}>No Reports Yet</h3>
            <p className={`${getSubtextClass()} mb-4`}>Generate your first business report to get started</p>
            <button 
              onClick={() => generateReport('financial')}
              disabled={generatingReport !== null}
              className={`px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors ${
                generatingReport !== null ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {generatingReport === 'financial' ? (
                <>
                  <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                'Generate Financial Report'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Report Templates Section */}
      <div className={`${getCardClass()} rounded-xl p-6`}>
        <h2 className={`text-xl font-semibold ${getTextClass()} mb-4`}>Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border border-white/10 rounded-lg">
            <h3 className={`font-medium ${getTextClass()} mb-2`}>Monthly Business Summary</h3>
            <p className={`text-sm ${getSubtextClass()} mb-3`}>Comprehensive monthly overview including revenue, expenses, and key metrics</p>
            <button 
              onClick={() => generateReport('monthly')}
              disabled={generatingReport !== null}
              className={`text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors ${
                generatingReport !== null ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {generatingReport === 'monthly' ? (
                <>
                  <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                'Use Template →'
              )}
            </button>
          </div>
          
          <div className="p-4 border border-white/10 rounded-lg">
            <h3 className={`font-medium ${getTextClass()} mb-2`}>Quarterly Performance Review</h3>
            <p className={`text-sm ${getSubtextClass()} mb-3`}>Detailed quarterly analysis with trends and recommendations</p>
            <button 
              onClick={() => generateReport('quarterly')}
              disabled={generatingReport !== null}
              className={`text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors ${
                generatingReport !== null ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {generatingReport === 'quarterly' ? (
                <>
                  <Loader2 className="w-3 h-3 inline mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                'Use Template →'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessReports
