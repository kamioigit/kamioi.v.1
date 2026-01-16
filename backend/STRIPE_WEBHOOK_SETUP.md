# Stripe Webhook Setup Guide

## Overview
Webhooks are how Stripe notifies your server about payment events. This guide will help you set up webhooks for both local development and production.

## Option 1: Local Development (Recommended for Testing)

### Step 1: Install Stripe CLI
Download from: https://stripe.com/docs/stripe-cli

### Step 2: Login to Stripe CLI
```bash
stripe login
```
This will open your browser to authenticate.

### Step 3: Forward Webhooks to Local Server
```bash
stripe listen --forward-to localhost:5111/api/stripe/webhook
```

### Step 4: Copy the Webhook Signing Secret
The CLI will output something like:
```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

### Step 5: Add to .env File
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

### Step 6: Restart Your Backend
Restart your Flask server to load the new webhook secret.

### Step 7: Test Webhooks
Trigger a test event:
```bash
stripe trigger checkout.session.completed
```

You should see the event in your terminal and your server should process it.

## Option 2: Production Webhook Setup

### Step 1: Deploy Your Backend
Make sure your backend is accessible at a public URL:
- Example: `https://api.yourdomain.com/api/stripe/webhook`

### Step 2: Configure Webhook in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/webhooks (or test mode: https://dashboard.stripe.com/test/webhooks)

2. Click **"Add endpoint"**

3. Enter your endpoint URL:
   ```
   https://your-domain.com/api/stripe/webhook
   ```

4. Select events to listen for:
   - ✅ `checkout.session.completed` - When user completes checkout
   - ✅ `invoice.payment_succeeded` - When subscription renews
   - ✅ `invoice.payment_failed` - When payment fails
   - ✅ `customer.subscription.deleted` - When subscription is cancelled
   - ✅ `customer.subscription.updated` - When subscription changes

5. Click **"Add endpoint"**

6. **Copy the "Signing secret"** (starts with `whsec_...`)

### Step 3: Add Webhook Secret to Production .env
```env
STRIPE_WEBHOOK_SECRET=whsec_your_production_secret_here
```

### Step 4: Restart Your Production Server
Restart to load the new webhook secret.

## Option 3: Using ngrok for Local Testing (Alternative)

If you want to test with Stripe Dashboard webhooks pointing to your local machine:

### Step 1: Install ngrok
Download from: https://ngrok.com/

### Step 2: Start Your Backend
```bash
python app.py
```

### Step 3: Start ngrok
```bash
ngrok http 5111
```

### Step 4: Copy ngrok URL
You'll get a URL like: `https://abc123.ngrok.io`

### Step 5: Configure Webhook in Stripe Dashboard
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://abc123.ngrok.io/api/stripe/webhook`
3. Select events (same as above)
4. Copy the signing secret

### Step 6: Add to .env
```env
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Testing Webhooks

### Test Events with Stripe CLI
```bash
# Test successful checkout
stripe trigger checkout.session.completed

# Test successful payment
stripe trigger invoice.payment_succeeded

# Test failed payment
stripe trigger invoice.payment_failed

# Test subscription cancellation
stripe trigger customer.subscription.deleted
```

### Test Events Manually
1. Create a test subscription in your app
2. Use test card: `4242 4242 4242 4242`
3. Complete checkout
4. Check your server logs for webhook processing

## Webhook Event Flow

1. **User completes checkout** → Stripe sends `checkout.session.completed`
   - Creates subscription in database
   - Creates journal entry (DR Cash, CR Deferred Revenue)

2. **Subscription renews** → Stripe sends `invoice.payment_succeeded`
   - Updates subscription dates
   - Creates renewal journal entry

3. **Payment fails** → Stripe sends `invoice.payment_failed`
   - Updates subscription status to `past_due`
   - Updates user status

4. **User cancels** → Stripe sends `customer.subscription.deleted`
   - Updates subscription status to `canceled`
   - Updates user status

## Troubleshooting

### Webhook Not Receiving Events
- Check webhook secret is set in `.env`
- Verify endpoint URL is correct
- Check server logs for errors
- Ensure server is running and accessible

### Signature Verification Fails
- Make sure you're using the correct webhook secret
- Test mode and Live mode have different secrets
- Restart server after changing webhook secret

### Events Not Processing
- Check server logs for errors
- Verify database columns exist (run migration)
- Check authentication/authorization
- Ensure webhook handler code is correct

## Security Notes

1. **Always verify webhook signatures** - Prevents fake events
2. **Use different secrets for test/live** - Keep them separate
3. **Never commit webhook secrets** - Add to `.env` and `.gitignore`
4. **Use HTTPS in production** - Stripe requires HTTPS for webhooks

## Next Steps

Once webhooks are set up:
1. Test with test cards
2. Monitor webhook events in Stripe Dashboard
3. Check your database for created subscriptions
4. Verify journal entries are created
5. Test subscription management in Customer Portal


