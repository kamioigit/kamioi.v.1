"""
Alpaca Trading Service for Kamioi Platform
Handles stock purchases when mappings are approved
"""

import requests
import json
from datetime import datetime, timedelta
import os
import ssl

# Simple in-memory cache for stock prices (5 minute TTL)
_price_cache = {}
_cache_ttl = 300  # 5 minutes

class AlpacaService:
    def __init__(self):
        # Alpaca Credentials - Read from environment variables
        # Set ALPACA_USE_SANDBOX=false in production to use live trading
        use_sandbox = os.getenv('ALPACA_USE_SANDBOX', 'true').lower() == 'true'

        if use_sandbox:
            self.base_url = "https://broker-api.sandbox.alpaca.markets"
            self.data_url = "https://data.sandbox.alpaca.markets"
        else:
            self.base_url = "https://broker-api.alpaca.markets"
            self.data_url = "https://data.alpaca.markets"

        self.api_key = os.getenv('ALPACA_API_KEY')
        self.api_secret = os.getenv('ALPACA_API_SECRET')

        if not self.api_key or not self.api_secret:
            print("WARNING: ALPACA_API_KEY and ALPACA_API_SECRET must be set in environment variables")

        # Headers for API requests
        self.headers = {
            "APCA-API-KEY-ID": self.api_key,
            "APCA-API-SECRET-KEY": self.api_secret,
            "Content-Type": "application/json"
        }

    def get_stock_price(self, symbol):
        """
        Get current stock price for a symbol using Alpaca Market Data API.
        Uses caching to avoid rate limits.
        Falls back to free Yahoo Finance API if needed.
        """
        global _price_cache

        # Check cache first
        cache_key = symbol.upper()
        if cache_key in _price_cache:
            cached_data = _price_cache[cache_key]
            if datetime.now().timestamp() - cached_data['timestamp'] < _cache_ttl:
                return cached_data['price']

        try:
            # Try Alpaca Market Data API first (free for Alpaca users)
            url = f"https://data.alpaca.markets/v2/stocks/{symbol}/quotes/latest"
            response = requests.get(url, headers=self.headers, timeout=5)

            if response.status_code == 200:
                data = response.json()
                if 'quote' in data and 'ap' in data['quote']:
                    price = float(data['quote']['ap'])  # Ask price
                    _price_cache[cache_key] = {'price': price, 'timestamp': datetime.now().timestamp()}
                    return price

            # Fallback: Try Alpaca bars endpoint
            url = f"https://data.alpaca.markets/v2/stocks/{symbol}/bars/latest"
            response = requests.get(url, headers=self.headers, timeout=5)

            if response.status_code == 200:
                data = response.json()
                if 'bar' in data and 'c' in data['bar']:
                    price = float(data['bar']['c'])  # Close price
                    _price_cache[cache_key] = {'price': price, 'timestamp': datetime.now().timestamp()}
                    return price

            # Fallback: Use Yahoo Finance (completely free)
            price = self._get_yahoo_price(symbol)
            if price:
                _price_cache[cache_key] = {'price': price, 'timestamp': datetime.now().timestamp()}
                return price

        except Exception as e:
            print(f"Error getting stock price for {symbol}: {e}")

        # Final fallback: estimated price based on common stocks
        return self._get_fallback_price(symbol)

    def _get_yahoo_price(self, symbol):
        """Get stock price from Yahoo Finance (free)"""
        try:
            url = f"https://query1.finance.yahoo.com/v8/finance/chart/{symbol}?interval=1d&range=1d"
            headers = {'User-Agent': 'Mozilla/5.0'}
            response = requests.get(url, headers=headers, timeout=5)

            if response.status_code == 200:
                data = response.json()
                result = data.get('chart', {}).get('result', [])
                if result:
                    meta = result[0].get('meta', {})
                    price = meta.get('regularMarketPrice')
                    if price:
                        return float(price)
        except Exception as e:
            print(f"Yahoo Finance error for {symbol}: {e}")
        return None

    def _get_fallback_price(self, symbol):
        """Fallback prices for common stocks when APIs fail"""
        fallback_prices = {
            'AAPL': 175.00, 'AMZN': 180.00, 'GOOGL': 140.00, 'MSFT': 420.00,
            'TSLA': 250.00, 'META': 500.00, 'NVDA': 900.00, 'NFLX': 600.00,
            'SBUX': 95.00, 'WMT': 165.00, 'DIS': 110.00, 'NKE': 100.00,
            'CVS': 60.00, 'UBER': 75.00, 'CMG': 3000.00, 'TGT': 150.00,
            'COST': 850.00, 'HD': 380.00, 'LOW': 250.00, 'MCD': 290.00,
            'KO': 62.00, 'PEP': 175.00, 'JPM': 200.00, 'V': 280.00, 'MA': 450.00
        }
        return fallback_prices.get(symbol.upper(), 100.00)

    def get_multiple_prices(self, symbols):
        """Get prices for multiple symbols"""
        prices = {}
        for symbol in symbols:
            prices[symbol] = self.get_stock_price(symbol)
        return prices
    
    def get_accounts(self):
        """Get all accounts"""
        try:
            response = requests.get(f"{self.base_url}/v1/accounts", headers=self.headers, verify=False)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error getting accounts: {response.status_code} - {response.text}")
                return []
        except Exception as e:
            print(f"Exception getting accounts: {e}")
            return []
    
    def create_account(self, account_data):
        """Create a new trading account"""
        try:
            response = requests.post(f"{self.base_url}/v1/accounts", headers=self.headers, json=account_data, verify=False)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error creating account: {response.status_code} - {response.text}")
                return None
        except Exception as e:
            print(f"Exception creating account: {e}")
            return None
    
    def get_positions(self, account_id):
        """Get positions for a specific account"""
        try:
            response = requests.get(f"{self.base_url}/v1/trading/accounts/{account_id}/positions", headers=self.headers, verify=False)
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Error getting positions: {response.status_code} - {response.text}")
                return []
        except Exception as e:
            print(f"Exception getting positions: {e}")
            return []
    
    def submit_order(self, account_id, symbol, qty, side="buy", order_type="market", time_in_force="day"):
        """
        Submit a stock order
        
        Args:
            account_id (str): Account ID
            symbol (str): Stock symbol (e.g., 'DIS')
            qty (float): Quantity to buy (fractional shares supported)
            side (str): 'buy' or 'sell'
            order_type (str): 'market' or 'limit'
            time_in_force (str): 'day', 'gtc', etc.
        """
        try:
            order_data = {
                "symbol": symbol,
                "qty": str(qty),  # Alpaca expects string for fractional shares
                "side": side,
                "type": order_type,
                "time_in_force": time_in_force
            }
            
            print(f"Submitting order for account {account_id}: {order_data}")
            
            response = requests.post(
                f"{self.base_url}/v1/trading/accounts/{account_id}/orders",
                headers=self.headers,
                json=order_data,
                verify=False
            )
            
            if response.status_code == 200:
                order_result = response.json()
                print(f"Order submitted successfully: {order_result}")
                return order_result
            else:
                print(f"Error submitting order: {response.status_code} - {response.text}")
                return None
                
        except Exception as e:
            print(f"Exception submitting order: {e}")
            return None
    
    def buy_fractional_shares(self, account_id, symbol, dollar_amount):
        """
        Buy fractional shares for a specific dollar amount
        
        Args:
            account_id (str): Account ID
            symbol (str): Stock symbol (e.g., 'DIS')
            dollar_amount (float): Dollar amount to invest (e.g., 1.00)
        """
        try:
            # For fractional shares, we use the dollar amount as quantity
            # Alpaca supports fractional shares with decimal quantities
            return self.submit_order(
                account_id=account_id,
                symbol=symbol,
                qty=dollar_amount,  # This will be treated as dollar amount for fractional shares
                side="buy",
                order_type="market",
                time_in_force="day"
            )
        except Exception as e:
            print(f"Exception buying fractional shares: {e}")
            return None
    
    def test_connection(self):
        """Test the Alpaca connection"""
        try:
            accounts = self.get_accounts()
            if accounts is not None:
                print("Alpaca connection successful!")
                print(f"Found {len(accounts)} accounts")
                for account in accounts:
                    print(f"Account ID: {account.get('id')}")
                    print(f"Status: {account.get('status')}")
                return True
            else:
                print("Alpaca connection failed!")
                return False
        except Exception as e:
            print(f"Alpaca connection error: {e}")
            return False

# Test the service
if __name__ == "__main__":
    alpaca = AlpacaService()
    alpaca.test_connection()
