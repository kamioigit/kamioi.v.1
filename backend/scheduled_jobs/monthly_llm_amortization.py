"""
Monthly LLM Data Assets Amortization Scheduled Job
Runs on the 1st of each month to create amortization journal entries
"""

from datetime import datetime
import sys
import os

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.llm_amortization_service import LLMAmortizationService
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_monthly_amortization():
    """
    Create monthly amortization journal entries for LLM Data Assets
    Should be scheduled to run on the 1st of each month (e.g., via cron)
    """
    try:
        service = LLMAmortizationService()
        today = datetime.now()
        
        # Only run on the 1st of the month
        if today.day != 1:
            logger.info(f"Skipping amortization - not the 1st of month (today is {today.strftime('%Y-%m-%d')})")
            return
        
        logger.info(f"Running monthly LLM amortization for {today.strftime('%Y-%m')}")
        
        created_entries = service.create_monthly_amortization_entries(today)
        
        if created_entries:
            logger.info(f"Successfully created {len(created_entries)} amortization journal entry/entries")
        else:
            logger.warning("No amortization entries were created")
            
    except Exception as e:
        logger.error(f"Error running monthly amortization: {str(e)}")
        raise

if __name__ == '__main__':
    run_monthly_amortization()

