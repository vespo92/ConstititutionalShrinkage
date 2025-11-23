/**
 * Compliance Reporter
 *
 * Generates comprehensive compliance reports across frameworks.
 */

import type { ComplianceReport, ComplianceCheck } from '../../types/index.js';
import { ComplianceFramework } from '../../types/index.js';
import * as soc2Checker from './soc2-checker.js';
import * as fedrampChecker from './fedramp-checker.js';
import { redis } from '../../lib/redis.js';
import { sha256 } from '../../lib/hashing.js';

interface ExecutiveSummary {
  overallScore: number;
  frameworks: Array<{
    framework: ComplianceFramework;
    status: string;
    score: number;
    criticalFindings: number;
  }>;
  topRisks: string[];
  recommendations: string[];
  generatedAt: Date;
}

interface DetailedReport {
  summary: ExecutiveSummary;
  soc2: ComplianceReport | null;
  fedramp: ComplianceReport | null;
  evidenceLinks: Array<{ control: string; evidence: string }>;
  signatureHash: string;
}

/**
 * Generate compliance report for specific framework
 */
export async function generateFrameworkReport(
  framework: ComplianceFramework
): Promise<ComplianceReport> {
  switch (framework) {
    case ComplianceFramework.SOC2:
      return soc2Checker.generateReport();
    case ComplianceFramework.FEDRAMP:
      return fedrampChecker.generateReport();
    default:
      throw new Error(`Unsupported framework: ${framework}`);
  }
}

/**
 * Generate executive summary across all frameworks
 */
export async function generateExecutiveSummary(): Promise<ExecutiveSummary> {
  const soc2Report = await soc2Checker.generateReport();
  const fedrampReport = await fedrampChecker.generateReport();

  const frameworks = [
    {
      framework: ComplianceFramework.SOC2,
      status: soc2Report.overallStatus,
      score: soc2Report.score,
      criticalFindings: soc2Report.checks.filter(
        (c) => c.status === 'failed'
      ).length,
    },
    {
      framework: ComplianceFramework.FEDRAMP,
      status: fedrampReport.overallStatus,
      score: fedrampReport.score,
      criticalFindings: fedrampReport.checks.filter(
        (c) => c.status === 'failed'
      ).length,
    },
  ];

  const overallScore = Math.round(
    frameworks.reduce((sum, f) => sum + f.score, 0) / frameworks.length
  );

  // Identify top risks
  const topRisks: string[] = [];
  const allChecks = [...soc2Report.checks, ...fedrampReport.checks];
  const failedChecks = allChecks.filter((c) => c.status === 'failed');

  for (const check of failedChecks.slice(0, 5)) {
    topRisks.push(`${check.controlId}: ${check.controlName}`);
  }

  // Generate recommendations
  const recommendations: string[] = [];

  if (overallScore < 70) {
    recommendations.push('Prioritize implementing critical security controls');
  }
  if (failedChecks.length > 10) {
    recommendations.push('Address high-priority compliance gaps before next audit');
  }
  if (soc2Report.score < fedrampReport.score) {
    recommendations.push('Focus on SOC 2 trust service criteria improvements');
  } else if (fedrampReport.score < soc2Report.score) {
    recommendations.push('Accelerate FedRAMP control implementation');
  }
  if (overallScore >= 80) {
    recommendations.push('Schedule formal compliance assessments');
  }

  return {
    overallScore,
    frameworks,
    topRisks,
    recommendations,
    generatedAt: new Date(),
  };
}

/**
 * Generate detailed compliance report
 */
export async function generateDetailedReport(): Promise<DetailedReport> {
  const summary = await generateExecutiveSummary();
  const soc2Report = await soc2Checker.generateReport();
  const fedrampReport = await fedrampChecker.generateReport();

  // Collect evidence links
  const evidenceLinks: Array<{ control: string; evidence: string }> = [];
  const allChecks = [...soc2Report.checks, ...fedrampReport.checks];

  for (const check of allChecks) {
    if (check.evidence) {
      evidenceLinks.push({
        control: check.controlId,
        evidence: check.evidence,
      });
    }
  }

  // Generate signature hash for integrity
  const reportContent = JSON.stringify({
    summary,
    soc2Report,
    fedrampReport,
    evidenceLinks,
    generatedAt: new Date().toISOString(),
  });
  const signatureHash = sha256(reportContent);

  return {
    summary,
    soc2: soc2Report,
    fedramp: fedrampReport,
    evidenceLinks,
    signatureHash,
  };
}

/**
 * Export report in various formats
 */
export async function exportReport(
  format: 'json' | 'markdown' | 'html'
): Promise<string> {
  const report = await generateDetailedReport();

  switch (format) {
    case 'json':
      return JSON.stringify(report, null, 2);

    case 'markdown':
      return generateMarkdownReport(report);

    case 'html':
      return generateHTMLReport(report);
  }
}

/**
 * Generate Markdown report
 */
function generateMarkdownReport(report: DetailedReport): string {
  const { summary, soc2, fedramp } = report;

  let md = `# Compliance Report

Generated: ${summary.generatedAt.toISOString()}
Signature: ${report.signatureHash.substring(0, 16)}...

## Executive Summary

**Overall Compliance Score: ${summary.overallScore}%**

### Framework Status

| Framework | Status | Score | Critical Findings |
|-----------|--------|-------|-------------------|
`;

  for (const fw of summary.frameworks) {
    md += `| ${fw.framework} | ${fw.status} | ${fw.score}% | ${fw.criticalFindings} |\n`;
  }

  md += `
### Top Risks

`;
  for (const risk of summary.topRisks) {
    md += `- ${risk}\n`;
  }

  md += `
### Recommendations

`;
  for (const rec of summary.recommendations) {
    md += `- ${rec}\n`;
  }

  if (soc2) {
    md += `
## SOC 2 Type II Report

**Score: ${soc2.score}%**
**Status: ${soc2.overallStatus}**

### Control Summary

- Total Controls: ${soc2.totalControls}
- Passed: ${soc2.passedControls}
- Failed: ${soc2.failedControls}

### Failed Controls

`;
    for (const check of soc2.checks.filter((c) => c.status === 'failed')) {
      md += `#### ${check.controlId}: ${check.controlName}

${check.description}

**Remediation:** ${check.remediation || 'Not specified'}

`;
    }
  }

  if (fedramp) {
    md += `
## FedRAMP Report

**Score: ${fedramp.score}%**
**Status: ${fedramp.overallStatus}**

### Control Summary

- Total Controls: ${fedramp.totalControls}
- Implemented: ${fedramp.passedControls}
- Planned: ${fedramp.failedControls}

`;
  }

  md += `
---
*This report was automatically generated by the Security Service.*
*Report integrity can be verified using the signature hash.*
`;

  return md;
}

/**
 * Generate HTML report
 */
function generateHTMLReport(report: DetailedReport): string {
  const { summary, soc2, fedramp } = report;

  return `<!DOCTYPE html>
<html>
<head>
  <title>Compliance Report - ${summary.generatedAt.toISOString()}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; }
    h1 { color: #333; }
    .score { font-size: 48px; font-weight: bold; }
    .compliant { color: #28a745; }
    .partial { color: #ffc107; }
    .non_compliant { color: #dc3545; }
    table { border-collapse: collapse; width: 100%; margin: 20px 0; }
    th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
    th { background-color: #f4f4f4; }
    .risk { background-color: #fff3cd; padding: 10px; margin: 5px 0; }
    .recommendation { background-color: #d1ecf1; padding: 10px; margin: 5px 0; }
    .passed { color: #28a745; }
    .failed { color: #dc3545; }
    .warning { color: #ffc107; }
  </style>
</head>
<body>
  <h1>Compliance Report</h1>
  <p>Generated: ${summary.generatedAt.toISOString()}</p>
  <p>Signature: <code>${report.signatureHash.substring(0, 16)}...</code></p>

  <h2>Executive Summary</h2>
  <div class="score ${summary.overallScore >= 80 ? 'compliant' : summary.overallScore >= 50 ? 'partial' : 'non_compliant'}">
    ${summary.overallScore}%
  </div>

  <h3>Framework Status</h3>
  <table>
    <tr>
      <th>Framework</th>
      <th>Status</th>
      <th>Score</th>
      <th>Critical Findings</th>
    </tr>
    ${summary.frameworks
      .map(
        (fw) => `
    <tr>
      <td>${fw.framework}</td>
      <td class="${fw.status}">${fw.status}</td>
      <td>${fw.score}%</td>
      <td>${fw.criticalFindings}</td>
    </tr>
    `
      )
      .join('')}
  </table>

  <h3>Top Risks</h3>
  ${summary.topRisks.map((r) => `<div class="risk">${r}</div>`).join('')}

  <h3>Recommendations</h3>
  ${summary.recommendations.map((r) => `<div class="recommendation">${r}</div>`).join('')}

  ${
    soc2
      ? `
  <h2>SOC 2 Type II Details</h2>
  <p><strong>Score:</strong> ${soc2.score}% | <strong>Status:</strong> ${soc2.overallStatus}</p>
  <table>
    <tr>
      <th>Control</th>
      <th>Name</th>
      <th>Status</th>
    </tr>
    ${soc2.checks
      .map(
        (c) => `
    <tr>
      <td>${c.controlId}</td>
      <td>${c.controlName}</td>
      <td class="${c.status}">${c.status}</td>
    </tr>
    `
      )
      .join('')}
  </table>
  `
      : ''
  }

  ${
    fedramp
      ? `
  <h2>FedRAMP Details</h2>
  <p><strong>Score:</strong> ${fedramp.score}% | <strong>Status:</strong> ${fedramp.overallStatus}</p>
  <table>
    <tr>
      <th>Control</th>
      <th>Name</th>
      <th>Status</th>
    </tr>
    ${fedramp.checks
      .slice(0, 20)
      .map(
        (c) => `
    <tr>
      <td>${c.controlId}</td>
      <td>${c.controlName}</td>
      <td class="${c.status}">${c.status}</td>
    </tr>
    `
      )
      .join('')}
  </table>
  `
      : ''
  }

  <hr>
  <p><em>This report was automatically generated by the Security Service.</em></p>
</body>
</html>`;
}

/**
 * Schedule compliance report generation
 */
export async function scheduleReport(
  cronExpression: string,
  recipients: string[]
): Promise<void> {
  await redis.hset('compliance:schedule', {
    cron: cronExpression,
    recipients: JSON.stringify(recipients),
    lastRun: '',
    enabled: 'true',
  });
}

/**
 * Get scheduled report configuration
 */
export async function getSchedule(): Promise<{
  cron: string;
  recipients: string[];
  lastRun: Date | null;
  enabled: boolean;
} | null> {
  const schedule = await redis.hgetall('compliance:schedule');

  if (!schedule.cron) return null;

  return {
    cron: schedule.cron,
    recipients: JSON.parse(schedule.recipients || '[]'),
    lastRun: schedule.lastRun ? new Date(schedule.lastRun) : null,
    enabled: schedule.enabled === 'true',
  };
}

/**
 * Get report history
 */
export async function getReportHistory(
  limit = 10
): Promise<
  Array<{
    id: string;
    framework: string;
    score: number;
    status: string;
    generatedAt: Date;
  }>
> {
  const history = await redis.lrange('compliance:history', 0, limit - 1);

  return history.map((h) => {
    const data = JSON.parse(h);
    return {
      ...data,
      generatedAt: new Date(data.generatedAt),
    };
  });
}

/**
 * Store report in history
 */
export async function storeReportHistory(report: ComplianceReport): Promise<void> {
  const entry = {
    id: `report_${Date.now()}`,
    framework: report.framework,
    score: report.score,
    status: report.overallStatus,
    generatedAt: report.generatedAt.toISOString(),
  };

  await redis.lpush('compliance:history', JSON.stringify(entry));
  await redis.ltrim('compliance:history', 0, 99); // Keep last 100
}

/**
 * Compare reports over time
 */
export async function compareReports(): Promise<{
  trend: 'improving' | 'declining' | 'stable';
  soc2Trend: number;
  fedrampTrend: number;
  periodDays: number;
}> {
  const history = await getReportHistory(30);

  if (history.length < 2) {
    return {
      trend: 'stable',
      soc2Trend: 0,
      fedrampTrend: 0,
      periodDays: 0,
    };
  }

  const soc2Reports = history.filter((h) => h.framework === ComplianceFramework.SOC2);
  const fedrampReports = history.filter((h) => h.framework === ComplianceFramework.FEDRAMP);

  const soc2Trend =
    soc2Reports.length >= 2
      ? (soc2Reports[0]?.score ?? 0) - (soc2Reports[soc2Reports.length - 1]?.score ?? 0)
      : 0;

  const fedrampTrend =
    fedrampReports.length >= 2
      ? (fedrampReports[0]?.score ?? 0) - (fedrampReports[fedrampReports.length - 1]?.score ?? 0)
      : 0;

  const overallTrend = soc2Trend + fedrampTrend;

  const firstDate = history[history.length - 1]?.generatedAt;
  const lastDate = history[0]?.generatedAt;
  const periodDays = firstDate && lastDate
    ? Math.ceil((lastDate.getTime() - firstDate.getTime()) / 86400000)
    : 0;

  return {
    trend: overallTrend > 5 ? 'improving' : overallTrend < -5 ? 'declining' : 'stable',
    soc2Trend,
    fedrampTrend,
    periodDays,
  };
}
