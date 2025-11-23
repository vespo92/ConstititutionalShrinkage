import { ethers } from "ethers";
import { EligibilityProof } from "../types";
import { MerkleTreeBuilder } from "../utils/merkle";

/**
 * Eligibility prover for ZK proofs
 * Proves voter is a registered citizen without revealing identity
 */
export class EligibilityProver {
  private eligibleCitizens: MerkleTreeBuilder;

  constructor() {
    this.eligibleCitizens = new MerkleTreeBuilder();
  }

  /**
   * Add an eligible citizen to the set
   */
  addEligibleCitizen(citizenIdHash: string): void {
    this.eligibleCitizens.addLeaf(citizenIdHash);
  }

  /**
   * Build the eligibility merkle tree
   */
  buildTree(): string {
    this.eligibleCitizens.build();
    return this.eligibleCitizens.getRoot() || "";
  }

  /**
   * Get the eligibility merkle root
   */
  getEligibilityRoot(): string | null {
    return this.eligibleCitizens.getRoot();
  }

  /**
   * Generate an eligibility proof for a citizen
   */
  async generateProof(
    citizenId: string,
    privateSecret: string
  ): Promise<EligibilityProof> {
    // Hash the citizen ID
    const citizenIdHash = ethers.keccak256(ethers.toUtf8Bytes(citizenId));

    // Get merkle proof
    const merkleProof = this.eligibleCitizens.getProof(citizenIdHash);
    const merkleRoot = this.eligibleCitizens.getRoot();

    if (!merkleProof || !merkleRoot) {
      throw new Error("Citizen not found in eligibility set");
    }

    // Generate ZK proof (placeholder - real implementation uses snarkjs/circom)
    const proofData = await this.generateZKProof(
      citizenId,
      privateSecret,
      merkleProof,
      merkleRoot
    );

    return {
      proof: proofData,
      publicInputs: [merkleRoot],
      merkleRoot,
    };
  }

  /**
   * Generate the ZK proof data
   * In production, this would use snarkjs with a compiled circuit
   */
  private async generateZKProof(
    citizenId: string,
    privateSecret: string,
    merkleProof: string[],
    merkleRoot: string
  ): Promise<string> {
    // Placeholder for actual ZK proof generation
    // The real implementation would:
    // 1. Load the circuit WASM and proving key
    // 2. Compute witness from inputs
    // 3. Generate Groth16 proof

    const proofData = ethers.concat([
      ethers.randomBytes(32), // a[0]
      ethers.randomBytes(32), // a[1]
      ethers.randomBytes(32), // b[0][0]
      ethers.randomBytes(32), // b[0][1]
      ethers.randomBytes(32), // b[1][0]
      ethers.randomBytes(32), // b[1][1]
      ethers.randomBytes(32), // c[0]
      ethers.randomBytes(32), // c[1]
    ]);

    return ethers.hexlify(proofData);
  }

  /**
   * Verify an eligibility proof locally
   */
  verifyProofLocally(proof: EligibilityProof): boolean {
    // Basic validation
    if (!proof.proof || proof.proof.length < 256 * 2 + 2) {
      return false;
    }

    if (!proof.merkleRoot || proof.merkleRoot.length !== 66) {
      return false;
    }

    // Verify merkle root matches
    const currentRoot = this.eligibleCitizens.getRoot();
    if (currentRoot && currentRoot !== proof.merkleRoot) {
      return false;
    }

    try {
      ethers.getBytes(proof.proof);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if a citizen is eligible
   */
  isEligible(citizenIdHash: string): boolean {
    const proof = this.eligibleCitizens.getProof(citizenIdHash);
    return proof !== null;
  }

  /**
   * Get the merkle proof for a citizen
   */
  getMerkleProof(citizenIdHash: string): string[] | null {
    return this.eligibleCitizens.getProof(citizenIdHash);
  }

  /**
   * Get the number of eligible citizens
   */
  getEligibleCount(): number {
    return this.eligibleCitizens.getLeafCount();
  }

  /**
   * Clear the eligibility set
   */
  clear(): void {
    this.eligibleCitizens.clear();
  }

  /**
   * Load eligible citizens from an array
   */
  loadFromArray(citizenIdHashes: string[]): string {
    this.clear();
    for (const hash of citizenIdHashes) {
      this.addEligibleCitizen(hash);
    }
    return this.buildTree();
  }
}
