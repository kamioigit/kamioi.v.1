#!/bin/bash
# Setup Monthly LLM Amortization Cron Job
# This script sets up a cron job to run on the 1st of each month at midnight

# Get the absolute path to the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PYTHON_SCRIPT="$SCRIPT_DIR/../scheduled_jobs/monthly_llm_amortization.py"

# Get Python path (adjust if needed)
PYTHON_PATH=$(which python3 || which python)

# Create cron entry: Run on 1st of every month at 00:00 (midnight)
CRON_ENTRY="0 0 1 * * $PYTHON_PATH $PYTHON_SCRIPT >> $SCRIPT_DIR/../logs/llm_amortization.log 2>&1"

# Add to crontab
(crontab -l 2>/dev/null | grep -v "monthly_llm_amortization.py"; echo "$CRON_ENTRY") | crontab -

echo "✓ Monthly LLM amortization cron job has been set up!"
echo "  It will run on the 1st of each month at midnight"
echo ""
echo "To view your crontab: crontab -l"
echo "To remove this job: crontab -e (then delete the line)"


