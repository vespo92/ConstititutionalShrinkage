# Agent Prompts Directory

This directory contains individual prompt files for each of the 10 parallel agents in the expanded deployment plan.

## Quick Reference

| Agent | File | Focus | Priority |
|-------|------|-------|----------|
| Agent_6 | [Agent_06_API_Gateway.md](./Agent_06_API_Gateway.md) | API Gateway & Core Routes | CRITICAL |
| Agent_7 | [Agent_07_Auth_Service.md](./Agent_07_Auth_Service.md) | Auth & User Services | CRITICAL |
| Agent_8 | [Agent_08_Notification_Search.md](./Agent_08_Notification_Search.md) | Notifications & Search | HIGH |
| Agent_9 | [Agent_09_Executive_App.md](./Agent_09_Executive_App.md) | Executive Application | HIGH |
| Agent_10 | [Agent_10_Judicial_App.md](./Agent_10_Judicial_App.md) | Judicial Application | HIGH |
| Agent_11 | [Agent_11_Regional_App.md](./Agent_11_Regional_App.md) | Regional Governance App | MEDIUM |
| Agent_12 | [Agent_12_Supply_Chain_App.md](./Agent_12_Supply_Chain_App.md) | Supply Chain App | MEDIUM |
| Agent_13 | [Agent_13_Testing_Expansion.md](./Agent_13_Testing_Expansion.md) | Testing Expansion | HIGH |
| Agent_14 | [Agent_14_DevOps.md](./Agent_14_DevOps.md) | DevOps & CI/CD | HIGH |
| Agent_15 | [Agent_15_Integration_Docs.md](./Agent_15_Integration_Docs.md) | Integration & Docs | MEDIUM |

## Parallel Execution Waves

### Wave 1 - Start Immediately (No Dependencies)
These agents can begin work right now:

```bash
# Copy prompt from Agent_06_API_Gateway.md
# Copy prompt from Agent_07_Auth_Service.md
# Copy prompt from Agent_08_Notification_Search.md
# Copy prompt from Agent_14_DevOps.md
```

### Wave 2 - After API Contracts Defined
Start these once Wave 1 agents have defined API contracts:

```bash
# Copy prompt from Agent_09_Executive_App.md
# Copy prompt from Agent_10_Judicial_App.md
# Copy prompt from Agent_11_Regional_App.md
# Copy prompt from Agent_12_Supply_Chain_App.md
```

### Wave 3 - Continuous
These can run alongside all others:

```bash
# Copy prompt from Agent_13_Testing_Expansion.md
# Copy prompt from Agent_15_Integration_Docs.md
```

## How to Use These Prompts

1. **Create a new Claude Code session** for each agent
2. **Copy the full content** of the relevant markdown file
3. **Paste as the initial prompt** to the agent
4. **Ensure the agent creates a branch** following the pattern:
   ```
   claude/agent-{N}-{domain}-{session-id}
   ```
5. **Monitor progress** and let agents work independently
6. **Merge PRs** in the recommended order (see main deployment doc)

## Branch Naming Convention

All agent branches must follow this pattern:
```
claude/agent-{number}-{domain}-{session-id}
```

Examples:
- `claude/agent-6-api-gateway-01ABC123`
- `claude/agent-7-auth-service-01DEF456`
- `claude/agent-9-executive-app-01GHI789`

## Expected Output

| Agent | Files | LOC | Key Deliverables |
|-------|-------|-----|------------------|
| Agent_6 | 25-30 | 2,500-3,000 | API Gateway with 35-40 endpoints |
| Agent_7 | 20-25 | 2,000-2,500 | Auth + User services |
| Agent_8 | 25-30 | 2,500-3,000 | WebSocket notifications, Elasticsearch |
| Agent_9 | 30-35 | 3,000-3,500 | Executive dashboard, TBL metrics |
| Agent_10 | 30-35 | 3,000-3,500 | Constitutional review, cases |
| Agent_11 | 30-35 | 3,000-3,500 | Pod management, regional governance |
| Agent_12 | 30-35 | 3,500-4,000 | Network graphs, distance calculator |
| Agent_13 | 40-50 | 4,000-5,000 | E2E, security, performance tests |
| Agent_14 | 35-40 | 2,000-2,500 | CI/CD, Docker, Kubernetes |
| Agent_15 | 50-60 | 1,500-2,000 | UI library, types, docs |

**Total:** ~315-375 files, ~27,000-32,500 LOC

## Dependency Graph

```
Agent_14 (DevOps) ─────────────────────────────────────────────────┐
       │                                                            │
       ▼                                                            │
┌─────────────────────────────────────────────────────────────────┐ │
│           API LAYER (Can start immediately)                     │ │
│                                                                  │ │
│  Agent_6 (API Gateway)  Agent_7 (Auth)  Agent_8 (Notifications) │ │
└───────────────────────────────┬─────────────────────────────────┘ │
                                │                                   │
                                ▼                                   │
┌─────────────────────────────────────────────────────────────────┐ │
│           FRONTEND APPS (After API contracts)                   │ │
│                                                                  │ │
│  Agent_9      Agent_10      Agent_11      Agent_12              │ │
│  Executive    Judicial      Regional      Supply Chain          │ │
└─────────────────────────────────────────────────────────────────┘ │
                                                                    │
┌─────────────────────────────────────────────────────────────────┐ │
│           CROSS-CUTTING (Continuous)                            │ │
│                                                                  │ │
│  Agent_13 (Testing)                 Agent_15 (Integration)      │◄┘
└─────────────────────────────────────────────────────────────────┘
```

## See Also

- [10-Agent Parallel Deployment Guide](../10_Agent_Parallel_Deployment.md) - Full deployment documentation
- [Original Agent Deployment](../Agent_Deployment.md) - Initial 5-agent structure
