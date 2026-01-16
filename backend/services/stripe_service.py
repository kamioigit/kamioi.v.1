"""
Stripe Service
Handles Stripe subscription management, payment processing, and webhook events
"""

import os
import stripe
from datetime import datetime
from typing import Dict, Optional, List
import logging

logger = logging.getLogger(__name__)


class StripeService:
    """Service for handling Stripe operations"""
    
    def __init__(self):
        """Initialize Stripe with API keys from environment"""
        stripe_mode = os.getenv('STRIPE_MODE', 'test')
        
        if stripe_mode == 'live':
            self.secret_key = os.getenv('STRIPE_SECRET_KEY_LIVE')
            self.publishable_key = os.getenv('STRIPE_PUBLISHABLE_KEY_LIVE')
        else:
            self.secret_key = os.getenv('STRIPE_SECRET_KEY_TEST')
            self.publishable_key = os.getenv('STRIPE_PUBLISHABLE_KEY_TEST')
        
        stripe.api_key = self.secret_key
        self.mode = stripe_mode
        
    def get_publishable_key(self) -> str:
        """Get the publishable key for frontend"""
        return self.publishable_key
    
    def create_customer(self, user_id: int, email: str, name: Optional[str] = None) -> Dict:
        """Create a Stripe customer"""
        try:
            customer = stripe.Customer.create(
                email=email,
                name=name,
                metadata={
                    'user_id': str(user_id),
                    'platform': 'kamioi'
                }
            )
            return {
                'success': True,
                'customer_id': customer.id,
                'customer': customer
            }
        except Exception as e:
            logger.error(f"Error creating Stripe customer: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_or_create_customer(self, user_id: int, email: str, name: Optional[str] = None, existing_customer_id: Optional[str] = None) -> Dict:
        """Get existing customer or create new one"""
        if existing_customer_id:
            try:
                customer = stripe.Customer.retrieve(existing_customer_id)
                return {
                    'success': True,
                    'customer_id': customer.id,
                    'customer': customer
                }
            except stripe.error.StripeError:
                # Customer doesn't exist, create new one
                pass
        
        return self.create_customer(user_id, email, name)
    
    def create_checkout_session(
        self,
        customer_id: str,
        price_id: str,
        success_url: str,
        cancel_url: str,
        metadata: Optional[Dict] = None
    ) -> Dict:
        """Create a Stripe Checkout session"""
        try:
            session_params = {
                'customer': customer_id,
                'payment_method_types': ['card'],
                'mode': 'subscription',
                'line_items': [{
                    'price': price_id,
                    'quantity': 1,
                }],
                'success_url': success_url,
                'cancel_url': cancel_url,
                'subscription_data': {
                    'metadata': metadata or {}
                }
            }
            
            session = stripe.checkout.Session.create(**session_params)
            
            return {
                'success': True,
                'session_id': session.id,
                'url': session.url
            }
        except Exception as e:
            logger.error(f"Error creating checkout session: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def create_portal_session(self, customer_id: str, return_url: str) -> Dict:
        """Create a Stripe Customer Portal session for subscription management"""
        try:
            session = stripe.billing_portal.Session.create(
                customer=customer_id,
                return_url=return_url
            )
            
            return {
                'success': True,
                'url': session.url
            }
        except Exception as e:
            logger.error(f"Error creating portal session: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_subscription(self, subscription_id: str) -> Optional[Dict]:
        """Get subscription details from Stripe"""
        try:
            subscription = stripe.Subscription.retrieve(subscription_id)
            return subscription.to_dict()
        except Exception as e:
            logger.error(f"Error retrieving subscription: {str(e)}")
            return None
    
    def cancel_subscription(self, subscription_id: str, immediately: bool = False) -> Dict:
        """Cancel a Stripe subscription"""
        try:
            if immediately:
                subscription = stripe.Subscription.delete(subscription_id)
            else:
                subscription = stripe.Subscription.modify(
                    subscription_id,
                    cancel_at_period_end=True
                )
            
            return {
                'success': True,
                'subscription': subscription.to_dict()
            }
        except Exception as e:
            logger.error(f"Error canceling subscription: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def create_price(self, amount: int, currency: str = 'usd', interval: str = 'month', product_name: str = '') -> Dict:
        """Create a Stripe Price (for subscription plans)"""
        try:
            # First create or get product
            products = stripe.Product.list(limit=100)
            product = None
            for p in products:
                if p.name == product_name:
                    product = p
                    break
            
            if not product:
                product = stripe.Product.create(name=product_name)
            
            # Create price
            price = stripe.Price.create(
                unit_amount=amount,  # Amount in cents
                currency=currency,
                recurring={'interval': interval},
                product=product.id
            )
            
            return {
                'success': True,
                'price_id': price.id,
                'price': price.to_dict()
            }
        except Exception as e:
            logger.error(f"Error creating price: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def verify_webhook_signature(self, payload: bytes, signature: str, webhook_secret: str) -> Optional[Dict]:
        """Verify Stripe webhook signature"""
        try:
            event = stripe.Webhook.construct_event(
                payload, signature, webhook_secret
            )
            return event
        except ValueError as e:
            logger.error(f"Invalid payload: {str(e)}")
            return None
        except stripe.error.SignatureVerificationError as e:
            logger.error(f"Invalid signature: {str(e)}")
            return None


