# Development Setup Guide

> Complete guide to setting up your local development environment.

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Node.js | 18.x or 20.x | JavaScript runtime |
| npm | 9.x+ | Package manager |
| Git | 2.x+ | Version control |
| PostgreSQL | 15+ | Database (optional for now) |
| Redis | 7+ | Caching (optional for now) |

### Recommended Tools

- **VS Code** with extensions:
  - ESLint
  - Prettier
  - TypeScript and JavaScript Language Features
  - Prisma
  - Tailwind CSS IntelliSense
- **Docker** (for running database locally)
- **Postman** or **Insomnia** (for API testing)

---

## Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/vespo92/ConstititutionalShrinkage.git
cd ConstititutionalShrinkage
```

### 2. Install Dependencies

```bash
npm install
```

This installs all dependencies for the monorepo using npm workspaces.

### 3. Run Development Mode

```bash
# Run all packages and apps in development mode
npm run dev

# Or run specific workspace
npm run dev --workspace=packages/constitutional-framework
npm run dev --workspace=apps/legislative
```

### 4. Build All Packages

```bash
npm run build
```

### 5. Run Tests

```bash
npm run test
```

### 6. Run Linting

```bash
npm run lint
```

---

## Project Structure

```
ConstititutionalShrinkage/
├── apps/                          # Applications
│   ├── legislative/               # Legislative system app
│   ├── citizen-portal/            # Citizen interface app
│   ├── executive/                 # Executive functions app
│   ├── judicial/                  # Judicial system app
│   ├── regional-governance/       # Regional pods app
│   └── supply-chain/              # Supply chain app
│
├── packages/                      # Shared packages
│   ├── constitutional-framework/  # Core rights & validation
│   ├── voting-system/             # Voting & liquid democracy
│   ├── governance-utils/          # Bill management utilities
│   ├── metrics/                   # Triple Bottom Line tracking
│   ├── entity-registry/           # Entity & change tracking
│   └── business-transparency/     # Employment & supply chain
│
├── docs/                          # Documentation
│   ├── api/                       # API reference
│   ├── applications/              # App design docs
│   ├── development/               # Development guides
│   ├── architecture/              # Architecture docs
│   └── roadmap/                   # Roadmap docs
│
├── examples/                      # Example code
│
├── turbo.json                     # Turborepo configuration
├── package.json                   # Root package.json
└── tsconfig.json                  # Root TypeScript config
```

---

## Working with Packages

### Package Structure

Each package follows this structure:

```
packages/example-package/
├── src/
│   ├── index.ts          # Main exports
│   ├── types.ts          # Type definitions
│   └── *.ts              # Implementation files
├── package.json
├── tsconfig.json
└── README.md
```

### Creating a New Package

1. Create package directory:
   ```bash
   mkdir packages/new-package
   cd packages/new-package
   ```

2. Initialize package.json:
   ```json
   {
     "name": "@constitutional-shrinkage/new-package",
     "version": "1.0.0",
     "main": "./src/index.ts",
     "types": "./src/index.ts",
     "scripts": {
       "build": "tsc",
       "dev": "tsc --watch"
     },
     "dependencies": {},
     "devDependencies": {
       "typescript": "^5.0.0"
     }
   }
   ```

3. Create tsconfig.json:
   ```json
   {
     "extends": "../../tsconfig.json",
     "compilerOptions": {
       "outDir": "./dist",
       "rootDir": "./src"
     },
     "include": ["src/**/*"]
   }
   ```

4. Create src/index.ts with exports

### Using Packages in Applications

Import from packages using their npm name:

```typescript
import { constitutionalFramework } from '@constitutional-shrinkage/constitutional-framework';
import { votingSystem } from '@constitutional-shrinkage/voting-system';
import { createBill } from '@constitutional-shrinkage/governance-utils';
```

---

## Running Examples

The `examples/` directory contains demonstration code:

```bash
# Run the full workflow demo
npx ts-node examples/demo-full-workflow.ts

# Run business transparency demo
npx ts-node examples/demo-business-transparency.ts
```

---

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

Edit files in the relevant package or app.

### 3. Run Tests Locally

```bash
npm run test
npm run lint
```

### 4. Commit Changes

Follow conventional commit format:

```bash
git commit -m "feat(package-name): add new feature"
git commit -m "fix(app-name): fix bug description"
git commit -m "docs: update documentation"
```

### 5. Push and Create PR

```bash
git push -u origin feature/your-feature-name
# Create PR on GitHub
```

---

## Code Style

### TypeScript

- Use strict mode
- Prefer interfaces over types for objects
- Use explicit return types for public functions
- Use `const` by default, `let` when necessary

```typescript
// Good
interface User {
  id: string;
  name: string;
}

function getUser(id: string): User | undefined {
  return users.get(id);
}

// Avoid
type User = {
  id: string;
  name: string;
};

function getUser(id) {
  return users.get(id);
}
```

### Imports

- Use named imports
- Order: external packages, then internal packages, then relative imports
- Separate groups with blank lines

```typescript
// External
import { useState, useEffect } from 'react';
import { z } from 'zod';

// Internal packages
import { constitutionalFramework } from '@constitutional-shrinkage/constitutional-framework';
import { votingSystem } from '@constitutional-shrinkage/voting-system';

// Relative imports
import { Button } from '../components/Button';
import { formatDate } from '../utils/date';
```

### File Naming

- Use `kebab-case` for files: `bill-management.ts`
- Use `PascalCase` for components: `BillCard.tsx`
- Use `camelCase` for hooks: `useVoting.ts`

---

## Debugging

### VS Code Launch Configuration

Add to `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Example",
      "program": "${workspaceFolder}/examples/demo-full-workflow.ts",
      "preLaunchTask": "tsc: build - tsconfig.json",
      "outFiles": ["${workspaceFolder}/**/*.js"],
      "runtimeArgs": ["-r", "ts-node/register"]
    }
  ]
}
```

### Console Logging

Use structured logging:

```typescript
console.log('[VotingSystem] Vote cast:', {
  citizenId: vote.citizenId,
  billId: vote.billId,
  choice: vote.choice,
  weight: vote.weight,
});
```

---

## Environment Variables

Create a `.env.local` file for local development:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/constitutional"

# Redis
REDIS_URL="redis://localhost:6379"

# Auth
NEXTAUTH_SECRET="your-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Feature Flags
ENABLE_BLOCKCHAIN=false
ENABLE_ANALYTICS=false
```

---

## Common Issues

### Issue: `Module not found`

**Solution:** Rebuild packages
```bash
npm run build
```

### Issue: TypeScript errors after pulling

**Solution:** Clean and reinstall
```bash
rm -rf node_modules
npm install
```

### Issue: Port already in use

**Solution:** Kill the process or use a different port
```bash
lsof -i :3000
kill -9 <PID>
```

### Issue: Database connection failed

**Solution:** Check PostgreSQL is running
```bash
# macOS
brew services start postgresql

# Linux
sudo systemctl start postgresql

# Docker
docker run -d -p 5432:5432 -e POSTGRES_PASSWORD=password postgres:15
```

---

## Getting Help

- **Documentation**: `/docs` directory
- **Examples**: `/examples` directory
- **GitHub Issues**: Report bugs and request features
- **GitHub Discussions**: Ask questions and discuss ideas

---

## Next Steps

1. Review the [API documentation](/docs/api/README.md)
2. Read the [application design docs](/docs/applications/README.md)
3. Check the [NEXT-STEPS.md](/docs/NEXT-STEPS.md) for priority tasks
4. Pick an issue and start contributing!
