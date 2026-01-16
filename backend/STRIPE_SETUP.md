# Stripe Integration Setup Guide

## ✅ Completed Backend Setup

The Stripe integration backend is now complete! Here's what has been implemented:

### Files Created:
1. **`services/stripe_service.py`** - Stripe service for API operations
2. **`api/stripe_endpoints.py`** - API endpoints for checkout and webhooks
3. **`.env`** - Stripe API keys added (test mode by default)

### API Endpoints Available:

#### 1. Get Stripe Config
```
GET /api/stripe/config
```
Returns the publishable key for frontend use.

#### 2. Create Checkout Session
```
POST /api/stripe/create-checkout-session
Body: {
  "plan_id": 1,
  "billing_cycle": "monthly" // or "yearly"
}
```
Creates a Stripe Checkout session and returns the checkout URL.

#### 3. Create Portal Session
```
POST /api/stripe/create-portal-session
```
Creates a Customer Portal session for subscription management.

#### 4. Webhook Handler
```
POST /api/stripe/webhook
```
Handles Stripe webhook events (payments, cancellations, etc.)

## 🔧 Required Database Changes

You need to add these columns to your database:

### Add to `users` table:
```sql
ALTER TABLE users ADD COLUMN stripe_customer_id TEXT;
```

### Add to `user_subscriptions` table:
```sql
ALTER TABLE user_subscriptions ADD COLUMN stripe_subscription_id TEXT;
```

## 🔐 Webhook Setup (IMPORTANT!)

### 1. Get Webhook Secret from Stripe Dashboard:
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Set endpoint URL to: `https://your-domain.com/api/stripe/webhook`
4. Select events to listen for:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.deleted`
   - `customer.subscription.updated`
5. Copy the "Signing secret" (starts with `whsec_...`)
6. Add it to `.env`:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 2. For Local Development:
Use Stripe CLI to forward webhooks:
```bash
stripe listen --forward-to localhost:5000/api/stripe/webhook
```
This will give you a webhook signing secret - add it to `.env`

## 📝 Environment Variables

Make sure these are in your `.env` file:
```env
STRIPE_SECRET_KEY_TEST=sk_test_...
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_...
STRIPE_SECRET_KEY_LIVE=sk_live_...
STRIPE_PUBLISHABLE_KEY_LIVE=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_MODE=test  # Change to 'live' for production
FRONTEND_URL=http://localhost:3764  # Your frontend URL
```

## 🎯 How It Works

1. **User subscribes**: Frontend calls `/api/stripe/create-checkout-session`
2. **Stripe Checkout**: User completes payment on Stripe's hosted page
3. **Webhook**: Stripe sends webhook to `/api/stripe/webhook`
4. **Database Update**: System updates subscription status
5. **Journal Entry**: Automatic accounting entry created (DR Cash, CR Deferred Revenue)

## 📊 Journal Entries

The system automatically creates journal entries:
- **Initial Payment**: DR Cash (10100) / CR Deferred Revenue (23010/23020/23030)
- **Renewals**: Same entry structure
- **Reference Format**: `STRIPE-{subscription_id}-{date}`

## 🚀 Next Steps

1. Add database columns (see above)
2. Set up webhook endpoint in Stripe Dashboard
3. Add webhook secret to `.env`
4. Test with Stripe test cards
5. Implement frontend checkout UI (see frontend integration guide)

## 🧪 Testing

Use Stripe test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0027 6000 3184`

Any expiry date in the future, any CVC, any ZIP.

## ⚠️ Security Notes

1. **Never commit `.env` file** - It contains secret keys
2. **Rotate keys** if they're exposed
3. **Use test mode** for development
4. **Webhook signature verification** is enabled (when secret is set)


