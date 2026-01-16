"""
Create First LLM Amortization Entry
Since November 1st has already passed, create the first amortization entry manually
Then cron will take over for future months
"""

import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.llm_amortization_service import LLMAmortizationService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def create_first_amortization_entry():
    """Create the first amortization entry for November 2025"""
    try:
        service = LLMAmortizationService()
        
        # Create entry for November 1st, 2025
        entry_date = datetime(2025, 11, 1)
        
        logger.info(f"Creating first LLM amortization entry for {entry_date.strftime('%Y-%m-%d')}")
        
        created_entries = service.create_monthly_amortization_entries(entry_date)
        
        if created_entries:
            logger.info(f"✓ Successfully created {len(created_entries)} amortization journal entry/entries")
            logger.info(f"  Entry IDs: {', '.join(created_entries)}")
            logger.info("")
            logger.info("Next steps:")
            logger.info("1. Cron job is set up to run automatically on the 1st of each month")
            logger.info("2. Future entries will be created automatically")
        else:
            logger.warning("No amortization entries were created. Check if there are active LLM assets.")
            
    except Exception as e:
        logger.error(f"Error creating first amortization entry: {str(e)}")
        raise

if __name__ == '__main__':
    create_first_amortization_entry()


