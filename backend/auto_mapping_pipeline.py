"""
Auto-Mapping Pipeline for Kamioi Platform
Handles automatic merchant-to-ticker mapping with confidence scoring
"""

import re
import json
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any
from dataclasses import dataclass
import difflib

@dataclass
class MappingRule:
    pattern: str
    ticker: str
    merchant: str
    category: str
    confidence: float
    rule_type: str  # 'exact', 'regex', 'fuzzy', 'llm'
    created_at: str
    usage_count: int = 0

@dataclass
class MappingResult:
    ticker: str
    merchant: str
    category: str
    confidence: float
    method: str
    evidence: str
    rule_id: Optional[str] = None

class AutoMappingPipeline:
    def __init__(self):
        self.rules: List[MappingRule] = []
        self.auto_threshold = 0.92
        self.review_threshold = 0.70
        self.llm_threshold = 0.85
        
        # Initialize with common mappings
        self._initialize_common_mappings()
    
    def _initialize_common_mappings(self):
        """Initialize with common merchant-to-ticker mappings"""
        common_mappings = [
            # Food & Dining
            ("starbucks", "SBUX", "Starbucks", "Food & Dining", 0.98),
            ("mcdonald", "MCD", "McDonald's", "Food & Dining", 0.98),
            ("subway", "SBUX", "Subway", "Food & Dining", 0.95),
            ("pizza hut", "YUM", "Pizza Hut", "Food & Dining", 0.95),
            ("kfc", "YUM", "KFC", "Food & Dining", 0.95),
            ("taco bell", "YUM", "Taco Bell", "Food & Dining", 0.95),
            ("domino", "DPZ", "Domino's", "Food & Dining", 0.95),
            ("chipotle", "CMG", "Chipotle", "Food & Dining", 0.98),
            
            # Retail
            ("amazon", "AMZN", "Amazon", "Shopping", 0.98),
            ("target", "TGT", "Target", "Shopping", 0.98),
            ("walmart", "WMT", "Walmart", "Shopping", 0.98),
            ("costco", "COST", "Costco", "Warehouse Club", 0.98),
            ("best buy", "BBY", "Best Buy", "Electronics", 0.95),
            ("home depot", "HD", "Home Depot", "Home Improvement", 0.98),
            ("lowes", "LOW", "Lowe's", "Home Improvement", 0.98),
            ("nike", "NKE", "Nike", "Apparel", 0.95),
            ("adidas", "ADDYY", "Adidas", "Apparel", 0.95),
            
            # Technology
            ("apple", "AAPL", "Apple", "Technology", 0.98),
            ("google", "GOOGL", "Google", "Technology", 0.98),
            ("microsoft", "MSFT", "Microsoft", "Technology", 0.98),
            ("netflix", "NFLX", "Netflix", "Entertainment", 0.98),
            ("spotify", "SPOT", "Spotify", "Entertainment", 0.95),
            ("uber", "UBER", "Uber", "Transportation", 0.95),
            ("lyft", "LYFT", "Lyft", "Transportation", 0.95),
            ("tesla", "TSLA", "Tesla", "Automotive", 0.98),
            
            # Financial
            ("visa", "V", "Visa", "Financial", 0.98),
            ("mastercard", "MA", "Mastercard", "Financial", 0.98),
            ("paypal", "PYPL", "PayPal", "Financial", 0.95),
            ("square", "SQ", "Square", "Financial", 0.95),
            
            # Healthcare
            ("cvs", "CVS", "CVS", "Healthcare", 0.95),
            ("walgreens", "WBA", "Walgreens", "Healthcare", 0.95),
            ("rite aid", "RAD", "Rite Aid", "Healthcare", 0.90),
            
            # Energy
            ("shell", "SHEL", "Shell", "Energy", 0.95),
            ("exxon", "XOM", "Exxon", "Energy", 0.95),
            ("chevron", "CVX", "Chevron", "Energy", 0.95),
            ("bp", "BP", "BP", "Energy", 0.95),
            
            # Entertainment
            ("disney", "DIS", "Disney", "Entertainment", 0.98),
            ("hbo", "WBD", "HBO", "Entertainment", 0.90),
            ("hulu", "DIS", "Hulu", "Entertainment", 0.90),
            
            # Communication
            ("verizon", "VZ", "Verizon", "Communication", 0.95),
            ("att", "T", "AT&T", "Communication", 0.95),
            ("tmobile", "TMUS", "T-Mobile", "Communication", 0.95),
            
            # Airlines
            ("delta", "DAL", "Delta", "Airlines", 0.95),
            ("american airlines", "AAL", "American Airlines", "Airlines", 0.95),
            ("united", "UAL", "United", "Airlines", 0.95),
            ("southwest", "LUV", "Southwest", "Airlines", 0.95),
            
            # Hotels
            ("marriott", "MAR", "Marriott", "Hotels", 0.95),
            ("hilton", "HLT", "Hilton", "Hotels", 0.95),
            ("hyatt", "H", "Hyatt", "Hotels", 0.95),
        ]
        
        for merchant, ticker, canonical, category, confidence in common_mappings:
            rule = MappingRule(
                pattern=merchant,
                ticker=ticker,
                merchant=canonical,
                category=category,
                confidence=confidence,
                rule_type='exact',
                created_at=datetime.utcnow().isoformat()
            )
            self.rules.append(rule)
    
    def map_merchant(self, raw_merchant: str, user_hint: str = None) -> MappingResult:
        """Map a merchant string to a ticker symbol"""
        if not raw_merchant or not raw_merchant.strip():
            return MappingResult(
                ticker="",
                merchant="Unknown",
                category="Unknown",
                confidence=0.0,
                method="none",
                evidence="Empty merchant string"
            )
        
        raw_lower = raw_merchant.lower().strip()
        
        # Try exact match first
        exact_result = self._try_exact_match(raw_lower)
        if exact_result and exact_result.confidence >= self.auto_threshold:
            return exact_result
        
        # Try regex patterns
        regex_result = self._try_regex_match(raw_lower)
        if regex_result and regex_result.confidence >= self.auto_threshold:
            return regex_result
        
        # Try fuzzy matching
        fuzzy_result = self._try_fuzzy_match(raw_lower)
        if fuzzy_result and fuzzy_result.confidence >= self.auto_threshold:
            return fuzzy_result
        
        # Try user hint
        hint_result = None
        if user_hint:
            hint_result = self._try_user_hint(raw_lower, user_hint)
            if hint_result and hint_result.confidence >= self.review_threshold:
                return hint_result
        
        # Try LLM-based mapping (simulated)
        llm_result = self._try_llm_mapping(raw_lower)
        if llm_result and llm_result.confidence >= self.llm_threshold:
            return llm_result
        
        # Return best result or unknown
        results = [exact_result, regex_result, fuzzy_result, hint_result, llm_result]
        valid_results = [r for r in results if r and r.confidence > 0]
        
        if valid_results:
            best_result = max(valid_results, key=lambda x: x.confidence)
            return best_result
        
        return MappingResult(
            ticker="",
            merchant="Unknown",
            category="Unknown",
            confidence=0.0,
            method="none",
            evidence="No matching patterns found"
        )
    
    def _try_exact_match(self, raw_merchant: str) -> Optional[MappingResult]:
        """Try exact string matching"""
        for rule in self.rules:
            if rule.rule_type == 'exact' and rule.pattern in raw_merchant:
                rule.usage_count += 1
                return MappingResult(
                    ticker=rule.ticker,
                    merchant=rule.merchant,
                    category=rule.category,
                    confidence=rule.confidence,
                    method="exact_match",
                    evidence=f"Exact match for '{rule.pattern}'",
                    rule_id=f"rule_{rule.pattern}"
                )
        return None
    
    def _try_regex_match(self, raw_merchant: str) -> Optional[MappingResult]:
        """Try regex pattern matching"""
        for rule in self.rules:
            if rule.rule_type == 'regex':
                try:
                    if re.search(rule.pattern, raw_merchant, re.IGNORECASE):
                        rule.usage_count += 1
                        return MappingResult(
                            ticker=rule.ticker,
                            merchant=rule.merchant,
                            category=rule.category,
                            confidence=rule.confidence,
                            method="regex_match",
                            evidence=f"Regex match for pattern '{rule.pattern}'",
                            rule_id=f"rule_{rule.pattern}"
                        )
                except re.error:
                    continue
        return None
    
    def _try_fuzzy_match(self, raw_merchant: str) -> Optional[MappingResult]:
        """Try fuzzy string matching"""
        best_match = None
        best_ratio = 0.0
        
        for rule in self.rules:
            if rule.rule_type == 'exact':
                # Calculate similarity ratio
                ratio = difflib.SequenceMatcher(None, raw_merchant, rule.pattern).ratio()
                if ratio > best_ratio and ratio >= 0.8:  # 80% similarity threshold
                    best_ratio = ratio
                    best_match = rule
        
        if best_match and best_ratio >= 0.8:
            # Adjust confidence based on similarity
            adjusted_confidence = best_match.confidence * best_ratio
            best_match.usage_count += 1
            
            return MappingResult(
                ticker=best_match.ticker,
                merchant=best_match.merchant,
                category=best_match.category,
                confidence=adjusted_confidence,
                method="fuzzy_match",
                evidence=f"Fuzzy match with {best_ratio:.2%} similarity to '{best_match.pattern}'",
                rule_id=f"rule_{best_match.pattern}"
            )
        
        return None
    
    def _try_user_hint(self, raw_merchant: str, user_hint: str) -> Optional[MappingResult]:
        """Try user-provided hint"""
        if not user_hint or not user_hint.strip():
            return None
        
        hint_upper = user_hint.upper().strip()
        
        # Look for exact ticker match
        for rule in self.rules:
            if rule.ticker == hint_upper:
                return MappingResult(
                    ticker=rule.ticker,
                    merchant=rule.merchant,
                    category=rule.category,
                    confidence=0.75,  # Lower confidence for user hints
                    method="user_hint",
                    evidence=f"User suggested ticker: {hint_upper}",
                    rule_id=f"hint_{hint_upper}"
                )
        
        # If no exact match, return the hint as-is with lower confidence
        return MappingResult(
            ticker=hint_upper,
            merchant=user_hint,
            category="Unknown",
            confidence=0.60,
            method="user_hint",
            evidence=f"User suggested ticker: {hint_upper}",
            rule_id=f"hint_{hint_upper}"
        )
    
    def _try_llm_mapping(self, raw_merchant: str) -> Optional[MappingResult]:
        """Try LLM-based mapping (simulated)"""
        # This would normally call an LLM service
        # For now, we'll simulate with some intelligent pattern matching
        
        # Check for common patterns
        patterns = {
            r'\b(store|shop|market|retail)\b': ("RETAIL", "Retail Store", "Shopping", 0.70),
            r'\b(restaurant|dining|food|cafe)\b': ("FOOD", "Restaurant", "Food & Dining", 0.70),
            r'\b(gas|fuel|station)\b': ("ENERGY", "Gas Station", "Energy", 0.70),
            r'\b(hotel|inn|lodge)\b': ("HOTEL", "Hotel", "Hotels", 0.70),
            r'\b(airline|airport|flight)\b': ("AIRLINE", "Airline", "Airlines", 0.70),
        }
        
        for pattern, (ticker, merchant, category, confidence) in patterns.items():
            if re.search(pattern, raw_merchant, re.IGNORECASE):
                return MappingResult(
                    ticker=ticker,
                    merchant=merchant,
                    category=category,
                    confidence=confidence,
                    method="llm_simulation",
                    evidence=f"LLM pattern match for '{pattern}'",
                    rule_id=f"llm_{pattern}"
                )
        
        return None
    
    def add_rule(self, pattern: str, ticker: str, merchant: str, 
                 category: str, confidence: float, rule_type: str = 'exact'):
        """Add a new mapping rule"""
        rule = MappingRule(
            pattern=pattern,
            ticker=ticker,
            merchant=merchant,
            category=category,
            confidence=confidence,
            rule_type=rule_type,
            created_at=datetime.utcnow().isoformat()
        )
        self.rules.append(rule)
        print(f"✅ Added mapping rule: {pattern} -> {ticker}")
    
    def get_rule_stats(self) -> Dict[str, Any]:
        """Get statistics about mapping rules"""
        stats = {
            'total_rules': len(self.rules),
            'rule_types': {},
            'most_used': [],
            'recent_rules': []
        }
        
        # Count by rule type
        for rule in self.rules:
            rule_type = rule.rule_type
            stats['rule_types'][rule_type] = stats['rule_types'].get(rule_type, 0) + 1
        
        # Most used rules
        most_used = sorted(self.rules, key=lambda x: x.usage_count, reverse=True)[:10]
        stats['most_used'] = [
            {
                'pattern': rule.pattern,
                'ticker': rule.ticker,
                'usage_count': rule.usage_count,
                'confidence': rule.confidence
            }
            for rule in most_used
        ]
        
        # Recent rules
        recent_rules = sorted(self.rules, key=lambda x: x.created_at, reverse=True)[:10]
        stats['recent_rules'] = [
            {
                'pattern': rule.pattern,
                'ticker': rule.ticker,
                'created_at': rule.created_at,
                'rule_type': rule.rule_type
            }
            for rule in recent_rules
        ]
        
        return stats
    
    def test_mapping(self, test_merchants: List[str]) -> Dict[str, Any]:
        """Test mapping pipeline with sample merchants"""
        results = []
        
        for merchant in test_merchants:
            result = self.map_merchant(merchant)
            results.append({
                'input': merchant,
                'ticker': result.ticker,
                'merchant': result.merchant,
                'category': result.category,
                'confidence': result.confidence,
                'method': result.method,
                'evidence': result.evidence
            })
        
        # Calculate statistics
        total_tests = len(results)
        high_confidence = len([r for r in results if r['confidence'] >= self.auto_threshold])
        medium_confidence = len([r for r in results if self.review_threshold <= r['confidence'] < self.auto_threshold])
        low_confidence = len([r for r in results if r['confidence'] < self.review_threshold])
        
        return {
            'total_tests': total_tests,
            'high_confidence': high_confidence,
            'medium_confidence': medium_confidence,
            'low_confidence': low_confidence,
            'auto_mapping_rate': high_confidence / total_tests if total_tests > 0 else 0,
            'review_rate': medium_confidence / total_tests if total_tests > 0 else 0,
            'results': results
        }
    
    def process_pending_transactions(self):
        """Process all pending transactions automatically"""
        try:
            from database_manager import db_manager
            
            # Get all pending transactions
            conn = db_manager.get_connection()
            cur = conn.cursor()
            
            cur.execute("""
                SELECT id, merchant, amount, category, user_id 
                FROM transactions 
                WHERE status = 'pending' AND ticker IS NULL
                ORDER BY created_at ASC
                LIMIT 50
            """)
            
            pending_transactions = cur.fetchall()
            processed_count = 0
            auto_mapped_count = 0
            
            for tx_id, merchant, amount, category, user_id in pending_transactions:
                if not merchant:
                    continue
                    
                # Try to map the merchant
                result = self.map_merchant(merchant)
                
                if result.confidence >= self.auto_threshold:
                    # Auto-approve high confidence mappings
                    cur.execute("""
                        UPDATE transactions 
                        SET ticker = ?, category = ?, status = 'mapped'
                        WHERE id = ?
                    """, (result.ticker, result.category, tx_id))
                    
                    # Create mapping record
                    cur.execute("""
                        INSERT INTO llm_mappings 
                        (user_id, merchant_name, ticker, category, confidence, status, created_at)
                        VALUES (?, ?, ?, ?, ?, 'approved', ?)
                    """, (user_id, merchant, result.ticker, result.category, result.confidence, datetime.now().isoformat()))
                    
                    auto_mapped_count += 1
                    processed_count += 1
                    
                elif result.confidence >= self.review_threshold:
                    # Send to review queue for medium confidence
                    cur.execute("""
                        INSERT INTO llm_mappings 
                        (user_id, merchant_name, ticker, category, confidence, status, created_at)
                        VALUES (?, ?, ?, ?, ?, 'pending', ?)
                    """, (user_id, merchant, result.ticker, result.category, result.confidence, datetime.now().isoformat()))
                    
                    processed_count += 1
            
            conn.commit()
            conn.close()
            
            print(f"Auto-mapping processed {processed_count} transactions, {auto_mapped_count} auto-approved")
            return {
                'processed': processed_count,
                'auto_approved': auto_mapped_count,
                'sent_to_review': processed_count - auto_mapped_count
            }
            
        except Exception as e:
            print(f"Auto-mapping error: {e}")
            return {'error': str(e)}

# Global auto-mapping pipeline instance
auto_mapping_pipeline = AutoMappingPipeline()
