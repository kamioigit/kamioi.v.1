# Kamioi Mobile App Planning Document

## Executive Summary

This document outlines the technical architecture and implementation plan for Kamioi's mobile applications. The recommended approach is React Native to maximize code sharing with the existing React web application.

---

## 1. Technology Recommendation

### Framework: React Native

**Why React Native:**
- **Code Sharing**: 60-80% code reuse with existing React web codebase
- **Shared Components**: Context providers, hooks, and business logic can be shared
- **Team Efficiency**: Current team already proficient in React/TypeScript
- **Performance**: Near-native performance for financial applications
- **Ecosystem**: Excellent libraries for finance apps (charts, payments, biometrics)

**Alternatives Considered:**
| Framework | Pros | Cons | Decision |
|-----------|------|------|----------|
| React Native | Code sharing, team expertise | Bridge overhead | **Recommended** |
| Flutter | Performance, UI consistency | New language (Dart), no code sharing | Not recommended |
| Native (Swift/Kotlin) | Best performance | Double development effort | Not recommended |
| Expo | Easier setup, OTA updates | Limited native modules | Use with bare workflow |

---

## 2. Architecture Overview

### 2.1 Shared Codebase Structure

```
kamioi/
├── packages/
│   ├── shared/                 # Shared code between web and mobile
│   │   ├── api/               # API service layer
│   │   ├── hooks/             # Custom hooks (useAuth, useDemo, etc.)
│   │   ├── context/           # Context providers
│   │   ├── utils/             # Utility functions
│   │   ├── types/             # TypeScript types
│   │   └── constants/         # Shared constants
│   ├── web/                   # React web app (existing)
│   └── mobile/                # React Native app (new)
│       ├── ios/
│       ├── android/
│       ├── src/
│       │   ├── components/    # Mobile-specific components
│       │   ├── screens/       # Screen components
│       │   ├── navigation/    # React Navigation setup
│       │   └── theme/         # Mobile theming
│       └── App.tsx
```

### 2.2 API Layer

The existing REST API is mobile-ready. Required modifications:

| Endpoint Category | Current Status | Mobile Requirements |
|------------------|----------------|---------------------|
| Authentication | JWT tokens | Add refresh token flow |
| Transactions | REST | No changes needed |
| Portfolio | REST | No changes needed |
| Notifications | REST | Add push notification tokens |
| Bank Connection | MX Widget | MX SDK integration |

---

## 3. Feature Matrix

### 3.1 Core Features (MVP)

| Feature | Web | Mobile | Priority |
|---------|-----|--------|----------|
| User Registration | ✅ | 🔲 | P0 |
| Login/Logout | ✅ | 🔲 | P0 |
| Google OAuth | ✅ | 🔲 | P0 |
| Dashboard Overview | ✅ | 🔲 | P0 |
| View Portfolio | ✅ | 🔲 | P0 |
| View Transactions | ✅ | 🔲 | P0 |
| View Goals | ✅ | 🔲 | P0 |
| Push Notifications | ❌ | 🔲 | P0 |
| Biometric Login | ❌ | 🔲 | P1 |
| Bank Connection (MX) | ✅ | 🔲 | P1 |

### 3.2 Account Type Features

| Feature | Individual | Family | Business |
|---------|------------|--------|----------|
| Personal Dashboard | ✅ | ✅ | ✅ |
| Family Members | ❌ | ✅ | ❌ |
| Team Management | ❌ | ❌ | ✅ |
| Shared Goals | ❌ | ✅ | ✅ |
| Parental Controls | ❌ | ✅ | ❌ |
| Expense Reports | ❌ | ❌ | ✅ |

### 3.3 Mobile-Specific Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Push Notifications | Transaction alerts, goal updates | P0 |
| Biometric Auth | Face ID / Touch ID / Fingerprint | P1 |
| Widget Support | iOS/Android home screen widgets | P2 |
| Apple Watch | Portfolio at a glance | P3 |
| Offline Mode | View cached data offline | P2 |
| Quick Actions | 3D Touch / Long press shortcuts | P2 |

---

## 4. Technical Implementation

### 4.1 Authentication Flow

```
┌─────────────┐      ┌─────────────┐      ┌─────────────┐
│   Mobile    │      │   Backend   │      │   Firebase  │
│    App      │      │   (Flask)   │      │   Auth      │
└──────┬──────┘      └──────┬──────┘      └──────┬──────┘
       │                    │                    │
       │  1. Google Login   │                    │
       │────────────────────┼───────────────────>│
       │                    │                    │
       │  2. ID Token       │                    │
       │<───────────────────┼────────────────────│
       │                    │                    │
       │  3. Verify Token   │                    │
       │───────────────────>│                    │
       │                    │  4. Verify w/      │
       │                    │     Firebase       │
       │                    │───────────────────>│
       │                    │                    │
       │                    │  5. Valid          │
       │                    │<───────────────────│
       │                    │                    │
       │  6. JWT + Refresh  │                    │
       │<───────────────────│                    │
       │                    │                    │
       │  7. Store in       │                    │
       │     Keychain       │                    │
       ▼                    ▼                    ▼
```

### 4.2 Push Notifications

**Provider:** Firebase Cloud Messaging (FCM)

**Backend Changes Required:**
```python
# New endpoint: POST /api/user/push-token
{
    "token": "fcm_device_token",
    "platform": "ios" | "android",
    "device_id": "unique_device_identifier"
}

# New table: push_tokens
- id
- user_id
- token
- platform
- device_id
- created_at
- last_used_at
```

**Notification Types:**
| Type | Trigger | Content |
|------|---------|---------|
| Transaction | New transaction processed | "You invested $0.45 in AAPL" |
| Goal Progress | Goal milestone reached | "Emergency Fund is 50% complete!" |
| Market Alert | Significant portfolio change | "Your portfolio is up 5% today" |
| Weekly Summary | Sunday 9am | "Weekly investing summary ready" |

### 4.3 Offline Support

**Cached Data:**
- Portfolio holdings (24h cache)
- Recent transactions (7 days)
- Goals progress
- User profile

**Sync Strategy:**
1. Background fetch on app open
2. Pull-to-refresh for manual sync
3. Optimistic updates for user actions
4. Conflict resolution: server wins

### 4.4 Security Requirements

| Requirement | Implementation |
|-------------|----------------|
| Secure Storage | iOS Keychain / Android Keystore |
| Certificate Pinning | SSL pinning for API calls |
| Jailbreak Detection | Detect compromised devices |
| Screen Recording Block | Block screen capture on sensitive screens |
| Session Timeout | 15 min inactivity timeout |
| Biometric Auth | Optional Face ID / Touch ID |

---

## 5. Third-Party Integrations

### 5.1 Required SDKs

| SDK | Purpose | Platform |
|-----|---------|----------|
| React Navigation | Navigation | Both |
| React Native Firebase | Auth, Push, Analytics | Both |
| MX Path SDK | Bank connection | Both |
| React Native Keychain | Secure storage | Both |
| React Native Biometrics | Face ID / Touch ID | Both |
| Victory Native | Charts | Both |
| React Native Reanimated | Animations | Both |

### 5.2 MX Path Mobile SDK

```javascript
// Example MX Path integration
import { MXConnect } from 'mx-react-native';

const BankConnection = () => {
  const handleMXSuccess = (data) => {
    // Send member_guid to backend
    api.saveBankConnection(data.member_guid);
  };

  return (
    <MXConnect
      clientId={MX_CLIENT_ID}
      environment="production"
      onSuccess={handleMXSuccess}
      onError={handleMXError}
    />
  );
};
```

---

## 6. Development Phases

### Phase 1: Foundation (4 weeks)
- [ ] Project setup with Expo bare workflow
- [ ] Shared package extraction from web
- [ ] Navigation structure
- [ ] Authentication flow
- [ ] Basic theming

### Phase 2: Core Features (6 weeks)
- [ ] Dashboard screen
- [ ] Portfolio screen
- [ ] Transactions list
- [ ] Goals screen
- [ ] Settings screen

### Phase 3: Integrations (4 weeks)
- [ ] MX Path bank connection
- [ ] Push notifications
- [ ] Biometric authentication
- [ ] Analytics integration

### Phase 4: Polish (3 weeks)
- [ ] Animations and transitions
- [ ] Offline support
- [ ] Performance optimization
- [ ] Accessibility (a11y)

### Phase 5: Launch Prep (2 weeks)
- [ ] App Store assets
- [ ] Privacy policy updates
- [ ] Beta testing
- [ ] App Store submission

**Total Estimated Timeline: 19 weeks**

---

## 7. App Store Requirements

### 7.1 iOS App Store
- Apple Developer Account ($99/year)
- App Privacy labels
- In-app purchase for subscriptions (30% fee)
- Review guidelines compliance

### 7.2 Google Play Store
- Google Developer Account ($25 one-time)
- Data safety form
- In-app purchase (15-30% fee)
- Content rating

### 7.3 Compliance
- PCI DSS for payment data
- SEC regulations for investment apps
- CCPA/GDPR for user data
- Accessibility (WCAG 2.1)

---

## 8. Cost Estimates

### Development Costs
| Item | Estimate |
|------|----------|
| React Native Developer (19 weeks) | $45,000 - $75,000 |
| UI/UX Design | $5,000 - $10,000 |
| QA Testing | $5,000 - $10,000 |
| **Total Development** | **$55,000 - $95,000** |

### Ongoing Costs
| Item | Monthly |
|------|---------|
| Firebase (Push, Analytics) | $100 - $500 |
| App Store fees | $8/month |
| Monitoring (Sentry, etc.) | $50 - $200 |
| **Total Monthly** | **$158 - $708** |

---

## 9. Success Metrics

### KPIs to Track
| Metric | Target | Measurement |
|--------|--------|-------------|
| App Downloads | 10,000 in 6 months | App Store Analytics |
| DAU/MAU | 40% | Firebase Analytics |
| Crash-free rate | 99.5% | Firebase Crashlytics |
| App Rating | 4.5+ stars | App Store |
| Push notification opt-in | 70% | Firebase |
| Biometric adoption | 60% | Custom analytics |

---

## 10. Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| App Store rejection | Medium | High | Follow guidelines strictly |
| MX SDK issues | Low | High | Early integration testing |
| Performance on old devices | Medium | Medium | Device testing matrix |
| Security vulnerabilities | Low | Critical | Security audit before launch |
| Low adoption | Medium | High | Marketing plan, referral program |

---

## 11. Next Steps

1. **Immediate (Week 1-2)**
   - Set up React Native project with Expo
   - Extract shared code from web app
   - Create basic navigation structure

2. **Short-term (Week 3-8)**
   - Implement authentication
   - Build core screens
   - Integrate with existing API

3. **Medium-term (Week 9-15)**
   - MX SDK integration
   - Push notifications
   - Beta testing with internal team

4. **Launch (Week 16-19)**
   - App Store submission
   - Marketing preparation
   - Public launch

---

## Appendix A: Shared Code Candidates

### From Web App (Can Share Directly)
- `context/AuthContext.jsx` → Extract auth logic
- `context/DemoContext.jsx` → Share demo mode
- `hooks/useAdminQuery.js` → API fetch hooks
- `services/apiService.js` → API client

### Mobile-Specific Implementations Needed
- Navigation (React Navigation vs React Router)
- Storage (AsyncStorage/Keychain vs localStorage)
- UI Components (React Native vs DOM)
- Animations (Reanimated vs Framer Motion)

---

## Appendix B: Design System

The mobile app should follow the existing Kamioi design system:

| Element | Web | Mobile |
|---------|-----|--------|
| Primary Color | #6366f1 (Indigo) | Same |
| Secondary Color | #8b5cf6 (Purple) | Same |
| Font Family | Inter | SF Pro (iOS), Roboto (Android) |
| Border Radius | 8px, 12px, 16px | Same |
| Shadows | Tailwind shadows | Platform shadows |

---

*Document Version: 1.0*
*Last Updated: January 2026*
*Author: Kamioi Development Team*
