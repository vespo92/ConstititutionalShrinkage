/**
 * Compliance Prompt Templates
 */

export const COMPLIANCE_PROMPTS = {
  CONSTITUTIONAL_CHECK: `Analyze this legislation for constitutional compliance.

Constitution:
{constitution}

Bill:
{bill}

For each potential issue, identify:
1. The constitutional article/section at risk
2. The problematic text in the bill
3. Why it may conflict
4. Suggested remediation

Rate overall compliance from 0-100.`,

  RIGHTS_ANALYSIS: `Analyze how this legislation affects the following right:

Right: {rightName}
Constitutional Basis: {constitutionalBasis}

Bill Text:
{bill}

Determine if this bill:
- Protects the right
- Threatens the right
- Is neutral

Provide specific concerns and protections identified.`,

  CONFLICT_DETECTION: `Identify conflicts between this new bill and existing laws.

New Bill:
{newBill}

Existing Laws:
{existingLaws}

For each conflict found:
1. Identify the conflicting law
2. Describe the nature of the conflict
3. Suggest resolution`,

  AMENDMENT_COMPLIANCE: `Check if this proposed amendment maintains constitutional compliance.

Original Bill (Compliant):
{original}

Proposed Amendment:
{amendment}

Would the amendment introduce any constitutional issues?`,
};

export type CompliancePromptKey = keyof typeof COMPLIANCE_PROMPTS;

export function getCompliancePrompt(key: CompliancePromptKey): string {
  return COMPLIANCE_PROMPTS[key];
}

export function renderCompliancePrompt(
  key: CompliancePromptKey,
  variables: Record<string, string>
): string {
  let prompt = COMPLIANCE_PROMPTS[key];
  for (const [varName, value] of Object.entries(variables)) {
    prompt = prompt.replace(new RegExp(`\\{${varName}\\}`, 'g'), value);
  }
  return prompt;
}
