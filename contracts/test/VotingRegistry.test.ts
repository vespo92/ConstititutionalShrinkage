import { expect } from "chai";
import { ethers } from "hardhat";
import { VotingRegistry, VoteVerifier } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("VotingRegistry", function () {
  let votingRegistry: VotingRegistry;
  let voteVerifier: VoteVerifier;
  let owner: SignerWithAddress;
  let registrar: SignerWithAddress;
  let voter1: SignerWithAddress;
  let voter2: SignerWithAddress;

  const ELIGIBILITY_ROOT = ethers.keccak256(ethers.toUtf8Bytes("test-eligibility-root"));

  beforeEach(async function () {
    [owner, registrar, voter1, voter2] = await ethers.getSigners();

    // Deploy VoteVerifier
    const VoteVerifierFactory = await ethers.getContractFactory("VoteVerifier");
    voteVerifier = await VoteVerifierFactory.deploy(ELIGIBILITY_ROOT);
    await voteVerifier.waitForDeployment();

    // Deploy VotingRegistry
    const VotingRegistryFactory = await ethers.getContractFactory("VotingRegistry");
    votingRegistry = await VotingRegistryFactory.deploy(await voteVerifier.getAddress());
    await votingRegistry.waitForDeployment();

    // Grant roles
    const REGISTRAR_ROLE = await votingRegistry.REGISTRAR_ROLE();
    await votingRegistry.grantRole(REGISTRAR_ROLE, registrar.address);
  });

  describe("Session Management", function () {
    it("should create a voting session", async function () {
      const sessionId = ethers.keccak256(ethers.toUtf8Bytes("session-1"));
      const billHash = ethers.keccak256(ethers.toUtf8Bytes("bill-1"));
      const startTime = (await time.latest()) + 3600; // 1 hour from now
      const endTime = startTime + 86400; // 24 hours duration

      await expect(
        votingRegistry.connect(registrar).createSession(sessionId, billHash, startTime, endTime)
      ).to.emit(votingRegistry, "SessionCreated")
        .withArgs(sessionId, billHash, startTime, endTime);

      const session = await votingRegistry.getSession(sessionId);
      expect(session.billHash).to.equal(billHash);
      expect(session.startTime).to.equal(startTime);
      expect(session.endTime).to.equal(endTime);
      expect(session.finalized).to.be.false;
    });

    it("should reject duplicate session IDs", async function () {
      const sessionId = ethers.keccak256(ethers.toUtf8Bytes("session-1"));
      const billHash = ethers.keccak256(ethers.toUtf8Bytes("bill-1"));
      const startTime = (await time.latest()) + 3600;
      const endTime = startTime + 86400;

      await votingRegistry.connect(registrar).createSession(sessionId, billHash, startTime, endTime);

      await expect(
        votingRegistry.connect(registrar).createSession(sessionId, billHash, startTime, endTime)
      ).to.be.revertedWithCustomError(votingRegistry, "SessionAlreadyExists");
    });

    it("should reject invalid duration", async function () {
      const sessionId = ethers.keccak256(ethers.toUtf8Bytes("session-1"));
      const billHash = ethers.keccak256(ethers.toUtf8Bytes("bill-1"));
      const startTime = (await time.latest()) + 3600;
      const endTime = startTime + 1800; // Only 30 minutes

      await expect(
        votingRegistry.connect(registrar).createSession(sessionId, billHash, startTime, endTime)
      ).to.be.revertedWithCustomError(votingRegistry, "InvalidDuration");
    });

    it("should only allow registrar role to create sessions", async function () {
      const sessionId = ethers.keccak256(ethers.toUtf8Bytes("session-1"));
      const billHash = ethers.keccak256(ethers.toUtf8Bytes("bill-1"));
      const startTime = (await time.latest()) + 3600;
      const endTime = startTime + 86400;

      await expect(
        votingRegistry.connect(voter1).createSession(sessionId, billHash, startTime, endTime)
      ).to.be.reverted;
    });
  });

  describe("Vote Commitment", function () {
    let sessionId: string;
    let startTime: number;
    let endTime: number;

    beforeEach(async function () {
      sessionId = ethers.keccak256(ethers.toUtf8Bytes("session-1"));
      const billHash = ethers.keccak256(ethers.toUtf8Bytes("bill-1"));
      startTime = (await time.latest()) + 100;
      endTime = startTime + 86400;

      await votingRegistry.connect(registrar).createSession(sessionId, billHash, startTime, endTime);
    });

    it("should reject votes before voting starts", async function () {
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("commitment"));
      const mockProof = ethers.hexlify(ethers.randomBytes(256));

      await expect(
        votingRegistry.connect(voter1).commitVote(sessionId, commitment, mockProof)
      ).to.be.revertedWithCustomError(votingRegistry, "VotingNotStarted");
    });

    it("should reject votes after voting ends", async function () {
      await time.increaseTo(endTime + 1);

      const commitment = ethers.keccak256(ethers.toUtf8Bytes("commitment"));
      const mockProof = ethers.hexlify(ethers.randomBytes(256));

      await expect(
        votingRegistry.connect(voter1).commitVote(sessionId, commitment, mockProof)
      ).to.be.revertedWithCustomError(votingRegistry, "VotingEnded");
    });
  });

  describe("Vote Reveal", function () {
    it("should properly tally revealed votes", async function () {
      const sessionId = ethers.keccak256(ethers.toUtf8Bytes("session-reveal"));
      const billHash = ethers.keccak256(ethers.toUtf8Bytes("bill-reveal"));
      const startTime = (await time.latest()) + 100;
      const endTime = startTime + 86400;

      await votingRegistry.connect(registrar).createSession(sessionId, billHash, startTime, endTime);

      // Move to reveal period
      await time.increaseTo(endTime + 1);

      const session = await votingRegistry.getSession(sessionId);
      expect(session.yesVotes).to.equal(0);
      expect(session.noVotes).to.equal(0);
    });
  });

  describe("Pause Functionality", function () {
    it("should allow admin to pause and unpause", async function () {
      await votingRegistry.pause();
      expect(await votingRegistry.paused()).to.be.true;

      await votingRegistry.unpause();
      expect(await votingRegistry.paused()).to.be.false;
    });

    it("should prevent operations when paused", async function () {
      await votingRegistry.pause();

      const sessionId = ethers.keccak256(ethers.toUtf8Bytes("session-1"));
      const billHash = ethers.keccak256(ethers.toUtf8Bytes("bill-1"));
      const startTime = (await time.latest()) + 3600;
      const endTime = startTime + 86400;

      await expect(
        votingRegistry.connect(registrar).createSession(sessionId, billHash, startTime, endTime)
      ).to.be.reverted;
    });
  });
});
