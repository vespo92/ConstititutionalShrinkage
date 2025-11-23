interface SignatureParams {
  petitionId: string;
  userId: string;
  publicSignature: boolean;
  comment?: string;
}

interface Signature {
  id: string;
  petitionId: string;
  userId: string;
  name: string;
  publicSignature: boolean;
  comment?: string;
  signedAt: string;
}

export class SignatureCollector {
  private signatures = new Map<string, Signature[]>();

  async collect(params: SignatureParams): Promise<Signature> {
    const { petitionId, userId, publicSignature, comment } = params;

    // Check if already signed
    const existing = await this.hasSignature(petitionId, userId);
    if (existing) {
      throw new Error('Already signed this petition');
    }

    const signature: Signature = {
      id: Date.now().toString(),
      petitionId,
      userId,
      name: publicSignature ? 'User Name' : 'Anonymous', // Get from user profile
      publicSignature,
      comment,
      signedAt: new Date().toISOString(),
    };

    // Store signature
    if (!this.signatures.has(petitionId)) {
      this.signatures.set(petitionId, []);
    }
    this.signatures.get(petitionId)!.push(signature);

    return signature;
  }

  async hasSignature(petitionId: string, userId: string): Promise<boolean> {
    const petitionSignatures = this.signatures.get(petitionId) || [];
    return petitionSignatures.some((s) => s.userId === userId);
  }

  async getSignatureCount(petitionId: string): Promise<number> {
    return this.signatures.get(petitionId)?.length || 0;
  }

  async getRecentSignatures(petitionId: string, limit = 10): Promise<Signature[]> {
    const petitionSignatures = this.signatures.get(petitionId) || [];
    return petitionSignatures.slice(-limit).reverse();
  }

  async getPublicSignatures(petitionId: string, page = 1, limit = 50): Promise<Signature[]> {
    const petitionSignatures = this.signatures.get(petitionId) || [];
    const publicOnly = petitionSignatures.filter((s) => s.publicSignature);
    const start = (page - 1) * limit;
    return publicOnly.slice(start, start + limit);
  }
}
