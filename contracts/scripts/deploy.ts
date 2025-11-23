import { ethers } from "hardhat";

async function main() {
  console.log("Deploying Constitutional Shrinkage Voting Contracts...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Initial eligibility root (placeholder - replace with actual merkle root)
  const INITIAL_ELIGIBILITY_ROOT = ethers.keccak256(ethers.toUtf8Bytes("constitutional-shrinkage-eligibility-v1"));

  // Deploy VoteVerifier
  console.log("1. Deploying VoteVerifier...");
  const VoteVerifier = await ethers.getContractFactory("VoteVerifier");
  const voteVerifier = await VoteVerifier.deploy(INITIAL_ELIGIBILITY_ROOT);
  await voteVerifier.waitForDeployment();
  const voteVerifierAddress = await voteVerifier.getAddress();
  console.log("   VoteVerifier deployed to:", voteVerifierAddress);

  // Deploy VotingRegistry
  console.log("2. Deploying VotingRegistry...");
  const VotingRegistry = await ethers.getContractFactory("VotingRegistry");
  const votingRegistry = await VotingRegistry.deploy(voteVerifierAddress);
  await votingRegistry.waitForDeployment();
  const votingRegistryAddress = await votingRegistry.getAddress();
  console.log("   VotingRegistry deployed to:", votingRegistryAddress);

  // Deploy DelegationRegistry
  console.log("3. Deploying DelegationRegistry...");
  const DelegationRegistry = await ethers.getContractFactory("DelegationRegistry");
  const delegationRegistry = await DelegationRegistry.deploy();
  await delegationRegistry.waitForDeployment();
  const delegationRegistryAddress = await delegationRegistry.getAddress();
  console.log("   DelegationRegistry deployed to:", delegationRegistryAddress);

  // Deploy BillRegistry
  console.log("4. Deploying BillRegistry...");
  const BillRegistry = await ethers.getContractFactory("BillRegistry");
  const billRegistry = await BillRegistry.deploy();
  await billRegistry.waitForDeployment();
  const billRegistryAddress = await billRegistry.getAddress();
  console.log("   BillRegistry deployed to:", billRegistryAddress);

  // Deploy AuditTrail
  console.log("5. Deploying AuditTrail...");
  const AuditTrail = await ethers.getContractFactory("AuditTrail");
  const auditTrail = await AuditTrail.deploy();
  await auditTrail.waitForDeployment();
  const auditTrailAddress = await auditTrail.getAddress();
  console.log("   AuditTrail deployed to:", auditTrailAddress);

  console.log("\n=== Deployment Complete ===\n");
  console.log("Contract Addresses:");
  console.log("-------------------");
  console.log(`VoteVerifier:       ${voteVerifierAddress}`);
  console.log(`VotingRegistry:     ${votingRegistryAddress}`);
  console.log(`DelegationRegistry: ${delegationRegistryAddress}`);
  console.log(`BillRegistry:       ${billRegistryAddress}`);
  console.log(`AuditTrail:         ${auditTrailAddress}`);

  // Output deployment info for verification
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: Number((await ethers.provider.getNetwork()).chainId),
    deployer: deployer.address,
    contracts: {
      VoteVerifier: voteVerifierAddress,
      VotingRegistry: votingRegistryAddress,
      DelegationRegistry: delegationRegistryAddress,
      BillRegistry: billRegistryAddress,
      AuditTrail: auditTrailAddress,
    },
    eligibilityRoot: INITIAL_ELIGIBILITY_ROOT,
    timestamp: new Date().toISOString(),
  };

  console.log("\nDeployment Info (JSON):");
  console.log(JSON.stringify(deploymentInfo, null, 2));

  return deploymentInfo;
}

main()
  .then((info) => {
    console.log("\nDeployment successful!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\nDeployment failed:", error);
    process.exit(1);
  });
