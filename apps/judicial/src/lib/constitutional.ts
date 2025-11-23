import type { ComplianceCheck, Violation, Warning, RightsCheck } from '@/types';

// Constitutional Rights Categories
export const RIGHTS_CATEGORIES = {
  fundamental: [
    { id: 'right-speech', name: 'Freedom of Speech', description: 'Right to express opinions freely' },
    { id: 'right-assembly', name: 'Freedom of Assembly', description: 'Right to peacefully assemble' },
    { id: 'right-religion', name: 'Freedom of Religion', description: 'Right to practice any religion' },
    { id: 'right-press', name: 'Freedom of Press', description: 'Right to publish without censorship' },
    { id: 'right-privacy', name: 'Right to Privacy', description: 'Protection from unreasonable searches' },
    { id: 'right-due-process', name: 'Due Process', description: 'Fair treatment through judicial system' },
    { id: 'right-equal-protection', name: 'Equal Protection', description: 'Equal treatment under the law' },
  ],
  procedural: [
    { id: 'right-counsel', name: 'Right to Counsel', description: 'Right to legal representation' },
    { id: 'right-speedy-trial', name: 'Speedy Trial', description: 'Right to timely prosecution' },
    { id: 'right-jury', name: 'Trial by Jury', description: 'Right to be judged by peers' },
    { id: 'right-confrontation', name: 'Confrontation', description: 'Right to face accusers' },
    { id: 'right-self-incrimination', name: 'Against Self-Incrimination', description: 'Right to remain silent' },
  ],
  economic: [
    { id: 'right-property', name: 'Property Rights', description: 'Protection of private property' },
    { id: 'right-contract', name: 'Contract Rights', description: 'Right to enter into agreements' },
    { id: 'right-work', name: 'Right to Work', description: 'Right to pursue employment' },
    { id: 'right-fair-compensation', name: 'Fair Compensation', description: 'Just compensation for takings' },
  ],
};

// Keywords that may indicate constitutional issues
const CONSTITUTIONAL_KEYWORDS = {
  'right-speech': ['speech', 'expression', 'opinion', 'communication', 'silence', 'censor'],
  'right-assembly': ['assembly', 'gather', 'protest', 'demonstrate', 'march', 'meeting'],
  'right-religion': ['religion', 'religious', 'faith', 'worship', 'church', 'belief'],
  'right-privacy': ['privacy', 'search', 'surveillance', 'data', 'personal', 'tracking'],
  'right-due-process': ['process', 'procedure', 'hearing', 'notice', 'trial', 'court'],
  'right-property': ['property', 'seizure', 'forfeiture', 'taking', 'confiscate', 'eminent'],
};

// Analyze bill text for potential constitutional issues
export function analyzeBillText(billText: string): {
  potentialIssues: string[];
  affectedRights: string[];
  riskLevel: 'low' | 'medium' | 'high';
} {
  const lowerText = billText.toLowerCase();
  const potentialIssues: string[] = [];
  const affectedRights: Set<string> = new Set();

  // Check for keywords
  Object.entries(CONSTITUTIONAL_KEYWORDS).forEach(([rightId, keywords]) => {
    keywords.forEach(keyword => {
      if (lowerText.includes(keyword)) {
        affectedRights.add(rightId);
      }
    });
  });

  // Check for concerning patterns
  const concerningPatterns = [
    { pattern: /prohibit|ban|forbid|restrict/gi, issue: 'Contains restrictive language' },
    { pattern: /mandatory|compulsory|required/gi, issue: 'Contains mandatory requirements' },
    { pattern: /penalty|fine|imprison/gi, issue: 'Contains penalty provisions' },
    { pattern: /without warrant|warrantless/gi, issue: 'May bypass warrant requirements' },
    { pattern: /surveillance|monitor|track/gi, issue: 'Contains surveillance provisions' },
  ];

  concerningPatterns.forEach(({ pattern, issue }) => {
    if (pattern.test(billText)) {
      potentialIssues.push(issue);
    }
  });

  // Calculate risk level
  const riskLevel =
    affectedRights.size > 3 || potentialIssues.length > 3 ? 'high' :
    affectedRights.size > 1 || potentialIssues.length > 1 ? 'medium' : 'low';

  return {
    potentialIssues,
    affectedRights: Array.from(affectedRights),
    riskLevel,
  };
}

// Mock compliance check (in production, this would call the API)
export function mockComplianceCheck(billId: string, billText: string): ComplianceCheck {
  const analysis = analyzeBillText(billText);

  const violations: Violation[] = [];
  const warnings: Warning[] = [];
  const checkedRights: RightsCheck[] = [];

  // Generate mock results based on analysis
  analysis.affectedRights.forEach((rightId, index) => {
    const allRights = [
      ...RIGHTS_CATEGORIES.fundamental,
      ...RIGHTS_CATEGORIES.procedural,
      ...RIGHTS_CATEGORIES.economic,
    ];
    const right = allRights.find(r => r.id === rightId);

    if (right) {
      // Randomly determine if it's a violation or warning
      if (index % 3 === 0 && analysis.riskLevel === 'high') {
        violations.push({
          id: `viol-${index}`,
          rightId: right.id,
          rightName: right.name,
          severity: index === 0 ? 'critical' : 'major',
          clause: 'Section 2, paragraph 3',
          explanation: `This provision may infringe upon ${right.name}`,
          remediation: `Consider adding exemptions to protect ${right.name}`,
        });
      } else {
        warnings.push({
          id: `warn-${index}`,
          rightId: right.id,
          rightName: right.name,
          clause: 'Section 1, paragraph 2',
          explanation: `This provision may impact ${right.name}`,
          suggestion: `Review language to ensure ${right.name} is preserved`,
        });
      }

      checkedRights.push({
        rightId: right.id,
        rightName: right.name,
        category: 'fundamental',
        status: violations.some(v => v.rightId === right.id) ? 'violated' :
                warnings.some(w => w.rightId === right.id) ? 'at_risk' : 'protected',
        impact: violations.some(v => v.rightId === right.id) ? -50 :
                warnings.some(w => w.rightId === right.id) ? -20 : 0,
      });
    }
  });

  // Add some protected rights
  RIGHTS_CATEGORIES.fundamental.slice(0, 3).forEach(right => {
    if (!checkedRights.find(r => r.rightId === right.id)) {
      checkedRights.push({
        rightId: right.id,
        rightName: right.name,
        category: 'fundamental',
        status: 'protected',
        impact: 0,
      });
    }
  });

  const overallScore = Math.max(0, 100 - (violations.length * 20) - (warnings.length * 10));

  return {
    billId,
    overallScore,
    status: violations.length > 0 ? 'violation' : warnings.length > 0 ? 'warning' : 'compliant',
    violations,
    warnings,
    checkedRights,
    checkedAt: new Date(),
  };
}

// Get remediation suggestions
export function getRemediationSuggestions(violation: Violation): string[] {
  const suggestions: string[] = [];

  suggestions.push(`Review and modify the language in ${violation.clause}`);
  suggestions.push(`Add explicit protections for ${violation.rightName}`);
  suggestions.push(`Include exemptions for constitutionally protected activities`);

  if (violation.severity === 'critical') {
    suggestions.push(`Consider removing or significantly revising this provision`);
    suggestions.push(`Consult with constitutional law experts before proceeding`);
  }

  return suggestions;
}

// Check for conflicts between laws
export function detectConflicts(law1Text: string, law2Text: string): {
  hasConflict: boolean;
  conflictingAreas: string[];
  severity: 'minor' | 'moderate' | 'severe';
} {
  // Simplified conflict detection
  const conflictPatterns = [
    { pattern1: /shall/gi, pattern2: /shall not/gi, area: 'Mandatory vs Prohibitive' },
    { pattern1: /permit/gi, pattern2: /prohibit/gi, area: 'Permission vs Prohibition' },
    { pattern1: /increase/gi, pattern2: /decrease/gi, area: 'Directional Conflict' },
  ];

  const conflictingAreas: string[] = [];

  conflictPatterns.forEach(({ pattern1, pattern2, area }) => {
    if (pattern1.test(law1Text) && pattern2.test(law2Text)) {
      conflictingAreas.push(area);
    }
  });

  return {
    hasConflict: conflictingAreas.length > 0,
    conflictingAreas,
    severity: conflictingAreas.length > 2 ? 'severe' :
              conflictingAreas.length > 0 ? 'moderate' : 'minor',
  };
}
