# Agent_A: Mobile Applications (iOS & Android)

## Mission
Build native-quality mobile applications for iOS and Android using React Native, enabling citizens to participate in governance from anywhere with full feature parity to the web portal.

## Branch
```
claude/agent-A-mobile-apps-{session-id}
```

## Priority: HIGH

## Context
Citizens need mobile access to:
- Vote on legislation
- Manage delegations
- Track bills they care about
- Receive real-time notifications
- Verify their votes
- Participate in regional governance

## Target Directory
```
apps/mobile/
```

## Dependencies
- API Gateway (Agent_6) - COMPLETE
- Auth Service (Agent_7) - COMPLETE
- Notification Service (Agent_8) - COMPLETE

## Your Deliverables

### 1. React Native Project Setup

```
apps/mobile/
├── src/
│   ├── app/
│   │   ├── (tabs)/
│   │   │   ├── index.tsx           # Dashboard/Home
│   │   │   ├── bills.tsx           # Legislation browser
│   │   │   ├── vote.tsx            # Active voting sessions
│   │   │   ├── delegations.tsx     # Delegation management
│   │   │   └── profile.tsx         # User profile
│   │   ├── bill/
│   │   │   └── [id].tsx            # Bill detail view
│   │   ├── vote/
│   │   │   └── [sessionId].tsx     # Voting interface
│   │   ├── auth/
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   └── forgot-password.tsx
│   │   └── _layout.tsx
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Card.tsx
│   │   │   ├── Input.tsx
│   │   │   └── Badge.tsx
│   │   ├── bills/
│   │   │   ├── BillCard.tsx
│   │   │   ├── BillDiff.tsx
│   │   │   └── BillTimeline.tsx
│   │   ├── voting/
│   │   │   ├── VoteButton.tsx
│   │   │   ├── VoteConfirmation.tsx
│   │   │   └── VoteReceipt.tsx
│   │   ├── delegation/
│   │   │   ├── DelegationCard.tsx
│   │   │   └── DelegateSelector.tsx
│   │   └── common/
│   │       ├── Header.tsx
│   │       ├── TabBar.tsx
│   │       └── LoadingSpinner.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useBills.ts
│   │   ├── useVoting.ts
│   │   ├── useDelegations.ts
│   │   ├── useNotifications.ts
│   │   └── useBiometrics.ts
│   ├── services/
│   │   ├── api.ts                  # API client
│   │   ├── auth.ts                 # Auth service
│   │   ├── storage.ts              # Secure storage
│   │   ├── notifications.ts        # Push notifications
│   │   └── biometrics.ts           # Face ID / Touch ID
│   ├── store/
│   │   ├── authStore.ts
│   │   ├── billsStore.ts
│   │   └── votingStore.ts
│   ├── utils/
│   │   ├── crypto.ts               # Vote signing
│   │   └── formatting.ts
│   └── constants/
│       └── theme.ts
├── app.json
├── package.json
├── tsconfig.json
├── babel.config.js
└── eas.json                        # Expo Application Services
```

### 2. Core Features

#### Authentication
```typescript
// Biometric authentication for sensitive actions
- Face ID / Touch ID for login
- Biometric confirmation for voting
- Secure token storage (Keychain/Keystore)
- OAuth integration (Google, Apple Sign-In)
```

#### Voting Interface
```typescript
// Mobile-optimized voting
- Swipe gestures for Yes/No/Abstain
- Haptic feedback on vote cast
- Offline vote queue (sync when online)
- Vote verification with QR code
```

#### Push Notifications
```typescript
// Real-time engagement
- New bills in your region
- Voting session reminders
- Delegation activity alerts
- Bill status changes
- Vote confirmation receipts
```

### 3. Platform-Specific Features

#### iOS
- Widget for active votes
- Siri shortcuts ("Hey Siri, show my pending votes")
- Apple Watch companion app (notifications + quick vote)
- Face ID integration

#### Android
- Home screen widget
- Google Assistant integration
- Fingerprint authentication
- Material You theming

### 4. Offline Support

```typescript
// Offline-first architecture
- Cache bills for offline reading
- Queue votes when offline
- Background sync when connectivity restored
- Conflict resolution for delegation changes
```

### 5. Security Requirements

```typescript
// Mobile security hardening
- Certificate pinning
- Jailbreak/root detection
- Screenshot prevention on sensitive screens
- Secure enclave for vote signing keys
- App attestation (Play Integrity / App Attest)
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Screens | 15-20 |
| Components | 30-40 |
| Lines of Code | 8,000-10,000 |
| Test Coverage | 80%+ |

## Success Criteria

1. [ ] React Native + Expo project initialized
2. [ ] Authentication flow complete with biometrics
3. [ ] Bill browsing and search working
4. [ ] Voting interface functional
5. [ ] Delegation management complete
6. [ ] Push notifications integrated
7. [ ] Offline support implemented
8. [ ] Both iOS and Android builds passing
9. [ ] App store ready (screenshots, metadata)

---

*Agent_A Assignment - Mobile Applications*
