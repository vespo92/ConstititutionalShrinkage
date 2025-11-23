import { MerkleTree } from "merkletreejs";
import { ethers } from "ethers";
import { MerkleProof } from "../types";

class MerkleService {
  private trees: Map<string, MerkleTree> = new Map();
  private commitments: Map<string, string[]> = new Map();

  private hashFn(data: Buffer): Buffer {
    return Buffer.from(ethers.keccak256(data).slice(2), "hex");
  }

  addCommitment(sessionId: string, commitment: string): void {
    const sessionCommitments = this.commitments.get(sessionId) || [];
    if (!sessionCommitments.includes(commitment)) {
      sessionCommitments.push(commitment);
      this.commitments.set(sessionId, sessionCommitments);
      // Invalidate existing tree
      this.trees.delete(sessionId);
    }
  }

  buildTree(sessionId: string): MerkleTree | null {
    const sessionCommitments = this.commitments.get(sessionId);
    if (!sessionCommitments || sessionCommitments.length === 0) {
      return null;
    }

    const leaves = sessionCommitments.map((c) =>
      Buffer.from(c.startsWith("0x") ? c.slice(2) : c, "hex")
    );

    const tree = new MerkleTree(leaves, this.hashFn.bind(this), {
      sortPairs: true,
    });

    this.trees.set(sessionId, tree);
    return tree;
  }

  getTree(sessionId: string): MerkleTree | null {
    if (!this.trees.has(sessionId)) {
      this.buildTree(sessionId);
    }
    return this.trees.get(sessionId) || null;
  }

  getRoot(sessionId: string): string | null {
    const tree = this.getTree(sessionId);
    if (!tree) return null;
    return "0x" + tree.getRoot().toString("hex");
  }

  getProof(sessionId: string, commitment: string): MerkleProof | null {
    const tree = this.getTree(sessionId);
    if (!tree) {
      return null;
    }

    const sessionCommitments = this.commitments.get(sessionId) || [];
    const index = sessionCommitments.indexOf(commitment);
    if (index === -1) {
      return null;
    }

    const leaf = Buffer.from(
      commitment.startsWith("0x") ? commitment.slice(2) : commitment,
      "hex"
    );

    const proof = tree.getProof(leaf);
    const root = this.getRoot(sessionId);

    if (!root) {
      return null;
    }

    return {
      sessionId,
      commitment,
      proof: proof.map((p) => "0x" + p.data.toString("hex")),
      root,
      index,
      valid: tree.verify(proof, leaf, tree.getRoot()),
    };
  }

  verifyProof(
    sessionId: string,
    commitment: string,
    proof: string[],
    root: string
  ): boolean {
    const tree = this.getTree(sessionId);
    if (!tree) {
      return false;
    }

    const leaf = Buffer.from(
      commitment.startsWith("0x") ? commitment.slice(2) : commitment,
      "hex"
    );

    const proofBuffers = proof.map((p) => ({
      position: "right" as const,
      data: Buffer.from(p.startsWith("0x") ? p.slice(2) : p, "hex"),
    }));

    const expectedRoot = Buffer.from(
      root.startsWith("0x") ? root.slice(2) : root,
      "hex"
    );

    return tree.verify(proofBuffers, leaf, expectedRoot);
  }

  getCommitmentCount(sessionId: string): number {
    return this.commitments.get(sessionId)?.length || 0;
  }

  getAllCommitments(sessionId: string): string[] {
    return this.commitments.get(sessionId) || [];
  }

  clearSession(sessionId: string): void {
    this.trees.delete(sessionId);
    this.commitments.delete(sessionId);
  }
}

export const merkleService = new MerkleService();
