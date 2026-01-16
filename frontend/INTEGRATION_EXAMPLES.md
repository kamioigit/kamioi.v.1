# Stripe Integration Examples

## Example 1: Registration Page Integration

```jsx
// src/pages/Register.jsx (or your registration page)

import React, { useState } from 'react'
import StripeCheckout from '../components/common/StripeCheckout'

const Register = () => {
  const [selectedPlanId, setSelectedPlanId] = useState(null)
  const [billingCycle, setBillingCycle] = useState('monthly')

  // ... your existing registration form code ...

  return (
    <div>
      {/* Your registration form fields */}
      
      {/* Plan Selection */}
      <div className="mb-6">
        <h3>Select Subscription Plan</h3>
        {/* Plan selection UI */}
        <select 
          value={selectedPlanId} 
          onChange={(e) => setSelectedPlanId(e.target.value)}
        >
          <option value="">Select a plan...</option>
          <option value="1">Individual Plan - $9.99/month</option>
          <option value="2">Family Plan - $19.99/month</option>
          <option value="3">Business Plan - $49.99/month</option>
        </select>
        
        <select 
          value={billingCycle} 
          onChange={(e) => setBillingCycle(e.target.value)}
        >
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      {/* Stripe Checkout */}
      {selectedPlanId && (
        <StripeCheckout
          planId={parseInt(selectedPlanId)}
          billingCycle={billingCycle}
          buttonText="Complete Registration & Subscribe"
          onSuccess={() => {
            // Redirect to dashboard after successful checkout
            navigate('/dashboard')
          }}
          onCancel={() => {
            // User cancelled - stay on page
            console.log('Checkout cancelled')
          }}
        />
      )}
    </div>
  )
}

export default Register
```

## Example 2: User Dashboard Settings Integration

```jsx
// src/pages/UserDashboard.jsx or src/components/user/Settings.jsx

import React from 'react'
import StripeSubscriptionManager from '../components/common/StripeSubscriptionManager'

const Settings = () => {
  return (
    <div className="settings-page">
      <h2>Account Settings</h2>
      
      {/* Subscription Section */}
      <section className="mb-8">
        <h3>Subscription</h3>
        <StripeSubscriptionManager
          onSubscriptionUpdate={(action) => {
            if (action === 'subscribe') {
              // Navigate to plans page
              navigate('/plans')
            } else {
              // Refresh subscription data
              window.location.reload()
            }
          }}
        />
      </section>

      {/* Other settings sections... */}
    </div>
  )
}

export default Settings
```

## Example 3: Subscription Plans Page

```jsx
// src/pages/SubscriptionPlans.jsx

import React, { useState, useEffect } from 'react'
import StripeCheckout from '../components/common/StripeCheckout'
import { useAuth } from '../context/AuthContext'

const SubscriptionPlans = () => {
  const { token } = useAuth()
  const [plans, setPlans] = useState([])
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [billingCycle, setBillingCycle] = useState('monthly')

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5111/api/user/subscriptions/plans', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      const data = await response.json()
      if (data.success) {
        setPlans(data.data)
      }
    } catch (err) {
      console.error('Error fetching plans:', err)
    }
  }

  return (
    <div className="subscription-plans-page">
      <h1>Choose Your Plan</h1>
      
      <div className="billing-toggle mb-6">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={billingCycle === 'monthly' ? 'active' : ''}
        >
          Monthly
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={billingCycle === 'yearly' ? 'active' : ''}
        >
          Yearly
        </button>
      </div>

      <div className="plans-grid">
        {plans.map(plan => (
          <div 
            key={plan.id} 
            className={`plan-card ${selectedPlan === plan.id ? 'selected' : ''}`}
            onClick={() => setSelectedPlan(plan.id)}
          >
            <h3>{plan.name}</h3>
            <div className="price">
              ${billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly}
              <span>/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
            </div>
            
            {plan.features && (
              <ul>
                {plan.features.map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>

      {selectedPlan && (
        <div className="checkout-section mt-8">
          <StripeCheckout
            planId={selectedPlan}
            billingCycle={billingCycle}
            buttonText="Subscribe Now"
            showPlanDetails={false}
          />
        </div>
      )}
    </div>
  )
}

export default SubscriptionPlans
```

## Example 4: Success/Cancel Route Setup

```jsx
// src/App.jsx or your router file

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SubscriptionSuccess from './pages/SubscriptionSuccess'
import SubscriptionCancel from './pages/SubscriptionCancel'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ... other routes ... */}
        
        <Route path="/subscription/success" element={<SubscriptionSuccess />} />
        <Route path="/subscription/cancel" element={<SubscriptionCancel />} />
        
        {/* ... other routes ... */}
      </Routes>
    </BrowserRouter>
  )
}
```

## API Configuration

Make sure your components use the correct backend URL. Update if needed:

```jsx
// In StripeCheckout.jsx and StripeSubscriptionManager.jsx
// Change this line if your backend runs on different port:
const API_BASE_URL = 'http://127.0.0.1:5111'
// Or use environment variable:
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5111'
```

## Customization

### Custom Button Styling
```jsx
<StripeCheckout
  planId={planId}
  className="my-custom-class"
  buttonText="Start Free Trial"
/>
```

### Hide Plan Details
```jsx
<StripeCheckout
  planId={planId}
  showPlanDetails={false}
  // Plan details already shown elsewhere
/>
```

### Custom Callbacks
```jsx
<StripeCheckout
  planId={planId}
  onSuccess={() => {
    // Custom success handling
    showNotification('Subscription activated!')
    trackEvent('subscription_created')
    navigate('/dashboard')
  }}
  onCancel={() => {
    // Custom cancel handling
    showNotification('Subscription cancelled')
  }}
/>
```


