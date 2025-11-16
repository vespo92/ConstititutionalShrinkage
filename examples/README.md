# Examples

This directory contains working examples demonstrating the Constitutional Shrinkage governance system.

## Running Examples

### Full Workflow Demo

The complete demonstration of the governance system from bill proposal to law:

```bash
# From repository root
npx tsx examples/demo-full-workflow.ts
```

This example demonstrates:
1. ✅ Citizen registration with cryptographic keys
2. ✅ Liquid democracy (Bob delegates to Alice)
3. ✅ Bill proposal (Universal Basic Income)
4. ✅ Constitutional validation
5. ✅ Git-style forking (Dave proposes amendment)
6. ✅ Triple bottom line impact prediction
7. ✅ Voting session creation
8. ✅ Citizens casting votes
9. ✅ Weighted voting with delegations
10. ✅ Result calculation and bill merge into law

### Expected Output

You'll see a complete walkthrough with:
- 🏛️ ASCII art progress indicators
- ✅ Success confirmations at each step
- 📊 Voting results breakdown
- 🔮 Impact predictions (People, Planet, Profit)
- 📝 Git commit hashes and sunset dates
- 🎉 Final celebration when bill becomes law

## What This Demonstrates

### Direct Democracy
- Any citizen can propose legislation
- Citizens vote directly on bills
- No intermediaries required
- Transparent voting process

### Liquid Democracy
- Delegate your vote to experts
- Scoped delegation (all/category/single-bill)
- Revocable anytime
- Delegation chains visible

### Git-Style Governance
- Bills are branches
- Fork to propose amendments
- Diff shows exact changes
- Merge approval voting
- Full version history

### Constitutional Protection
- Immutable rights enforced
- Automatic validation
- Bills cannot violate core principles
- Conflict detection

### Metrics-Driven Policy
- Predict impact before voting
- Triple bottom line scoring
- All three pillars must succeed
- Performance-based governance

### Accountability
- Automatic sunset clauses
- Performance triggers
- No eternal bad laws
- Continuous measurement

## Example Structure

The demo follows this workflow:

```
Register Citizens
       ↓
Set Up Delegations
       ↓
Propose Bill
       ↓
Validate Constitutionally
       ↓
Fork (Optional Amendments)
       ↓
Predict Impact (Metrics)
       ↓
Create Voting Session
       ↓
Citizens Vote
       ↓
Calculate Results
       ↓
Merge to Law (if passed)
```

## Use Cases

### For Developers
- See all packages working together
- Learn the API patterns
- Understand the workflow
- Get code snippets to copy

### For Policy Experts
- Understand the governance process
- See how bills are validated
- Learn about sunset clauses
- Explore impact prediction

### For Citizens
- See how you'd participate
- Understand liquid democracy
- Learn about delegations
- Experience transparency

### For Advocates
- Demonstrate to others
- Show the vision in action
- Prove it's feasible
- Share the revolution

## Customizing Examples

You can modify the demo to test different scenarios:

### Change the Bill Content
```typescript
const myBill = createBill({
  title: 'Your Custom Bill Title',
  content: 'Your bill content here...',
  sponsor: 'your-citizen-id',
  level: GovernanceLevel.LOCAL,
  regionId: 'your-region',
  sunsetYears: 5,
});
```

### Add More Citizens
```typescript
votingSystem.registerCitizen({
  id: 'new-citizen',
  publicKey: newKeys.publicKey,
  regions: ['region-id'],
  votingPower: 1.0,
  delegations: [],
  reputation: 80,
  verificationLevel: VerificationLevel.FULL,
});
```

### Test Different Voting Outcomes
```typescript
// Make bill fail
votingSystem.castVote({
  citizenId: 'citizen-1',
  billId: bill.id,
  choice: VoteChoice.AGAINST,
  signature: sig,
});

// See what happens when quorum not met
// (just don't have enough people vote)
```

### Try Complex Delegations
```typescript
// Multi-level delegation chains
votingSystem.delegateVote({
  delegatorId: 'citizen-a',
  delegateId: 'citizen-b',
  scope: DelegationScope.ALL,
});

votingSystem.delegateVote({
  delegatorId: 'citizen-b',
  delegateId: 'citizen-c',
  scope: DelegationScope.CATEGORY,
  category: 'economics',
});
```

## Next Steps

After running the demo:

1. **Explore the Code**: Read through `demo-full-workflow.ts` to understand the API
2. **Try the Packages**: Import and use the packages in your own code
3. **Build an App**: Create a UI for this governance system
4. **Contribute**: Add more examples showing different use cases
5. **Share**: Show others what modern governance could look like

## Contributing Examples

We'd love more examples! Consider adding:
- Regional pod setup
- Supply chain distance taxation
- Judicial smart contracts
- Executive coordination
- Cross-region treaties
- Performance-based sunsets
- A/B testing policies

See [CONTRIBUTING.md](../CONTRIBUTING.md) for guidelines.

---

**This is what democracy looks like in 2025!** 🚀
