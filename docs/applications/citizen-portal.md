# Citizen Portal Design

> The citizen-facing interface for interacting with the git-style democracy system.

## Overview

The Citizen Portal is "GitHub for Government" - a unified interface where citizens can:
- Register and verify their identity
- View and vote on legislation
- Manage vote delegations
- Track personal civic activity
- Receive notifications on relevant issues
- Discover regional pods and communities

## User Journey

```
┌─────────────────────────────────────────────────────────────┐
│  1. DISCOVER    2. REGISTER    3. VERIFY    4. PARTICIPATE │
│  ───────────    ──────────     ────────     ───────────    │
│  Browse bills   Create         Prove        Vote, delegate,│
│  Learn system   account        identity     propose        │
└─────────────────────────────────────────────────────────────┘
```

## Core Features

### 1. User Registration & Verification

**Verification Levels:**
| Level | Requirements | Capabilities |
|-------|--------------|--------------|
| NONE | Email only | Browse, comment |
| EMAIL_VERIFIED | Verified email | Basic participation |
| PHONE_VERIFIED | + Phone verification | Enhanced trust |
| DOCUMENT_VERIFIED | + ID document | Vote on local issues |
| FULL_KYC | + Full identity check | Full voting rights |
| GOVERNMENT_VERIFIED | + Government ID link | Maximum trust |

**Components:**
```
Auth/
├── RegisterForm.tsx       # Initial registration
├── LoginForm.tsx          # Login
├── VerifyEmail.tsx        # Email verification
├── VerifyPhone.tsx        # Phone verification
├── VerifyDocument.tsx     # Document upload
├── VerificationStatus.tsx # Current status display
└── VerificationBadge.tsx  # Trust badge
```

**Flow:**
1. Email registration
2. Email verification
3. Optional phone verification
4. Optional document verification
5. Optional government ID link

---

### 2. Dashboard

**Purpose:** Personalized home for each citizen

**Sections:**
- **My Activity** - Recent votes, delegations, comments
- **Relevant Bills** - Bills in user's region/interests
- **Upcoming Votes** - Scheduled voting sessions
- **Delegations** - Who user delegates to / who delegates to user
- **Notifications** - Alerts and updates
- **Impact Score** - Personal civic engagement metrics

**Components:**
```
Dashboard/
├── DashboardLayout.tsx    # Main layout
├── ActivityFeed.tsx       # Recent activity
├── RelevantBills.tsx      # Personalized bill list
├── UpcomingVotes.tsx      # Voting calendar
├── DelegationSummary.tsx  # Delegation overview
├── NotificationPanel.tsx  # Notifications
├── ImpactScore.tsx        # Engagement metrics
└── QuickActions.tsx       # Common actions
```

---

### 3. Delegation Management

**Purpose:** Implement liquid democracy

**Features:**
- View current delegations (outgoing and incoming)
- Create new delegations by topic/region/bill
- Revoke delegations
- View delegation chains
- Override delegated votes

**Components:**
```
Delegations/
├── DelegationManager.tsx   # Main management UI
├── OutgoingDelegations.tsx # Who user delegates to
├── IncomingDelegations.tsx # Who delegates to user
├── CreateDelegation.tsx    # Create new delegation
├── DelegateSelector.tsx    # Find someone to delegate to
├── DelegationChain.tsx     # Visualize chain
├── DelegationCard.tsx      # Single delegation display
├── TopicSelector.tsx       # Choose delegation scope
└── OverrideVote.tsx        # Override for specific bill
```

**UI: Delegation Overview**
```
┌─────────────────────────────────────────────────────────────┐
│  MY DELEGATIONS                                             │
│                                                             │
│  Outgoing (3)                     Incoming (12)             │
│  ─────────────                    ─────────────             │
│                                                             │
│  ┌──────────────────────┐        Your total voting power:   │
│  │ Environment → Expert1│        13.0 (1 + 12 delegated)   │
│  │ Healthcare → Expert2 │                                   │
│  │ All Other → Expert3  │        [View all incoming]        │
│  └──────────────────────┘                                   │
│                                                             │
│  [+ Add Delegation]              [Manage Incoming]          │
└─────────────────────────────────────────────────────────────┘
```

---

### 4. Profile & Settings

**Sections:**
- **Personal Info** - Name, contact, region
- **Verification** - Identity verification status
- **Privacy** - Vote visibility, data sharing
- **Notifications** - Email, push preferences
- **Expertise** - Self-declared expertise areas
- **Civic History** - Public voting record

**Components:**
```
Profile/
├── ProfileView.tsx        # Public profile view
├── ProfileEdit.tsx        # Edit personal info
├── PrivacySettings.tsx    # Privacy controls
├── NotificationSettings.tsx # Notification prefs
├── ExpertiseManager.tsx   # Manage expertise areas
├── VotingHistory.tsx      # Historical votes
└── DeleteAccount.tsx      # Account deletion
```

---

### 5. Region & Pod Discovery

**Purpose:** Connect with local governance

**Features:**
- Discover regional pods
- Join regional communities
- View regional legislation
- Connect with local representatives
- Participate in local governance

**Components:**
```
Regions/
├── RegionBrowser.tsx      # Browse all regions
├── RegionDetail.tsx       # Single region view
├── MyRegion.tsx           # User's current region
├── RegionMap.tsx          # Interactive map
├── PodList.tsx            # Regional pods
├── PodDetail.tsx          # Pod information
├── JoinPod.tsx            # Join a pod
├── RepresentativeList.tsx # Local representatives
└── RegionMetrics.tsx      # Regional TBL scores
```

---

### 6. Notification Center

**Notification Types:**
- **Voting** - New votes available, votes ending soon
- **Bills** - Updates to followed bills
- **Delegations** - Delegation requests/changes
- **Region** - Regional announcements
- **System** - Account and security updates

**Components:**
```
Notifications/
├── NotificationCenter.tsx # Main notification view
├── NotificationList.tsx   # List of notifications
├── NotificationItem.tsx   # Single notification
├── NotificationBadge.tsx  # Unread count badge
├── NotificationPrefs.tsx  # Preferences
└── NotificationToast.tsx  # Pop-up notifications
```

---

### 7. Search & Discovery

**Searchable Items:**
- Bills and legislation
- People (representatives, delegates)
- Organizations
- Regions and pods
- Topics and categories

**Components:**
```
Search/
├── GlobalSearch.tsx       # Main search bar
├── SearchResults.tsx      # Results page
├── SearchFilters.tsx      # Filter sidebar
├── BillResults.tsx        # Bill search results
├── PersonResults.tsx      # Person search results
├── OrgResults.tsx         # Organization results
├── RecentSearches.tsx     # Search history
└── TrendingTopics.tsx     # Trending searches
```

---

## Page Structure

```
apps/citizen-portal/
├── app/
│   ├── layout.tsx                 # Root layout
│   ├── page.tsx                   # Landing page (logged out)
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── verify/page.tsx
│   ├── (authenticated)/
│   │   ├── layout.tsx             # Auth-required layout
│   │   ├── dashboard/page.tsx     # User dashboard
│   │   ├── profile/
│   │   │   ├── page.tsx           # View profile
│   │   │   └── edit/page.tsx      # Edit profile
│   │   ├── delegations/
│   │   │   ├── page.tsx           # Delegation manager
│   │   │   ├── create/page.tsx    # Create delegation
│   │   │   └── [id]/page.tsx      # Delegation detail
│   │   ├── votes/
│   │   │   ├── page.tsx           # Voting history
│   │   │   └── [id]/page.tsx      # Vote detail
│   │   ├── notifications/page.tsx
│   │   └── settings/page.tsx
│   ├── regions/
│   │   ├── page.tsx               # Region browser
│   │   └── [id]/page.tsx          # Region detail
│   ├── search/page.tsx
│   └── help/page.tsx
├── components/
├── lib/
└── styles/
```

## Data Models

### User Schema

```prisma
model User {
  id                String           @id @default(uuid())
  email             String           @unique
  emailVerified     DateTime?
  phone             String?
  phoneVerified     DateTime?
  passwordHash      String

  legalName         String
  preferredName     String?
  profileImage      String?

  primaryRegionId   String
  primaryRegion     Region           @relation(fields: [primaryRegionId], references: [id])
  regionIds         String[]

  verificationLevel VerificationLevel @default(NONE)
  votingPower       Float            @default(1.0)
  reputation        Int              @default(50)

  expertiseAreas    String[]
  publicKey         String?

  // Relationships
  sponsoredBills    Bill[]           @relation("sponsor")
  coSponsoredBills  Bill[]           @relation("coSponsors")
  votes             Vote[]
  delegationsTo     Delegation[]     @relation("delegator")
  delegationsFrom   Delegation[]     @relation("delegate")
  comments          Comment[]
  notifications     Notification[]

  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt
  lastLoginAt       DateTime?

  @@index([email])
  @@index([primaryRegionId])
  @@index([verificationLevel])
}

enum VerificationLevel {
  NONE
  EMAIL_VERIFIED
  PHONE_VERIFIED
  DOCUMENT_VERIFIED
  FULL_KYC
  GOVERNMENT_VERIFIED
}
```

### Delegation Schema

```prisma
model Delegation {
  id              String          @id @default(uuid())

  delegatorId     String
  delegator       User            @relation("delegator", fields: [delegatorId], references: [id])

  delegateId      String
  delegate        User            @relation("delegate", fields: [delegateId], references: [id])

  scope           DelegationScope
  category        String?         // If scope is CATEGORY
  billId          String?         // If scope is SINGLE_BILL

  active          Boolean         @default(true)
  createdAt       DateTime        @default(now())
  expiresAt       DateTime?
  revokedAt       DateTime?

  @@unique([delegatorId, delegateId, scope, category])
  @@index([delegatorId])
  @@index([delegateId])
}

enum DelegationScope {
  ALL
  CATEGORY
  SINGLE_BILL
}
```

## UI Components

### Dashboard Activity Feed

```
┌─────────────────────────────────────────────────────────────┐
│  RECENT ACTIVITY                            [View All →]   │
│                                                             │
│  Today                                                      │
│  ├─ 🗳️ Voted FOR "Clean Energy Act"           2 hours ago  │
│  └─ 📋 New bill in Environment category        5 hours ago  │
│                                                             │
│  Yesterday                                                  │
│  ├─ 🔗 Delegated Environment votes to @Expert1  10:30 AM   │
│  ├─ 💬 Commented on "Healthcare Reform"          9:15 AM   │
│  └─ 📩 Received delegation from @User123         8:00 AM   │
│                                                             │
│  This Week                                                  │
│  ├─ 🗳️ Voted AGAINST "Surveillance Act"        Monday      │
│  └─ ✏️ Proposed amendment to Bill #1234         Tuesday    │
└─────────────────────────────────────────────────────────────┘
```

### Delegation Creation

```
┌─────────────────────────────────────────────────────────────┐
│  CREATE DELEGATION                                          │
│                                                             │
│  Delegate to: ___________________________________           │
│               [@username or search]                         │
│                                                             │
│  Scope:                                                     │
│  ○ All votes                                                │
│  ● By category                                              │
│  ○ Single bill                                              │
│                                                             │
│  Category: [Environment ▼]                                  │
│                                                             │
│  Duration:                                                  │
│  ○ Until revoked                                            │
│  ● Until date: [2025-12-31]                                │
│                                                             │
│  ⚠️ You can always override by voting directly              │
│                                                             │
│  [Cancel]                        [Create Delegation]        │
└─────────────────────────────────────────────────────────────┘
```

### Profile Card

```
┌─────────────────────────────────────────────────────────────┐
│  ┌─────────┐                                                │
│  │  Avatar │  Jane Citizen                                  │
│  └─────────┘  @janecitizen · California                     │
│               ✓ Government Verified                         │
│                                                             │
│  Expertise: Environment, Technology, Healthcare             │
│                                                             │
│  ├── Voting Power: 1.0 base + 5.0 delegated = 6.0 total   │
│  ├── Reputation: ★★★★☆ (85/100)                            │
│  ├── Votes Cast: 127                                        │
│  └── Member Since: January 2025                             │
│                                                             │
│  [View Public Profile]  [Edit Profile]  [Settings]          │
└─────────────────────────────────────────────────────────────┘
```

## Integration Points

### With Legislative App
- Deep link to bills for voting
- Embed bill previews in dashboard
- Share voting receipts

### With Entity Registry
- Track user associations
- Record civic activity
- Generate involvement reports

### With Voting System
- Cast votes through citizen portal
- Manage delegations
- View voting history

## Implementation Checklist

### Phase 1: Core Auth
- [ ] Registration flow
- [ ] Email verification
- [ ] Login/logout
- [ ] Password reset
- [ ] Session management

### Phase 2: Basic Profile
- [ ] Profile view
- [ ] Profile edit
- [ ] Basic settings
- [ ] Verification status display

### Phase 3: Dashboard
- [ ] Activity feed
- [ ] Relevant bills widget
- [ ] Upcoming votes widget
- [ ] Quick actions

### Phase 4: Delegations
- [ ] View delegations
- [ ] Create delegation
- [ ] Revoke delegation
- [ ] Delegation chain view
- [ ] Override voting

### Phase 5: Discovery
- [ ] Region browser
- [ ] Search functionality
- [ ] Notification center
- [ ] Pod discovery

### Phase 6: Advanced
- [ ] Advanced verification
- [ ] Mobile optimization
- [ ] Offline support
- [ ] Push notifications
- [ ] Analytics dashboard
