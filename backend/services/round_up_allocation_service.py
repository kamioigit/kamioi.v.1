"""
Round-Up Allocation Service
Handles intelligent allocation of round-up amounts across multiple stocks
based on retailer and brand purchases
"""

import logging
from typing import Dict, List, Optional
from decimal import Decimal

logger = logging.getLogger(__name__)


class RoundUpAllocationService:
    """Service for calculating round-up allocations across multiple stocks"""
    
    def __init__(self):
        """Initialize the round-up allocation service"""
        # Allocation rules
        self.RETAILER_ALLOCATION_PERCENTAGE = 0.33  # 33% to retailer
        self.BRAND_ALLOCATION_PERCENTAGE = 0.67  # 67% to brands (split proportionally)
        self.MIN_ALLOCATION_AMOUNT = 0.01  # Minimum $0.01 per stock
        self.MAX_STOCKS = 5  # Maximum number of stocks to allocate to
    
    def calculate_allocation(self, transaction: Dict) -> Dict:
        """
        Calculate round-up allocation for a transaction
        
        Args:
            transaction: {
                'items': List[Dict],  # List of items with 'name', 'amount', 'brand', 'brandSymbol'
                'retailer': Dict,  # {'name': str, 'stockSymbol': str}
                'totalAmount': float,
                'roundUpAmount': float
            }
        
        Returns:
            {
                'allocations': List[Dict],  # List of allocations per stock
                'totalRoundUp': float
            }
        """
        try:
            items = transaction.get('items', [])
            retailer = transaction.get('retailer')
            total_amount = transaction.get('totalAmount', 0.0)
            round_up_amount = transaction.get('roundUpAmount', self._calculate_round_up(total_amount))
            
            logger.info(f"Calculating allocation: round_up=${round_up_amount}, items={len(items)}, retailer={retailer}")
            
            if round_up_amount <= 0:
                logger.warning(f"Invalid round-up amount: {round_up_amount}")
                return {
                    'success': False,
                    'error': 'Invalid round-up amount'
                }
            
            # Get all relevant stocks
            relevant_stocks = self._get_relevant_stocks(items, retailer)
            logger.info(f"Found {len(relevant_stocks)} relevant stocks: {[s['symbol'] for s in relevant_stocks]}")
            
            if not relevant_stocks:
                logger.warning(f"No relevant stocks found. Items: {items}, Retailer: {retailer}")
                return {
                    'success': False,
                    'error': 'No relevant stocks found'
                }
            
            # Calculate allocation weights
            weights = self._calculate_weights(items, relevant_stocks, total_amount, retailer)
            logger.info(f"Allocation weights: {weights}")
            
            # Distribute round-up (pass stocks so we can include confidence)
            allocations = self._distribute_round_up(round_up_amount, weights, relevant_stocks)
            logger.info(f"Allocations calculated: {len(allocations)} allocations totaling ${round_up_amount}")
            
            return {
                'success': True,
                'allocations': allocations,
                'totalRoundUp': round_up_amount
            }
        except Exception as e:
            logger.error(f"Error calculating allocation: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def _calculate_round_up(self, amount: float) -> float:
        """Calculate round-up amount (round up to nearest dollar)"""
        return round(amount) - amount if amount % 1 != 0 else 1.0
    
    def _get_relevant_stocks(self, items: List[Dict], retailer: Optional[Dict]) -> List[Dict]:
        """
        Identifies all unique stock symbols relevant to the transaction,
        including the retailer and brands of purchased items.
        ONLY includes brands with confidence > 0.7 to avoid incorrect mappings.
        """
        stocks = [] # Use list to maintain order and allow duplicates if needed, but we'll filter unique
        stock_symbols_seen = set()
        
        # Add retailer stock (high confidence - user explicitly selected retailer)
        if retailer and retailer.get('stockSymbol'):
            stock_symbol = retailer['stockSymbol']
            if stock_symbol not in stock_symbols_seen:
                stocks.append({
                    'symbol': stock_symbol,
                    'name': retailer['name'],
                    'type': 'retailer',
                    'reason': f"Purchase at {retailer['name']}",
                    'confidence': 1.0  # Retailer is always high confidence
                })
                stock_symbols_seen.add(stock_symbol)
        
        # Add brand stocks from items (ONLY if confidence is high enough)
        for item in items:
            # Skip payment method items (they're not products)
            item_name = item.get('name', '').lower()
            if any(skip in item_name for skip in ['debit tend', 'pay from', 'payment', 'tend', 'card', 'visa charge']):
                logger.debug(f"Skipping payment method item: '{item.get('name')}'")
                continue  # Skip payment methods
            
            # Check brand confidence - only use if confidence > 0.7
            brand_confidence = item.get('brand_confidence', 0.0)
            if brand_confidence < 0.7:
                logger.debug(f"Skipping item '{item.get('name')}' - low confidence ({brand_confidence:.2f})")
                continue  # Skip low-confidence mappings
            
            # Handle different item formats - could be dict with 'brand' key or 'brandSymbol' key
            brand_info = item.get('brand')
            brand_symbol = None
            brand_name = None
            
            if isinstance(brand_info, dict):
                brand_symbol = brand_info.get('stockSymbol') or brand_info.get('symbol')
                brand_name = brand_info.get('name')
            elif brand_info:
                # If brand is just a string, try to use it as symbol
                brand_symbol = str(brand_info) if brand_info else None
            
            # Also check for direct brandSymbol key (this is the most reliable)
            if not brand_symbol:
                brand_symbol = item.get('brandSymbol')
            
            # Only add if we have a valid symbol and it's not already added
            if brand_symbol and brand_symbol not in stock_symbols_seen:
                stocks.append({
                    'symbol': brand_symbol,
                    'name': brand_name or brand_symbol,
                    'type': 'brand',
                    'reason': f"Purchased {brand_name or brand_symbol} products (confidence: {brand_confidence:.0%})",
                    'confidence': brand_confidence
                })
                stock_symbols_seen.add(brand_symbol)
                logger.info(f"✅ Added brand stock: {brand_symbol} ({brand_name}) from item '{item.get('name')}' (confidence: {brand_confidence:.2f})")
            elif not brand_symbol:
                logger.warning(f"⚠️ Item '{item.get('name')}' has brand_confidence={brand_confidence:.2f} but no brand_symbol found. brand={brand_info}, brandSymbol={item.get('brandSymbol')}")
        
        # If no valid brands found, only use retailer
        if len(stocks) == 1 and stocks[0]['type'] == 'retailer':
            logger.warning("No valid brand mappings found - using retailer only")
        
        # Limit to max stocks
        return stocks[:self.MAX_STOCKS]
    
    def _calculate_weights(self, items: List[Dict], stocks: List[Dict], 
                          total_amount: float, retailer: Optional[Dict]) -> Dict[str, float]:
        """Calculate allocation weights for each stock - evenly distributed"""
        weights = {}
        
        # Allocate evenly across all relevant stocks (no 33%/67% split)
        if stocks:
            equal_weight = 1.0 / len(stocks)
            for stock in stocks:
                weights[stock['symbol']] = equal_weight
        
        return weights
    
    def _distribute_round_up(self, round_up_amount: float, weights: Dict[str, float], stocks: List[Dict]) -> List[Dict]:
        """Distribute round-up amount evenly according to weights"""
        from decimal import Decimal, ROUND_HALF_UP
        
        allocations = []
        round_up_decimal = Decimal(str(round_up_amount))
        
        # Sort by weight (descending) to ensure minimum allocations
        sorted_stocks = sorted(weights.items(), key=lambda x: x[1], reverse=True)
        remaining_amount = round_up_decimal
        
        for i, (stock_symbol, weight) in enumerate(sorted_stocks):
            # Calculate allocation using Decimal for precision
            weight_decimal = Decimal(str(weight))
            allocation_amount = round_up_decimal * weight_decimal
            
            # Round to 2 decimal places
            allocation_amount = allocation_amount.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)
            
            # Ensure minimum allocation
            if allocation_amount < Decimal(str(self.MIN_ALLOCATION_AMOUNT)) and remaining_amount >= Decimal(str(self.MIN_ALLOCATION_AMOUNT)):
                allocation_amount = Decimal(str(self.MIN_ALLOCATION_AMOUNT))
            
            # Adjust if we're on the last stock (account for rounding errors)
            if i == len(sorted_stocks) - 1:
                allocation_amount = remaining_amount
            else:
                remaining_amount -= allocation_amount
            
            # Get stock data from weights dict (we need to find the original stock object)
            # Find the stock object that matches this symbol
            stock_obj = None
            for s in stocks:
                if s['symbol'] == stock_symbol:
                    stock_obj = s
                    break
            
            # Find stock name for display
            stock_name = stock_obj.get('name') if stock_obj else stock_symbol  # Use name from stock data first
            
            # Try to get company name from ticker lookup if available
            if not stock_obj or stock_name == stock_symbol:
                try:
                    from ticker_company_lookup import get_company_name_from_ticker
                    company_name = get_company_name_from_ticker(stock_symbol)
                    if company_name:
                        stock_name = company_name
                except:
                    pass
            
            # Include confidence score from stock data
            stock_confidence = stock_obj.get('confidence', 1.0) if stock_obj else 1.0
            
            allocations.append({
                'stockSymbol': stock_symbol,
                'stockName': stock_name,
                'amount': float(allocation_amount),
                'percentage': round(float(weight_decimal * Decimal('100')), 1),
                'reason': stock_obj.get('reason', f"{round(float(weight_decimal * Decimal('100')), 1)}% allocation") if stock_obj else f"{round(float(weight_decimal * Decimal('100')), 1)}% allocation",
                'confidence': stock_confidence  # Include confidence for frontend display
            })
        
        return allocations

