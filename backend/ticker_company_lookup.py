"""
Ticker to Company Name Lookup Service
Provides accurate company names for stock tickers to fix LLM mapping data integrity
"""
import sqlite3
import requests
import json
from typing import Optional, Dict

# Comprehensive ticker to company name mapping
# This is a fallback for common tickers - ideally we'd use an API
TICKER_TO_COMPANY = {
    'DLTR': 'Dollar Tree Inc.',
    'ROKU': 'Roku Inc.',
    'MS': 'Morgan Stanley',
    'AXP': 'American Express Company',
    'T': 'AT&T Inc.',
    'CBRE': 'CBRE Group Inc.',
    'AAPL': 'Apple Inc.',
    'MSFT': 'Microsoft Corporation',
    'GOOGL': 'Alphabet Inc.',
    'AMZN': 'Amazon.com Inc.',
    'META': 'Meta Platforms Inc.',
    'TSLA': 'Tesla Inc.',
    'NVDA': 'NVIDIA Corporation',
    'NFLX': 'Netflix Inc.',
    'DIS': 'The Walt Disney Company',
    'WMT': 'Walmart Inc.',
    'TGT': 'Target Corporation',
    'SBUX': 'Starbucks Corporation',
    'MCD': 'McDonald\'s Corporation',
    'CVS': 'CVS Health Corporation',
    'SHEL': 'Shell plc',
    'JPM': 'JPMorgan Chase & Co.',
    'BAC': 'Bank of America Corporation',
    'WFC': 'Wells Fargo & Company',
    'C': 'Citigroup Inc.',
    'GS': 'The Goldman Sachs Group Inc.',
    'V': 'Visa Inc.',
    'MA': 'Mastercard Incorporated',
    'JNJ': 'Johnson & Johnson',
    'PG': 'The Procter & Gamble Company',
    'KO': 'The Coca-Cola Company',
    'PEP': 'PepsiCo Inc.',
    'WMT': 'Walmart Inc.',
    'HD': 'The Home Depot Inc.',
    'LOW': 'Lowe\'s Companies Inc.',
    'NKE': 'Nike Inc.',
    'ADBE': 'Adobe Inc.',
    'CRM': 'Salesforce Inc.',
    'ORCL': 'Oracle Corporation',
    'INTC': 'Intel Corporation',
    'AMD': 'Advanced Micro Devices Inc.',
    'QCOM': 'QUALCOMM Incorporated',
    'AVGO': 'Broadcom Inc.',
    'COST': 'Costco Wholesale Corporation',
    'TMO': 'Thermo Fisher Scientific Inc.',
    'ABBV': 'AbbVie Inc.',
    'LLY': 'Eli Lilly and Company',
    'UNH': 'UnitedHealth Group Incorporated',
    'CVS': 'CVS Health Corporation',
    'ABT': 'Abbott Laboratories',
    'DHR': 'Danaher Corporation',
    'BMY': 'Bristol-Myers Squibb Company',
    'AMGN': 'Amgen Inc.',
    'PM': 'Philip Morris International Inc.',
    'MO': 'Altria Group Inc.',
    'DUK': 'Duke Energy Corporation',
    'SO': 'The Southern Company',
    'AEP': 'American Electric Power Company Inc.',
    'SRE': 'Sempra Energy',
    'NEE': 'NextEra Energy Inc.',
    'XOM': 'Exxon Mobil Corporation',
    'CVX': 'Chevron Corporation',
    'COP': 'ConocoPhillips',
    'SLB': 'Schlumberger Limited',
    'EOG': 'EOG Resources Inc.',
    'MPC': 'Marathon Petroleum Corporation',
    'VLO': 'Valero Energy Corporation',
    'PSX': 'Phillips 66',
    'HES': 'Hess Corporation',
    'OXY': 'Occidental Petroleum Corporation',
    'FANG': 'Diamondback Energy Inc.',
    'MRO': 'Marathon Oil Corporation',
    'APA': 'APA Corporation',
    'DVN': 'Devon Energy Corporation',
    'CTRA': 'Coterra Energy Inc.',
    'PR': 'Permian Resources Corporation',
    'MTCH': 'Match Group Inc.',
    'IAC': 'IAC Inc.',
    'ANGI': 'Angi Inc.',
    'VRSK': 'Verisk Analytics Inc.',
    'FAST': 'Fastenal Company',
    'GWW': 'W.W. Grainger Inc.',
    'SHW': 'The Sherwin-Williams Company',
    'PPG': 'PPG Industries Inc.',
    'EMR': 'Emerson Electric Co.',
    'ETN': 'Eaton Corporation plc',
    'ROK': 'Rockwell Automation Inc.',
    'HON': 'Honeywell International Inc.',
    'GE': 'General Electric Company',
    'DE': 'Deere & Company',
    'CAT': 'Caterpillar Inc.',
    'CMI': 'Cummins Inc.',
    'DAL': 'Delta Air Lines Inc.',
    'UAL': 'United Airlines Holdings Inc.',
    'AAL': 'American Airlines Group Inc.',
    'LUV': 'Southwest Airlines Co.',
    'JBLU': 'JetBlue Airways Corporation',
    'ALK': 'Alaska Air Group Inc.',
    'SAVE': 'Spirit Airlines Inc.',
    'HA': 'Hawaiian Holdings Inc.',
    'RCL': 'Royal Caribbean Cruises Ltd.',
    'CCL': 'Carnival Corporation & plc',
    'NCLH': 'Norwegian Cruise Line Holdings Ltd.',
    'MSC': 'MSC Industrial Direct Co. Inc.',
    'WCC': 'WESCO International Inc.',
    'MSM': 'MSC Industrial Direct Co. Inc.',
    'AOS': 'A.O. Smith Corporation',
    'ITT': 'ITT Inc.',
    'FLR': 'Fluor Corporation',
    'JEC': 'Jacobs Engineering Group Inc.',
    'ACM': 'AECOM',
    'CLH': 'Clean Harbors Inc.',
    'RSG': 'Republic Services Inc.',
    'WM': 'Waste Management Inc.',
    'ROL': 'Rollins Inc.',
    'ABM': 'ABM Industries Incorporated',
    'CWST': 'Casella Waste Systems Inc.',
    'ES': 'Eversource Energy',
    'ED': 'Consolidated Edison Inc.',
    'FE': 'FirstEnergy Corp.',
    'ETR': 'Entergy Corporation',
    'PPL': 'PPL Corporation',
    'ES': 'Eversource Energy',
    'CMS': 'CMS Energy Corporation',
    'ATO': 'Atmos Energy Corporation',
    'NI': 'NiSource Inc.',
    'UGI': 'UGI Corporation',
    'SWX': 'Southwest Gas Holdings Inc.',
    'NWN': 'Northwest Natural Gas Company',
    'NJR': 'New Jersey Resources Corporation',
    'OGS': 'ONE Gas Inc.',
    'SJI': 'South Jersey Industries Inc.',
    'GLNG': 'Golar LNG Limited',
    'GASS': 'StealthGas Inc.',
    'NG': 'Novagold Resources Inc.',
    'NGD': 'New Gold Inc.',
    'NGVC': 'Natural Grocers by Vitamin Cottage Inc.',
    'NHI': 'National Health Investors Inc.',
    'NHTC': 'Natural Health Trends Corp.',
    'NHS': 'Neuberger Berman High Yield Strategies Fund',
    'NHF': 'NexPoint Diversified Real Estate Trust',
    'NHC': 'National Healthcare Corporation',
    'NH': 'NantHealth Inc.',
    'NHC': 'National Healthcare Corporation',
    'NHF': 'NexPoint Diversified Real Estate Trust',
    'NHS': 'Neuberger Berman High Yield Strategies Fund',
    'NHTC': 'Natural Health Trends Corp.',
    'NHI': 'National Health Investors Inc.',
    'NGVC': 'Natural Grocers by Vitamin Cottage Inc.',
    'NGD': 'New Gold Inc.',
    'NG': 'Novagold Resources Inc.',
    'GASS': 'StealthGas Inc.',
    'GLNG': 'Golar LNG Limited',
    'SJI': 'South Jersey Industries Inc.',
    'OGS': 'ONE Gas Inc.',
    'NJR': 'New Jersey Resources Corporation',
    'NWN': 'Northwest Natural Gas Company',
    'SWX': 'Southwest Gas Holdings Inc.',
    'UGI': 'UGI Corporation',
    'NI': 'NiSource Inc.',
    'ATO': 'Atmos Energy Corporation',
    'CMS': 'CMS Energy Corporation',
    'ES': 'Eversource Energy',
    'PPL': 'PPL Corporation',
    'ETR': 'Entergy Corporation',
    'FE': 'FirstEnergy Corp.',
    'ED': 'Consolidated Edison Inc.',
    'ES': 'Eversource Energy',
    'CWST': 'Casella Waste Systems Inc.',
    'ABM': 'ABM Industries Incorporated',
    'ROL': 'Rollins Inc.',
    'WM': 'Waste Management Inc.',
    'RSG': 'Republic Services Inc.',
    'CLH': 'Clean Harbors Inc.',
    'ACM': 'AECOM',
    'JEC': 'Jacobs Engineering Group Inc.',
    'FLR': 'Fluor Corporation',
    'ITT': 'ITT Inc.',
    'AOS': 'A.O. Smith Corporation',
    'MSM': 'MSC Industrial Direct Co. Inc.',
    'WCC': 'WESCO International Inc.',
    'MSC': 'MSC Industrial Direct Co. Inc.',
    'NCLH': 'Norwegian Cruise Line Holdings Ltd.',
    'CCL': 'Carnival Corporation & plc',
    'RCL': 'Royal Caribbean Cruises Ltd.',
    'HA': 'Hawaiian Holdings Inc.',
    'SAVE': 'Spirit Airlines Inc.',
    'ALK': 'Alaska Air Group Inc.',
    'JBLU': 'JetBlue Airways Corporation',
    'LUV': 'Southwest Airlines Co.',
    'AAL': 'American Airlines Group Inc.',
    'UAL': 'United Airlines Holdings Inc.',
    'DAL': 'Delta Air Lines Inc.',
    'CMI': 'Cummins Inc.',
    'CAT': 'Caterpillar Inc.',
    'DE': 'Deere & Company',
    'GE': 'General Electric Company',
    'HON': 'Honeywell International Inc.',
    'ROK': 'Rockwell Automation Inc.',
    'ETN': 'Eaton Corporation plc',
    'EMR': 'Emerson Electric Co.',
    'PPG': 'PPG Industries Inc.',
    'SHW': 'The Sherwin-Williams Company',
    'GWW': 'W.W. Grainger Inc.',
    'FAST': 'Fastenal Company',
    'VRSK': 'Verisk Analytics Inc.',
    'ANGI': 'Angi Inc.',
    'IAC': 'IAC Inc.',
    'MTCH': 'Match Group Inc.',
    'PR': 'Permian Resources Corporation',
    'CTRA': 'Coterra Energy Inc.',
    'DVN': 'Devon Energy Corporation',
    'APA': 'APA Corporation',
    'MRO': 'Marathon Oil Corporation',
    'FANG': 'Diamondback Energy Inc.',
    'OXY': 'Occidental Petroleum Corporation',
    'HES': 'Hess Corporation',
    'PSX': 'Phillips 66',
    'VLO': 'Valero Energy Corporation',
    'MPC': 'Marathon Petroleum Corporation',
    'EOG': 'EOG Resources Inc.',
    'SLB': 'Schlumberger Limited',
    'COP': 'ConocoPhillips',
    'CVX': 'Chevron Corporation',
    'XOM': 'Exxon Mobil Corporation',
    'NEE': 'NextEra Energy Inc.',
    'SRE': 'Sempra Energy',
    'AEP': 'American Electric Power Company Inc.',
    'SO': 'The Southern Company',
    'DUK': 'Duke Energy Corporation',
    'MO': 'Altria Group Inc.',
    'PM': 'Philip Morris International Inc.',
    'AMGN': 'Amgen Inc.',
    'BMY': 'Bristol-Myers Squibb Company',
    'DHR': 'Danaher Corporation',
    'ABT': 'Abbott Laboratories',
    'CVS': 'CVS Health Corporation',
    'UNH': 'UnitedHealth Group Incorporated',
    'LLY': 'Eli Lilly and Company',
    'ABBV': 'AbbVie Inc.',
    'TMO': 'Thermo Fisher Scientific Inc.',
    'COST': 'Costco Wholesale Corporation',
    'AVGO': 'Broadcom Inc.',
    'QCOM': 'QUALCOMM Incorporated',
    'AMD': 'Advanced Micro Devices Inc.',
    'INTC': 'Intel Corporation',
    'ORCL': 'Oracle Corporation',
    'CRM': 'Salesforce Inc.',
    'ADBE': 'Adobe Inc.',
    'NKE': 'Nike Inc.',
    'LOW': 'Lowe\'s Companies Inc.',
    'HD': 'The Home Depot Inc.',
    'WMT': 'Walmart Inc.',
    'PEP': 'PepsiCo Inc.',
    'KO': 'The Coca-Cola Company',
    'PG': 'The Procter & Gamble Company',
    'JNJ': 'Johnson & Johnson',
    'MA': 'Mastercard Incorporated',
    'V': 'Visa Inc.',
    'GS': 'The Goldman Sachs Group Inc.',
    'C': 'Citigroup Inc.',
    'WFC': 'Wells Fargo & Company',
    'BAC': 'Bank of America Corporation',
    'JPM': 'JPMorgan Chase & Co.',
    'SHEL': 'Shell plc',
    'CVS': 'CVS Health Corporation',
    'MCD': 'McDonald\'s Corporation',
    'SBUX': 'Starbucks Corporation',
    'TGT': 'Target Corporation',
    'WMT': 'Walmart Inc.',
    'DIS': 'The Walt Disney Company',
    'NFLX': 'Netflix Inc.',
    'NVDA': 'NVIDIA Corporation',
    'TSLA': 'Tesla Inc.',
    'META': 'Meta Platforms Inc.',
    'AMZN': 'Amazon.com Inc.',
    'GOOGL': 'Alphabet Inc.',
    'MSFT': 'Microsoft Corporation',
    'AAPL': 'Apple Inc.'
}

def get_ticker_from_company_name(company_name: str) -> Optional[str]:
    """
    Get stock ticker from company name (reverse lookup).
    Uses fuzzy matching to find tickers even with partial names.
    
    Args:
        company_name: Company name string (e.g., 'Dollar Tree', 'Dollar Tree Inc.')
    
    Returns:
        Stock ticker symbol or None if not found
    """
    if not company_name:
        return None
    
    company_normalized = company_name.lower().strip()
    
    # Remove common suffixes for better matching
    suffixes = [' inc.', ' inc', ' corporation', ' corp.', ' corp', ' ltd.', ' ltd', ' llc', ' company', ' co.', ' co']
    for suffix in suffixes:
        if company_normalized.endswith(suffix):
            company_normalized = company_normalized[:-len(suffix)].strip()
    
    # Search through TICKER_TO_COMPANY for matches
    # Priority: exact match > starts with > contains
    exact_match = None
    starts_with_match = None
    contains_match = None
    
    for ticker, full_company_name in TICKER_TO_COMPANY.items():
        full_normalized = full_company_name.lower().strip()
        # Remove suffixes from full company name too
        for suffix in suffixes:
            if full_normalized.endswith(suffix):
                full_normalized = full_normalized[:-len(suffix)].strip()
        
        # Check for exact match
        if full_normalized == company_normalized:
            exact_match = ticker
            break
        # Check if input starts with company name (e.g., "Dollar Tree" -> "Dollar Tree Inc.")
        elif full_normalized.startswith(company_normalized):
            if not starts_with_match:
                starts_with_match = ticker
        # Check if company name contains input (e.g., "Dollar" -> "Dollar Tree Inc.")
        elif company_normalized in full_normalized and len(company_normalized) >= 4:
            if not contains_match:
                contains_match = ticker
    
    # Return best match (priority: exact > starts with > contains)
    return exact_match or starts_with_match or contains_match

def get_company_name_from_ticker(ticker: str, use_api: bool = False) -> Optional[str]:
    """
    Get company name from stock ticker.
    First tries API lookup, then falls back to static mapping.
    
    Args:
        ticker: Stock ticker symbol (e.g., 'AAPL', 'DLTR')
        use_api: Whether to try API lookup first (requires internet)
    
    Returns:
        Company name string or None if not found
    """
    if not ticker:
        return None
    
    ticker_upper = ticker.strip().upper()
    
    # Try API lookup if enabled (requires yfinance or similar)
    if use_api:
        try:
            import yfinance as yf
            stock = yf.Ticker(ticker_upper)
            info = stock.info
            company_name = info.get('longName') or info.get('shortName')
            if company_name:
                return company_name
        except Exception:
            pass  # Fall back to static mapping
    
    # Fall back to static mapping
    return TICKER_TO_COMPANY.get(ticker_upper)

def validate_ticker_company_match(ticker: str, company_name: str) -> Dict:
    """
    Validate if company_name matches the correct company for the ticker.
    
    Returns:
        {
            'is_valid': bool,
            'correct_company_name': str or None,
            'needs_correction': bool
        }
    """
    if not ticker:
        return {'is_valid': False, 'correct_company_name': None, 'needs_correction': False}
    
    correct_company = get_company_name_from_ticker(ticker, use_api=False)
    
    if not correct_company:
        # Ticker not in our mapping - can't validate
        return {'is_valid': True, 'correct_company_name': None, 'needs_correction': False}
    
    # Normalize for comparison (case-insensitive, remove common suffixes)
    def normalize(name):
        if not name:
            return ''
        name_lower = name.lower().strip()
        # Remove common suffixes
        for suffix in [' inc.', ' inc', ' corporation', ' corp.', ' corp', ' ltd.', ' ltd', ' llc', ' company', ' co.', ' co']:
            if name_lower.endswith(suffix):
                name_lower = name_lower[:-len(suffix)].strip()
        return name_lower
    
    company_normalized = normalize(company_name)
    correct_normalized = normalize(correct_company)
    
    is_valid = company_normalized == correct_normalized
    
    return {
        'is_valid': is_valid,
        'correct_company_name': correct_company if not is_valid else None,
        'needs_correction': not is_valid
    }

if __name__ == '__main__':
    # Test the lookup
    test_cases = [
        ('DLTR', 'Dollar Tree Inc.'),
        ('DLTR', 'Depot Market Inc. NV'),
        ('ROKU', 'Roku Inc.'),
        ('ROKU', 'Neural Neural Services MI'),
        ('MS', 'Morgan Stanley'),
        ('MS', 'Market Edge Corp. OR'),
    ]
    
    print("Testing ticker-to-company lookup:")
    for ticker, company_name in test_cases:
        result = validate_ticker_company_match(ticker, company_name)
        correct = get_company_name_from_ticker(ticker)
        print(f"\nTicker: {ticker}")
        print(f"  Input Company: {company_name}")
        print(f"  Correct Company: {correct}")
        print(f"  Valid: {result['is_valid']}")
        print(f"  Needs Correction: {result['needs_correction']}")

