import { ethers } from "ethers";
import { MerkleTreeBuilder, verifyMerkleProof } from "../utils/merkle";

/**
 * Membership proof for set membership verification
 * Used for proving membership in various sets without revealing identity
 */
export class MembershipProver {
  private sets: Map<string, MerkleTreeBuilder> = new Map();

  /**
   * Create a new set
   */
  createSet(setId: string): void {
    if (this.sets.has(setId)) {
      throw new Error(`Set ${setId} already exists`);
    }
    this.sets.set(setId, new MerkleTreeBuilder());
  }

  /**
   * Add a member to a set
   */
  addMember(setId: string, memberHash: string): void {
    const set = this.sets.get(setId);
    if (!set) {
      throw new Error(`Set ${setId} not found`);
    }
    set.addLeaf(memberHash);
  }

  /**
   * Add multiple members to a set
   */
  addMembers(setId: string, memberHashes: string[]): void {
    for (const hash of memberHashes) {
      this.addMember(setId, hash);
    }
  }

  /**
   * Build the merkle tree for a set
   */
  buildSet(setId: string): string {
    const set = this.sets.get(setId);
    if (!set) {
      throw new Error(`Set ${setId} not found`);
    }
    set.build();
    return set.getRoot() || "";
  }

  /**
   * Get the merkle root for a set
   */
  getSetRoot(setId: string): string | null {
    const set = this.sets.get(setId);
    if (!set) {
      return null;
    }
    return set.getRoot();
  }

  /**
   * Generate a membership proof
   */
  generateMembershipProof(
    setId: string,
    memberHash: string
  ): {
    proof: string[];
    root: string;
    valid: boolean;
  } | null {
    const set = this.sets.get(setId);
    if (!set) {
      return null;
    }

    const proof = set.getProof(memberHash);
    const root = set.getRoot();

    if (!proof || !root) {
      return null;
    }

    return {
      proof,
      root,
      valid: true,
    };
  }

  /**
   * Verify a membership proof
   */
  verifyMembershipProof(
    memberHash: string,
    proof: string[],
    root: string
  ): boolean {
    return verifyMerkleProof(memberHash, proof, root);
  }

  /**
   * Check if a member is in a set
   */
  isMember(setId: string, memberHash: string): boolean {
    const set = this.sets.get(setId);
    if (!set) {
      return false;
    }
    const proof = set.getProof(memberHash);
    return proof !== null;
  }

  /**
   * Get set member count
   */
  getSetSize(setId: string): number {
    const set = this.sets.get(setId);
    return set?.getLeafCount() || 0;
  }

  /**
   * Delete a set
   */
  deleteSet(setId: string): boolean {
    return this.sets.delete(setId);
  }

  /**
   * Get all set IDs
   */
  getSetIds(): string[] {
    return Array.from(this.sets.keys());
  }

  /**
   * Generate a ZK proof of membership
   * In production, this would generate an actual ZK proof
   */
  async generateZKMembershipProof(
    setId: string,
    memberHash: string,
    privateSecret: string
  ): Promise<string> {
    const membership = this.generateMembershipProof(setId, memberHash);
    if (!membership) {
      throw new Error("Member not found in set");
    }

    // Placeholder for actual ZK proof generation
    const proofData = ethers.concat([
      ethers.randomBytes(32),
      ethers.randomBytes(32),
      ethers.randomBytes(32),
      ethers.randomBytes(32),
      ethers.randomBytes(32),
      ethers.randomBytes(32),
      ethers.randomBytes(32),
      ethers.randomBytes(32),
    ]);

    return ethers.hexlify(proofData);
  }

  /**
   * Create a set from an array of member hashes
   */
  createSetFromArray(setId: string, memberHashes: string[]): string {
    this.createSet(setId);
    this.addMembers(setId, memberHashes);
    return this.buildSet(setId);
  }

  /**
   * Compute member hash from raw data
   */
  static computeMemberHash(data: string): string {
    return ethers.keccak256(ethers.toUtf8Bytes(data));
  }

  /**
   * Compute member hash from address
   */
  static computeAddressHash(address: string): string {
    return ethers.keccak256(ethers.solidityPacked(["address"], [address]));
  }
}
