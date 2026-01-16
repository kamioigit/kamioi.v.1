# Automatic Monthly LLM Amortization Setup

## ✅ Automatic Scheduling Integrated

The system now automatically runs monthly LLM amortization **without any manual setup required**!

## 🔧 How It Works

1. **APScheduler Integration**: The Flask app uses APScheduler to automatically run monthly amortization
2. **Schedule**: Runs on the **1st of each month at 00:01 AM**
3. **No Manual Setup**: No cron jobs, no Task Scheduler - it's built into the Flask app
4. **Automatic**: Starts when the Flask app starts

## 📦 Installation

If APScheduler is not installed, install it:

```bash
pip install APScheduler
```

Or add to `requirements.txt`:
```
APScheduler>=3.10.0
```

## ✅ Date Fix

**Fixed the date issue** where entries were being pushed back 1 day:
- Journal entries now store dates as `YYYY-MM-DD` only (no time, no timezone)
- This prevents timezone conversion issues that caused dates to shift

## 🚀 How to Use

1. **Start your Flask app** - The scheduler starts automatically
2. **That's it!** - The system will automatically create amortization entries on the 1st of each month

## 📝 Logs

When the scheduler runs, you'll see:
```
[SCHEDULER] Running monthly LLM amortization for 2025-12
[SCHEDULER] Successfully created 1 amortization journal entry/entries
```

## 🔍 Verification

After the 1st of each month:
1. Go to **Financial Analytics → Transaction Management**
2. Look for entry with reference: `LLM-AMORT-YYYYMM`
3. Type: `amortization`
4. Date: Should be the 1st of the month (no longer shifted back!)

## 🎯 Summary

**What's Done:**
- ✅ APScheduler integrated into Flask app
- ✅ Automatic monthly scheduling (no manual setup)
- ✅ Date issue fixed (no more day shift)
- ✅ Scheduler starts automatically with Flask app

**What You Need to Do:**
- ⚠️ Install APScheduler if not already installed: `pip install APScheduler`
- ⚠️ Restart your Flask app to activate the scheduler

**Next Automatic Run:**
- 📅 December 1, 2025 at 00:01 AM (if Flask app is running)


