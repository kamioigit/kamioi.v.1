"""
Receipt Processing Service
Handles OCR, text extraction, and intelligent parsing of receipts/invoices
"""

import os
import re
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple
import json

# Initialize logger first
logger = logging.getLogger(__name__)

# Try to import OCR libraries
try:
    import pytesseract
    from PIL import Image
    PYTESSERACT_AVAILABLE = True
    
    # Try to find Tesseract executable automatically
    # Always check and set the path to ensure it's found
    username = os.getenv('USERNAME', '')
    tesseract_paths = [
        r'C:\Program Files\Tesseract-OCR\tesseract.exe',  # Standard location - check first
        r'C:\Program Files (x86)\Tesseract-OCR\tesseract.exe',
        r'C:\Users\beltr\Kamioi\5.5.1 source code\tesseract.exe',  # User's custom location
    ]
    # Check subdirectories in user's custom location
    custom_path = r'C:\Users\beltr\Kamioi\5.5.1 source code'
    if os.path.exists(custom_path):
        # Search for tesseract.exe in subdirectories
        for root, dirs, files in os.walk(custom_path):
            if 'tesseract.exe' in files:
                tesseract_paths.insert(0, os.path.join(root, 'tesseract.exe'))
                break
    
    if username:
        tesseract_paths.append(r'C:\Users\{}\AppData\Local\Programs\Tesseract-OCR\tesseract.exe'.format(username))
    
    tesseract_found = False
    for path in tesseract_paths:
        if os.path.exists(path):
            pytesseract.pytesseract.tesseract_cmd = path
            logger.info(f"Auto-detected Tesseract at: {path}")
            tesseract_found = True
            break
    
    if not tesseract_found:
        logger.warning("Tesseract OCR not found. OCR will use manual entry fallback.")
        logger.warning("Install Tesseract from: https://github.com/UB-Mannheim/tesseract/wiki")
except ImportError:
    PYTESSERACT_AVAILABLE = False
    logger.warning("pytesseract or PIL not available - OCR will use manual entry fallback")


class ReceiptProcessingService:
    """Service for processing receipts and invoices with OCR and AI parsing"""
    
    def __init__(self):
        """Initialize the receipt processing service"""
        # Load learned mappings from LLM Center FIRST (before retailers/brands)
        self.learned_mappings = self._load_learned_mappings()
        # Brand database - in production, this would come from a database
        self.brands_db = self._load_brands_database()
        # Retailers database (uses learned_mappings)
        self.retailers_db = self._load_retailers_database()
    
    def _load_brands_database(self) -> Dict:
        """Load brand database with stock symbols"""
        return {
            'nike': {'name': 'Nike', 'symbol': 'NKE', 'aliases': ['nike', 'just do it']},
            'under armour': {'name': 'Under Armour', 'symbol': 'UAA', 'aliases': ['under armour', 'ua', 'underarmour']},
            'adidas': {'name': 'Adidas', 'symbol': 'ADDYY', 'aliases': ['adidas', 'adi']},
            'apple': {'name': 'Apple', 'symbol': 'AAPL', 'aliases': ['apple', 'iphone', 'ipad', 'mac']},
            'samsung': {'name': 'Samsung', 'symbol': 'SSNLF', 'aliases': ['samsung', 'galaxy']},
            'target': {'name': 'Target', 'symbol': 'TGT', 'aliases': ['target']},
            'walmart': {'name': 'Walmart', 'symbol': 'WMT', 'aliases': ['walmart', 'wal-mart']},
            'foot locker': {'name': 'Foot Locker', 'symbol': 'FL', 'aliases': ['foot locker', 'footlocker']},
            'starbucks': {'name': 'Starbucks', 'symbol': 'SBUX', 'aliases': ['starbucks', 'starbucks coffee']},
            'amazon': {'name': 'Amazon', 'symbol': 'AMZN', 'aliases': ['amazon', 'amazon.com']},
            'microsoft': {'name': 'Microsoft', 'symbol': 'MSFT', 'aliases': ['microsoft', 'msft', 'xbox']},
            'google': {'name': 'Alphabet', 'symbol': 'GOOGL', 'aliases': ['google', 'alphabet']},
            'tesla': {'name': 'Tesla', 'symbol': 'TSLA', 'aliases': ['tesla']},
            'coca cola': {'name': 'Coca-Cola', 'symbol': 'KO', 'aliases': ['coca cola', 'coke']},
            'pepsi': {'name': 'PepsiCo', 'symbol': 'PEP', 'aliases': ['pepsi', 'pepsico']},
            'nike store': {'name': 'Nike', 'symbol': 'NKE', 'aliases': ['nike store', 'nike.com']},
        }
    
    def _load_retailers_database(self) -> Dict:
        """Load retailer database with stock symbols"""
        base_retailers = {
            'target': {'name': 'Target', 'symbol': 'TGT'},
            'walmart': {'name': 'Walmart', 'symbol': 'WMT'},
            'foot locker': {'name': 'Foot Locker', 'symbol': 'FL'},
            'amazon': {'name': 'Amazon', 'symbol': 'AMZN'},
            'best buy': {'name': 'Best Buy', 'symbol': 'BBY'},
            'home depot': {'name': 'Home Depot', 'symbol': 'HD'},
            'lowes': {'name': "Lowe's", 'symbol': 'LOW'},
            'costco': {'name': 'Costco', 'symbol': 'COST'},
            'nike store': {'name': 'Nike', 'symbol': 'NKE'},
            'starbucks': {'name': 'Starbucks', 'symbol': 'SBUX'},
        }
        # Merge with learned mappings
        if self.learned_mappings:
            for mapping in self.learned_mappings:
                if mapping.get('category') == 'Retailer' and mapping.get('ticker'):
                    retailer_name_lower = mapping.get('merchant_name', '').lower()
                    if retailer_name_lower:
                        base_retailers[retailer_name_lower] = {
                            'name': mapping.get('merchant_name'),
                            'symbol': mapping.get('ticker')
                        }
        return base_retailers
    
    def _load_learned_mappings(self) -> List[Dict]:
        """Load approved mappings from LLM Center for learning"""
        try:
            from database_manager import db_manager
            conn = db_manager.get_connection()
            
            if db_manager._use_postgresql:
                from sqlalchemy import text
                # PostgreSQL: Check if mapping_data column exists
                try:
                    result = conn.execute(text("""
                        SELECT column_name 
                        FROM information_schema.columns 
                        WHERE table_name = 'llm_mappings' AND column_name = 'mapping_data'
                    """))
                    has_mapping_data = result.fetchone() is not None
                except:
                    has_mapping_data = False
                
                if has_mapping_data:
                    result = conn.execute(text("""
                        SELECT merchant_name, ticker, company_name, category, mapping_data
                        FROM llm_mappings
                        WHERE source_type = 'receipt_processing'
                        AND status = 'approved'
                        AND admin_approved = 1
                        ORDER BY created_at DESC
                        LIMIT 100
                    """))
                else:
                    # Fallback: use available columns
                    result = conn.execute(text("""
                        SELECT merchant_name, ticker, company_name, category
                        FROM llm_mappings
                        WHERE source_type = 'receipt_processing'
                        AND status = 'approved'
                        AND admin_approved = 1
                        ORDER BY created_at DESC
                        LIMIT 100
                    """))
                
                rows = result.fetchall()
                db_manager.release_connection(conn)
            else:
                # SQLite path
                cursor = conn.cursor()
                
                # Get approved receipt processing mappings
                # Check if mapping_data column exists
                cursor.execute("PRAGMA table_info(llm_mappings)")
                columns = [col[1] for col in cursor.fetchall()]
                has_mapping_data = 'mapping_data' in columns
                
                if has_mapping_data:
                    cursor.execute("""
                        SELECT merchant_name, ticker, company_name, category, mapping_data
                        FROM llm_mappings
                        WHERE source_type = 'receipt_processing'
                        AND status = 'approved'
                        AND admin_approved = 1
                        ORDER BY updated_at DESC
                        LIMIT 100
                    """)
                else:
                    # Fallback: use available columns
                    cursor.execute("""
                        SELECT merchant_name, ticker, company_name, category
                        FROM llm_mappings
                        WHERE source_type = 'receipt_processing'
                        AND status = 'approved'
                        AND admin_approved = 1
                        ORDER BY updated_at DESC
                        LIMIT 100
                    """)
                
                rows = cursor.fetchall()
                conn.close()
            
            mappings = []
            for row in rows:
                if has_mapping_data:
                    # Handle both tuple and Row objects
                    if hasattr(row, '_mapping'):
                        row_dict = dict(row._mapping)
                        mappings.append({
                            'merchant_name': row_dict.get('merchant_name'),
                            'ticker': row_dict.get('ticker'),
                            'company_name': row_dict.get('company_name'),
                            'category': row_dict.get('category'),
                            'mapping_data': json.loads(row_dict.get('mapping_data')) if row_dict.get('mapping_data') else {}
                        })
                    else:
                        mappings.append({
                            'merchant_name': row[0],
                            'ticker': row[1],
                            'company_name': row[2],
                            'category': row[3],
                            'mapping_data': json.loads(row[4]) if row[4] else {}
                        })
                else:
                    # Handle both tuple and Row objects
                    if hasattr(row, '_mapping'):
                        row_dict = dict(row._mapping)
                        mappings.append({
                            'merchant_name': row_dict.get('merchant_name'),
                            'ticker': row_dict.get('ticker'),
                            'company_name': row_dict.get('company_name'),
                            'category': row_dict.get('category'),
                            'mapping_data': {}
                        })
                    else:
                        mappings.append({
                            'merchant_name': row[0],
                            'ticker': row[1],
                            'company_name': row[2],
                            'category': row[3],
                            'mapping_data': {}
                        })
            
            logger.info(f"Loaded {len(mappings)} learned mappings from LLM Center")
            return mappings
        except Exception as e:
            logger.warning(f"Could not load learned mappings: {e}")
            return []
    
    def extract_text_from_image(self, image_path: str) -> str:
        """
        Extract text from receipt image using OCR
        Uses pytesseract if available, otherwise returns empty string for manual entry
        """
        try:
            if not os.path.exists(image_path):
                logger.error(f"Image file not found: {image_path}")
                return ""
            
            if PYTESSERACT_AVAILABLE:
                # Open image with PIL
                image = Image.open(image_path)
                
                # Ensure Tesseract path is set (should already be set at module load, but double-check)
                if not hasattr(pytesseract.pytesseract, 'tesseract_cmd') or not pytesseract.pytesseract.tesseract_cmd:
                    # Fallback: try to find it again
                    standard_path = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
                    if os.path.exists(standard_path):
                        pytesseract.pytesseract.tesseract_cmd = standard_path
                        logger.info(f"Set Tesseract path at runtime: {standard_path}")
                    else:
                        logger.error("Tesseract path not set and standard location not found!")
                        return ""
                
                try:
                    # Try to extract text using Tesseract OCR
                    # Try multiple PSM modes to get best results
                    best_text = ""
                    psm_modes = [6, 11, 12, 7]  # 6=block, 11=sparse, 12=line, 7=line
                    
                    for psm in psm_modes:
                        try:
                            custom_config = f'--oem 3 --psm {psm}'
                            text = pytesseract.image_to_string(image, config=custom_config)
                            if len(text.strip()) > len(best_text.strip()):
                                best_text = text
                                logger.debug(f"PSM {psm} extracted {len(text)} characters")
                        except Exception as e:
                            logger.debug(f"PSM {psm} failed: {str(e)}")
                            continue
                    
                    if best_text:
                        logger.info(f"OCR extracted {len(best_text)} characters from {image_path}")
                        return best_text
                    else:
                        logger.warning(f"No text extracted from {image_path} with any PSM mode")
                        return ""
                        
                except pytesseract.TesseractNotFoundError:
                    logger.error("Tesseract OCR not found. Please install from: https://github.com/UB-Mannheim/tesseract/wiki")
                    logger.error("Or set pytesseract.pytesseract.tesseract_cmd to the tesseract.exe path")
                    return ""
                except Exception as e:
                    logger.error(f"Tesseract OCR error: {str(e)}")
                    return ""
            else:
                logger.warning("pytesseract not available - OCR extraction skipped")
                return ""
        except Exception as e:
            logger.error(f"Error extracting text from image: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return ""
    
    def parse_receipt_text(self, raw_text: str) -> Dict:
        """
        Parse receipt text to extract structured data
        Uses regex patterns and AI-like logic to identify items, brands, amounts, and retailer
        """
        if not raw_text:
            return {
                'retailer': None,
                'items': [],
                'brands': [],
                'totalAmount': 0.0,
                'timestamp': datetime.now().isoformat(),
                'raw_text': raw_text
            }
        
        # Extract retailer
        retailer = self._identify_retailer(raw_text)
        
        # Extract total amount
        total_amount = self._extract_total_amount(raw_text)
        
        # Extract date
        date = self._extract_date(raw_text)
        
        # Extract items (this is simplified - in production, use more sophisticated parsing)
        items = self._extract_items(raw_text)
        
        # Note: Enhancement with LLM mappings is done in process_receipt() method
        # to allow for skip_llm_enhancement flag
        
        # Identify brands from items (basic identification)
        brands = self._identify_brands_from_items(items)
        
        # Only mark as needs_manual_entry if we couldn't extract ANY useful data
        needs_manual = (
            not retailer and 
            not items and 
            total_amount == 0.0
        )
        
        result = {
            'retailer': retailer,
            'items': items,
            'brands': brands,
            'totalAmount': total_amount,
            'timestamp': date or datetime.now().isoformat(),
            'raw_text': raw_text,
            'needs_manual_entry': needs_manual
        }
        
        logger.info(f"Parsed receipt: retailer={retailer}, items={len(items)}, total=${total_amount}, needs_manual={needs_manual}")
        
        return result
    
    def _identify_retailer(self, text: str) -> Optional[Dict]:
        """Identify retailer from receipt text with improved matching"""
        text_lower = text.lower()
        
        # Try to find retailer at the top of the receipt (first few lines)
        lines = text.split('\n')[:10]  # Check first 10 lines
        top_text = ' '.join(lines).lower()
        
        # Check against retailer database
        for retailer_key, retailer_data in self.retailers_db.items():
            # Check if retailer name appears in text
            if retailer_key in text_lower or retailer_key in top_text:
                return {
                    'name': retailer_data['name'],
                    'stockSymbol': retailer_data['symbol']
                }
            # Also check if retailer name (capitalized) appears
            if retailer_data['name'].lower() in text_lower:
                return {
                    'name': retailer_data['name'],
                    'stockSymbol': retailer_data['symbol']
                }
        
        # If no match, try to extract first line as potential retailer
        # (often the store name appears first)
        if lines:
            first_line = lines[0].strip()
            # If first line looks like a store name (not a date, not all numbers, reasonable length)
            if (len(first_line) > 2 and len(first_line) < 50 and 
                not re.match(r'^[\d\s\/\-]+$', first_line) and
                not re.match(r'^\d{1,2}[\-\/]\d{1,2}', first_line)):
                return {
                    'name': first_line,
                    'stockSymbol': None  # Will be looked up later if possible
                }
        
        return None
    
    def _extract_total_amount(self, text: str) -> float:
        """Extract total amount from receipt with improved patterns"""
        # Look for patterns like "Total: $50.00", "TOTAL 50.00", etc.
        patterns = [
            r'total[:\s]*\$?\s*(\d+\.\d{2})',  # More specific - require .XX
            r'total[:\s]*\$?\s*(\d+\.?\d*)',
            r'subtotal[:\s]*\$?\s*(\d+\.\d{2})',
            r'subtotal[:\s]*\$?\s*(\d+\.?\d*)',
            r'amount[:\s]*\$?\s*(\d+\.\d{2})',
            r'amount[:\s]*\$?\s*(\d+\.?\d*)',
            r'\$\s*(\d+\.\d{2})\s*(?:total|due)',
            r'(?:grand\s+)?total[:\s]*\$?\s*(\d+\.\d{2})',  # Grand total
            r'balance[:\s]*\$?\s*(\d+\.\d{2})',
            r'paid[:\s]*\$?\s*(\d+\.\d{2})',
        ]
        
        # Try to find the largest amount that looks like a total
        candidates = []
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    amount = float(match)
                    # Reasonable total amounts (between $0.01 and $100,000)
                    if 0.01 <= amount <= 100000:
                        candidates.append(amount)
                except ValueError:
                    continue
        
        # Return the largest candidate (usually the grand total)
        if candidates:
            return max(candidates)
        
        return 0.0
    
    def _extract_date(self, text: str) -> Optional[str]:
        """Extract date from receipt"""
        # Look for date patterns
        date_patterns = [
            r'(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})',
            r'(\d{4}-\d{2}-\d{2})',
        ]
        
        for pattern in date_patterns:
            matches = re.findall(pattern, text)
            if matches:
                return matches[0]
        
        return None
    
    def _extract_items(self, text: str) -> List[Dict]:
        """Extract items from receipt text with improved patterns and multi-line support"""
        items = []
        
        lines = text.split('\n')
        skip_keywords = ['total', 'subtotal', 'tax', 'date', 'receipt', 'change', 'cash', 'card', 'thank', 'visit', 'balance', 'discount', 'coupon', 'store', 'register', 'cashier', 'sales associate', 'item', 'price', 'amount']
        
        # Brand keywords for detecting item lines
        brand_keywords = ['nike', 'adidas', 'jordan', 'lebron', 'yeezy', 'puma', 'reebok', 'under armour', 'new balance', 'converse', 'boost', 'retro', 'air', 'sb']
        
        # Track potential item data across lines (item name, quantity, price)
        pending_item_name = None
        pending_quantity = None
        
        for i, line in enumerate(lines):
            line = line.strip()
            if not line or len(line) < 1:
                continue
            
            line_lower = line.lower()
            
            # Skip header/footer lines
            if any(skip in line_lower for skip in skip_keywords):
                pending_item_name = None
                pending_quantity = None
                continue
            
            # Check if this line has a price (most reliable indicator)
            price_match = re.search(r'\$?(\d+\.\d{2})', line)
            if price_match:
                amount = float(price_match.group(1))
                
                # Check if we have pending item name and quantity
                if pending_item_name and pending_quantity:
                    # We have all three: name, quantity, price
                    if 0.01 <= amount <= 10000 and len(pending_item_name) > 2:
                        item_name = re.sub(r'\s+', ' ', pending_item_name).strip()
                        items.append({
                            'name': item_name,
                            'amount': amount,
                            'quantity': pending_quantity
                        })
                        pending_item_name = None
                        pending_quantity = None
                        continue
                elif pending_item_name:
                    # We have item name, use quantity 1
                    if 0.01 <= amount <= 10000 and len(pending_item_name) > 2:
                        item_name = re.sub(r'\s+', ' ', pending_item_name).strip()
                        items.append({
                            'name': item_name,
                            'amount': amount,
                            'quantity': 1
                        })
                        pending_item_name = None
                        continue
                elif i > 0:
                    # Check previous line for item name
                    prev_line = lines[i-1].strip()
                    prev_lower = prev_line.lower()
                    
                    if not any(skip in prev_lower for skip in skip_keywords):
                        # Check if previous line looks like item name
                        if any(keyword in prev_lower for keyword in brand_keywords) or (len(prev_line) > 8 and not re.match(r'^[\d\$\.\s]+$', prev_line)):
                            # Check if line before that has quantity
                            quantity = 1
                            if i > 1:
                                prev_prev = lines[i-2].strip()
                                if re.match(r'^\d+$', prev_prev):
                                    quantity = int(prev_prev)
                            
                            if 0.01 <= amount <= 10000 and len(prev_line) > 2:
                                item_name = re.sub(r'\s+', ' ', prev_line).strip()
                                items.append({
                                    'name': item_name,
                                    'amount': amount,
                                    'quantity': quantity
                                })
                                continue
            
            # Check if this line is just a quantity (single digit)
            if re.match(r'^\d+$', line) and len(line) < 4:
                # This might be a quantity, check if previous line has item name
                if i > 0:
                    prev_line = lines[i-1].strip()
                    prev_lower = prev_line.lower()
                    
                    if not any(skip in prev_lower for skip in skip_keywords):
                        # Check if previous line looks like item name
                        if any(keyword in prev_lower for keyword in brand_keywords) or (len(prev_line) > 8 and not re.match(r'^[\d\$\.\s]+$', prev_line)):
                            pending_item_name = prev_line
                            pending_quantity = int(line)
                            continue
            
            # Check if this line looks like an item name (contains brand keywords)
            if any(keyword in line_lower for keyword in brand_keywords) or (len(line) > 10 and not re.match(r'^[\d\$\.\s]+$', line)):
                # Check if following lines have quantity and price (may be separated by empty lines)
                # Look ahead up to 5 lines for quantity and price
                quantity = None
                amount = None
                
                for j in range(i + 1, min(i + 6, len(lines))):
                    check_line = lines[j].strip()
                    if not check_line:
                        continue
                    
                    # Check if it's a quantity (single digit or small number)
                    if not quantity and re.match(r'^\d+$', check_line) and len(check_line) < 4:
                        quantity = int(check_line)
                    
                    # Check if it's a price
                    if not amount:
                        price_match = re.search(r'\$?(\d+\.\d{2})', check_line)
                        if price_match:
                            amount = float(price_match.group(1))
                    
                    # If we found both, we're done
                    if quantity and amount:
                        break
                
                # If we found both quantity and price, add the item
                if quantity and amount and 0.01 <= amount <= 10000 and len(line) > 2:
                    item_name = re.sub(r'\s+', ' ', line).strip()
                    items.append({
                        'name': item_name,
                        'amount': amount,
                        'quantity': quantity
                    })
                    continue
                
                # If we only found price (no quantity), use quantity 1
                if amount and not quantity and 0.01 <= amount <= 10000 and len(line) > 2:
                    item_name = re.sub(r'\s+', ' ', line).strip()
                    items.append({
                        'name': item_name,
                        'amount': amount,
                        'quantity': 1
                    })
                    continue
            
            # Standard patterns for single-line items
            patterns = [
                r'(\d+)\s+(.+?)\s+\$?(\d+\.\d{2})',  # Quantity, item, price
                r'(.+?)\s+\$?(\d+\.\d{2})',  # Item name followed by price
                r'(.+?)\s+(\d+\.\d{2})',  # Item and price (no $)
            ]
            
            for pattern in patterns:
                match = re.search(pattern, line)
                if match:
                    if len(match.groups()) == 3:
                        quantity = int(match.group(1))
                        item_name = match.group(2).strip()
                        amount = float(match.group(3))
                    elif len(match.groups()) == 2:
                        item_name = match.group(1).strip()
                        amount = float(match.group(2))
                        quantity = 1
                    else:
                        continue
                    
                    # Validation
                    if amount > 10000 or amount < 0.01:
                        continue
                    if not item_name or len(item_name) < 2 or re.match(r'^[\d\$\.]+$', item_name):
                        continue
                    
                    item_name = re.sub(r'\s+', ' ', item_name).strip()
                    if not item_name:
                        continue
                    
                    items.append({
                        'name': item_name,
                        'amount': amount,
                        'quantity': quantity
                    })
                    break
        
        return items
    
    def _identify_brands_from_items(self, items: List[Dict]) -> List[Dict]:
        """Identify brands from item names and add brand info to items"""
        brands = []
        brand_names_seen = set()
        
        # Build learned brands map from approved mappings
        learned_brands = {}
        if self.learned_mappings:
            for mapping in self.learned_mappings:
                if mapping.get('category') == 'Brand':
                    brand_name = mapping.get('merchant_name', '').lower()
                    if brand_name:
                        learned_brands[brand_name] = {
                            'name': mapping.get('merchant_name'),
                            'symbol': mapping.get('ticker')
                        }
        
        for item in items:
            item_name_lower = item['name'].lower()
            brand_found = None
            
            # Check learned mappings first
            for brand_key, brand_data in learned_brands.items():
                if brand_key in item_name_lower:
                    brand_found = {
                        'name': brand_data['name'],
                        'stockSymbol': brand_data['symbol']
                    }
                    break
            
            # Check against brand database if not found in learned mappings
            if not brand_found:
                for brand_key, brand_data in self.brands_db.items():
                    if brand_key in item_name_lower or any(alias in item_name_lower for alias in brand_data['aliases']):
                        brand_found = {
                            'name': brand_data['name'],
                            'stockSymbol': brand_data['symbol']
                        }
                        break
            
            # Add brand info to the item if found
            if brand_found:
                item['brand'] = brand_found
                item['brandSymbol'] = brand_found['stockSymbol']
                
                # Add to brands list if not already there
                if brand_found['name'] not in brand_names_seen:
                    brands.append(brand_found)
                    brand_names_seen.add(brand_found['name'])
        
        return brands
    
    def _enhance_items_with_llm_mappings(self, items: List[Dict], raw_text: str) -> List[Dict]:
        """
        Enhance items with stock ticker mappings from LLM Center
        Uses the 14m+ mappings to identify stock tickers for product names
        OPTIMIZED: Uses fast keyword matching and caching for speed
        """
        if not items:
            return items
        
        try:
            from database_manager import db_manager
            
            # Quick keyword-to-ticker mapping cache (fast lookup)
            # This avoids database queries for common brands
            keyword_cache = {
                'hp': 'HPQ', 'hewlett': 'HPQ', 'hewlett-packard': 'HPQ', 'envy': 'HPQ',
                'nike': 'NKE', 'adidas': 'ADDYY', 'apple': 'AAPL', 'iphone': 'AAPL', 'ipad': 'AAPL',
                'microsoft': 'MSFT', 'google': 'GOOGL', 'amazon': 'AMZN',
                'samsung': 'SSNLF', 'tesla': 'TSLA', 'target': 'TGT',
                'walmart': 'WMT', 'costco': 'COST', 'starbucks': 'SBUX', 'sbr': 'SBUX',
                'pillsbury': 'PSY'
            }
            
            # Check if llm_mappings table exists (fast check)
            conn = db_manager.get_connection()
            cursor = conn.cursor()
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='llm_mappings'
            """)
            has_llm_table = cursor.fetchone() is not None
            
            # Only proceed with DB queries if table exists and we have items to enhance
            if not has_llm_table:
                conn.close()
                # Still try keyword cache for common brands
                return self._enhance_with_keyword_cache(items, keyword_cache)
            
            enhanced_items = []
            # Fast keyword cache lookup first (no DB queries)
            for item in items:
                item_name = item.get('name', '').lower()
                if not item_name or len(item_name) < 3:
                    enhanced_items.append(item)
                    continue
                
                # Try keyword cache first (instant, no DB query)
                best_match = None
                for keyword, ticker in keyword_cache.items():
                    if keyword in item_name:
                        # Get company name from ticker
                        company_names = {
                            'HPQ': 'Hewlett-Packard', 'NKE': 'Nike', 'ADDYY': 'Adidas',
                            'AAPL': 'Apple', 'MSFT': 'Microsoft', 'GOOGL': 'Alphabet',
                            'AMZN': 'Amazon', 'SSNLF': 'Samsung', 'TSLA': 'Tesla',
                            'TGT': 'Target', 'WMT': 'Walmart', 'COST': 'Costco', 'SBUX': 'Starbucks',
                            'TJX': 'TJX Companies', 'PYPL': 'PayPal', 'V': 'Visa', 'MA': 'Mastercard',
                            'PSY': 'Pillsbury'
                        }
                        best_match = {
                            'ticker': ticker,
                            'company_name': company_names.get(ticker, ticker),
                            'confidence': 0.95  # High confidence for keyword matches
                        }
                        break
                
                # Only query DB if keyword cache didn't find a match
                if not best_match:
                    # Use a single optimized query with better indexing hints
                    # Extract first meaningful word (skip numbers, single chars)
                    words = [w for w in item_name.split() if len(w) >= 3][:1]  # Only check first meaningful word
                    if words:
                        search_term = f'%{words[0]}%'
                        # Optimized query: use index on status/admin_approved/ticker, limit to 1 result
                        cursor.execute("""
                            SELECT merchant_name, ticker, company_name, category, confidence
                            FROM llm_mappings
                            WHERE (
                                LOWER(merchant_name) LIKE ? OR
                                LOWER(company_name) LIKE ?
                            )
                            AND status = 'approved'
                            AND admin_approved = 1
                            AND ticker IS NOT NULL
                            AND ticker != ''
                            ORDER BY confidence DESC
                            LIMIT 1
                        """, (search_term, search_term))
                        
                        match = cursor.fetchone()
                        if match:
                            best_match = {
                                'ticker': match[1],
                                'company_name': match[2] or match[0],
                                'confidence': match[4] or 0.8
                            }
                
                # Apply enhancement if found
                if best_match and best_match['confidence'] > 0.5:
                    item['brand'] = {
                        'name': best_match['company_name'],
                        'stockSymbol': best_match['ticker']
                    }
                    item['brandSymbol'] = best_match['ticker']
                    item['brand_confidence'] = best_match['confidence']
                    item['brand_source'] = 'keyword_cache' if best_match['confidence'] >= 0.95 else 'llm_center'
                
                enhanced_items.append(item)
            
            conn.close()
            return enhanced_items
            
        except Exception as e:
            logger.warning(f"Could not enhance items with LLM mappings: {e}")
            # Fallback to keyword cache
            return self._enhance_with_keyword_cache(items, keyword_cache)
    
    def _enhance_with_keyword_cache(self, items: List[Dict], keyword_cache: Dict) -> List[Dict]:
        """Fast keyword-based enhancement without DB queries - IMPROVED with better matching"""
        enhanced_items = []
        company_names = {
            'HPQ': 'Hewlett-Packard', 'NKE': 'Nike', 'ADDYY': 'Adidas',
            'AAPL': 'Apple', 'MSFT': 'Microsoft', 'GOOGL': 'Alphabet',
            'AMZN': 'Amazon', 'SSNLF': 'Samsung', 'TSLA': 'Tesla',
            'TGT': 'Target', 'WMT': 'Walmart', 'COST': 'Costco', 'SBUX': 'Starbucks',
            'TJX': 'TJX Companies', 'PYPL': 'PayPal', 'V': 'Visa', 'MA': 'Mastercard',
            'PSY': 'Pillsbury'
        }
        
        # Enhanced keyword patterns for better matching
        # Priority order: specific patterns first, then general keywords
        keyword_patterns = [
            # HP patterns (highest priority)
            (r'\bhp\s+envy\b', 'HPQ', 'Hewlett-Packard', 0.98),
            (r'\bhewlett[-\s]?packard\b', 'HPQ', 'Hewlett-Packard', 0.97),
            (r'\benvy\b', 'HPQ', 'Hewlett-Packard', 0.85),  # Lower confidence for just "envy"
            (r'\bhp\b', 'HPQ', 'Hewlett-Packard', 0.90),
            # Nike patterns
            (r'\bnike\b', 'NKE', 'Nike', 0.95),
            (r'\bjordan\b', 'NKE', 'Nike (Jordan)', 0.90),
            # Apple patterns
            (r'\bapple\b', 'AAPL', 'Apple', 0.95),
            (r'\biphone\b', 'AAPL', 'Apple', 0.90),
            (r'\bipad\b', 'AAPL', 'Apple', 0.90),
            # Payment processors
            (r'\bpaypal\b', 'PYPL', 'PayPal', 0.95),
            (r'\bpay\s+from\s+primary\b', 'PYPL', 'PayPal', 0.85),
            (r'\bdebit\s+tend\b', None, None, 0.0),  # Skip - payment method, not brand
            # Retailers
            (r'\bwalmart\b', 'WMT', 'Walmart', 0.95),
            (r'\btj\s*maxx\b', 'TJX', 'TJX Companies', 0.95),
            (r'\btjx\b', 'TJX', 'TJX Companies', 0.90),
            # Coffee/Starbucks patterns
            (r'\bstarbucks\b', 'SBUX', 'Starbucks', 0.95),
            (r'\bsbr\b', 'SBUX', 'Starbucks', 0.90),  # SBR abbreviation
            (r'\b284050833\b', 'SBUX', 'Starbucks', 0.85),  # Starbucks product code
            # Food brands - Pillsbury
            (r'\bpillsbury\b', 'PSY', 'Pillsbury', 0.95),
            (r'\b284000087\b', 'PSY', 'Pillsbury', 0.90),  # Pillsbury product code
        ]
        
        for item in items:
            item_name = item.get('name', '').lower()
            if not item_name:
                enhanced_items.append(item)
                continue
            
            # Skip payment method lines (they're not products)
            if any(skip in item_name for skip in ['debit tend', 'pay from', 'payment', 'tend', 'card']):
                # These are payment methods, not products - don't assign brands
                enhanced_items.append(item)
                continue
            
            best_match = None
            best_confidence = 0.0
            
            # Try pattern matching first (more accurate)
            for pattern, ticker, company_name, confidence in keyword_patterns:
                if ticker and re.search(pattern, item_name, re.IGNORECASE):
                    if confidence > best_confidence:
                        best_match = {
                            'ticker': ticker,
                            'company_name': company_name,
                            'confidence': confidence
                        }
                        best_confidence = confidence
                        break  # Found a match, use it
            
            # Fallback to simple keyword cache if no pattern match
            if not best_match:
                for keyword, ticker in keyword_cache.items():
                    if keyword in item_name:
                        company_name = company_names.get(ticker, ticker)
                        # Lower confidence for simple keyword matches
                        confidence = 0.75 if len(keyword) < 3 else 0.85
                        if confidence > best_confidence:
                            best_match = {
                                'ticker': ticker,
                                'company_name': company_name,
                                'confidence': confidence
                            }
                            best_confidence = confidence
                            break
            
            # Apply enhancement if we found a good match
            if best_match and best_match['confidence'] > 0.7:
                item['brand'] = {
                    'name': best_match['company_name'],
                    'stockSymbol': best_match['ticker'],
                    'symbol': best_match['ticker']  # Also add 'symbol' for compatibility
                }
                item['brandSymbol'] = best_match['ticker']
                item['brand_confidence'] = best_match['confidence']
                item['brand_source'] = 'keyword_cache'
                logger.info(f"✅ Enhanced item '{item.get('name')}' → {best_match['ticker']} ({best_match['company_name']}) (confidence: {best_match['confidence']:.2f})")
            else:
                # No confident match found - mark for manual review
                item['brand_confidence'] = 0.0
                item['brand_source'] = 'none'
                if item.get('name'):
                    logger.debug(f"⚠️ No brand match found for item '{item.get('name')}' (best confidence: {best_confidence:.2f})")
            
            enhanced_items.append(item)
        
        return enhanced_items
    
    def process_receipt(self, receipt_data: Dict) -> Dict:
        """
        Main method to process a receipt
        receipt_data should contain: {'raw_text': str, 'image_path': Optional[str], 'skip_llm_enhancement': Optional[bool]}
        """
        try:
            raw_text = receipt_data.get('raw_text', '')
            
            # If no raw text but image path provided, extract text
            if not raw_text and receipt_data.get('image_path'):
                raw_text = self.extract_text_from_image(receipt_data['image_path'])

            if not raw_text:
                logger.warning("No raw text available for parsing.")
                return {
                    'success': True,
                    'data': {
                        'retailer': None, 'items': [], 'brands': [], 'totalAmount': 0.0,
                        'timestamp': datetime.now().isoformat(), 'raw_text': '', 'needs_manual_entry': True
                    }
                }

            # Parse receipt text (this creates the basic structure)
            parsed_data = self.parse_receipt_text(raw_text)
            
            # Enhance items with LLM Center mappings (only if not skipped for speed)
            skip_llm = receipt_data.get('skip_llm_enhancement', False)
            if not skip_llm:
                parsed_data['items'] = self._enhance_items_with_llm_mappings(parsed_data.get('items', []), raw_text)
            else:
                # Still use fast keyword cache for common brands
                keyword_cache = {
                    'hp': 'HPQ', 'hewlett': 'HPQ', 'nike': 'NKE', 'adidas': 'ADDYY',
                    'apple': 'AAPL', 'microsoft': 'MSFT', 'google': 'GOOGL', 'amazon': 'AMZN'
                }
                parsed_data['items'] = self._enhance_with_keyword_cache(parsed_data.get('items', []), keyword_cache)
            
            # Identify brands from items (this updates the brands list)
            parsed_data['brands'] = self._identify_brands_from_items(parsed_data.get('items', []))
            
            return {'success': True, 'data': parsed_data}
        except Exception as e:
            logger.error(f"Error in process_receipt: {str(e)}")
            import traceback
            logger.error(traceback.format_exc())
            return {'success': False, 'error': str(e)}

