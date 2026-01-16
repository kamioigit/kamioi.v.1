# Monthly LLM Amortization Setup

## ✅ First Entry Created

The first amortization entry for November 2025 has been created successfully:
- **Entry ID**: JE-1762199208680-6967
- **Date**: November 1, 2025
- **Amount**: $4,000.00
- **Assets Amortized**: 3 assets (KamioiGPT v1.0, Transaction Dataset v1.0, Merchant Mapping Model)
- **Journal Entry**: DR Amortization Expense (67010) / CR LLM Data Assets (15200)

## 📅 Automatic Monthly Execution Setup

### Option 1: Cron (Linux/Mac/WSL)

If you're on Linux, Mac, or Windows Subsystem for Linux (WSL):

1. **Open your crontab:**
   ```bash
   crontab -e
   ```

2. **Add this line (adjust the path to your backend directory):**
   ```
   0 0 1 * * cd /path/to/Kamioi/backend && python scheduled_jobs/monthly_llm_amortization.py >> logs/llm_amortization.log 2>&1
   ```

   **For your specific setup:**
   ```
   0 0 1 * * cd C:/Users/beltr/Kamioi/backend && python scheduled_jobs/monthly_llm_amortization.py >> logs/llm_amortization.log 2>&1
   ```

3. **Save and exit** (in vi: `:wq`, in nano: `Ctrl+X`, then `Y`, then `Enter`)

4. **Verify it's set up:**
   ```bash
   crontab -l
   ```

### Option 2: Windows Task Scheduler (Manual Setup)

Since automated setup requires admin rights, here's the manual process:

1. **Open Task Scheduler** (search "Task Scheduler" in Windows)

2. **Click "Create Basic Task"** in the right panel

3. **Name & Description:**
   - Name: `Monthly LLM Amortization`
   - Description: `Runs monthly LLM Data Assets amortization journal entries on the 1st of each month`

4. **Trigger:**
   - Select "Monthly"
   - Start date: Next month (e.g., December 1, 2025)
   - Time: `00:00:00` (midnight)
   - Months: All months (January - December)
   - Days: `1` (first day of month)

5. **Action:**
   - Select "Start a program"
   - Program/script: `python` (or full path: `C:\Python\python.exe`)
   - Add arguments: `C:\Users\beltr\Kamioi\backend\scheduled_jobs\monthly_llm_amortization.py`
   - Start in: `C:\Users\beltr\Kamioi\backend`

6. **Finish** - Click "Finish" and check "Open the Properties dialog for this task"

7. **In Properties:**
   - **General tab**: Check "Run whether user is logged on or not"
   - **Conditions tab**: Uncheck "Start the task only if the computer is on AC power"
   - **Settings tab**: Check "Allow task to be run on demand"

8. **Click OK** (may prompt for admin password)

## 🔍 How It Works

The monthly amortization job:
- Runs automatically on the **1st of each month at midnight**
- Calculates monthly amortization for all active LLM assets: `Cost Basis / Useful Life`
- Creates a journal entry:
  - **DR** Amortization Expense (67010) - Expense on P&L
  - **CR** LLM Data Assets (15200) - Reduces asset carrying value
- Reference format: `LLM-AMORT-YYYYMM` (e.g., `LLM-AMORT-202512`)

## 📊 Expected Monthly Amount

Based on current assets:
- **Monthly Total**: $4,000.00
- **Per Asset**: ~$1,333.33 each (3 assets)

This will continue until assets are fully amortized.

## 🧪 Testing

To test the job manually (before the 1st of next month):

**Linux/Mac/WSL:**
```bash
cd backend
python scheduled_jobs/monthly_llm_amortization.py
```

**Windows:**
```powershell
cd C:\Users\beltr\Kamioi\backend
python scheduled_jobs/monthly_llm_amortization.py
```

Note: The script checks if it's the 1st of the month. To test on other days, temporarily comment out the date check in `monthly_llm_amortization.py` (lines 27-30).

## 📝 Logs

Logs will be written to:
- **Linux/Mac/WSL**: `backend/logs/llm_amortization.log`
- **Windows**: Check Windows Event Viewer (Task Scheduler history) or create a log file manually

## ✅ Verification

After December 1st, check the Transaction Management tab in Financial Analytics:
- Look for reference: `LLM-AMORT-202512`
- Type: `amortization`
- Amount: $4,000.00

The entry will appear automatically - no manual intervention needed!

## 🎯 Summary

**What's Done:**
- ✅ First amortization entry created (November 1, 2025)
- ✅ Monthly job script created
- ✅ API endpoint available for manual triggering

**What You Need to Do:**
- ⚠️ Set up cron (Option 1) or Windows Task Scheduler (Option 2) as described above
- ⚠️ Verify the task is scheduled correctly

**Next Automatic Run:**
- 📅 December 1, 2025 at midnight (if scheduler is set up)
