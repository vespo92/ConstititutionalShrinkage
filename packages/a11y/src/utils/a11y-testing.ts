/**
 * Accessibility testing utilities for WCAG 2.1 AAA compliance
 */

export interface A11yViolation {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  nodes: string[];
  help: string;
  helpUrl: string;
}

export interface A11yTestResult {
  violations: A11yViolation[];
  passes: number;
  score: number;
  timestamp: Date;
}

/**
 * Common accessibility checks that can be run without axe-core
 */
export function checkBasicA11y(container: HTMLElement): A11yViolation[] {
  const violations: A11yViolation[] = [];

  // Check for images without alt text
  const imagesWithoutAlt = container.querySelectorAll('img:not([alt])');
  if (imagesWithoutAlt.length > 0) {
    violations.push({
      id: 'image-alt',
      impact: 'critical',
      description: 'Images must have alternate text',
      nodes: Array.from(imagesWithoutAlt).map((el) => el.outerHTML.slice(0, 100)),
      help: 'Add alt attribute to all images',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/image-alt',
    });
  }

  // Check for buttons/links without accessible names
  const interactiveWithoutName = container.querySelectorAll(
    'button:not([aria-label]):not([aria-labelledby]):empty, a:not([aria-label]):not([aria-labelledby]):empty'
  );
  if (interactiveWithoutName.length > 0) {
    violations.push({
      id: 'button-name',
      impact: 'critical',
      description: 'Interactive elements must have accessible names',
      nodes: Array.from(interactiveWithoutName).map((el) => el.outerHTML.slice(0, 100)),
      help: 'Add text content or aria-label to interactive elements',
      helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/button-name',
    });
  }

  // Check for form inputs without labels
  const inputsWithoutLabels = container.querySelectorAll(
    'input:not([type="hidden"]):not([type="submit"]):not([type="button"]):not([aria-label]):not([aria-labelledby])'
  );
  inputsWithoutLabels.forEach((input) => {
    const id = input.getAttribute('id');
    if (!id || !container.querySelector(`label[for="${id}"]`)) {
      violations.push({
        id: 'label',
        impact: 'critical',
        description: 'Form elements must have labels',
        nodes: [input.outerHTML.slice(0, 100)],
        help: 'Add a label element or aria-label attribute',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/label',
      });
    }
  });

  // Check for headings in order
  const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
  let lastLevel = 0;
  headings.forEach((heading) => {
    const level = parseInt(heading.tagName.slice(1), 10);
    if (level > lastLevel + 1 && lastLevel !== 0) {
      violations.push({
        id: 'heading-order',
        impact: 'moderate',
        description: `Heading levels should increase by one: h${lastLevel} followed by h${level}`,
        nodes: [heading.outerHTML.slice(0, 100)],
        help: 'Use heading levels in sequential order',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/heading-order',
      });
    }
    lastLevel = level;
  });

  // Check for sufficient link text
  const vagueLinkTexts = ['click here', 'here', 'read more', 'learn more', 'more'];
  container.querySelectorAll('a').forEach((link) => {
    const text = link.textContent?.toLowerCase().trim() || '';
    if (vagueLinkTexts.includes(text)) {
      violations.push({
        id: 'link-name',
        impact: 'serious',
        description: 'Links must have descriptive text',
        nodes: [link.outerHTML.slice(0, 100)],
        help: 'Use descriptive link text that makes sense out of context',
        helpUrl: 'https://dequeuniversity.com/rules/axe/4.4/link-name',
      });
    }
  });

  return violations;
}

/**
 * Calculate accessibility score based on violations
 */
export function calculateA11yScore(result: { violations: A11yViolation[]; passes: number }): number {
  const { violations, passes } = result;
  const total = violations.length + passes;
  if (total === 0) return 100;

  // Weight by severity
  let deductions = 0;
  violations.forEach((v) => {
    switch (v.impact) {
      case 'critical':
        deductions += 20;
        break;
      case 'serious':
        deductions += 10;
        break;
      case 'moderate':
        deductions += 5;
        break;
      case 'minor':
        deductions += 2;
        break;
    }
  });

  return Math.max(0, 100 - deductions);
}

/**
 * Format violations for console output
 */
export function formatViolations(violations: A11yViolation[]): string {
  if (violations.length === 0) {
    return '✓ No accessibility violations found';
  }

  let output = `Found ${violations.length} accessibility violation(s):\n\n`;

  violations.forEach((v, i) => {
    output += `${i + 1}. [${v.impact.toUpperCase()}] ${v.description}\n`;
    output += `   Help: ${v.help}\n`;
    output += `   More info: ${v.helpUrl}\n`;
    output += `   Affected elements:\n`;
    v.nodes.forEach((node) => {
      output += `     - ${node}\n`;
    });
    output += '\n';
  });

  return output;
}

export default {
  checkBasicA11y,
  calculateA11yScore,
  formatViolations,
};
