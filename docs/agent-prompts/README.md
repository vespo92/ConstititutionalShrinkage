# Agent Prompts Directory

This directory contains individual prompt files for all parallel agents in the Constitutional Shrinkage deployment plan.

## Agent Overview

### Original Agents (6-15) - Foundation Layer
These agents built the core platform infrastructure.

| Agent | File | Focus | Status |
|-------|------|-------|--------|
| Agent_6 | [Agent_06_API_Gateway.md](./Agent_06_API_Gateway.md) | API Gateway & Core Routes | ✅ COMPLETE |
| Agent_7 | [Agent_07_Auth_Service.md](./Agent_07_Auth_Service.md) | Auth & User Services | ✅ COMPLETE |
| Agent_8 | [Agent_08_Notification_Search.md](./Agent_08_Notification_Search.md) | Notifications & Search | ✅ COMPLETE |
| Agent_9 | [Agent_09_Executive_App.md](./Agent_09_Executive_App.md) | Executive Application | ✅ COMPLETE |
| Agent_10 | [Agent_10_Judicial_App.md](./Agent_10_Judicial_App.md) | Judicial Application | ✅ COMPLETE |
| Agent_11 | [Agent_11_Regional_App.md](./Agent_11_Regional_App.md) | Regional Governance App | ✅ COMPLETE |
| Agent_12 | [Agent_12_Supply_Chain_App.md](./Agent_12_Supply_Chain_App.md) | Supply Chain App | ✅ COMPLETE |
| Agent_13 | [Agent_13_Testing_Expansion.md](./Agent_13_Testing_Expansion.md) | Testing Expansion | 🟡 PARTIAL |
| Agent_14 | [Agent_14_DevOps.md](./Agent_14_DevOps.md) | DevOps & CI/CD | ✅ COMPLETE |
| Agent_15 | [Agent_15_Integration_Docs.md](./Agent_15_Integration_Docs.md) | Integration & Docs | 🔴 NOT STARTED |

### NEW Agents (A-J) - Expansion Layer
These agents extend the platform with advanced capabilities.

| Agent | File | Focus | Priority |
|-------|------|-------|----------|
| Agent_A | [Agent_A_Mobile_Apps.md](./Agent_A_Mobile_Apps.md) | iOS & Android Mobile Apps | HIGH |
| Agent_B | [Agent_B_Blockchain_Voting.md](./Agent_B_Blockchain_Voting.md) | Blockchain Vote Verification | CRITICAL |
| Agent_C | [Agent_C_AI_Services.md](./Agent_C_AI_Services.md) | AI/ML Analysis & Assistance | HIGH |
| Agent_D | [Agent_D_Analytics_Dashboard.md](./Agent_D_Analytics_Dashboard.md) | Analytics & BI Platform | HIGH |
| Agent_E | [Agent_E_Accessibility_i18n.md](./Agent_E_Accessibility_i18n.md) | Accessibility & i18n | CRITICAL |
| Agent_F | [Agent_F_Public_API_SDK.md](./Agent_F_Public_API_SDK.md) | Public API & SDKs | MEDIUM |
| Agent_G | [Agent_G_Simulation_Modeling.md](./Agent_G_Simulation_Modeling.md) | Policy Simulation Engine | MEDIUM |
| Agent_H | [Agent_H_Security_Hardening.md](./Agent_H_Security_Hardening.md) | Security & Compliance | CRITICAL |
| Agent_I | [Agent_I_Data_Migration.md](./Agent_I_Data_Migration.md) | Data Migration & Import | HIGH |
| Agent_J | [Agent_J_Community_Engagement.md](./Agent_J_Community_Engagement.md) | Community & Social Features | MEDIUM |

---

## NEW Agent Details (A-J)

### Agent_A: Mobile Applications
Build native-quality iOS and Android apps using React Native/Expo with:
- Biometric authentication (Face ID, Touch ID)
- Offline voting queue
- Push notifications
- Vote verification with QR codes
- Apple Watch companion app

### Agent_B: Blockchain Voting Verification
Implement tamper-proof vote verification using Ethereum L2:
- Smart contracts for vote registry
- Commit-reveal voting scheme
- Zero-knowledge eligibility proofs
- Merkle tree vote inclusion proofs
- Public audit capability

### Agent_C: AI/ML Analysis Services
Build AI-powered governance tools:
- Bill summarization in plain language
- Constitutional compliance checking
- Triple Bottom Line impact prediction
- Semantic search with RAG
- Conversational AI assistant

### Agent_D: Analytics & BI Platform
Create comprehensive analytics dashboards:
- Real-time voting statistics
- TBL metrics visualization
- Regional comparison tools
- Policy effectiveness tracking
- Custom report builder

### Agent_E: Accessibility & Internationalization
Ensure universal access:
- WCAG 2.1 AAA compliance
- Screen reader optimization
- Multi-language support (EN, ES, ZH)
- Low-bandwidth modes
- Keyboard-only navigation

### Agent_F: Public API & Developer SDK
Enable the developer ecosystem:
- Public API gateway
- JavaScript/TypeScript SDK
- Python SDK
- Developer portal
- Webhook system
- Rate limiting & quotas

### Agent_G: Policy Simulation & Modeling
Help predict policy outcomes:
- Economic impact models
- Environmental impact models
- Social impact models
- Monte Carlo uncertainty analysis
- Policy comparison tools

### Agent_H: Security Hardening & Compliance
Enterprise-grade security:
- Zero-trust architecture
- mTLS between services
- SOC 2 Type II preparation
- FedRAMP control mapping
- Penetration testing suite
- SIEM integration

### Agent_I: Data Migration & Legacy Integration
Import existing government data:
- Congress.gov API integration
- State legislature imports
- Census/geographic data
- Voter registration (secure)
- Historical legislation archive

### Agent_J: Community Engagement
Foster civic participation:
- Discussion forums
- Public comment system
- Citizen petitions
- Virtual town halls
- Reputation system
- Content moderation

---

## Parallel Execution Strategy

### Wave 1 - Critical Path (Start Immediately)
```
Agent_B (Blockchain) - Vote integrity is fundamental
Agent_E (Accessibility) - Legal requirement for government
Agent_H (Security) - Security before deployment
```

### Wave 2 - Platform Extensions
```
Agent_A (Mobile) - After API stable
Agent_C (AI) - Enhances all apps
Agent_D (Analytics) - Requires data flowing
```

### Wave 3 - Ecosystem
```
Agent_F (Public API) - After internal APIs stable
Agent_G (Simulation) - Requires AI service
Agent_I (Migration) - Parallel with others
Agent_J (Community) - After core apps
```

---

## Expected Output (NEW Agents)

| Agent | Files | LOC | Key Deliverables |
|-------|-------|-----|------------------|
| Agent_A | 50-60 | 8,000-10,000 | React Native apps for iOS/Android |
| Agent_B | 30-40 | 5,000-6,000 | Smart contracts, ZK proofs, SDK |
| Agent_C | 40-50 | 6,000-8,000 | LLM integration, RAG, analysis APIs |
| Agent_D | 40-50 | 10,000-12,000 | Dashboards, charts, ClickHouse |
| Agent_E | 30-40 | 4,000-5,000 | A11y components, 3 language packs |
| Agent_F | 60-70 | 8,000-10,000 | API gateway, JS SDK, Python SDK |
| Agent_G | 50-60 | 12,000-15,000 | Simulation engine, modeling UI |
| Agent_H | 40-50 | 8,000-10,000 | Security controls, compliance checks |
| Agent_I | 40-50 | 8,000-10,000 | Importers, ETL pipelines, CLI |
| Agent_J | 50-60 | 12,000-15,000 | Forums, petitions, town halls |

**Total NEW Agents:** ~430-530 files, ~81,000-101,000 LOC

**Grand Total (All Agents):** ~750-900 files, ~110,000-135,000 LOC

---

## Dependency Graph (NEW Agents)

```
                           ┌─────────────────────────────────────────────────────────┐
                           │                    EXISTING PLATFORM                     │
                           │  (Agent 6-14 Complete: API, Auth, Apps, DevOps)         │
                           └───────────────────────────┬─────────────────────────────┘
                                                       │
    ┌──────────────────────────────────────────────────┼──────────────────────────────────────────────────┐
    │                                                   │                                                  │
    │  ┌────────────────────────────────────────────────┼────────────────────────────────────────────────┐ │
    │  │                           CRITICAL PATH (Wave 1)                                                │ │
    │  │                                                                                                  │ │
    │  │    ┌──────────────┐        ┌──────────────┐        ┌──────────────┐                            │ │
    │  │    │   Agent_B    │        │   Agent_E    │        │   Agent_H    │                            │ │
    │  │    │  Blockchain  │        │ Accessibility│        │   Security   │                            │ │
    │  │    │   Voting     │        │    & i18n    │        │  Hardening   │                            │ │
    │  │    └──────────────┘        └──────────────┘        └──────────────┘                            │ │
    │  └──────────────────────────────────────────────────────────────────────────────────────────────────┘ │
    │                                                   │                                                  │
    │  ┌────────────────────────────────────────────────┼────────────────────────────────────────────────┐ │
    │  │                           PLATFORM EXTENSIONS (Wave 2)                                          │ │
    │  │                                                                                                  │ │
    │  │    ┌──────────────┐        ┌──────────────┐        ┌──────────────┐                            │ │
    │  │    │   Agent_A    │        │   Agent_C    │        │   Agent_D    │                            │ │
    │  │    │    Mobile    │        │  AI/ML Svc   │        │  Analytics   │                            │ │
    │  │    │     Apps     │        │              │        │  Dashboard   │                            │ │
    │  │    └──────────────┘        └──────────────┘        └──────────────┘                            │ │
    │  └──────────────────────────────────────────────────────────────────────────────────────────────────┘ │
    │                                                   │                                                  │
    │  ┌────────────────────────────────────────────────┼────────────────────────────────────────────────┐ │
    │  │                           ECOSYSTEM (Wave 3)                                                    │ │
    │  │                                                                                                  │ │
    │  │    ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐                   │ │
    │  │    │   Agent_F    │   │   Agent_G    │   │   Agent_I    │   │   Agent_J    │                   │ │
    │  │    │  Public API  │   │  Simulation  │   │  Migration   │   │  Community   │                   │ │
    │  │    │    & SDK     │   │   Modeling   │   │   & Import   │   │  Engagement  │                   │ │
    │  │    └──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘                   │ │
    │  └──────────────────────────────────────────────────────────────────────────────────────────────────┘ │
    │                                                                                                      │
    └──────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## How to Use These Prompts

1. **Create a new Claude Code session** for each agent
2. **Copy the full content** of the relevant markdown file
3. **Paste as the initial prompt** to the agent
4. **Ensure the agent creates a branch** following the pattern:
   ```
   claude/agent-{letter}-{domain}-{session-id}
   ```
5. **Monitor progress** and let agents work independently
6. **Merge PRs** in wave order

## Branch Naming Convention

```
claude/agent-{letter}-{domain}-{session-id}
```

Examples:
- `claude/agent-A-mobile-apps-01ABC123`
- `claude/agent-B-blockchain-voting-01DEF456`
- `claude/agent-C-ai-services-01GHI789`

---

## See Also

- [10-Agent Parallel Deployment Guide](../10_Agent_Parallel_Deployment.md) - Original 10-agent deployment
- [Original Agent Deployment](../Agent_Deployment.md) - Initial 5-agent structure
- [Implementation Roadmap](../IMPLEMENTATION_ROADMAP.md) - Overall project timeline
