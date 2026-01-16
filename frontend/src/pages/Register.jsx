import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MXConnectWidget from '../components/auth/MXConnectWidget';

const Register = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    accountType: 'individual',
    termsAccepted: false
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMXConnect, setShowMXConnect] = useState(false);
  const [userGuid, setUserGuid] = useState(null);
  const [registrationStep, setRegistrationStep] = useState(1); // 1: Basic Info, 2: Bank Connection
  
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      if (registrationStep === 1) {
        // Step 1: Validate basic form
        if (!formData.name || !formData.email || !formData.password) {
          throw new Error('All fields are required');
        }
        
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        
        if (!formData.termsAccepted) {
          throw new Error('Please accept the terms and conditions');
        }
        
        // Create user account and move to bank connection step
        const userData = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          accountType: formData.accountType
        };
        
        const response = await fetch('/api/user/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          setUserGuid(result.userGuid);
          setRegistrationStep(2);
          setShowMXConnect(true);
          console.log('✅ User created successfully, moving to bank connection');
        } else {
          throw new Error(result.error || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('❌ Registration error:', error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMXSuccess = async (data) => {
    console.log('✅ MX Connect Success:', data);
    
    try {
      // First, get the auth token from the registration response
      // We need to get it from localStorage or from the registration API response
      const token = localStorage.getItem('kamioi_user_token') || localStorage.getItem('authToken');
      
      // Save the bank connection
      if (token) {
        const account = data.accounts && data.accounts.length > 0 ? data.accounts[0] : {};
        const connectionData = {
          institution_name: 'Chase', // From demo mode
          bank_name: 'Chase',
          account_name: account.account_name || 'Chase Checking',
          account_type: account.account_type || 'checking',
          account_id: account.account_id || 'demo_001',
          member_guid: data.member_guid || '',
          user_guid: data.user_guid || ''
        };

              const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5111'
        const saveResponse = await fetch(`${apiBaseUrl}/api/business/bank-connections`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(connectionData)
        });

        if (saveResponse.ok) {
          console.log('✅ Bank connection saved during registration');
        } else {
          console.warn('⚠️ Failed to save bank connection during registration, but continuing...');
        }
      }
      
      // Send MX data to backend to complete registration
      const response = await fetch('/api/user/auth/complete-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userGuid,
          mxData: data
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        throw new Error(result.error || 'Failed to complete registration');
      }
    } catch (error) {
      console.error('❌ MX completion error:', error);
      setError('Failed to complete bank account setup. Please try again.');
    }
  };
  
  const handleMXError = (error) => {
    console.error('❌ MX Connect Error:', error);
    setError('Failed to connect bank account. Please try again.');
    setShowMXConnect(false);
  };
  
  const handleMXClose = () => {
    console.log('🔒 MX Connect Closed');
    setShowMXConnect(false);
  };

  const handleBackToStep1 = () => {
    setRegistrationStep(1);
    setShowMXConnect(false);
    setUserGuid(null);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {registrationStep === 1 ? 'Create Your Account' : 'Connect Your Bank Account'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {registrationStep === 1 
            ? 'Start your investment journey with Kamioi' 
            : 'Link your bank account to enable round-up investing'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center ${registrationStep >= 1 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  registrationStep >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  1
                </div>
                <span className="ml-2 text-sm font-medium">Account Info</span>
              </div>
              <div className={`w-8 h-1 ${registrationStep >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              <div className={`flex items-center ${registrationStep >= 2 ? 'text-indigo-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  registrationStep >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                }`}>
                  2
                </div>
                <span className="ml-2 text-sm font-medium">Bank Connection</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Step 1: Basic Registration Form */}
          {registrationStep === 1 && (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your full name"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="mt-1">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Confirm your password"
                  />
                </div>
              </div>

              {/* Account Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Account Type
                </label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="individual"
                      name="accountType"
                      type="radio"
                      value="individual"
                      checked={formData.accountType === 'individual'}
                      onChange={handleInputChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label htmlFor="individual" className="ml-3 block text-sm font-medium text-gray-700">
                      <span className="font-semibold">Individual</span>
                      <span className="block text-xs text-gray-500">Personal finance management</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="family"
                      name="accountType"
                      type="radio"
                      value="family"
                      checked={formData.accountType === 'family'}
                      onChange={handleInputChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label htmlFor="family" className="ml-3 block text-sm font-medium text-gray-700">
                      <span className="font-semibold">Family</span>
                      <span className="block text-xs text-gray-500">Manage finances for your family</span>
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="business"
                      name="accountType"
                      type="radio"
                      value="business"
                      checked={formData.accountType === 'business'}
                      onChange={handleInputChange}
                      className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                    />
                    <label htmlFor="business" className="ml-3 block text-sm font-medium text-gray-700">
                      <span className="font-semibold">Business</span>
                      <span className="block text-xs text-gray-500">Business finance and team management</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-center">
                <input
                  id="termsAccepted"
                  name="termsAccepted"
                  type="checkbox"
                  checked={formData.termsAccepted}
                  onChange={handleInputChange}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <label htmlFor="termsAccepted" className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <a href="/terms" className="text-indigo-600 hover:text-indigo-500">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-indigo-600 hover:text-indigo-500">
                    Privacy Policy
                  </a>
                </label>
              </div>

              {/* Submit Button */}
              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating Account...' : 'Continue to Bank Connection'}
                </button>
              </div>
            </form>
          )}

          {/* Step 2: Bank Connection */}
          {registrationStep === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Account Created Successfully!</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Now let&apos;s connect your bank account to enable round-up investing.
                </p>
              </div>

              {/* MX Connect Widget */}
              <div className="border border-gray-200 rounded-lg p-4">
                <MXConnectWidget
                  userGuid={userGuid}
                  onSuccess={handleMXSuccess}
                  onError={handleMXError}
                  onClose={handleMXClose}
                  isVisible={showMXConnect}
                />
              </div>

              {/* Back Button */}
              <div>
                <button
                  type="button"
                  onClick={handleBackToStep1}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Back to Account Info
                </button>
              </div>
            </div>
          )}

          {/* Login Link */}
          {registrationStep === 1 && (
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => navigate('/login')}
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Sign in instead
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Register;