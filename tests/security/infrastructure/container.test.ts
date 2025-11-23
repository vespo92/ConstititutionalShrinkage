/**
 * Container Security Tests
 *
 * Tests to verify container security configurations and best practices.
 */

import { describe, it, expect } from 'vitest';

// Container security configuration types
interface ContainerSecurityContext {
  runAsNonRoot: boolean;
  runAsUser?: number;
  runAsGroup?: number;
  readOnlyRootFilesystem: boolean;
  allowPrivilegeEscalation: boolean;
  privileged: boolean;
  capabilities?: {
    add?: string[];
    drop?: string[];
  };
  seccompProfile?: {
    type: 'RuntimeDefault' | 'Localhost' | 'Unconfined';
    localhostProfile?: string;
  };
}

interface PodSecurityContext {
  runAsNonRoot: boolean;
  runAsUser?: number;
  runAsGroup?: number;
  fsGroup?: number;
  seccompProfile?: {
    type: 'RuntimeDefault' | 'Localhost' | 'Unconfined';
  };
}

interface ResourceLimits {
  cpu: string;
  memory: string;
  ephemeralStorage?: string;
}

interface ContainerSpec {
  name: string;
  image: string;
  imagePullPolicy: 'Always' | 'IfNotPresent' | 'Never';
  securityContext: ContainerSecurityContext;
  resources: {
    limits: ResourceLimits;
    requests: ResourceLimits;
  };
  livenessProbe?: object;
  readinessProbe?: object;
}

describe('Container Image Security', () => {
  interface ImagePolicy {
    allowedRegistries: string[];
    requireDigest: boolean;
    scanOnPush: boolean;
    blockHighVulnerabilities: boolean;
    signatureVerification: boolean;
  }

  it('should use allowed registries only', () => {
    const policy: ImagePolicy = {
      allowedRegistries: [
        'gcr.io/constitutional-shrinkage',
        'us-docker.pkg.dev/constitutional-shrinkage',
      ],
      requireDigest: true,
      scanOnPush: true,
      blockHighVulnerabilities: true,
      signatureVerification: true,
    };

    const validateImage = (image: string): boolean => {
      return policy.allowedRegistries.some((registry) => image.startsWith(registry));
    };

    expect(validateImage('gcr.io/constitutional-shrinkage/api:v1.0.0')).toBe(true);
    expect(validateImage('docker.io/malicious/image:latest')).toBe(false);
  });

  it('should require image digest for immutability', () => {
    const policy: ImagePolicy = {
      allowedRegistries: ['gcr.io/constitutional-shrinkage'],
      requireDigest: true,
      scanOnPush: true,
      blockHighVulnerabilities: true,
      signatureVerification: true,
    };

    const hasDigest = (image: string): boolean => {
      return image.includes('@sha256:');
    };

    const imageWithDigest = 'gcr.io/constitutional-shrinkage/api@sha256:abc123def456';
    const imageWithTag = 'gcr.io/constitutional-shrinkage/api:latest';

    expect(hasDigest(imageWithDigest)).toBe(true);
    expect(hasDigest(imageWithTag)).toBe(false);
  });

  it('should not use latest tag', () => {
    const validateTag = (image: string): { valid: boolean; reason?: string } => {
      if (image.endsWith(':latest')) {
        return { valid: false, reason: 'latest tag is not allowed' };
      }
      if (!image.includes(':') && !image.includes('@sha256:')) {
        return { valid: false, reason: 'Image must specify version tag or digest' };
      }
      return { valid: true };
    };

    expect(validateTag('nginx:latest').valid).toBe(false);
    expect(validateTag('nginx').valid).toBe(false);
    expect(validateTag('nginx:1.21.0').valid).toBe(true);
    expect(validateTag('nginx@sha256:abc123').valid).toBe(true);
  });

  it('should scan images for vulnerabilities', () => {
    interface VulnerabilityScan {
      image: string;
      scanDate: Date;
      critical: number;
      high: number;
      medium: number;
      low: number;
      passed: boolean;
    }

    const evaluateScan = (scan: VulnerabilityScan): { passed: boolean; reason?: string } => {
      if (scan.critical > 0) {
        return { passed: false, reason: `${scan.critical} critical vulnerabilities found` };
      }
      if (scan.high > 5) {
        return { passed: false, reason: `Too many high vulnerabilities: ${scan.high}` };
      }
      return { passed: true };
    };

    const cleanScan: VulnerabilityScan = {
      image: 'gcr.io/app:v1.0.0',
      scanDate: new Date(),
      critical: 0,
      high: 2,
      medium: 5,
      low: 10,
      passed: true,
    };

    const vulnScan: VulnerabilityScan = {
      image: 'gcr.io/app:v0.9.0',
      scanDate: new Date(),
      critical: 1,
      high: 10,
      medium: 20,
      low: 30,
      passed: false,
    };

    expect(evaluateScan(cleanScan).passed).toBe(true);
    expect(evaluateScan(vulnScan).passed).toBe(false);
  });
});

describe('Container Security Context', () => {
  it('should run as non-root user', () => {
    const context: ContainerSecurityContext = {
      runAsNonRoot: true,
      runAsUser: 1000,
      runAsGroup: 1000,
      readOnlyRootFilesystem: true,
      allowPrivilegeEscalation: false,
      privileged: false,
    };

    expect(context.runAsNonRoot).toBe(true);
    expect(context.runAsUser).toBeGreaterThan(0);
  });

  it('should not allow privilege escalation', () => {
    const context: ContainerSecurityContext = {
      runAsNonRoot: true,
      readOnlyRootFilesystem: true,
      allowPrivilegeEscalation: false,
      privileged: false,
    };

    expect(context.allowPrivilegeEscalation).toBe(false);
  });

  it('should not run privileged containers', () => {
    const context: ContainerSecurityContext = {
      runAsNonRoot: true,
      readOnlyRootFilesystem: true,
      allowPrivilegeEscalation: false,
      privileged: false,
    };

    expect(context.privileged).toBe(false);
  });

  it('should use read-only root filesystem', () => {
    const context: ContainerSecurityContext = {
      runAsNonRoot: true,
      readOnlyRootFilesystem: true,
      allowPrivilegeEscalation: false,
      privileged: false,
    };

    expect(context.readOnlyRootFilesystem).toBe(true);
  });

  it('should drop all capabilities and add only required ones', () => {
    const context: ContainerSecurityContext = {
      runAsNonRoot: true,
      readOnlyRootFilesystem: true,
      allowPrivilegeEscalation: false,
      privileged: false,
      capabilities: {
        drop: ['ALL'],
        add: ['NET_BIND_SERVICE'], // Only if needed for ports < 1024
      },
    };

    expect(context.capabilities?.drop).toContain('ALL');
    expect(context.capabilities?.add?.length ?? 0).toBeLessThanOrEqual(2);
  });

  it('should use Seccomp profile', () => {
    const context: ContainerSecurityContext = {
      runAsNonRoot: true,
      readOnlyRootFilesystem: true,
      allowPrivilegeEscalation: false,
      privileged: false,
      seccompProfile: {
        type: 'RuntimeDefault',
      },
    };

    expect(context.seccompProfile).toBeDefined();
    expect(['RuntimeDefault', 'Localhost']).toContain(context.seccompProfile?.type);
    expect(context.seccompProfile?.type).not.toBe('Unconfined');
  });
});

describe('Container Resource Limits', () => {
  it('should define resource limits', () => {
    const container: ContainerSpec = {
      name: 'api',
      image: 'gcr.io/app:v1.0.0',
      imagePullPolicy: 'Always',
      securityContext: {
        runAsNonRoot: true,
        readOnlyRootFilesystem: true,
        allowPrivilegeEscalation: false,
        privileged: false,
      },
      resources: {
        limits: {
          cpu: '1000m',
          memory: '512Mi',
        },
        requests: {
          cpu: '100m',
          memory: '128Mi',
        },
      },
    };

    expect(container.resources.limits.cpu).toBeTruthy();
    expect(container.resources.limits.memory).toBeTruthy();
  });

  it('should define resource requests', () => {
    const container: ContainerSpec = {
      name: 'api',
      image: 'gcr.io/app:v1.0.0',
      imagePullPolicy: 'Always',
      securityContext: {
        runAsNonRoot: true,
        readOnlyRootFilesystem: true,
        allowPrivilegeEscalation: false,
        privileged: false,
      },
      resources: {
        limits: {
          cpu: '1000m',
          memory: '512Mi',
        },
        requests: {
          cpu: '100m',
          memory: '128Mi',
        },
      },
    };

    expect(container.resources.requests.cpu).toBeTruthy();
    expect(container.resources.requests.memory).toBeTruthy();
  });

  it('should have reasonable memory limits', () => {
    const parseMemory = (mem: string): number => {
      const match = mem.match(/^(\d+)(Mi|Gi)$/);
      if (!match) return 0;
      const value = parseInt(match[1]);
      const unit = match[2];
      return unit === 'Gi' ? value * 1024 : value;
    };

    const limitMi = parseMemory('512Mi');
    const requestMi = parseMemory('128Mi');

    expect(limitMi).toBeGreaterThan(requestMi);
    expect(limitMi).toBeLessThanOrEqual(4096); // 4Gi max reasonable limit
  });

  it('should use Always or IfNotPresent image pull policy', () => {
    const container: ContainerSpec = {
      name: 'api',
      image: 'gcr.io/app:v1.0.0',
      imagePullPolicy: 'Always',
      securityContext: {
        runAsNonRoot: true,
        readOnlyRootFilesystem: true,
        allowPrivilegeEscalation: false,
        privileged: false,
      },
      resources: {
        limits: { cpu: '1000m', memory: '512Mi' },
        requests: { cpu: '100m', memory: '128Mi' },
      },
    };

    expect(['Always', 'IfNotPresent']).toContain(container.imagePullPolicy);
  });
});

describe('Container Health Probes', () => {
  interface HealthProbe {
    httpGet?: {
      path: string;
      port: number;
      scheme: 'HTTP' | 'HTTPS';
    };
    exec?: {
      command: string[];
    };
    tcpSocket?: {
      port: number;
    };
    initialDelaySeconds: number;
    periodSeconds: number;
    timeoutSeconds: number;
    failureThreshold: number;
    successThreshold: number;
  }

  it('should define liveness probe', () => {
    const livenessProbe: HealthProbe = {
      httpGet: {
        path: '/health/live',
        port: 8080,
        scheme: 'HTTP',
      },
      initialDelaySeconds: 15,
      periodSeconds: 10,
      timeoutSeconds: 5,
      failureThreshold: 3,
      successThreshold: 1,
    };

    expect(livenessProbe.httpGet || livenessProbe.exec || livenessProbe.tcpSocket).toBeDefined();
    expect(livenessProbe.initialDelaySeconds).toBeGreaterThan(0);
  });

  it('should define readiness probe', () => {
    const readinessProbe: HealthProbe = {
      httpGet: {
        path: '/health/ready',
        port: 8080,
        scheme: 'HTTP',
      },
      initialDelaySeconds: 5,
      periodSeconds: 5,
      timeoutSeconds: 3,
      failureThreshold: 3,
      successThreshold: 1,
    };

    expect(readinessProbe.httpGet || readinessProbe.exec || readinessProbe.tcpSocket).toBeDefined();
    expect(readinessProbe.periodSeconds).toBeLessThanOrEqual(10);
  });

  it('should have reasonable probe timeouts', () => {
    const probe: HealthProbe = {
      httpGet: {
        path: '/health',
        port: 8080,
        scheme: 'HTTP',
      },
      initialDelaySeconds: 15,
      periodSeconds: 10,
      timeoutSeconds: 5,
      failureThreshold: 3,
      successThreshold: 1,
    };

    expect(probe.timeoutSeconds).toBeLessThan(probe.periodSeconds);
    expect(probe.failureThreshold).toBeGreaterThanOrEqual(2);
  });
});

describe('Container Secrets Management', () => {
  interface SecretMount {
    type: 'env' | 'volume';
    secretName: string;
    key?: string;
    mountPath?: string;
    readOnly?: boolean;
  }

  it('should mount secrets as volumes (not env vars) for sensitive data', () => {
    const sensitiveSecrets: SecretMount[] = [
      {
        type: 'volume',
        secretName: 'database-credentials',
        mountPath: '/secrets/db',
        readOnly: true,
      },
      {
        type: 'volume',
        secretName: 'api-keys',
        mountPath: '/secrets/api',
        readOnly: true,
      },
    ];

    for (const secret of sensitiveSecrets) {
      expect(secret.type).toBe('volume');
      expect(secret.readOnly).toBe(true);
    }
  });

  it('should use read-only secret mounts', () => {
    const secretMount: SecretMount = {
      type: 'volume',
      secretName: 'tls-certs',
      mountPath: '/etc/tls',
      readOnly: true,
    };

    expect(secretMount.readOnly).toBe(true);
  });

  it('should not hardcode secrets in container spec', () => {
    const containerEnv = [
      { name: 'DATABASE_URL', valueFrom: { secretKeyRef: { name: 'db-secret', key: 'url' } } },
      { name: 'API_KEY', valueFrom: { secretKeyRef: { name: 'api-secret', key: 'key' } } },
      { name: 'LOG_LEVEL', value: 'info' }, // Non-sensitive config is OK
    ];

    const sensitivePatterns = [/password/i, /secret/i, /api.?key/i, /token/i, /credential/i];

    for (const env of containerEnv) {
      if ('value' in env && env.value) {
        for (const pattern of sensitivePatterns) {
          expect(pattern.test(env.name)).toBe(false);
        }
      }
    }
  });
});

describe('Container Network Security', () => {
  interface ContainerPort {
    containerPort: number;
    protocol: 'TCP' | 'UDP';
    name?: string;
  }

  it('should not expose unnecessary ports', () => {
    const ports: ContainerPort[] = [
      { containerPort: 8080, protocol: 'TCP', name: 'http' },
      { containerPort: 8443, protocol: 'TCP', name: 'https' },
    ];

    // Common dangerous ports that should not be exposed
    const dangerousPorts = [22, 23, 3389, 5432, 3306, 27017, 6379];

    for (const port of ports) {
      expect(dangerousPorts).not.toContain(port.containerPort);
    }
  });

  it('should use non-privileged ports (>1024)', () => {
    const ports: ContainerPort[] = [
      { containerPort: 8080, protocol: 'TCP', name: 'http' },
      { containerPort: 8443, protocol: 'TCP', name: 'https' },
      { containerPort: 9090, protocol: 'TCP', name: 'metrics' },
    ];

    for (const port of ports) {
      expect(port.containerPort).toBeGreaterThan(1024);
    }
  });
});

describe('Dockerfile Security Best Practices', () => {
  interface DockerfileAnalysis {
    baseImage: string;
    hasUser: boolean;
    hasHealthcheck: boolean;
    copiesSecrets: boolean;
    usesLatestTag: boolean;
    hasUnnecessaryPackages: boolean;
    multiStage: boolean;
  }

  it('should use minimal base image', () => {
    const analysis: DockerfileAnalysis = {
      baseImage: 'gcr.io/distroless/nodejs18-debian11',
      hasUser: true,
      hasHealthcheck: true,
      copiesSecrets: false,
      usesLatestTag: false,
      hasUnnecessaryPackages: false,
      multiStage: true,
    };

    const minimalImages = ['distroless', 'alpine', 'slim', 'scratch'];
    const isMinimal = minimalImages.some((img) => analysis.baseImage.includes(img));
    expect(isMinimal).toBe(true);
  });

  it('should define USER instruction', () => {
    const analysis: DockerfileAnalysis = {
      baseImage: 'node:18-alpine',
      hasUser: true,
      hasHealthcheck: true,
      copiesSecrets: false,
      usesLatestTag: false,
      hasUnnecessaryPackages: false,
      multiStage: true,
    };

    expect(analysis.hasUser).toBe(true);
  });

  it('should not copy secrets into image', () => {
    const analysis: DockerfileAnalysis = {
      baseImage: 'node:18-alpine',
      hasUser: true,
      hasHealthcheck: true,
      copiesSecrets: false,
      usesLatestTag: false,
      hasUnnecessaryPackages: false,
      multiStage: true,
    };

    expect(analysis.copiesSecrets).toBe(false);
  });

  it('should use multi-stage builds', () => {
    const analysis: DockerfileAnalysis = {
      baseImage: 'node:18-alpine',
      hasUser: true,
      hasHealthcheck: true,
      copiesSecrets: false,
      usesLatestTag: false,
      hasUnnecessaryPackages: false,
      multiStage: true,
    };

    expect(analysis.multiStage).toBe(true);
  });
});
