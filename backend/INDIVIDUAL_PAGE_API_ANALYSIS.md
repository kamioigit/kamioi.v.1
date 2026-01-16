# Individual Dashboard Page-by-Page API Analysis

**Generated**: 2025-10-20 14:10:54

## Summary

- **Total Pages Analyzed**: 10
- **Total Issues Found**: 0
- **Backend Endpoints Available**: 198

## Page-by-Page Analysis

### Dashboard Overview

**Components**: Dashboard.jsx, DashboardSidebar.jsx

**API Calls**:
- `http://127.0.0.1:5000/api/user/active-ad` (fetch) - ⚠️ External

**Issues**: None found

---

### AI Insights

**Components**: AIInsights.jsx, AIRecommendations.jsx

**API Calls**:
- `http://127.0.0.1:5000/api/user/ai/insights` (fetch) - ⚠️ External
- `http://127.0.0.1:5000/api/user/rewards` (fetch) - ⚠️ External
- `http://127.0.0.1:5000/api/analytics/recommendation-click` (fetch) - ⚠️ External
- `http://127.0.0.1:5000/api/user/ai-insights?timeframe=${selectedTimeframe}` (fetch) - ⚠️ External

**Issues**: None found

---

### Transactions

**Components**: UserTransactions.jsx, TransactionHistory.jsx

**API Calls**:
- `http://127.0.0.1:5000/api/user/transactions` (fetch) - ⚠️ External
- `http://127.0.0.1:5000/api/transactions/process` (fetch) - ⚠️ External
- `http://127.0.0.1:5000/api/transactions/bulk-upload` (fetch) - ⚠️ External
- `http://127.0.0.1:5000/api/user/export/transactions` (fetch) - ⚠️ External
- `http://127.0.0.1:5000/api/mappings/submit` (fetch) - ⚠️ External

**Issues**: None found

---

### Portfolio

**Components**: Portfolio.jsx, StockStatus.jsx

**API Calls**: None found

**Issues**: None found

---

### Settings

**Components**: Settings.jsx, ProfileSettings.jsx

**API Calls**:
- `http://127.0.0.1:5000/api/user/profile` (fetch) - ⚠️ External
- `http://127.0.0.1:5000/api/user/statements` (fetch) - ⚠️ External
- `http://127.0.0.1:5000/api/user/profile` (fetch) - ⚠️ External

**Issues**: None found

---

### Receipt Upload

**Components**: ReceiptUpload.jsx, ReceiptProcessing.jsx

**API Calls**:
- `/api/receipts/upload` (fetch) - ⚠️ External
- `/api/receipts/${receiptId}/process` (fetch) - ⚠️ External
- `/api/receipts/${receiptId}/allocate` (fetch) - ⚠️ External
- `/api/transactions/create` (fetch) - ⚠️ External

**Issues**: None found

---

### Analytics

**Components**: UserAnalytics.jsx, FinancialAnalytics.jsx

**API Calls**: None found

**Issues**: None found

---

### Goals

**Components**: Goals.jsx, GoalTracking.jsx

**API Calls**: None found

**Issues**: None found

---

### Rewards

**Components**: Rewards.jsx, RewardHistory.jsx

**API Calls**: None found

**Issues**: None found

---

### Notifications

**Components**: Notifications.jsx, NotificationCenter.jsx

**API Calls**: None found

**Issues**: None found

---

## Recommendations

1. **Fix Missing Endpoints**: Implement any missing API endpoints
2. **Update Frontend Calls**: Update frontend to use correct endpoints
3. **Add Error Handling**: Implement proper error handling for API calls
4. **Add Loading States**: Add loading indicators for API calls
5. **Add Retry Logic**: Implement retry logic for failed API calls
6. **Standardize URLs**: Use consistent URL patterns across components
7. **Add API Documentation**: Document all API endpoints and their usage
