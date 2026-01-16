"""
Rule-Based Fallback System for Merchant Mapping
Use this as a temporary solution until AI processing is fully implemented
"""

import re
from typing import Dict, Optional, Tuple
from datetime import datetime

class RuleBasedMappingProcessor:
    """
    Simple rule-based system for merchant mapping analysis.
    This provides immediate functionality while AI system is being built.
    """
    
    # Merchant to Ticker mapping database
    MERCHANT_TICKER_MAP = {
        # Retail
        'walmart': 'WMT',
        'target': 'TGT',
        'costco': 'COST',
        'amazon': 'AMZN',
        'apple store': 'AAPL',
        'apple': 'AAPL',
        'microsoft store': 'MSFT',
        'microsoft': 'MSFT',
        'google': 'GOOGL',
        'netflix': 'NFLX',
        'spotify': 'SPOT',
        'starbucks': 'SBUX',
        'mcdonalds': 'MCD',
        'nike': 'NKE',
        'foot locker': 'FL',
        'footlocker': 'FL',
        'dicks sporting goods': 'DKS',
        'dicks': 'DKS',
        'burlington': 'BURL',
        'charter': 'CHTR',
        'spectrum': 'CHTR',
        'estee lauder': 'EL',
        'macy': 'M',
        'macys': 'M',
        'chipotle': 'CMG',
        'disney': 'DIS',
        'tesla': 'TSLA',
        'meta': 'META',
        'facebook': 'META',
        'nvidia': 'NVDA',
        'adobe': 'ADBE',
        'salesforce': 'CRM',
        'paypal': 'PYPL',
        'intel': 'INTC',
        'amd': 'AMD',
        'oracle': 'ORCL',
        'ibm': 'IBM',
        'cisco': 'CSCO',
        'jpmorgan': 'JPM',
        'bank of america': 'BAC',
        'wells fargo': 'WFC',
        'goldman sachs': 'GS',
        'visa': 'V',
        'mastercard': 'MA',
        'johnson & johnson': 'JNJ',
        'pfizer': 'PFE',
        'unitedhealth': 'UNH',
        'home depot': 'HD',
        'lowes': 'LOW',
        'coca-cola': 'KO',
        'pepsi': 'PEP',
        'yum': 'YUM',
    }
    
    # Category to likely tickers
    CATEGORY_TICKER_HINTS = {
        'retail': ['WMT', 'TGT', 'COST', 'AMZN'],
        'technology': ['AAPL', 'MSFT', 'GOOGL', 'META', 'NVDA'],
        'restaurant': ['MCD', 'SBUX', 'CMG', 'YUM'],
        'entertainment': ['NFLX', 'DIS', 'SPOT'],
        'apparel': ['NKE', 'FL', 'DKS'],
        'financial': ['JPM', 'BAC', 'WFC', 'GS', 'V', 'MA'],
        'healthcare': ['JNJ', 'PFE', 'UNH'],
        'home improvement': ['HD', 'LOW'],
        'telecommunications': ['CHTR'],
        'automotive': ['TSLA'],
    }
    
    def process_mapping(self, mapping: Dict) -> Dict:
        """
        Process a merchant mapping using rule-based logic
        
        Args:
            mapping: Dictionary with merchant_name, category, ticker, etc.
            
        Returns:
            Dictionary with ai_status, ai_confidence, ai_reasoning, etc.
        """
        start_time = datetime.now()
        
        merchant_name = (mapping.get('merchant_name') or '').lower().strip()
        category = (mapping.get('category') or '').lower().strip()
        existing_ticker = (mapping.get('ticker') or '').upper().strip()
        
        # Step 1: Try exact match
        ticker, confidence, reasoning = self._exact_match(merchant_name)
        
        # Step 2: Try fuzzy match if exact match failed
        if not ticker:
            ticker, confidence, reasoning = self._fuzzy_match(merchant_name)
        
        # Step 3: Try category-based suggestion
        if not ticker:
            ticker, confidence, reasoning = self._category_match(category)
        
        # Step 4: Validate existing ticker if provided
        if existing_ticker and not ticker:
            ticker, confidence, reasoning = self._validate_ticker(existing_ticker, merchant_name, category)
        
        # Determine status based on confidence
        if ticker:
            if confidence >= 0.9:
                status = 'approved'
            elif confidence >= 0.7:
                status = 'review_required'
            else:
                status = 'uncertain'
        else:
            status = 'rejected'
            confidence = 0.0
            reasoning = f"Could not match merchant '{merchant_name}' to any known company. Manual review required."
        
        # Calculate processing time
        processing_time = int((datetime.now() - start_time).total_seconds() * 1000)
        
        return {
            'ai_attempted': True,
            'ai_status': status,
            'ai_confidence': confidence,
            'ai_reasoning': reasoning,
            'ai_model_version': 'rule-based-v1.0',
            'ai_processing_duration': processing_time,
            'ai_processing_time': datetime.now().isoformat(),
            'suggested_ticker': ticker
        }
    
    def _exact_match(self, merchant_name: str) -> Tuple[Optional[str], float, str]:
        """Try exact match in merchant database"""
        if merchant_name in self.MERCHANT_TICKER_MAP:
            ticker = self.MERCHANT_TICKER_MAP[merchant_name]
            return ticker, 0.95, f"Exact match found: '{merchant_name}' maps to {ticker}"
        return None, 0.0, ""
    
    def _fuzzy_match(self, merchant_name: str) -> Tuple[Optional[str], float, str]:
        """Try fuzzy matching (contains, similar)"""
        # Remove common words
        cleaned = re.sub(r'\b(store|shop|retail|inc|llc|corp|company)\b', '', merchant_name).strip()
        
        # Try contains match
        for merchant, ticker in self.MERCHANT_TICKER_MAP.items():
            if merchant in merchant_name or merchant_name in merchant:
                confidence = 0.85 if len(merchant) > 5 else 0.75
                return ticker, confidence, f"Fuzzy match: '{merchant_name}' contains '{merchant}' → {ticker}"
        
        # Try word-by-word matching
        words = cleaned.split()
        for word in words:
            if len(word) > 3 and word in self.MERCHANT_TICKER_MAP:
                ticker = self.MERCHANT_TICKER_MAP[word]
                return ticker, 0.80, f"Partial match: '{word}' in merchant name → {ticker}"
        
        return None, 0.0, ""
    
    def _category_match(self, category: str) -> Tuple[Optional[str], float, str]:
        """Suggest ticker based on category"""
        if category in self.CATEGORY_TICKER_HINTS:
            tickers = self.CATEGORY_TICKER_HINTS[category]
            # Return first ticker with lower confidence
            return tickers[0], 0.60, f"Category-based suggestion: '{category}' typically maps to {tickers[0]} (low confidence, review recommended)"
        return None, 0.0, ""
    
    def _validate_ticker(self, ticker: str, merchant_name: str, category: str) -> Tuple[Optional[str], float, str]:
        """Validate if existing ticker makes sense"""
        # Check if ticker is in our known list
        known_tickers = set(self.MERCHANT_TICKER_MAP.values())
        if ticker in known_tickers:
            return ticker, 0.70, f"Existing ticker {ticker} is valid, but merchant name '{merchant_name}' doesn't match exactly. Review recommended."
        return None, 0.0, ""
    
    def add_merchant_mapping(self, merchant_name: str, ticker: str):
        """Add new merchant mapping to database (for learning)"""
        self.MERCHANT_TICKER_MAP[merchant_name.lower()] = ticker.upper()
    
    def get_merchant_database_size(self) -> int:
        """Get number of merchants in database"""
        return len(self.MERCHANT_TICKER_MAP)


# Usage Example
if __name__ == "__main__":
    processor = RuleBasedMappingProcessor()
    
    # Test mapping
    test_mapping = {
        'merchant_name': 'Walmart Supercenter',
        'category': 'Retail',
        'ticker': None
    }
    
    result = processor.process_mapping(test_mapping)
    print("Result:", result)
    
    # Expected output:
    # {
    #     'ai_attempted': True,
    #     'ai_status': 'approved',
    #     'ai_confidence': 0.85,
    #     'ai_reasoning': "Fuzzy match: 'walmart supercenter' contains 'walmart' → WMT",
    #     'ai_model_version': 'rule-based-v1.0',
    #     'suggested_ticker': 'WMT'
    # }

