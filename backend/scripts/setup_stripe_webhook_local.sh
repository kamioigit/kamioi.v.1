#!/bin/bash
# Stripe Webhook Local Setup Script for Linux/Mac
# This script helps you set up Stripe CLI for local webhook testing

echo "========================================"
echo "Stripe Webhook Local Setup"
echo "========================================"
echo ""

# Check if Stripe CLI is installed
echo "Checking for Stripe CLI..."
if ! command -v stripe &> /dev/null; then
    echo "[ERROR] Stripe CLI is not installed."
    echo ""
    echo "Please install Stripe CLI:"
    echo "  macOS: brew install stripe/stripe-cli/stripe"
    echo "  Linux: See https://stripe.com/docs/stripe-cli"
    echo ""
    exit 1
fi

echo "[OK] Stripe CLI is installed"
echo ""

# Check if logged in
echo "Checking Stripe login status..."
if ! stripe config --list &> /dev/null; then
    echo "[WARNING] Not logged in to Stripe CLI"
    echo ""
    echo "To log in, run:"
    echo "  stripe login"
    echo ""
    echo "This will open your browser to authenticate."
    echo ""
    read -p "Would you like to log in now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        stripe login
    else
        echo ""
        echo "Please log in manually with: stripe login"
        exit 1
    fi
else
    echo "[OK] Logged in to Stripe CLI"
fi

echo ""
echo "========================================"
echo "Starting Webhook Listener"
echo "========================================"
echo ""
echo "This will forward webhooks to: http://localhost:5111/api/stripe/webhook"
echo ""
echo "IMPORTANT: Keep this terminal window open while testing!"
echo "You will see webhook events in real-time."
echo ""
echo "When you see a webhook signing secret (whsec_...), copy it and:"
echo "1. Add it to your .env file: STRIPE_WEBHOOK_SECRET=whsec_..."
echo "2. Restart your backend server"
echo ""
echo "Press Ctrl+C to stop the webhook listener"
echo ""

# Start webhook listener
echo "Starting Stripe webhook listener..."
echo ""

stripe listen --forward-to localhost:5111/api/stripe/webhook


