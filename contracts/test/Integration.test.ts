import { expect } from "chai";
import { ethers } from "hardhat";
import {
  VotingRegistry,
  VoteVerifier,
  DelegationRegistry,
  BillRegistry,
  AuditTrail,
} from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("Integration Tests", function () {
  let votingRegistry: VotingRegistry;
  let voteVerifier: VoteVerifier;
  let delegationRegistry: DelegationRegistry;
  let billRegistry: BillRegistry;
  let auditTrail: AuditTrail;

  let owner: SignerWithAddress;
  let registrar: SignerWithAddress;
  let voter1: SignerWithAddress;
  let voter2: SignerWithAddress;
  let delegate: SignerWithAddress;

  const ELIGIBILITY_ROOT = ethers.keccak256(ethers.toUtf8Bytes("test-eligibility-root"));

  beforeEach(async function () {
    [owner, registrar, voter1, voter2, delegate] = await ethers.getSigners();

    // Deploy all contracts
    const VoteVerifierFactory = await ethers.getContractFactory("VoteVerifier");
    voteVerifier = await VoteVerifierFactory.deploy(ELIGIBILITY_ROOT);

    const VotingRegistryFactory = await ethers.getContractFactory("VotingRegistry");
    votingRegistry = await VotingRegistryFactory.deploy(await voteVerifier.getAddress());

    const DelegationRegistryFactory = await ethers.getContractFactory("DelegationRegistry");
    delegationRegistry = await DelegationRegistryFactory.deploy();

    const BillRegistryFactory = await ethers.getContractFactory("BillRegistry");
    billRegistry = await BillRegistryFactory.deploy();

    const AuditTrailFactory = await ethers.getContractFactory("AuditTrail");
    auditTrail = await AuditTrailFactory.deploy();

    // Grant roles
    const REGISTRAR_ROLE = await votingRegistry.REGISTRAR_ROLE();
    await votingRegistry.grantRole(REGISTRAR_ROLE, registrar.address);

    const BILL_REGISTRAR_ROLE = await billRegistry.BILL_REGISTRAR_ROLE();
    await billRegistry.grantRole(BILL_REGISTRAR_ROLE, registrar.address);

    const RECORDER_ROLE = await auditTrail.RECORDER_ROLE();
    await auditTrail.grantRole(RECORDER_ROLE, registrar.address);
  });

  describe("Full Voting Flow", function () {
    it("should complete a full voting cycle", async function () {
      // 1. Register a bill
      const billId = ethers.keccak256(ethers.toUtf8Bytes("bill-001"));
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes("bill content"));
      const titleHash = ethers.keccak256(ethers.toUtf8Bytes("Test Bill"));

      await billRegistry.connect(registrar).registerBill(
        billId,
        contentHash,
        titleHash,
        "BILL-2024-001"
      );

      const bill = await billRegistry.getBill(billId);
      expect(bill.contentHash).to.equal(contentHash);

      // 2. Update bill status to SUBMITTED
      await billRegistry.connect(registrar).updateStatus(billId, 1); // SUBMITTED

      // 3. Create voting session
      const sessionId = ethers.keccak256(ethers.toUtf8Bytes("session-001"));
      const startTime = (await time.latest()) + 100;
      const endTime = startTime + 86400;

      await votingRegistry.connect(registrar).createSession(
        sessionId,
        contentHash,
        startTime,
        endTime
      );

      // 4. Update bill status to VOTING
      await billRegistry.connect(registrar).updateStatus(billId, 2); // VOTING

      // 5. Record audit entry
      await auditTrail.connect(registrar).recordSessionCreated(
        sessionId,
        contentHash,
        registrar.address
      );

      const auditEntries = await auditTrail.getEntriesByKey(sessionId);
      expect(auditEntries.length).to.equal(1);

      // 6. Verify session exists
      const session = await votingRegistry.getSession(sessionId);
      expect(session.billHash).to.equal(contentHash);
    });
  });

  describe("Delegation Integration", function () {
    it("should allow delegation and verify chain", async function () {
      // Voter1 delegates to voter2
      await delegationRegistry.connect(voter1).delegate(voter2.address);

      const finalDelegate = await delegationRegistry.getFinalDelegate(voter1.address);
      expect(finalDelegate).to.equal(voter2.address);

      // Voter2 delegates to delegate
      await delegationRegistry.connect(voter2).delegate(delegate.address);

      // Voter1's final delegate should now be 'delegate'
      const updatedFinalDelegate = await delegationRegistry.getFinalDelegate(voter1.address);
      expect(updatedFinalDelegate).to.equal(delegate.address);

      // Get the delegation chain
      const chain = await delegationRegistry.getDelegationChain(voter1.address);
      expect(chain.length).to.equal(3);
      expect(chain[0]).to.equal(voter1.address);
      expect(chain[1]).to.equal(voter2.address);
      expect(chain[2]).to.equal(delegate.address);
    });

    it("should prevent circular delegation", async function () {
      // Voter1 -> Voter2
      await delegationRegistry.connect(voter1).delegate(voter2.address);

      // Voter2 -> Delegate
      await delegationRegistry.connect(voter2).delegate(delegate.address);

      // Delegate -> Voter1 should fail (creates loop)
      await expect(
        delegationRegistry.connect(delegate).delegate(voter1.address)
      ).to.be.revertedWithCustomError(delegationRegistry, "DelegationLoopDetected");
    });
  });

  describe("Bill Lifecycle", function () {
    it("should track bill through full lifecycle", async function () {
      const billId = ethers.keccak256(ethers.toUtf8Bytes("bill-lifecycle"));
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes("bill content"));
      const titleHash = ethers.keccak256(ethers.toUtf8Bytes("Lifecycle Bill"));

      // Register
      await billRegistry.connect(registrar).registerBill(
        billId,
        contentHash,
        titleHash,
        "BILL-LC-001"
      );

      let bill = await billRegistry.getBill(billId);
      expect(bill.status).to.equal(0); // DRAFT

      // Submit
      await billRegistry.connect(registrar).updateStatus(billId, 1);
      bill = await billRegistry.getBill(billId);
      expect(bill.status).to.equal(1); // SUBMITTED

      // Start voting
      await billRegistry.connect(registrar).updateStatus(billId, 2);
      bill = await billRegistry.getBill(billId);
      expect(bill.status).to.equal(2); // VOTING

      // Pass
      await billRegistry.connect(registrar).updateStatus(billId, 3);
      bill = await billRegistry.getBill(billId);
      expect(bill.status).to.equal(3); // PASSED

      // Enact
      await billRegistry.connect(registrar).updateStatus(billId, 5);
      bill = await billRegistry.getBill(billId);
      expect(bill.status).to.equal(5); // ENACTED
    });

    it("should add amendments to bill", async function () {
      const billId = ethers.keccak256(ethers.toUtf8Bytes("bill-amend"));
      const contentHash = ethers.keccak256(ethers.toUtf8Bytes("original content"));
      const titleHash = ethers.keccak256(ethers.toUtf8Bytes("Amendment Bill"));

      await billRegistry.connect(registrar).registerBill(
        billId,
        contentHash,
        titleHash,
        "BILL-AMD-001"
      );

      // Add amendments
      const amendment1 = ethers.keccak256(ethers.toUtf8Bytes("amendment 1"));
      const amendment2 = ethers.keccak256(ethers.toUtf8Bytes("amendment 2"));

      await billRegistry.connect(registrar).addAmendment(billId, amendment1);
      await billRegistry.connect(registrar).addAmendment(billId, amendment2);

      const amendments = await billRegistry.getAmendments(billId);
      expect(amendments.length).to.equal(2);
      expect(amendments[0]).to.equal(amendment1);
      expect(amendments[1]).to.equal(amendment2);
    });
  });

  describe("Audit Trail", function () {
    it("should record and query audit entries", async function () {
      const sessionId = ethers.keccak256(ethers.toUtf8Bytes("audit-session"));
      const billHash = ethers.keccak256(ethers.toUtf8Bytes("audit-bill"));

      // Record multiple entries
      await auditTrail.connect(registrar).recordSessionCreated(
        sessionId,
        billHash,
        registrar.address
      );

      const commitment = ethers.keccak256(ethers.toUtf8Bytes("commitment"));
      await auditTrail.connect(registrar).recordVoteCommitted(
        sessionId,
        commitment,
        voter1.address
      );

      // Query by session
      const entriesByKey = await auditTrail.getEntriesByKey(sessionId);
      expect(entriesByKey.length).to.equal(2);

      // Query by actor
      const entriesByVoter = await auditTrail.getEntriesByActor(voter1.address);
      expect(entriesByVoter.length).to.equal(1);

      // Get entry count
      const count = await auditTrail.getEntryCount();
      expect(count).to.equal(2);
    });
  });
});
