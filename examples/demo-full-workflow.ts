/**
 * Complete Example: Universal Basic Income Bill
 *
 * This example demonstrates the entire governance workflow:
 * 1. Proposing a bill
 * 2. Validating against the constitution
 * 3. Creating a voting session
 * 4. Citizens voting (direct and delegated)
 * 5. Predicting impact with metrics
 * 6. Merging the bill into law
 */

import {
  constitutionalFramework,
  GovernanceLevel,
  LawStatus,
} from '../packages/constitutional-framework/src';
import {
  createBill,
  forkBill,
  mergeBill,
  generateDiff,
  signData,
  generateKeyPair,
} from '../packages/governance-utils/src';
import {
  votingSystem,
  VoteChoice,
  DelegationScope,
  VerificationLevel,
} from '../packages/voting-system/src';
import {
  metricsSystem,
  MetricCategory,
  STANDARD_METRICS,
} from '../packages/metrics/src';

// ============================================================================
// STEP 1: Register Citizens
// ============================================================================

console.log('\n🏛️  CONSTITUTIONAL SHRINKAGE - DEMO\n');
console.log('━'.repeat(80));
console.log('📋 STEP 1: Registering Citizens\n');

const alice = generateKeyPair();
const bob = generateKeyPair();
const carol = generateKeyPair();
const dave = generateKeyPair();

// Register citizens in the voting system
votingSystem.registerCitizen({
  id: 'alice',
  publicKey: alice.publicKey,
  regions: ['region-northwest'],
  votingPower: 1.0,
  delegations: [],
  reputation: 95,
  verificationLevel: VerificationLevel.FULL,
});

votingSystem.registerCitizen({
  id: 'bob',
  publicKey: bob.publicKey,
  regions: ['region-northwest'],
  votingPower: 1.0,
  delegations: [],
  reputation: 87,
  verificationLevel: VerificationLevel.FULL,
});

votingSystem.registerCitizen({
  id: 'carol',
  publicKey: carol.publicKey,
  regions: ['region-northwest'],
  votingPower: 1.0,
  delegations: [],
  reputation: 92,
  verificationLevel: VerificationLevel.FULL,
});

votingSystem.registerCitizen({
  id: 'dave',
  publicKey: dave.publicKey,
  regions: ['region-northwest'],
  votingPower: 1.0,
  delegations: [],
  reputation: 78,
  verificationLevel: VerificationLevel.BASIC,
});

console.log('✅ Registered 4 citizens: Alice, Bob, Carol, Dave\n');

// ============================================================================
// STEP 2: Bob Delegates to Alice (Liquid Democracy)
// ============================================================================

console.log('━'.repeat(80));
console.log('🔄 STEP 2: Bob Delegates Voting Power to Alice\n');

votingSystem.delegateVote({
  delegatorId: 'bob',
  delegateId: 'alice',
  scope: DelegationScope.CATEGORY,
  category: 'economic-policy',
  duration: 365, // 1 year
});

console.log('✅ Bob has delegated economic policy votes to Alice for 1 year\n');

// ============================================================================
// STEP 3: Alice Proposes a Universal Basic Income Bill
// ============================================================================

console.log('━'.repeat(80));
console.log('📝 STEP 3: Alice Proposes Universal Basic Income Bill\n');

const ubiBill = createBill({
  title: 'Universal Basic Income Pilot Program',
  content: `
# Universal Basic Income Pilot Program

## Summary
Establish a 3-year pilot program providing $1,000/month to all adult residents
of the Northwest Region to test the effects of Universal Basic Income on:
- Economic security
- Job mobility
- Mental health
- Innovation and entrepreneurship

## Funding
Funded through:
1. Regional carbon tax revenue
2. Administrative cost savings from welfare consolidation
3. Progressive income tax on top 5% earners

## Metrics & Accountability
This program will be measured on:
- Employment rates (target: maintain 90%+)
- Mental health outcomes (target: 20% improvement)
- Small business formation (target: 30% increase)
- Carbon emissions (target: maintain or reduce)

## Sunset Clause
This program will automatically sunset after 3 years unless:
1. All target metrics are achieved
2. 65% of citizens vote to extend
3. Triple bottom line scores remain above minimum thresholds

## Constitutional Compliance
This bill respects individual sovereignty - participation is voluntary.
No person is compelled to accept UBI payments.
  `,
  sponsor: 'alice',
  level: GovernanceLevel.REGIONAL,
  regionId: 'region-northwest',
  sunsetYears: 3,
});

console.log(`📄 Bill Created: ${ubiBill.title}`);
console.log(`📍 Bill ID: ${ubiBill.id}`);
console.log(`🌿 Git Branch: ${ubiBill.gitBranch}`);
console.log(`⏰ Sunset Date: ${ubiBill.sunsetDate.toLocaleDateString()}\n`);

// ============================================================================
// STEP 4: Validate Bill Against Constitution
// ============================================================================

console.log('━'.repeat(80));
console.log('⚖️  STEP 4: Validating Bill Against Constitution\n');

const validation = constitutionalFramework.validateLaw(ubiBill);

console.log(`Validation Result: ${validation.valid ? '✅ VALID' : '❌ INVALID'}\n`);

if (validation.errors.length > 0) {
  console.log('❌ Errors:');
  validation.errors.forEach((error) => {
    console.log(`   - ${error.message}`);
  });
}

if (validation.warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  validation.warnings.forEach((warning) => {
    console.log(`   - ${warning.message}`);
  });
}

if (validation.valid) {
  console.log('\n✅ Bill passes constitutional validation!\n');
}

// ============================================================================
// STEP 5: Dave Forks the Bill (Proposes Amendment)
// ============================================================================

console.log('━'.repeat(80));
console.log('🔀 STEP 5: Dave Forks the Bill to Propose Changes\n');

const davesFork = forkBill(
  ubiBill,
  'dave',
  ubiBill.content.replace('$1,000/month', '$750/month') +
    '\n\n## Amendment by Dave\nReduced monthly payment to $750 to lower tax burden.'
);

console.log(`📄 Fork Created: ${davesFork.title} (Fork)`);
console.log(`📍 Parent Bill: ${davesFork.parentBillId}`);
console.log(`🌿 Git Branch: ${davesFork.gitBranch}\n`);

const diff = generateDiff(ubiBill.content, davesFork.content);
console.log('📊 Diff Preview (first 300 chars):');
console.log(diff.substring(0, 300) + '...\n');

console.log('💡 For this demo, we\'ll proceed with Alice\'s original bill\n');

// ============================================================================
// STEP 6: Predict Impact with Metrics
// ============================================================================

console.log('━'.repeat(80));
console.log('📊 STEP 6: Predicting Triple Bottom Line Impact\n');

// Register the Northwest Region
metricsSystem.registerRegion({
  regionId: 'region-northwest',
  regionName: 'Northwest Region',
  metrics: [
    { ...STANDARD_METRICS.HAPPINESS_INDEX, currentValue: 72 },
    { ...STANDARD_METRICS.EMPLOYMENT_RATE, currentValue: 88 },
    { ...STANDARD_METRICS.GDP_PER_CAPITA, currentValue: 65000 },
    { ...STANDARD_METRICS.CARBON_EMISSIONS, currentValue: 4.2 },
  ],
  score: {
    people: 75,
    planet: 68,
    profit: 72,
    composite: 72,
    timestamp: new Date(),
    tradeoffs: [],
  },
  trends: [],
});

const impact = metricsSystem.predictImpact(
  ubiBill.content,
  'region-northwest',
  ['UBI increases economic security', 'Reduced work stress improves health']
);

console.log('🔮 Impact Predictions:\n');
console.log(`Short Term (1 year):`);
console.log(`  👥 People:  ${impact.shortTerm.people.toFixed(1)}`);
console.log(`  🌍 Planet:  ${impact.shortTerm.planet.toFixed(1)}`);
console.log(`  💰 Profit:  ${impact.shortTerm.profit.toFixed(1)}\n`);

console.log(`Medium Term (5 years):`);
console.log(`  👥 People:  ${impact.mediumTerm.people.toFixed(1)}`);
console.log(`  🌍 Planet:  ${impact.mediumTerm.planet.toFixed(1)}`);
console.log(`  💰 Profit:  ${impact.mediumTerm.profit.toFixed(1)}\n`);

console.log(`Long Term (10 years):`);
console.log(`  👥 People:  ${impact.longTerm.people.toFixed(1)}`);
console.log(`  🌍 Planet:  ${impact.longTerm.planet.toFixed(1)}`);
console.log(`  💰 Profit:  ${impact.longTerm.profit.toFixed(1)}\n`);

// ============================================================================
// STEP 7: Create Voting Session
// ============================================================================

console.log('━'.repeat(80));
console.log('🗳️  STEP 7: Creating Voting Session\n');

const votingSession = votingSystem.createSession({
  billId: ubiBill.id,
  startDate: new Date(),
  endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  quorum: {
    minimumParticipation: 0.5, // 50% must vote
    approvalThreshold: 0.6, // 60% must approve
  },
});

console.log(`📅 Voting Period: 30 days`);
console.log(`📊 Quorum Required: 50% participation`);
console.log(`✅ Approval Threshold: 60% of votes\n`);

// ============================================================================
// STEP 8: Citizens Vote
// ============================================================================

console.log('━'.repeat(80));
console.log('🗳️  STEP 8: Citizens Cast Their Votes\n');

// Alice votes FOR (she proposed it)
const aliceSignature = signData(`vote-${ubiBill.id}-for`, alice.privateKey);
votingSystem.castVote({
  citizenId: 'alice',
  billId: ubiBill.id,
  choice: VoteChoice.FOR,
  signature: aliceSignature,
  isPublic: true,
});
console.log('✅ Alice voted FOR (direct vote, +1 voting power)');

// Bob's vote is automatically delegated to Alice
// So Alice effectively has 2 voting power
console.log('🔄 Bob\'s vote delegated to Alice (+1 voting power to Alice)');

// Carol votes FOR
const carolSignature = signData(`vote-${ubiBill.id}-for`, carol.privateKey);
votingSystem.castVote({
  citizenId: 'carol',
  billId: ubiBill.id,
  choice: VoteChoice.FOR,
  signature: carolSignature,
  isPublic: true,
});
console.log('✅ Carol voted FOR (direct vote, +1 voting power)');

// Dave votes AGAINST (he wanted lower amount)
const daveSignature = signData(`vote-${ubiBill.id}-against`, dave.privateKey);
votingSystem.castVote({
  citizenId: 'dave',
  billId: ubiBill.id,
  choice: VoteChoice.AGAINST,
  signature: daveSignature,
  isPublic: true,
});
console.log('❌ Dave voted AGAINST (direct vote, +1 voting power)\n');

// ============================================================================
// STEP 9: Check Results
// ============================================================================

console.log('━'.repeat(80));
console.log('📊 STEP 9: Voting Results\n');

const results = votingSystem.getResults(ubiBill.id);

console.log(`Votes:`);
console.log(`  ✅ FOR:     ${results.for} votes (${results.weightedFor} weighted)`);
console.log(`  ❌ AGAINST: ${results.against} votes (${results.weightedAgainst} weighted)`);
console.log(`  ⚪ ABSTAIN: ${results.abstain} votes (${results.weightedAbstain} weighted)`);
console.log(`  📊 TOTAL:   ${results.total} votes\n`);

console.log(`Requirements:`);
console.log(`  Quorum Met: ${results.quorumMet ? '✅' : '❌'}`);
console.log(`  Passed: ${results.passed ? '✅ YES' : '❌ NO'}\n`);

// ============================================================================
// STEP 10: Merge Bill into Law
// ============================================================================

if (results.passed) {
  console.log('━'.repeat(80));
  console.log('⚖️  STEP 10: Merging Bill into Law\n');

  const mergedBill = mergeBill(ubiBill);
  console.log(`✅ Bill merged into law!`);
  console.log(`📜 Law ID: ${mergedBill.id}`);
  console.log(`📝 Status: ${mergedBill.status}`);
  console.log(`🔐 Git Commit: ${mergedBill.gitCommitHash}`);
  console.log(`📅 Ratified: ${mergedBill.ratifiedAt?.toLocaleString()}`);
  console.log(`⏰ Sunset: ${mergedBill.sunsetDate.toLocaleDateString()}\n`);

  console.log('━'.repeat(80));
  console.log('🎉 SUCCESS! The bill is now law!\n');
  console.log('This demonstrates the complete governance workflow:');
  console.log('  ✅ Citizen proposal');
  console.log('  ✅ Constitutional validation');
  console.log('  ✅ Fork and amendment (git-style)');
  console.log('  ✅ Impact prediction (triple bottom line)');
  console.log('  ✅ Liquid democracy (delegation)');
  console.log('  ✅ Transparent voting');
  console.log('  ✅ Automatic merge into law\n');

  console.log('📈 Next Steps:');
  console.log('  - Monitor metrics against targets');
  console.log('  - Auto-sunset in 3 years if targets not met');
  console.log('  - Citizens can revoke delegations anytime');
  console.log('  - Performance-based governance in action!\n');

  console.log('━'.repeat(80));
  console.log('🏛️  POWER TO THE PEOPLE! TRANSPARENCY FOR ALL!\n');
}

// ============================================================================
// Summary
// ============================================================================

console.log('\n' + '═'.repeat(80));
console.log('📋 SUMMARY OF DEMONSTRATION\n');
console.log('This example showed the complete Constitutional Shrinkage workflow:');
console.log('');
console.log('1. ✅ Citizen registration with cryptographic identity');
console.log('2. ✅ Liquid democracy (Bob delegated to Alice)');
console.log('3. ✅ Bill proposal with sunset clause');
console.log('4. ✅ Constitutional validation (immutable rights)');
console.log('5. ✅ Git-style forking (Dave proposed changes)');
console.log('6. ✅ Triple bottom line impact prediction');
console.log('7. ✅ Transparent voting session');
console.log('8. ✅ Weighted voting with delegations');
console.log('9. ✅ Automatic result calculation');
console.log('10. ✅ Merge to law with git commit hash');
console.log('');
console.log('🎯 Key Features Demonstrated:');
console.log('  • Direct democracy - citizens propose and vote directly');
console.log('  • Liquid democracy - delegate or vote yourself');
console.log('  • Git workflow - fork, diff, merge like code');
console.log('  • Constitutional protection - immutable rights enforced');
console.log('  • Metrics-driven - predict impact before voting');
console.log('  • Transparent - all votes public (with privacy options)');
console.log('  • Accountable - automatic sunset, performance tracking');
console.log('  • Decentralized - regional autonomy');
console.log('');
console.log('═'.repeat(80));
console.log('\n🚀 This is the future of governance!\n');
