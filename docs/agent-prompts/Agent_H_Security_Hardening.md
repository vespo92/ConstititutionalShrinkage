# Agent_H: Security Hardening & Compliance

## Mission
Implement comprehensive security hardening across the platform including penetration testing automation, security monitoring, compliance frameworks (SOC2, FedRAMP preparation), incident response, and zero-trust architecture patterns.

## Branch
```
claude/agent-H-security-hardening-{session-id}
```

## Priority: CRITICAL

## Context
Government systems require the highest security standards:
- Protect against nation-state level attacks
- Ensure vote integrity and citizen privacy
- Meet federal compliance requirements
- Detect and respond to intrusions
- Prevent data breaches
- Maintain system availability

## Target Directories
```
services/security-service/
infrastructure/security/
packages/security/
tests/security/         (expansion)
```

## Your Deliverables

### 1. Security Service

```
services/security-service/
├── src/
│   ├── index.ts
│   ├── app.ts
│   ├── routes/
│   │   ├── audit.ts                # Audit log queries
│   │   ├── threats.ts              # Threat detection
│   │   ├── incidents.ts            # Incident management
│   │   └── compliance.ts           # Compliance reports
│   ├── services/
│   │   ├── detection/
│   │   │   ├── anomaly-detector.ts     # ML-based anomaly detection
│   │   │   ├── brute-force-detector.ts
│   │   │   ├── sybil-detector.ts       # Voting fraud detection
│   │   │   ├── injection-detector.ts
│   │   │   └── pattern-matcher.ts
│   │   ├── prevention/
│   │   │   ├── waf.ts                  # Web application firewall rules
│   │   │   ├── rate-limiter.ts
│   │   │   ├── ip-reputation.ts
│   │   │   └── bot-detection.ts
│   │   ├── response/
│   │   │   ├── incident-handler.ts
│   │   │   ├── auto-remediation.ts
│   │   │   ├── quarantine.ts
│   │   │   └── alerting.ts
│   │   ├── audit/
│   │   │   ├── logger.ts               # Centralized audit logging
│   │   │   ├── analyzer.ts             # Audit analysis
│   │   │   └── retention.ts            # Log retention policies
│   │   └── compliance/
│   │       ├── soc2-checker.ts
│   │       ├── fedramp-checker.ts
│   │       └── reporter.ts
│   ├── lib/
│   │   ├── crypto.ts
│   │   ├── hashing.ts
│   │   └── secrets.ts
│   └── types/
│       └── index.ts
├── package.json
└── tsconfig.json
```

### 2. Security Infrastructure

```
infrastructure/security/
├── vault/
│   ├── policies/
│   │   ├── api-gateway.hcl
│   │   ├── auth-service.hcl
│   │   └── database.hcl
│   └── config.hcl
├── waf/
│   ├── rules/
│   │   ├── owasp-crs.conf             # OWASP Core Rule Set
│   │   ├── custom-rules.conf
│   │   └── rate-limiting.conf
│   └── modsecurity.conf
├── certificates/
│   ├── cert-manager.yaml              # Kubernetes cert-manager
│   └── issuer.yaml
├── network-policies/
│   ├── default-deny.yaml
│   ├── api-gateway.yaml
│   ├── database.yaml
│   └── internal-only.yaml
├── scanning/
│   ├── trivy-config.yaml              # Container scanning
│   ├── snyk-config.yaml               # Dependency scanning
│   └── sonarqube-config.yaml          # Code analysis
└── siem/
    ├── wazuh/
    │   └── config.yaml
    └── alerts/
        ├── critical-alerts.yaml
        └── warning-alerts.yaml
```

### 3. Security Package

```
packages/security/
├── src/
│   ├── auth/
│   │   ├── jwt.ts                  # JWT utilities
│   │   ├── session.ts              # Session management
│   │   ├── mfa.ts                  # Multi-factor auth
│   │   └── oauth.ts                # OAuth security
│   ├── crypto/
│   │   ├── encryption.ts           # Data encryption
│   │   ├── signing.ts              # Digital signatures
│   │   ├── hashing.ts              # Secure hashing
│   │   └── key-derivation.ts       # Key derivation
│   ├── validation/
│   │   ├── input-sanitizer.ts      # Input sanitization
│   │   ├── xss-filter.ts           # XSS prevention
│   │   ├── sql-injection.ts        # SQL injection prevention
│   │   └── path-traversal.ts       # Path traversal prevention
│   ├── headers/
│   │   ├── security-headers.ts     # Security headers
│   │   ├── csp.ts                  # Content Security Policy
│   │   └── cors.ts                 # CORS configuration
│   ├── audit/
│   │   ├── logger.ts               # Audit logging
│   │   └── tamper-proof.ts         # Tamper-proof logs
│   └── index.ts
├── package.json
└── tsconfig.json
```

### 4. Zero-Trust Implementation

```typescript
// Zero-Trust Architecture patterns

interface ZeroTrustPolicy {
  // Never trust, always verify
  principles: {
    verifyExplicitly: true;          // Always authenticate
    leastPrivilege: true;            // Minimum access
    assumeBreach: true;              // Defense in depth
  };

  // Identity verification
  identity: {
    requireMFA: boolean;
    sessionTimeout: number;
    continuousValidation: boolean;
    deviceTrust: DeviceTrustLevel;
  };

  // Micro-segmentation
  network: {
    serviceToService: 'mTLS';
    encryptInTransit: true;
    encryptAtRest: true;
    networkPolicies: NetworkPolicy[];
  };

  // Access policies
  access: {
    rbac: RBACPolicy[];
    abac: ABACPolicy[];              // Attribute-based
    dynamicPolicies: boolean;
  };
}

// Service mesh security
interface ServiceMeshSecurity {
  mtls: {
    enabled: true;
    strictMode: true;
    certificateRotation: '24h';
  };

  authorizationPolicies: {
    // API Gateway can call all services
    'api-gateway': ['*'];
    // Auth service is internal only
    'auth-service': ['api-gateway'];
    // Database only accessible by services
    'database': ['api-gateway', 'auth-service', 'voting-service'];
  };
}
```

### 5. Threat Detection & Response

```typescript
// Real-time threat detection
interface ThreatDetection {
  // Anomaly detection
  detectAnomalies(
    events: SecurityEvent[],
    baseline: Baseline
  ): Promise<Anomaly[]>;

  // Known attack patterns
  matchPatterns(
    request: Request
  ): Promise<ThreatMatch[]>;

  // Behavioral analysis
  analyzeUserBehavior(
    userId: string,
    actions: UserAction[]
  ): Promise<BehaviorAnalysis>;

  // Vote fraud detection
  detectVoteFraud(
    sessionId: string
  ): Promise<FraudIndicator[]>;
}

// Incident response automation
interface IncidentResponse {
  // Severity levels
  levels: {
    P1: 'critical';    // Immediate response, all hands
    P2: 'high';        // Response within 15 minutes
    P3: 'medium';      // Response within 1 hour
    P4: 'low';         // Response within 24 hours
  };

  // Auto-remediation actions
  autoRemediate(incident: Incident): Promise<RemediationResult>;

  // Playbooks
  playbooks: {
    dataExfiltration: Playbook;
    accountCompromise: Playbook;
    ddosAttack: Playbook;
    votingAnomaly: Playbook;
  };

  // Forensics
  collectForensics(incidentId: string): Promise<ForensicsBundle>;
}
```

### 6. Compliance Framework

```typescript
// SOC 2 Type II compliance
interface SOC2Compliance {
  trustServiceCriteria: {
    security: {
      accessControls: CheckResult[];
      systemOperations: CheckResult[];
      changeManagement: CheckResult[];
      riskMitigation: CheckResult[];
    };
    availability: {
      monitoring: CheckResult[];
      recovery: CheckResult[];
      maintenance: CheckResult[];
    };
    confidentiality: {
      dataClassification: CheckResult[];
      encryption: CheckResult[];
      disposal: CheckResult[];
    };
    processingIntegrity: {
      accuracy: CheckResult[];
      completeness: CheckResult[];
      validity: CheckResult[];
    };
    privacy: {
      notice: CheckResult[];
      consent: CheckResult[];
      collection: CheckResult[];
      retention: CheckResult[];
    };
  };

  // Generate evidence
  generateEvidence(): Promise<EvidencePackage>;

  // Continuous monitoring
  monitorControls(): Promise<ControlStatus[]>;
}

// FedRAMP preparation
interface FedRAMPPrep {
  // NIST 800-53 controls
  controlFamilies: {
    accessControl: Control[];
    auditAndAccountability: Control[];
    securityAssessment: Control[];
    configurationManagement: Control[];
    contingencyPlanning: Control[];
    identificationAndAuthentication: Control[];
    incidentResponse: Control[];
    maintenance: Control[];
    mediaProtection: Control[];
    personnelSecurity: Control[];
    physicalProtection: Control[];
    planning: Control[];
    programManagement: Control[];
    riskAssessment: Control[];
    systemAndServicesAcquisition: Control[];
    systemAndCommunicationsProtection: Control[];
    systemAndInformationIntegrity: Control[];
  };

  impactLevel: 'Low' | 'Moderate' | 'High';

  // POA&M (Plan of Action and Milestones)
  planOfAction: POAMItem[];
}
```

### 7. Expanded Security Tests

```
tests/security/
├── penetration/
│   ├── authentication/
│   │   ├── brute-force.test.ts
│   │   ├── session-fixation.test.ts
│   │   ├── credential-stuffing.test.ts
│   │   └── mfa-bypass.test.ts
│   ├── authorization/
│   │   ├── privilege-escalation.test.ts
│   │   ├── idor.test.ts                 # Insecure Direct Object Ref
│   │   ├── broken-access.test.ts
│   │   └── jwt-tampering.test.ts
│   ├── injection/
│   │   ├── sql-injection.test.ts
│   │   ├── nosql-injection.test.ts
│   │   ├── command-injection.test.ts
│   │   ├── ldap-injection.test.ts
│   │   └── xpath-injection.test.ts
│   ├── xss/
│   │   ├── reflected-xss.test.ts
│   │   ├── stored-xss.test.ts
│   │   └── dom-xss.test.ts
│   └── voting/
│       ├── vote-manipulation.test.ts
│       ├── sybil-attack.test.ts
│       ├── timing-attack.test.ts
│       └── replay-attack.test.ts
├── compliance/
│   ├── soc2-controls.test.ts
│   ├── pci-dss.test.ts
│   └── gdpr.test.ts
├── infrastructure/
│   ├── container-security.test.ts
│   ├── kubernetes-security.test.ts
│   └── network-policies.test.ts
└── utils/
    ├── attack-helpers.ts
    └── vuln-scanner.ts
```

## API Endpoints

```yaml
Audit:
  GET    /security/audit/logs          # Query audit logs
  GET    /security/audit/user/:id      # User activity
  GET    /security/audit/resource/:id  # Resource access log

Threats:
  GET    /security/threats             # Active threats
  GET    /security/threats/:id         # Threat details
  POST   /security/threats/analyze     # Analyze request

Incidents:
  GET    /security/incidents           # List incidents
  POST   /security/incidents           # Report incident
  PUT    /security/incidents/:id       # Update incident
  POST   /security/incidents/:id/respond # Trigger response

Compliance:
  GET    /security/compliance/status   # Overall status
  GET    /security/compliance/soc2     # SOC 2 report
  GET    /security/compliance/controls # Control status
  POST   /security/compliance/scan     # Run compliance scan
```

## Output Metrics Target

| Metric | Target |
|--------|--------|
| Security Controls | 100+ |
| Penetration Tests | 50+ |
| Detection Rules | 100+ |
| Compliance Checks | 200+ |
| Lines of Code | 8,000-10,000 |

## Success Criteria

1. [ ] Zero-trust architecture implemented
2. [ ] mTLS between all services
3. [ ] WAF rules deployed and tested
4. [ ] Anomaly detection operational
5. [ ] Incident response playbooks defined
6. [ ] SOC 2 controls documented
7. [ ] FedRAMP control mapping complete
8. [ ] All OWASP Top 10 mitigated
9. [ ] Security scanning in CI/CD
10. [ ] Penetration tests passing
11. [ ] Audit logging comprehensive
12. [ ] Secrets management with Vault

---

*Agent_H Assignment - Security Hardening & Compliance*
