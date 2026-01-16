"""
Stock API Manager for Kamioi Platform
Handles real-time stock price data from external APIs
"""

import requests
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import os
from dotenv import load_dotenv

load_dotenv()

class StockAPIManager:
    def __init__(self):
        # API configurations
        self.alpha_vantage_key = os.getenv('ALPHA_VANTAGE_API_KEY', 'demo')
        self.finnhub_key = os.getenv('FINNHUB_API_KEY', 'demo')
        self.polygon_key = os.getenv('POLYGON_API_KEY', 'demo')
        
        # Rate limiting
        self.rate_limits = {
            'alpha_vantage': {'calls_per_minute': 5, 'last_call': 0},
            'finnhub': {'calls_per_minute': 60, 'last_call': 0},
            'polygon': {'calls_per_minute': 5, 'last_call': 0}
        }
        
        # Cache for stock prices
        self.price_cache = {}
        self.cache_duration = 60  # 1 minute cache
        
        # Company name to ticker mapping
        self.company_mapping = {
            'apple': 'AAPL',
            'microsoft': 'MSFT',
            'google': 'GOOGL',
            'amazon': 'AMZN',
            'tesla': 'TSLA',
            'meta': 'META',
            'netflix': 'NFLX',
            'nvidia': 'NVDA',
            'starbucks': 'SBUX',
            'target': 'TGT',
            'walmart': 'WMT',
            'mcdonalds': 'MCD',
            'coca cola': 'KO',
            'pepsi': 'PEP',
            'disney': 'DIS',
            'nike': 'NKE',
            'adobe': 'ADBE',
            'salesforce': 'CRM',
            'oracle': 'ORCL',
            'intel': 'INTC'
        }
    
    def _check_rate_limit(self, api_name: str) -> bool:
        """Check if we can make an API call based on rate limits"""
        current_time = time.time()
        rate_limit = self.rate_limits[api_name]
        
        if current_time - rate_limit['last_call'] >= 60:  # Reset after 1 minute
            rate_limit['last_call'] = current_time
            return True
        
        return False
    
    def _update_rate_limit(self, api_name: str):
        """Update the last call time for rate limiting"""
        self.rate_limits[api_name]['last_call'] = time.time()
    
    def _is_cache_valid(self, ticker: str) -> bool:
        """Check if cached price is still valid"""
        if ticker not in self.price_cache:
            return False
        
        cache_time = self.price_cache[ticker]['timestamp']
        return (datetime.utcnow() - cache_time).seconds < self.cache_duration
    
    def get_stock_price_alpha_vantage(self, ticker: str) -> Optional[Dict]:
        """Get stock price from Alpha Vantage API"""
        if not self._check_rate_limit('alpha_vantage'):
            return None
        
        try:
            url = f"https://www.alphavantage.co/query"
            params = {
                'function': 'GLOBAL_QUOTE',
                'symbol': ticker,
                'apikey': self.alpha_vantage_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if 'Global Quote' in data:
                quote = data['Global Quote']
                price_data = {
                    'ticker': ticker,
                    'price': float(quote.get('05. price', 0)),
                    'change': float(quote.get('09. change', 0)),
                    'change_percent': quote.get('10. change percent', '0%').replace('%', ''),
                    'volume': int(quote.get('06. volume', 0)),
                    'high': float(quote.get('03. high', 0)),
                    'low': float(quote.get('04. low', 0)),
                    'open': float(quote.get('02. open', 0)),
                    'timestamp': datetime.utcnow(),
                    'source': 'alpha_vantage'
                }
                
                # Cache the result
                self.price_cache[ticker] = price_data
                self._update_rate_limit('alpha_vantage')
                
                return price_data
            
        except Exception as e:
            print(f"Alpha Vantage API error for {ticker}: {e}")
        
        return None
    
    def get_stock_price_finnhub(self, ticker: str) -> Optional[Dict]:
        """Get stock price from Finnhub API"""
        if not self._check_rate_limit('finnhub'):
            return None
        
        try:
            url = f"https://finnhub.io/api/v1/quote"
            params = {
                'symbol': ticker,
                'token': self.finnhub_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if 'c' in data:  # Current price
                price_data = {
                    'ticker': ticker,
                    'price': float(data.get('c', 0)),
                    'change': float(data.get('d', 0)),
                    'change_percent': float(data.get('dp', 0)),
                    'high': float(data.get('h', 0)),
                    'low': float(data.get('l', 0)),
                    'open': float(data.get('o', 0)),
                    'previous_close': float(data.get('pc', 0)),
                    'timestamp': datetime.utcnow(),
                    'source': 'finnhub'
                }
                
                # Cache the result
                self.price_cache[ticker] = price_data
                self._update_rate_limit('finnhub')
                
                return price_data
            
        except Exception as e:
            print(f"Finnhub API error for {ticker}: {e}")
        
        return None
    
    def get_stock_price_polygon(self, ticker: str) -> Optional[Dict]:
        """Get stock price from Polygon API"""
        if not self._check_rate_limit('polygon'):
            return None
        
        try:
            url = f"https://api.polygon.io/v2/aggs/ticker/{ticker}/prev"
            params = {
                'adjusted': 'true',
                'apikey': self.polygon_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if 'results' in data and len(data['results']) > 0:
                result = data['results'][0]
                price_data = {
                    'ticker': ticker,
                    'price': float(result.get('c', 0)),  # Close price
                    'change': float(result.get('c', 0)) - float(result.get('o', 0)),
                    'change_percent': ((float(result.get('c', 0)) - float(result.get('o', 0))) / float(result.get('o', 1))) * 100,
                    'volume': int(result.get('v', 0)),
                    'high': float(result.get('h', 0)),
                    'low': float(result.get('l', 0)),
                    'open': float(result.get('o', 0)),
                    'timestamp': datetime.utcnow(),
                    'source': 'polygon'
                }
                
                # Cache the result
                self.price_cache[ticker] = price_data
                self._update_rate_limit('polygon')
                
                return price_data
            
        except Exception as e:
            print(f"Polygon API error for {ticker}: {e}")
        
        return None
    
    def get_stock_price(self, ticker: str) -> Optional[Dict]:
        """Get stock price from the best available API"""
        # Check cache first
        if self._is_cache_valid(ticker):
            cached_data = self.price_cache[ticker].copy()
            cached_data['cached'] = True
            return cached_data
        
        # Try APIs in order of preference
        apis = [
            self.get_stock_price_finnhub,
            self.get_stock_price_alpha_vantage,
            self.get_stock_price_polygon
        ]
        
        for api_func in apis:
            try:
                result = api_func(ticker)
                if result:
                    return result
            except Exception as e:
                print(f"API call failed: {e}")
                continue
        
        # If all APIs fail, return mock data
        return self.get_mock_stock_price(ticker)
    
    def get_mock_stock_price(self, ticker: str) -> Dict:
        """Get mock stock price data for testing"""
        # Mock prices for common stocks
        mock_prices = {
            'AAPL': {'price': 175.50, 'change': 2.30, 'change_percent': 1.33},
            'MSFT': {'price': 378.85, 'change': -1.20, 'change_percent': -0.32},
            'GOOGL': {'price': 142.30, 'change': 0.85, 'change_percent': 0.60},
            'AMZN': {'price': 155.75, 'change': 3.25, 'change_percent': 2.13},
            'TSLA': {'price': 248.90, 'change': -5.40, 'change_percent': -2.12},
            'META': {'price': 485.20, 'change': 8.75, 'change_percent': 1.83},
            'NFLX': {'price': 612.45, 'change': 12.30, 'change_percent': 2.05},
            'NVDA': {'price': 875.30, 'change': 15.60, 'change_percent': 1.82},
            'SBUX': {'price': 98.45, 'change': 0.75, 'change_percent': 0.77},
            'TGT': {'price': 145.20, 'change': -2.10, 'change_percent': -1.43}
        }
        
        if ticker in mock_prices:
            data = mock_prices[ticker]
        else:
            # Generate random mock data for unknown tickers
            import random
            base_price = random.uniform(10, 500)
            change = random.uniform(-10, 10)
            data = {
                'price': round(base_price, 2),
                'change': round(change, 2),
                'change_percent': round((change / base_price) * 100, 2)
            }
        
        return {
            'ticker': ticker,
            'price': data['price'],
            'change': data['change'],
            'change_percent': data['change_percent'],
            'volume': 1000000,
            'high': data['price'] + abs(data['change']),
            'low': data['price'] - abs(data['change']),
            'open': data['price'] - data['change'],
            'timestamp': datetime.utcnow(),
            'source': 'mock',
            'cached': False
        }
    
    def lookup_ticker(self, company_name: str) -> Optional[str]:
        """Look up stock ticker from company name"""
        company_name_lower = company_name.lower().strip()
        
        # Direct mapping
        if company_name_lower in self.company_mapping:
            return self.company_mapping[company_name_lower]
        
        # Partial matching
        for company, ticker in self.company_mapping.items():
            if company in company_name_lower or company_name_lower in company:
                return ticker
        
        # Try to find ticker using external API
        try:
            # Use Finnhub search API
            url = "https://finnhub.io/api/v1/search"
            params = {
                'q': company_name,
                'token': self.finnhub_key
            }
            
            response = requests.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            
            if 'result' in data and len(data['result']) > 0:
                # Return the first result
                return data['result'][0].get('symbol')
                
        except Exception as e:
            print(f"Ticker lookup error for {company_name}: {e}")
        
        return None
    
    def get_multiple_stock_prices(self, tickers: List[str]) -> Dict[str, Dict]:
        """Get stock prices for multiple tickers"""
        results = {}
        
        for ticker in tickers:
            try:
                price_data = self.get_stock_price(ticker)
                if price_data:
                    results[ticker] = price_data
            except Exception as e:
                print(f"Error getting price for {ticker}: {e}")
                results[ticker] = self.get_mock_stock_price(ticker)
        
        return results
    
    def get_market_summary(self) -> Dict:
        """Get market summary with major indices"""
        major_indices = ['SPY', 'QQQ', 'DIA', 'IWM']  # S&P 500, NASDAQ, Dow, Russell 2000
        
        summary = {
            'timestamp': datetime.utcnow().isoformat(),
            'indices': {},
            'market_status': 'open' if self._is_market_open() else 'closed'
        }
        
        for index in major_indices:
            try:
                price_data = self.get_stock_price(index)
                if price_data:
                    summary['indices'][index] = {
                        'price': price_data['price'],
                        'change': price_data['change'],
                        'change_percent': price_data['change_percent']
                    }
            except Exception as e:
                print(f"Error getting market summary for {index}: {e}")
        
        return summary
    
    def _is_market_open(self) -> bool:
        """Check if US stock market is currently open"""
        now = datetime.utcnow()
        # Convert to EST (UTC-5) or EDT (UTC-4)
        # Simple approximation - market is open 9:30 AM to 4:00 PM EST
        market_open = now.replace(hour=14, minute=30, second=0, microsecond=0)  # 9:30 AM EST
        market_close = now.replace(hour=21, minute=0, second=0, microsecond=0)   # 4:00 PM EST
        
        return market_open <= now <= market_close and now.weekday() < 5  # Monday-Friday
    
    def get_api_status(self) -> Dict:
        """Get status of all APIs"""
        status = {
            'timestamp': datetime.utcnow().isoformat(),
            'apis': {
                'alpha_vantage': {
                    'available': bool(self.alpha_vantage_key and self.alpha_vantage_key != 'demo'),
                    'rate_limit': self.rate_limits['alpha_vantage']
                },
                'finnhub': {
                    'available': bool(self.finnhub_key and self.finnhub_key != 'demo'),
                    'rate_limit': self.rate_limits['finnhub']
                },
                'polygon': {
                    'available': bool(self.polygon_key and self.polygon_key != 'demo'),
                    'rate_limit': self.rate_limits['polygon']
                }
            },
            'cache': {
                'entries': len(self.price_cache),
                'duration_minutes': self.cache_duration
            }
        }
        
        return status

# Global stock API manager instance
stock_api_manager = StockAPIManager()
