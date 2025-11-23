import { MerkleTree } from "merkletreejs";
import { ethers } from "ethers";

/**
 * Merkle tree builder for vote commitments
 */
export class MerkleTreeBuilder {
  private leaves: Buffer[] = [];
  private tree: MerkleTree | null = null;

  /**
   * Hash function using keccak256
   */
  private hashFn(data: Buffer): Buffer {
    return Buffer.from(ethers.keccak256(data).slice(2), "hex");
  }

  /**
   * Add a leaf to the tree
   */
  addLeaf(data: string): void {
    const leaf = Buffer.from(
      data.startsWith("0x") ? data.slice(2) : data,
      "hex"
    );
    this.leaves.push(leaf);
    this.tree = null; // Invalidate existing tree
  }

  /**
   * Add multiple leaves
   */
  addLeaves(data: string[]): void {
    for (const d of data) {
      this.addLeaf(d);
    }
  }

  /**
   * Build the merkle tree
   */
  build(): MerkleTree {
    if (this.leaves.length === 0) {
      throw new Error("Cannot build tree with no leaves");
    }

    this.tree = new MerkleTree(this.leaves, this.hashFn.bind(this), {
      sortPairs: true,
    });

    return this.tree;
  }

  /**
   * Get the merkle root
   */
  getRoot(): string | null {
    if (!this.tree) {
      if (this.leaves.length > 0) {
        this.build();
      } else {
        return null;
      }
    }
    return "0x" + this.tree!.getRoot().toString("hex");
  }

  /**
   * Get proof for a leaf
   */
  getProof(leaf: string): string[] | null {
    if (!this.tree) {
      if (this.leaves.length > 0) {
        this.build();
      } else {
        return null;
      }
    }

    const leafBuffer = Buffer.from(
      leaf.startsWith("0x") ? leaf.slice(2) : leaf,
      "hex"
    );

    const proof = this.tree!.getProof(leafBuffer);
    return proof.map((p) => "0x" + p.data.toString("hex"));
  }

  /**
   * Verify a proof
   */
  verify(leaf: string, proof: string[], root: string): boolean {
    if (!this.tree) {
      if (this.leaves.length > 0) {
        this.build();
      } else {
        return false;
      }
    }

    const leafBuffer = Buffer.from(
      leaf.startsWith("0x") ? leaf.slice(2) : leaf,
      "hex"
    );

    const proofBuffers = proof.map((p) => ({
      position: "right" as const,
      data: Buffer.from(p.startsWith("0x") ? p.slice(2) : p, "hex"),
    }));

    const rootBuffer = Buffer.from(
      root.startsWith("0x") ? root.slice(2) : root,
      "hex"
    );

    return this.tree!.verify(proofBuffers, leafBuffer, rootBuffer);
  }

  /**
   * Get all leaves
   */
  getLeaves(): string[] {
    return this.leaves.map((l) => "0x" + l.toString("hex"));
  }

  /**
   * Get leaf count
   */
  getLeafCount(): number {
    return this.leaves.length;
  }

  /**
   * Get tree depth
   */
  getDepth(): number {
    if (!this.tree) {
      if (this.leaves.length > 0) {
        this.build();
      } else {
        return 0;
      }
    }
    return this.tree!.getDepth();
  }

  /**
   * Clear the tree
   */
  clear(): void {
    this.leaves = [];
    this.tree = null;
  }
}

/**
 * Verify a merkle proof without building a full tree
 */
export function verifyMerkleProof(
  leaf: string,
  proof: string[],
  root: string
): boolean {
  let computedHash = Buffer.from(
    leaf.startsWith("0x") ? leaf.slice(2) : leaf,
    "hex"
  );

  for (const proofElement of proof) {
    const proofBuffer = Buffer.from(
      proofElement.startsWith("0x") ? proofElement.slice(2) : proofElement,
      "hex"
    );

    // Sort the pair for consistent hashing
    const combined =
      computedHash.compare(proofBuffer) < 0
        ? Buffer.concat([computedHash, proofBuffer])
        : Buffer.concat([proofBuffer, computedHash]);

    computedHash = Buffer.from(ethers.keccak256(combined).slice(2), "hex");
  }

  const rootBuffer = Buffer.from(
    root.startsWith("0x") ? root.slice(2) : root,
    "hex"
  );

  return computedHash.equals(rootBuffer);
}

/**
 * Create a merkle tree from an array of data
 */
export function createMerkleTree(data: string[]): MerkleTreeBuilder {
  const builder = new MerkleTreeBuilder();
  builder.addLeaves(data);
  builder.build();
  return builder;
}
