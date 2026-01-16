import React, { useState, useEffect, useRef } from 'react';
import { X, ExternalLink, AlertCircle, User, Search } from 'lucide-react';

const MXConnectWidget = ({ 
  onSuccess, 
  onError, 
  userType = 'user',
  isOpen = false,
  isVisible = true, // Support for Register page compatibility
  onClose,
  userGuid = null, // Support for Register page compatibility
  inline = false // If true, render inline without modal overlay (for Register page)
}) => {
  // Support both isOpen and isVisible props for backward compatibility
  // Use isOpen if provided, otherwise fall back to isVisible
  const isModalOpen = isOpen !== undefined ? isOpen : (isVisible !== undefined ? isVisible : false);
  const [widgetUrl, setWidgetUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demoStep, setDemoStep] = useState(0);
  const iframeRef = useRef(null);
  const widgetContainerRef = useRef(null);

  // Handle postMessage events from MX Connect Widget
  useEffect(() => {
    const handleMessage = (event) => {
      // Verify origin for security (adjust based on your MX environment)
      const allowedOrigins = [
        'https://connect.mx.com',
        'https://int-connect.mx.com',
        'https://connect-demo.mx.com',
        window.location.origin
      ];
      
      if (!allowedOrigins.includes(event.origin)) {
        console.warn('MX Widget: Ignoring message from unauthorized origin:', event.origin);
        return;
      }

      console.log('MX Widget Message:', event.data);

      // Handle different message types from MX Connect Widget
      if (event.data && typeof event.data === 'object') {
        const { type, payload } = event.data;

        switch (type) {
          case 'mx/connect/member_created':
          case 'mx/connect/member_updated':
            console.log('MX Widget: Member connected successfully', payload);
            if (onSuccess) {
              onSuccess({
                user_guid: payload.user_guid,
                member_guid: payload.member_guid,
                accounts: payload.accounts || []
              });
            }
            // Close modal after successful connection
            setTimeout(() => {
              if (onClose) onClose();
            }, 2000);
            break;

          case 'mx/connect/error':
            console.error('MX Widget Error:', payload);
            setError(payload.message || 'Connection failed');
            if (onError) {
              onError(payload);
            }
            break;

          case 'mx/connect/close':
            console.log('MX Widget: User closed widget');
            if (onClose) onClose();
            break;

          case 'mx/connect/loading':
            setIsLoading(true);
            break;

          case 'mx/connect/loaded':
            setIsLoading(false);
            break;

          default:
            // Handle other MX widget events
            if (payload && payload.member_guid) {
              // Member connection successful
              if (onSuccess) {
                onSuccess(payload);
              }
            }
        }
      }
    };

    if (isModalOpen) {
      window.addEventListener('message', handleMessage);
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }
  }, [isModalOpen, onSuccess, onError, onClose]);

  // Load MX widget URL when modal opens or when in inline mode
  useEffect(() => {
    // For inline mode, always try to load (or show demo)
    // For modal mode, only load when modal is open
    const shouldLoad = inline ? true : isModalOpen;
    
    if (shouldLoad && !widgetUrl) {
      // If no userGuid, skip API call and go straight to demo mode
      if (!userGuid) {
        console.log('MX Widget: No userGuid provided, using demo mode');
        setWidgetUrl('demo');
        setIsLoading(false);
      } else {
        loadWidgetUrl();
      }
    }
  }, [isModalOpen, userGuid, inline, widgetUrl]);

  // Reset widget URL when modal closes (only for modal mode, not inline)
  useEffect(() => {
    // Don't reset for inline mode - it should stay loaded
    if (!inline && !isModalOpen) {
      console.log('🔄 MX Widget: Modal closed, resetting state');
      setWidgetUrl(null);
      setDemoStep(0);
      setError(null);
      setIsLoading(false);
    }
  }, [isModalOpen, inline]);

  // Reset demo step when modal opens or when widget loads in inline mode
  useEffect(() => {
    const shouldReset = inline ? (widgetUrl === 'demo') : (isModalOpen && widgetUrl === 'demo');
    if (shouldReset) {
      setDemoStep(0);
    }
  }, [isModalOpen, widgetUrl, inline]);

  const loadWidgetUrl = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('kamioi_business_token') || 
                   localStorage.getItem('kamioi_user_token') || 
                    localStorage.getItem('kamioi_token');

        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
        const response = await fetch(`${apiBaseUrl}/api/mx/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_type: userType
        })
      });

      if (!response.ok) {
        // If endpoint doesn't exist or error, use demo mode
        if (response.status === 404 || response.status === 500) {
          console.log('MX Connect endpoint not available - using demo mode');
          // In demo mode, show a demo iframe or fallback UI
          setWidgetUrl('demo');
          setIsLoading(false);
          return;
        }
        throw new Error(`Failed to load widget: ${response.statusText}`);
      }

      const config = await response.json();
      console.log('MX Widget Config:', config);

      if (config.success && config.data) {
        // Check if we're in demo mode
        if (config.data.is_demo === true || 
            config.data.environment === 'sandbox' || 
            !config.data.widget_url ||
            config.data.widget_url === null) {
          console.log('MX Widget: Using demo mode UI');
          setWidgetUrl('demo');
        } else if (config.data.widget_url && config.data.widget_url.startsWith('http')) {
          // Use real widget URL (must be a valid HTTP URL)
          console.log('MX Widget: Using real widget URL');
          setWidgetUrl(config.data.widget_url);
        } else {
          // Invalid widget URL, use demo mode
          console.log('MX Widget: Invalid widget URL, using demo mode');
          setWidgetUrl('demo');
        }
      } else {
        // Config not successful, use demo mode
        console.log('MX Widget: Config not successful, using demo mode');
        setWidgetUrl('demo');
      }

        setIsLoading(false);
    } catch (error) {
      console.error('Error loading MX widget:', error);
      setError(error.message);
      // Fallback to demo mode
      setWidgetUrl('demo');
      setIsLoading(false);
    }
  };

  // Auto-advance connecting step
  useEffect(() => {
    if (widgetUrl === 'demo' && demoStep === 2) {
      const timer = setTimeout(() => {
        setDemoStep(3);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [widgetUrl, demoStep]);

  // Demo mode fallback UI (matches MX Connect Widget flow)
  const renderDemoMode = () => {
    const steps = [
      {
        title: 'Select your institution',
        content: (
          <div className="space-y-4">
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { name: 'Chase', logo: '🏦' },
                { name: 'Bank of America', logo: '🏛️' },
                { name: 'Wells Fargo', logo: '🏦' },
                { name: 'Citi', logo: '🏢' },
                { name: 'US Bank', logo: '🏛️' },
                { name: 'Capital One', logo: '💳' },
                { name: 'TD Bank', logo: '🏦' },
                { name: 'PNC Bank', logo: '🏛️' },
                { name: 'American Express', logo: '💳' }
              ].map((bank) => (
                <button
                  key={bank.name}
                  onClick={() => setDemoStep(1)}
                  className="p-4 bg-white/10 border border-white/20 rounded-lg hover:bg-white/20 transition-colors text-white text-sm flex flex-col items-center space-y-2"
                >
                  <span className="text-2xl">{bank.logo}</span>
                  <span>{bank.name}</span>
                </button>
              ))}
            </div>
            <div className="flex justify-center space-x-4 mt-4">
              <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">Search for your institution</button>
              <span className="text-white/40">•</span>
              <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">Add account manually</button>
            </div>
          </div>
        )
      },
      {
        title: 'Enter your credentials',
        content: (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-4">
              <button onClick={() => setDemoStep(0)} className="text-white/60 hover:text-white">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-white font-medium">Chase</span>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/80 mb-2">Username</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-2">Password</label>
                <input
                  type="password"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter password"
                />
              </div>
              <button
                onClick={() => setDemoStep(2)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
              >
                Continue
              </button>
              <button className="w-full text-blue-400 text-sm">Reset password</button>
            </div>
            <div className="flex items-center justify-center space-x-2 mt-6 text-xs text-white/60">
              <span>Data access by</span>
              <span className="font-semibold">MX</span>
            </div>
          </div>
        )
      },
      {
        title: 'Connecting to Chase',
        content: (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              <div className="w-3 h-3 bg-white/20 rounded-full"></div>
            </div>
            <p className="text-white font-medium mb-2">Syncing your information</p>
            <p className="text-white/60 text-sm">We're working on it. Stick around!</p>
          </div>
        ),
        autoAdvance: true,
        autoAdvanceDelay: 3000
      },
      {
        title: 'Success',
        content: (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Success</h3>
            <p className="text-white/80 text-center mb-6">You have successfully connected to Chase.</p>
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('✅ MX Widget: Done button clicked');
                const connectionData = {
                  user_guid: userGuid || 'demo_user',
                  member_guid: 'demo_member',
                  accounts: [{ account_id: 'demo_001', account_name: 'Chase Checking', account_type: 'checking', balance: 2500.00 }],
                  connectedAt: new Date().toISOString()
                };
                
                // Call onSuccess first
                try {
                  if (onSuccess) {
                    console.log('✅ MX Widget: Calling onSuccess with data:', connectionData);
                    await Promise.resolve(onSuccess(connectionData));
                  } else {
                    console.warn('⚠️ MX Widget: onSuccess callback not provided');
                  }
                } catch (error) {
                  console.error('❌ MX Widget: Error in onSuccess callback:', error);
                }
                
                // Always close the modal, even if onSuccess fails
                // Use requestAnimationFrame to ensure state updates are processed
                requestAnimationFrame(() => {
                  setTimeout(() => {
                    try {
                      if (onClose) {
                        console.log('✅ MX Widget: Calling onClose');
                        onClose();
                      } else {
                        console.warn('⚠️ MX Widget: onClose callback not provided');
                      }
                    } catch (error) {
                      console.error('❌ MX Widget: Error in onClose callback:', error);
                    }
                  }, 50); // Reduced delay
                });
              }}
              type="button"
              className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3 px-8 rounded-lg font-medium transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Done
            </button>
            <div className="flex items-center justify-center space-x-2 mt-6 text-xs text-white/60">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Private and secure</span>
            </div>
          </div>
        )
      }
    ];

    return (
      <div className="w-full h-full">
        {steps[demoStep].content}
      </div>
    );
  };

  // Inline mode (for Register page) - no modal overlay
  // Always render in inline mode, regardless of isModalOpen
  if (inline) {
    // For inline mode, always show the widget (don't check isModalOpen)
    return (
      <div className="w-full">
        {/* Header */}
        <div className="mb-6">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-white">
              {isLoading ? 'Loading...' : 
               widgetUrl === 'demo' ? (demoStep === 0 ? 'Select your institution' : 
                                       demoStep === 1 ? 'Enter your credentials' :
                                       demoStep === 2 ? 'Connecting to Chase' :
                                       demoStep === 3 ? 'Success' : 'Connect Your Bank') :
               'Connect Your Bank Account'}
            </h2>
          </div>
        </div>

        {/* Widget Content */}
        <div className="relative min-h-[400px]">
          {isLoading && !widgetUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-white/80">Loading connection widget...</p>
              </div>
            </div>
          )}

          {error && widgetUrl !== 'demo' && (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setWidgetUrl('demo');
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                >
                  Use Demo Mode
                </button>
              </div>
            </div>
          )}

          {widgetUrl === 'demo' && !isLoading && !error && (
            <div className="w-full">
              {renderDemoMode()}
            </div>
          )}

          {widgetUrl && widgetUrl !== 'demo' && !error && (
            <iframe
              ref={iframeRef}
              src={widgetUrl}
              className="w-full border-0 rounded-lg"
              title="MX Connect Widget"
              allow="camera; microphone"
              style={{ minHeight: '400px' }}
              onError={() => {
                console.error('MX Widget iframe failed to load');
                setError('Failed to load connection widget');
                setWidgetUrl('demo');
              }}
            />
          )}
        </div>
      </div>
    );
  }

  // Modal mode (default) - with overlay
  // Use portal-like rendering to ensure it's always on top
  // Only check isModalOpen for modal mode, not inline mode
  if (!isModalOpen) return null; // Double check before rendering
  
  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" 
      style={{ 
        zIndex: 999999, 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        bottom: 0,
        pointerEvents: 'auto'
      }}
      onClick={(e) => {
        // Close on backdrop click
        if (e.target === e.currentTarget && onClose) {
          console.log('✅ MX Widget: Backdrop clicked, closing modal');
          onClose();
        }
      }}
    >
      <div 
        ref={widgetContainerRef}
        className="bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] max-h-[700px] flex flex-col overflow-hidden"
        style={{ 
          minHeight: '550px', 
          minWidth: '320px',
          zIndex: 1000000,
          position: 'relative'
        }}
        onClick={(e) => {
          // Prevent clicks inside modal from closing it
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-semibold text-white">
            {isLoading ? 'Loading...' : 
             widgetUrl === 'demo' ? (demoStep === 0 ? 'Select your institution' : 
                                     demoStep === 1 ? 'Enter your credentials' :
                                     demoStep === 2 ? 'Connecting to Chase' :
                                     demoStep === 3 ? 'Success' : 'Connect Your Bank') :
             'Connect Your Bank Account'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Widget Container */}
        <div className="flex-1 relative overflow-hidden">
          {isLoading && !widgetUrl && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-white/80">Loading connection widget...</p>
              </div>
            </div>
          )}

          {error && widgetUrl !== 'demo' && (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div className="text-center">
                <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                <p className="text-red-400 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setWidgetUrl('demo'); // Fallback to demo mode
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg"
                >
                  Use Demo Mode
                </button>
              </div>
            </div>
          )}

          {widgetUrl === 'demo' && !isLoading && !error && (
            <div className="h-full overflow-y-auto p-6">
              {renderDemoMode()}
            </div>
          )}

          {widgetUrl && widgetUrl !== 'demo' && !error && (
            <iframe
              ref={iframeRef}
              src={widgetUrl}
              className="w-full h-full border-0"
              title="MX Connect Widget"
              allow="camera; microphone"
              style={{ minHeight: '550px' }}
              onError={() => {
                console.error('MX Widget iframe failed to load');
                setError('Failed to load connection widget');
                setWidgetUrl('demo');
              }}
            />
          )}

          {/* Fallback: Show demo mode if widget URL is invalid */}
          {widgetUrl && widgetUrl !== 'demo' && !widgetUrl.startsWith('http') && !isLoading && (
            <div className="h-full overflow-y-auto p-6">
              {renderDemoMode()}
            </div>
          )}
        </div>

        {/* Footer */}
        {widgetUrl === 'demo' && (
          <div className="p-4 border-t border-white/10 text-center">
            <p className="text-xs text-white/60">
              Demo Mode - This is a simulation of the MX Connect Widget
            </p>
            <p className="text-xs text-white/40 mt-1">
              In production, this would connect to real financial institutions
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MXConnectWidget;
