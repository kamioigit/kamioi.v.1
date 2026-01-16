import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Calculator, 
  FileText, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  Settings
} from 'lucide-react';

const LLMDataAssetsProper = () => {
  const [assets, setAssets] = useState([]);
  const [summary, setSummary] = useState({});
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [costBreakdown, setCostBreakdown] = useState([]);
  const [amortizationSchedule, setAmortizationSchedule] = useState([]);

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/admin/llm-assets', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssets(data.data.assets);
        setSummary(data.data.summary);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCostBreakdown = async (assetId) => {
    try {
      const response = await fetch(`/api/admin/llm-assets/${assetId}/cost-breakdown`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCostBreakdown(data.data.cost_breakdown);
      }
    } catch (error) {
      console.error('Error fetching cost breakdown:', error);
    }
  };

  const fetchAmortizationSchedule = async (assetId) => {
    try {
      const response = await fetch(`/api/admin/llm-assets/${assetId}/amortization`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAmortizationSchedule(data.data.schedule);
      }
    } catch (error) {
      console.error('Error fetching amortization schedule:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value.toFixed(1)}%`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'production':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'development':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      case 'retired':
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Settings className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'production':
        return 'text-green-400 bg-green-400/20';
      case 'development':
        return 'text-yellow-400 bg-yellow-400/20';
      case 'retired':
        return 'text-red-400 bg-red-400/20';
      default:
        return 'text-gray-400 bg-gray-400/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">LLM Data Assets</h2>
          <p className="text-gray-400">Proper accounting implementation with GL integration</p>
        </div>
        <div className="flex space-x-2">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Database className="w-5 h-5" />
            <span>Add Asset</span>
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
            <Calculator className="w-5 h-5" />
            <span>Revalue All</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Assets</p>
              <p className="text-2xl font-bold text-white">{summary.total_assets || 0}</p>
            </div>
            <Database className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Cost Basis</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary.total_cost_basis || 0)}</p>
            </div>
            <DollarSign className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Economic Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary.total_economic_value || 0)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-400" />
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Carrying Value</p>
              <p className="text-2xl font-bold text-white">{formatCurrency(summary.total_carrying_value || 0)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <div key={asset.asset_id} className="glass-card p-6">
            {/* Asset Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <Brain className="w-6 h-6 text-blue-400" />
                <div>
                  <h3 className="text-lg font-semibold text-white">{asset.asset_name}</h3>
                  <p className="text-gray-400 text-sm">{asset.asset_type}</p>
                </div>
              </div>
              <div className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(asset.status)}`}>
                {getStatusIcon(asset.status)}
                <span className="capitalize">{asset.status}</span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Cost Basis</span>
                <span className="text-white font-medium">{formatCurrency(asset.cost_basis.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Economic Value</span>
                <span className="text-white font-medium">{formatCurrency(asset.economic_value)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 text-sm">Carrying Value</span>
                <span className="text-white font-medium">{formatCurrency(asset.carrying_value)}</span>
              </div>
              {asset.impairment_loss > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-400 text-sm">Impairment Loss</span>
                  <span className="text-red-400 font-medium">{formatCurrency(asset.impairment_loss)}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button 
                onClick={() => {
                  setSelectedAsset(asset);
                  setActiveTab('costs');
                  fetchCostBreakdown(asset.asset_id);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1"
              >
                <DollarSign className="w-4 h-4" />
                <span>Costs</span>
              </button>
              <button 
                onClick={() => {
                  setSelectedAsset(asset);
                  setActiveTab('amortization');
                  fetchAmortizationSchedule(asset.asset_id);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center space-x-1"
              >
                <Calculator className="w-4 h-4" />
                <span>Schedule</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Explanation Paragraph */}
      <div className="glass-card p-6 rounded-lg shadow-xl border border-blue-500/20 bg-blue-500/5">
        <div className="flex items-start space-x-4">
          <FileText className="w-6 h-6 text-blue-400 mt-1" />
          <div>
            <h4 className="text-white font-semibold mb-4 text-lg">Understanding Our LLM Data Assets Portfolio</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              This section provides a comprehensive financial overview of our Large Language Model (LLM) data assets, 
              integrating directly with our General Ledger for accurate accounting. We currently track <span className="text-blue-400 font-semibold">{summary.total_assets || 0} distinct LLM assets</span>, 
              including our core AI model, merchant mapping system, and transaction dataset. The Cost Basis of <span className="text-green-400 font-semibold">{formatCurrency(summary.total_cost_basis || 0)}</span> represents the total capitalized investment in developing and acquiring these assets, including data acquisition, 
              AI training costs, and ML staff salaries.               The Economic Value of <span className="text-purple-400 font-semibold">{formatCurrency(summary.total_economic_value || 0)}</span> reflects the estimated current worth of these assets, dynamically calculated based on their real-world performance, 
              such as the volume of processed mappings and their contribution to business value (e.g., churn reduction, API monetization). 
              <span className="text-cyan-400 font-semibold">The formula is: Total Mappings × $0.072 per transaction</span>, where $0.072 represents the combined value from churn reduction ($0.025), API monetization ($0.020), and investment trigger fees ($0.027).
              Finally, the Carrying Value of <span className="text-yellow-400 font-semibold">{formatCurrency(summary.total_carrying_value || 0)}</span> is the net book value of these assets on our balance sheet, which is the Cost Basis less accumulated amortization. 
              This value systematically decreases over the assets' estimated useful lives, reflecting their consumption and ensuring compliance with accounting standards. 
              The current ROI of <span className={`font-semibold ${(summary.total_carrying_value || 0) < (summary.total_cost_basis || 0) ? 'text-red-400' : 'text-green-400'}`}>
                {summary.total_cost_basis > 0 ? (((summary.total_carrying_value || 0) - (summary.total_cost_basis || 0)) / (summary.total_cost_basis || 1) * 100).toFixed(1) : 0}%
              </span> indicates the return on our AI investment, with negative values expected during early amortization periods as we build toward profitability.
            </p>
          </div>
        </div>
      </div>

      {/* Asset Detail Modal */}
      {selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="glass-card p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">{selectedAsset.asset_name}</h3>
              <button 
                onClick={() => setSelectedAsset(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === 'overview' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => {
                  setActiveTab('costs');
                  fetchCostBreakdown(selectedAsset.asset_id);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === 'costs' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Cost Breakdown
              </button>
              <button
                onClick={() => {
                  setActiveTab('amortization');
                  fetchAmortizationSchedule(selectedAsset.asset_id);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  activeTab === 'amortization' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Amortization
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Valuation Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Cost Basis</span>
                        <span className="text-white">{formatCurrency(selectedAsset.cost_basis.total)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Economic Value</span>
                        <span className="text-white">{formatCurrency(selectedAsset.economic_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amortized Value</span>
                        <span className="text-white">{formatCurrency(selectedAsset.amortized_value)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Carrying Value</span>
                        <span className="text-white font-semibold">{formatCurrency(selectedAsset.carrying_value)}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Cost Breakdown</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedAsset.cost_basis.breakdown).map(([type, amount]) => (
                        <div key={type} className="flex justify-between">
                          <span className="text-gray-400 capitalize">{type.replace('_', ' ')}</span>
                          <span className="text-white">{formatCurrency(amount)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'costs' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Cost Breakdown by GL Account</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left text-gray-400 py-2">Cost Type</th>
                        <th className="text-left text-gray-400 py-2">GL Account</th>
                        <th className="text-left text-gray-400 py-2">Description</th>
                        <th className="text-right text-gray-400 py-2">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {costBreakdown.map((cost, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="text-white py-2 capitalize">{cost.cost_type.replace('_', ' ')}</td>
                          <td className="text-white py-2">{cost.gl_account}</td>
                          <td className="text-gray-400 py-2">{cost.description}</td>
                          <td className="text-white py-2 text-right">{formatCurrency(cost.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'amortization' && (
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">Amortization Schedule</h4>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left text-gray-400 py-2">Period</th>
                        <th className="text-left text-gray-400 py-2">Start Date</th>
                        <th className="text-left text-gray-400 py-2">End Date</th>
                        <th className="text-right text-gray-400 py-2">Amortization</th>
                        <th className="text-right text-gray-400 py-2">Remaining Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {amortizationSchedule.map((period, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="text-white py-2">{period.period}</td>
                          <td className="text-white py-2">{period.period_start}</td>
                          <td className="text-white py-2">{period.period_end}</td>
                          <td className="text-white py-2 text-right">{formatCurrency(period.amortization_expense)}</td>
                          <td className="text-white py-2 text-right">{formatCurrency(period.remaining_value)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LLMDataAssetsProper;
