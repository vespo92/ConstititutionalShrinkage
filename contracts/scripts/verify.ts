import { ethers, run } from "hardhat";

interface DeploymentAddresses {
  VoteVerifier: string;
  VotingRegistry: string;
  DelegationRegistry: string;
  BillRegistry: string;
  AuditTrail: string;
}

async function main() {
  console.log("Verifying Constitutional Shrinkage Contracts on Etherscan...\n");

  // Replace with actual deployed addresses
  const addresses: DeploymentAddresses = {
    VoteVerifier: process.env.VOTE_VERIFIER_ADDRESS || "",
    VotingRegistry: process.env.VOTING_REGISTRY_ADDRESS || "",
    DelegationRegistry: process.env.DELEGATION_REGISTRY_ADDRESS || "",
    BillRegistry: process.env.BILL_REGISTRY_ADDRESS || "",
    AuditTrail: process.env.AUDIT_TRAIL_ADDRESS || "",
  };

  const INITIAL_ELIGIBILITY_ROOT = ethers.keccak256(
    ethers.toUtf8Bytes("constitutional-shrinkage-eligibility-v1")
  );

  if (!addresses.VoteVerifier) {
    console.log("Please set contract addresses via environment variables:");
    console.log("  VOTE_VERIFIER_ADDRESS");
    console.log("  VOTING_REGISTRY_ADDRESS");
    console.log("  DELEGATION_REGISTRY_ADDRESS");
    console.log("  BILL_REGISTRY_ADDRESS");
    console.log("  AUDIT_TRAIL_ADDRESS");
    process.exit(1);
  }

  // Verify VoteVerifier
  console.log("1. Verifying VoteVerifier...");
  try {
    await run("verify:verify", {
      address: addresses.VoteVerifier,
      constructorArguments: [INITIAL_ELIGIBILITY_ROOT],
    });
    console.log("   VoteVerifier verified successfully");
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message.includes("Already Verified")) {
      console.log("   VoteVerifier already verified");
    } else {
      console.log("   Error verifying VoteVerifier:", err.message);
    }
  }

  // Verify VotingRegistry
  console.log("2. Verifying VotingRegistry...");
  try {
    await run("verify:verify", {
      address: addresses.VotingRegistry,
      constructorArguments: [addresses.VoteVerifier],
    });
    console.log("   VotingRegistry verified successfully");
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message.includes("Already Verified")) {
      console.log("   VotingRegistry already verified");
    } else {
      console.log("   Error verifying VotingRegistry:", err.message);
    }
  }

  // Verify DelegationRegistry
  console.log("3. Verifying DelegationRegistry...");
  try {
    await run("verify:verify", {
      address: addresses.DelegationRegistry,
      constructorArguments: [],
    });
    console.log("   DelegationRegistry verified successfully");
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message.includes("Already Verified")) {
      console.log("   DelegationRegistry already verified");
    } else {
      console.log("   Error verifying DelegationRegistry:", err.message);
    }
  }

  // Verify BillRegistry
  console.log("4. Verifying BillRegistry...");
  try {
    await run("verify:verify", {
      address: addresses.BillRegistry,
      constructorArguments: [],
    });
    console.log("   BillRegistry verified successfully");
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message.includes("Already Verified")) {
      console.log("   BillRegistry already verified");
    } else {
      console.log("   Error verifying BillRegistry:", err.message);
    }
  }

  // Verify AuditTrail
  console.log("5. Verifying AuditTrail...");
  try {
    await run("verify:verify", {
      address: addresses.AuditTrail,
      constructorArguments: [],
    });
    console.log("   AuditTrail verified successfully");
  } catch (error: unknown) {
    const err = error as Error;
    if (err.message.includes("Already Verified")) {
      console.log("   AuditTrail already verified");
    } else {
      console.log("   Error verifying AuditTrail:", err.message);
    }
  }

  console.log("\n=== Verification Complete ===");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Verification failed:", error);
    process.exit(1);
  });
