# Stripe Frontend Integration Guide

## Installation

### Step 1: Install Stripe.js
```bash
cd frontend
npm install @stripe/stripe-js
```

## Components Created

### 1. StripeCheckout Component
**Location:** `src/components/common/StripeCheckout.jsx`

**Usage:** For registration page and subscription purchase

**Props:**
- `planId` (required) - The subscription plan ID
- `billingCycle` (optional) - 'monthly' or 'yearly' (default: 'monthly')
- `onSuccess` (optional) - Callback when checkout succeeds
- `onCancel` (optional) - Callback when checkout is cancelled
- `buttonText` (optional) - Custom button text (default: 'Subscribe Now')
- `className` (optional) - Additional CSS classes
- `showPlanDetails` (optional) - Show plan details (default: true)

**Example Usage:**
```jsx
import StripeCheckout from '../components/common/StripeCheckout'

// In registration page
<StripeCheckout
  planId={selectedPlanId}
  billingCycle="monthly"
  buttonText="Complete Registration"
  onSuccess={() => {
    // Redirect to dashboard
    navigate('/dashboard')
  }}
/>
```

### 2. StripeSubscriptionManager Component
**Location:** `src/components/common/StripeSubscriptionManager.jsx`

**Usage:** For user dashboard settings page

**Props:**
- `onSubscriptionUpdate` (optional) - Callback when subscription changes

**Example Usage:**
```jsx
import StripeSubscriptionManager from '../components/common/StripeSubscriptionManager'

// In user settings page
<StripeSubscriptionManager
  onSubscriptionUpdate={(action) => {
    if (action === 'subscribe') {
      // Navigate to plans page
      navigate('/plans')
    }
  }}
/>
```

## Integration Steps

### Registration Page Integration

1. **Import the component:**
```jsx
import StripeCheckout from '../components/common/StripeCheckout'
```

2. **Add to registration form:**
```jsx
// After user selects a plan
{selectedPlanId && (
  <StripeCheckout
    planId={selectedPlanId}
    billingCycle={billingCycle}
    buttonText="Complete Registration"
    onSuccess={() => {
      // Handle successful registration
      navigate('/dashboard')
    }}
  />
)}
```

### User Dashboard Settings Integration

1. **Import the component:**
```jsx
import StripeSubscriptionManager from '../components/common/StripeSubscriptionManager'
```

2. **Add to settings page:**
```jsx
// In subscription settings section
<StripeSubscriptionManager
  onSubscriptionUpdate={(action) => {
    if (action === 'subscribe') {
      navigate('/plans')
    } else {
      // Refresh subscription data
      fetchSubscription()
    }
  }}
/>
```

## Success/Cancel Pages

### Create Success Page: `src/pages/SubscriptionSuccess.jsx`
```jsx
import React, { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { CheckCircle } from 'lucide-react'

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const sessionId = searchParams.get('session_id')

  useEffect(() => {
    // Optionally verify the session with backend
    // Then redirect to dashboard after a few seconds
    const timer = setTimeout(() => {
      navigate('/dashboard')
    }, 3000)

    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Subscription Successful!</h1>
        <p className="text-gray-400">Redirecting to dashboard...</p>
      </div>
    </div>
  )
}

export default SubscriptionSuccess
```

### Create Cancel Page: `src/pages/SubscriptionCancel.jsx`
```jsx
import React from 'react'
import { useNavigate } from 'react-router-dom'
import { XCircle } from 'lucide-react'

const SubscriptionCancel = () => {
  const navigate = useNavigate()

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <XCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Subscription Cancelled</h1>
        <p className="text-gray-400 mb-4">You can try again anytime.</p>
        <button
          onClick={() => navigate('/plans')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          View Plans
        </button>
      </div>
    </div>
  )
}

export default SubscriptionCancel
```

## API Configuration

Make sure your backend URL is correct in the components:
- Default: `http://127.0.0.1:5111`
- Update if your backend runs on a different port

## Testing

### Test Cards (Stripe Test Mode)
- **Success:** `4242 4242 4242 4242`
- **Decline:** `4000 0000 0000 0002`
- **3D Secure:** `4000 0027 6000 3184`

Any future expiry date, any CVC, any ZIP.

## Flow

1. **User selects plan** → Shows `StripeCheckout` component
2. **User clicks subscribe** → Creates checkout session via API
3. **Redirects to Stripe** → User completes payment
4. **Stripe webhook** → Backend processes payment
5. **Redirects back** → Success or Cancel page
6. **User dashboard** → `StripeSubscriptionManager` shows subscription

## Troubleshooting

### Component not loading
- Check if Stripe.js is installed: `npm list @stripe/stripe-js`
- Check browser console for errors
- Verify backend is running

### Checkout not working
- Check API endpoint is accessible
- Verify user is authenticated
- Check backend logs for errors
- Verify Stripe keys in `.env`

### Subscription not showing
- Check webhook is set up correctly
- Verify database has subscription record
- Check API endpoint returns subscription data


