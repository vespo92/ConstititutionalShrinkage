# Agent_Q: Citizen Identity & Verification System

## Mission
Build comprehensive citizen identity management including digital identity verification, multi-factor authentication, biometric options, identity proofing, voter registration verification, privacy-preserving credentials, and self-sovereign identity integration to ensure secure and accessible citizen identification.

## Branch
```
claude/agent-Q-citizen-identity-{session-id}
```

## Priority: CRITICAL

## Context
Government services require verified identity:
- Secure voter identification
- Privacy-preserving verification
- Multiple authentication methods
- Accessibility for all citizens
- Prevention of fraud and impersonation
- Compliance with identity regulations
- Self-sovereign identity options

## Target Directories
```
services/identity-service/
packages/identity-verification/
apps/identity-portal/
infrastructure/identity/
```

## Dependencies
- Agent_7: Auth Service (authentication base)
- Agent_H: Security Hardening (security standards)
- Agent_B: Blockchain Voting (credential anchoring)

## Your Deliverables

### 1. Identity Service

```
services/identity-service/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── routes/
│   │   ├── verification.ts        # Identity verification
│   │   ├── credentials.ts         # Credential management
│   │   ├── mfa.ts                 # Multi-factor auth
│   │   ├── biometrics.ts          # Biometric auth
│   │   └── recovery.ts            # Account recovery
│   ├── services/
│   │   ├── verification/
│   │   │   ├── identity-proofer.ts
│   │   │   ├── document-verifier.ts
│   │   │   ├── liveness-check.ts
│   │   │   └── risk-scorer.ts
│   │   ├── credentials/
│   │   │   ├── credential-issuer.ts
│   │   │   ├── verifiable-credentials.ts
│   │   │   ├── revocation.ts
│   │   │   └── wallet-connector.ts
│   │   ├── mfa/
│   │   │   ├── totp-provider.ts
│   │   │   ├── sms-provider.ts
│   │   │   ├── email-provider.ts
│   │   │   ├── webauthn-provider.ts
│   │   │   └── backup-codes.ts
│   │   ├── biometrics/
│   │   │   ├── fingerprint.ts
│   │   │   ├── face-recognition.ts
│   │   │   └── voice-recognition.ts
│   │   └── recovery/
│   │       ├── recovery-manager.ts
│   │       ├── trusted-contacts.ts
│   │       └── security-questions.ts
│   ├── integrations/
│   │   ├── dmv.ts                 # DMV integration
│   │   ├── ssa.ts                 # Social Security
│   │   ├── voter-registration.ts
│   │   └── credit-bureaus.ts
│   ├── lib/
│   │   ├── crypto.ts
│   │   └── privacy.ts
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

### 2. Identity Verification Package

```
packages/identity-verification/
├── src/
│   ├── proofing/
│   │   ├── identity-proofing.ts   # IAL levels
│   │   ├── document-analysis.ts   # ID document OCR
│   │   ├── selfie-match.ts        # Photo matching
│   │   └── knowledge-based.ts     # KBA questions
│   ├── verification/
│   │   ├── verifier.ts            # Credential verification
│   │   ├── revocation-check.ts    # Check revocation
│   │   └── trust-framework.ts     # Trust levels
│   ├── credentials/
│   │   ├── vc-types.ts            # Verifiable credential types
│   │   ├── presentation.ts        # Credential presentation
│   │   ├── selective-disclosure.ts # Privacy-preserving
│   │   └── zkp.ts                 # Zero-knowledge proofs
│   ├── privacy/
│   │   ├── minimal-disclosure.ts
│   │   ├── data-minimization.ts
│   │   └── consent-manager.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 3. Identity Portal

```
apps/identity-portal/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # Identity dashboard
│   │   ├── verify/
│   │   │   ├── page.tsx                # Start verification
│   │   │   ├── document/page.tsx       # Document upload
│   │   │   ├── selfie/page.tsx         # Selfie capture
│   │   │   ├── questions/page.tsx      # KBA questions
│   │   │   └── complete/page.tsx       # Verification complete
│   │   ├── credentials/
│   │   │   ├── page.tsx                # My credentials
│   │   │   ├── [id]/page.tsx           # Credential detail
│   │   │   └── share/page.tsx          # Share credential
│   │   ├── security/
│   │   │   ├── page.tsx                # Security settings
│   │   │   ├── mfa/page.tsx            # MFA setup
│   │   │   ├── biometrics/page.tsx     # Biometric setup
│   │   │   ├── devices/page.tsx        # Trusted devices
│   │   │   └── recovery/page.tsx       # Recovery options
│   │   ├── wallet/
│   │   │   ├── page.tsx                # Identity wallet
│   │   │   └── connect/page.tsx        # Connect external wallet
│   │   └── history/
│   │       ├── page.tsx                # Verification history
│   │       └── audit/page.tsx          # Access audit
│   ├── components/
│   │   ├── verification/
│   │   │   ├── DocumentScanner.tsx
│   │   │   ├── SelfieCapture.tsx
│   │   │   ├── LivenessCheck.tsx
│   │   │   ├── ProgressStepper.tsx
│   │   │   └── VerificationStatus.tsx
│   │   ├── credentials/
│   │   │   ├── CredentialCard.tsx
│   │   │   ├── QRPresentation.tsx
│   │   │   ├── SelectiveShare.tsx
│   │   │   └── RevocationBadge.tsx
│   │   ├── security/
│   │   │   ├── MFASetup.tsx
│   │   │   ├── BiometricEnroll.tsx
│   │   │   ├── DeviceList.tsx
│   │   │   ├── BackupCodes.tsx
│   │   │   └── RecoverySetup.tsx
│   │   └── common/
│   │       ├── PrivacyNotice.tsx
│   │       ├── ConsentDialog.tsx
│   │       └── SecurityBadge.tsx
│   ├── hooks/
│   │   ├── useVerification.ts
│   │   ├── useCredentials.ts
│   │   ├── useMFA.ts
│   │   └── useBiometrics.ts
│   └── lib/
│       └── api.ts
├── package.json
└── tsconfig.json
```

### 4. Identity Infrastructure

```
infrastructure/identity/
├── kubernetes/
│   ├── identity-service.yaml
│   ├── hsm-integration.yaml       # Hardware Security Module
│   ├── secrets-management.yaml
│   └── network-policies.yaml
├── vault/
│   ├── identity-secrets.hcl
│   ├── encryption-keys.hcl
│   └── policies.hcl
├── compliance/
│   ├── nist-800-63.yaml           # Identity assurance
│   ├── fips-140.yaml              # Cryptographic modules
│   └── gdpr-privacy.yaml
└── monitoring/
    ├── fraud-detection.yaml
    └── identity-metrics.yaml
```

### 5. Identity Proofing System

```typescript
// NIST SP 800-63A compliant identity proofing
interface IdentityProofing {
  // Start proofing session
  startSession(params: {
    targetIAL: IdentityAssuranceLevel;
    purpose: string;
  }): Promise<ProofingSession>;

  // Document verification
  submitDocument(sessionId: string, params: {
    documentType: DocumentType;
    frontImage: Buffer;
    backImage?: Buffer;
  }): Promise<DocumentResult>;

  // Selfie verification
  submitSelfie(sessionId: string, params: {
    selfieImage: Buffer;
    livenessData?: LivenessData;
  }): Promise<SelfieResult>;

  // Knowledge-based authentication
  getKBAQuestions(sessionId: string): Promise<KBAQuestion[]>;
  submitKBAAnswers(sessionId: string, answers: KBAAnswer[]): Promise<KBAResult>;

  // Complete proofing
  completeProofing(sessionId: string): Promise<ProofingResult>;
}

// NIST Identity Assurance Levels
type IdentityAssuranceLevel =
  | 'IAL1'   // Self-asserted
  | 'IAL2'   // Remote or in-person proofing
  | 'IAL3';  // In-person proofing with biometrics

type DocumentType =
  | 'drivers_license'
  | 'state_id'
  | 'passport'
  | 'military_id'
  | 'tribal_id'
  | 'voter_registration';

interface ProofingSession {
  id: string;
  targetIAL: IdentityAssuranceLevel;
  status: ProofingStatus;
  steps: ProofingStep[];
  currentStep: number;
  startedAt: Date;
  expiresAt: Date;
}

interface DocumentResult {
  verified: boolean;
  documentType: DocumentType;
  extractedData: {
    fullName: string;
    dateOfBirth: Date;
    address: Address;
    documentNumber: string;
    expirationDate: Date;
  };
  authenticity: {
    score: number;
    checks: AuthenticityCheck[];
  };
  issues: DocumentIssue[];
}

interface SelfieResult {
  matched: boolean;
  confidence: number;
  livenessVerified: boolean;
  livenessScore: number;
  issues: string[];
}
```

### 6. Verifiable Credentials

```typescript
// W3C Verifiable Credentials implementation
interface VerifiableCredentialSystem {
  // Issue credentials
  issueCredential(params: {
    type: CredentialType;
    subject: CredentialSubject;
    evidence?: Evidence[];
    expirationDate?: Date;
  }): Promise<VerifiableCredential>;

  // Verify credentials
  verifyCredential(credential: VerifiableCredential): Promise<VerificationResult>;

  // Revoke credentials
  revokeCredential(credentialId: string, reason: string): Promise<void>;
  checkRevocation(credentialId: string): Promise<RevocationStatus>;

  // Presentations
  createPresentation(params: {
    credentials: VerifiableCredential[];
    holder: string;
    verifier: string;
    selectiveDisclosure?: SelectiveDisclosure;
  }): Promise<VerifiablePresentation>;

  verifyPresentation(presentation: VerifiablePresentation): Promise<PresentationResult>;
}

// W3C Verifiable Credential structure
interface VerifiableCredential {
  '@context': string[];
  id: string;
  type: string[];
  issuer: string | Issuer;
  issuanceDate: string;
  expirationDate?: string;
  credentialSubject: CredentialSubject;
  credentialStatus?: CredentialStatus;
  proof: Proof;
}

type CredentialType =
  | 'CitizenCredential'
  | 'VoterCredential'
  | 'AgeVerification'
  | 'ResidencyCredential'
  | 'OfficeHolderCredential';

interface CredentialSubject {
  id: string;                      // DID
  // Type-specific claims
  [key: string]: unknown;
}

// Selective disclosure for privacy
interface SelectiveDisclosure {
  // Only reveal specific claims
  revealClaims: string[];

  // Prove predicates without revealing values
  predicates?: {
    claim: string;
    predicate: 'greaterThan' | 'lessThan' | 'equals';
    value: unknown;
  }[];
}

// Zero-knowledge proof for age verification
const ageVerificationExample = {
  credential: 'CitizenCredential',
  selectiveDisclosure: {
    revealClaims: ['citizenship'],
    predicates: [{
      claim: 'dateOfBirth',
      predicate: 'lessThan',
      value: new Date('2006-01-01'),  // Over 18
    }],
  },
};
```

### 7. Multi-Factor Authentication

```typescript
// Comprehensive MFA system
interface MFASystem {
  // Setup MFA
  setupTOTP(userId: string): Promise<TOTPSetup>;
  verifyTOTPSetup(userId: string, code: string): Promise<boolean>;

  setupWebAuthn(userId: string): Promise<WebAuthnSetup>;
  verifyWebAuthnSetup(userId: string, attestation: AttestationResponse): Promise<boolean>;

  setupSMS(userId: string, phoneNumber: string): Promise<void>;
  verifySMSSetup(userId: string, code: string): Promise<boolean>;

  // Verify MFA
  verifyMFA(userId: string, params: MFAVerification): Promise<MFAResult>;

  // Manage methods
  getMethods(userId: string): Promise<MFAMethod[]>;
  removeMethod(userId: string, methodId: string): Promise<void>;
  setPrimaryMethod(userId: string, methodId: string): Promise<void>;

  // Backup codes
  generateBackupCodes(userId: string): Promise<string[]>;
  useBackupCode(userId: string, code: string): Promise<boolean>;
}

interface MFAMethod {
  id: string;
  type: MFAType;
  name: string;
  isPrimary: boolean;
  createdAt: Date;
  lastUsed?: Date;
  metadata: Record<string, unknown>;
}

type MFAType =
  | 'totp'              // Authenticator app
  | 'webauthn'          // Hardware key / biometric
  | 'sms'               // SMS code
  | 'email'             // Email code
  | 'push'              // Push notification
  | 'backup_code';      // One-time backup code

// NIST Authenticator Assurance Levels
type AuthenticatorAssuranceLevel =
  | 'AAL1'   // Single factor
  | 'AAL2'   // Two factors
  | 'AAL3';  // Hardware-based authenticator

// WebAuthn for phishing-resistant auth
interface WebAuthnProvider {
  // Registration
  generateRegistrationOptions(params: {
    userId: string;
    userName: string;
    attestation: AttestationType;
  }): Promise<PublicKeyCredentialCreationOptions>;

  verifyRegistration(params: {
    userId: string;
    attestation: AttestationResponse;
  }): Promise<VerifiedRegistration>;

  // Authentication
  generateAuthenticationOptions(userId: string): Promise<PublicKeyCredentialRequestOptions>;

  verifyAuthentication(params: {
    userId: string;
    assertion: AssertionResponse;
  }): Promise<VerifiedAuthentication>;
}
```

### 8. Biometric Authentication

```typescript
// Privacy-preserving biometrics
interface BiometricSystem {
  // Enrollment
  enrollBiometric(userId: string, params: {
    type: BiometricType;
    template: BiometricTemplate;
  }): Promise<BiometricEnrollment>;

  // Verification
  verifyBiometric(userId: string, params: {
    type: BiometricType;
    sample: BiometricSample;
  }): Promise<BiometricResult>;

  // Management
  getBiometrics(userId: string): Promise<BiometricInfo[]>;
  removeBiometric(userId: string, biometricId: string): Promise<void>;

  // Liveness detection
  checkLiveness(sample: BiometricSample): Promise<LivenessResult>;
}

type BiometricType =
  | 'fingerprint'
  | 'face'
  | 'voice'
  | 'iris';

interface BiometricTemplate {
  // Template is never stored raw
  // Only encrypted/hashed version stored
  type: BiometricType;
  version: string;
  encryptedTemplate: Buffer;
  salt: Buffer;
}

interface LivenessResult {
  isLive: boolean;
  confidence: number;
  checks: {
    name: string;
    passed: boolean;
  }[];
  spoofAttemptDetected: boolean;
}

// Privacy-preserving biometric matching
interface BiometricPrivacy {
  // Never store raw biometrics
  hashTemplate(template: Buffer, salt: Buffer): Buffer;

  // Fuzzy hashing for matching
  fuzzyMatch(stored: Buffer, sample: Buffer, threshold: number): boolean;

  // Secure comparison
  secureCompare(a: Buffer, b: Buffer): boolean;

  // Cancelable biometrics
  generateCancelableTemplate(template: Buffer, key: Buffer): Buffer;
  cancelAndReissue(userId: string, biometricId: string): Promise<void>;
}
```

### 9. Account Recovery

```typescript
// Secure account recovery
interface AccountRecovery {
  // Recovery methods
  setupRecoveryEmail(userId: string, email: string): Promise<void>;
  setupRecoveryPhone(userId: string, phone: string): Promise<void>;
  setupTrustedContacts(userId: string, contacts: TrustedContact[]): Promise<void>;
  setupSecurityQuestions(userId: string, questions: SecurityQuestion[]): Promise<void>;

  // Initiate recovery
  initiateRecovery(identifier: string): Promise<RecoverySession>;

  // Verify recovery
  verifyRecoveryEmail(sessionId: string, code: string): Promise<RecoveryStep>;
  verifyRecoveryPhone(sessionId: string, code: string): Promise<RecoveryStep>;
  verifyTrustedContact(sessionId: string, contactId: string, code: string): Promise<RecoveryStep>;
  verifySecurityQuestions(sessionId: string, answers: SecurityAnswer[]): Promise<RecoveryStep>;

  // Complete recovery
  completeRecovery(sessionId: string, newCredentials: NewCredentials): Promise<void>;
}

interface TrustedContact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  relationship: string;
  verificationThreshold: number;  // How many needed
}

interface RecoverySession {
  id: string;
  userId: string;
  status: 'initiated' | 'verifying' | 'verified' | 'completed' | 'failed';
  availableMethods: RecoveryMethod[];
  completedSteps: RecoveryStep[];
  requiredVerifications: number;
  expiresAt: Date;
  attempts: number;
  maxAttempts: number;
}

// Recovery with trusted contacts (social recovery)
interface SocialRecovery {
  // M-of-N recovery
  config: {
    totalContacts: number;         // N
    requiredApprovals: number;     // M
    recoveryPeriod: number;        // Hours to wait
  };

  // Request recovery
  requestSocialRecovery(userId: string): Promise<SocialRecoverySession>;

  // Contact approval
  approveRecovery(sessionId: string, contactId: string, code: string): Promise<void>;

  // Complete after threshold
  completeSocialRecovery(sessionId: string): Promise<void>;
}
```

### 10. Privacy and Consent

```typescript
// Privacy-preserving identity
interface PrivacyManager {
  // Consent management
  recordConsent(params: {
    userId: string;
    purpose: string;
    dataTypes: string[];
    recipient: string;
    duration: number;
  }): Promise<Consent>;

  withdrawConsent(consentId: string): Promise<void>;
  getConsents(userId: string): Promise<Consent[]>;

  // Data minimization
  getMinimalClaims(purpose: string): string[];

  // Access logging
  logAccess(params: {
    userId: string;
    accessor: string;
    purpose: string;
    claims: string[];
  }): Promise<void>;

  getAccessLog(userId: string): Promise<AccessLogEntry[]>;

  // Right to be forgotten
  requestDeletion(userId: string): Promise<DeletionRequest>;
  processDeletion(requestId: string): Promise<void>;
}

interface Consent {
  id: string;
  userId: string;
  purpose: string;
  dataTypes: string[];
  recipient: string;
  grantedAt: Date;
  expiresAt: Date;
  withdrawn: boolean;
  withdrawnAt?: Date;
}

// Zero-knowledge proof utilities
interface ZKPUtilities {
  // Prove age without revealing DOB
  proveAgeOver(dateOfBirth: Date, ageThreshold: number): Promise<ZKProof>;
  verifyAgeProof(proof: ZKProof, threshold: number): Promise<boolean>;

  // Prove residency without revealing address
  proveResidency(address: Address, jurisdiction: string): Promise<ZKProof>;
  verifyResidencyProof(proof: ZKProof, jurisdiction: string): Promise<boolean>;

  // Prove citizenship without revealing identity
  proveCitizenship(credential: VerifiableCredential): Promise<ZKProof>;
  verifyCitizenshipProof(proof: ZKProof): Promise<boolean>;
}
```

## API Endpoints

```yaml
Verification:
  POST   /identity/verify/start         # Start verification
  POST   /identity/verify/document      # Submit document
  POST   /identity/verify/selfie        # Submit selfie
  POST   /identity/verify/kba           # Answer KBA questions
  GET    /identity/verify/:sessionId    # Check status

Credentials:
  GET    /identity/credentials          # List credentials
  POST   /identity/credentials          # Request credential
  GET    /identity/credentials/:id      # Get credential
  POST   /identity/credentials/:id/present  # Create presentation
  DELETE /identity/credentials/:id      # Revoke credential

MFA:
  GET    /identity/mfa/methods          # List MFA methods
  POST   /identity/mfa/totp             # Setup TOTP
  POST   /identity/mfa/webauthn         # Setup WebAuthn
  POST   /identity/mfa/verify           # Verify MFA
  DELETE /identity/mfa/:methodId        # Remove method

Biometrics:
  POST   /identity/biometrics/enroll    # Enroll biometric
  POST   /identity/biometrics/verify    # Verify biometric
  DELETE /identity/biometrics/:id       # Remove biometric

Recovery:
  POST   /identity/recovery/initiate    # Start recovery
  POST   /identity/recovery/verify      # Verify step
  POST   /identity/recovery/complete    # Complete recovery

Privacy:
  GET    /identity/privacy/consents     # List consents
  POST   /identity/privacy/consent      # Grant consent
  DELETE /identity/privacy/consent/:id  # Withdraw consent
  GET    /identity/privacy/access-log   # View access log
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Verification Success Rate | >95% |
| False Rejection Rate | <2% |
| False Acceptance Rate | <0.1% |
| MFA Adoption | >80% |
| Credential Issuance Time | <5 minutes |
| Recovery Success Rate | >90% |

## Success Criteria

1. [ ] Identity proofing workflow complete
2. [ ] Document verification working
3. [ ] Selfie matching operational
4. [ ] Verifiable credentials issuing
5. [ ] Selective disclosure working
6. [ ] MFA all methods functional
7. [ ] WebAuthn implemented
8. [ ] Biometric enrollment working
9. [ ] Account recovery functional
10. [ ] Privacy controls operational
11. [ ] Zero-knowledge proofs working
12. [ ] All tests passing

## Handoff Notes

For downstream agents:
- Identity API integrates with Agent_7 (Auth)
- Voter credentials used by Agent_B (Blockchain Voting)
- Credential verification for Agent_N (Federation)
- Privacy controls documented for Agent_L (Audit)

---

*Agent_Q Assignment - Citizen Identity & Verification System*
