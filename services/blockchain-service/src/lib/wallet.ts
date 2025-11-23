import { ethers } from "ethers";

let wallet: ethers.Wallet | null = null;

export function getServerWallet(provider: ethers.Provider): ethers.Wallet {
  if (!wallet) {
    const privateKey = process.env.SERVER_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error("SERVER_PRIVATE_KEY environment variable not set");
    }
    wallet = new ethers.Wallet(privateKey, provider);
  }
  return wallet;
}

export function createRandomWallet(): ethers.Wallet {
  return ethers.Wallet.createRandom();
}

export function generateNullifier(): string {
  return ethers.hexlify(ethers.randomBytes(32));
}

export function generateSalt(): string {
  return ethers.hexlify(ethers.randomBytes(32));
}

export function computeCommitment(
  choice: number,
  salt: string,
  nullifier: string
): string {
  return ethers.keccak256(
    ethers.solidityPacked(
      ["uint8", "bytes32", "bytes32"],
      [choice, salt, nullifier]
    )
  );
}

export function hashData(data: string): string {
  return ethers.keccak256(ethers.toUtf8Bytes(data));
}

export function hashBytes(data: Uint8Array): string {
  return ethers.keccak256(data);
}
