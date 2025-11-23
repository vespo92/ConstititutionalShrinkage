import { expect } from "chai";
import { ethers } from "hardhat";
import { VoteVerifier } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("VoteVerifier", function () {
  let voteVerifier: VoteVerifier;
  let owner: SignerWithAddress;
  let admin: SignerWithAddress;

  const INITIAL_ELIGIBILITY_ROOT = ethers.keccak256(ethers.toUtf8Bytes("initial-root"));

  beforeEach(async function () {
    [owner, admin] = await ethers.getSigners();

    const VoteVerifierFactory = await ethers.getContractFactory("VoteVerifier");
    voteVerifier = await VoteVerifierFactory.deploy(INITIAL_ELIGIBILITY_ROOT);
    await voteVerifier.waitForDeployment();
  });

  describe("Eligibility Root", function () {
    it("should set initial eligibility root", async function () {
      const root = await voteVerifier.getEligibilityRoot();
      expect(root).to.equal(INITIAL_ELIGIBILITY_ROOT);
    });

    it("should allow admin to update eligibility root", async function () {
      const newRoot = ethers.keccak256(ethers.toUtf8Bytes("new-root"));

      await expect(voteVerifier.setEligibilityRoot(newRoot))
        .to.emit(voteVerifier, "EligibilityRootUpdated")
        .withArgs(INITIAL_ELIGIBILITY_ROOT, newRoot);

      expect(await voteVerifier.getEligibilityRoot()).to.equal(newRoot);
    });

    it("should reject non-admin eligibility root update", async function () {
      const newRoot = ethers.keccak256(ethers.toUtf8Bytes("new-root"));

      await expect(
        voteVerifier.connect(admin).setEligibilityRoot(newRoot)
      ).to.be.reverted;
    });
  });

  describe("Eligibility Verification", function () {
    it("should reject proof with wrong merkle root", async function () {
      const wrongRoot = ethers.keccak256(ethers.toUtf8Bytes("wrong-root"));
      const mockProof = ethers.hexlify(ethers.randomBytes(256));

      await expect(
        voteVerifier.verifyEligibility(mockProof, wrongRoot)
      ).to.be.revertedWithCustomError(voteVerifier, "InvalidMerkleRoot");
    });

    it("should reject proof with insufficient length", async function () {
      const shortProof = ethers.hexlify(ethers.randomBytes(100));

      await expect(
        voteVerifier.verifyEligibility(shortProof, INITIAL_ELIGIBILITY_ROOT)
      ).to.be.revertedWithCustomError(voteVerifier, "InvalidProofLength");
    });
  });

  describe("Vote Validity Verification", function () {
    it("should reject empty commitment", async function () {
      const mockProof = ethers.hexlify(ethers.randomBytes(256));

      await expect(
        voteVerifier.verifyVoteValidity(mockProof, ethers.ZeroHash)
      ).to.be.revertedWithCustomError(voteVerifier, "InvalidProof");
    });

    it("should reject short proof", async function () {
      const shortProof = ethers.hexlify(ethers.randomBytes(100));
      const commitment = ethers.keccak256(ethers.toUtf8Bytes("commitment"));

      await expect(
        voteVerifier.verifyVoteValidity(shortProof, commitment)
      ).to.be.revertedWithCustomError(voteVerifier, "InvalidProofLength");
    });
  });

  describe("Delegation Chain Verification", function () {
    it("should reject zero address delegate", async function () {
      const mockProof = ethers.hexlify(ethers.randomBytes(256));

      await expect(
        voteVerifier.verifyDelegationChain(mockProof, ethers.ZeroAddress, 3)
      ).to.be.revertedWithCustomError(voteVerifier, "InvalidProof");
    });

    it("should reject zero depth", async function () {
      const mockProof = ethers.hexlify(ethers.randomBytes(256));

      await expect(
        voteVerifier.verifyDelegationChain(mockProof, admin.address, 0)
      ).to.be.revertedWithCustomError(voteVerifier, "InvalidProof");
    });

    it("should reject depth greater than 10", async function () {
      const mockProof = ethers.hexlify(ethers.randomBytes(256));

      await expect(
        voteVerifier.verifyDelegationChain(mockProof, admin.address, 11)
      ).to.be.revertedWithCustomError(voteVerifier, "InvalidProof");
    });
  });

  describe("Batch Verification", function () {
    it("should batch verify multiple proofs", async function () {
      const proofs = [
        ethers.hexlify(ethers.randomBytes(256)),
        ethers.hexlify(ethers.randomBytes(256)),
      ];
      const commitments = [
        ethers.keccak256(ethers.toUtf8Bytes("commitment-1")),
        ethers.keccak256(ethers.toUtf8Bytes("commitment-2")),
      ];

      const results = await voteVerifier.batchVerify(proofs, commitments);
      expect(results.length).to.equal(2);
    });

    it("should require equal length arrays", async function () {
      const proofs = [ethers.hexlify(ethers.randomBytes(256))];
      const commitments = [
        ethers.keccak256(ethers.toUtf8Bytes("commitment-1")),
        ethers.keccak256(ethers.toUtf8Bytes("commitment-2")),
      ];

      await expect(
        voteVerifier.batchVerify(proofs, commitments)
      ).to.be.revertedWith("Length mismatch");
    });
  });
});
