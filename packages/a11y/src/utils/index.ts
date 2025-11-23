export {
  checkBasicA11y,
  calculateA11yScore,
  formatViolations,
  type A11yViolation,
  type A11yTestResult,
} from './a11y-testing';

export {
  hexToRgb,
  parseColor,
  getRelativeLuminance,
  calculateContrastRatio,
  checkContrast,
  formatContrastResult,
  suggestAAAColor,
  type RGB,
  type ContrastResult,
} from './color-contrast';

export {
  generateId,
  resetIdCounter,
  createAriaDescribedBy,
  createAriaLabelledBy,
  createAriaControls,
  createAriaControlled,
  createTabProps,
  createTabPanelProps,
  createDialogProps,
  createLiveRegionProps,
  getAccessibleName,
  type AriaRole,
  type AriaControlsProps,
  type AriaControlledProps,
  type TabAriaProps,
  type TabPanelAriaProps,
  type DialogAriaProps,
  type LiveRegionAriaProps,
} from './aria-helpers';
