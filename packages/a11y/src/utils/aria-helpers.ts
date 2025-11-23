/**
 * ARIA attribute helpers for accessibility
 */

export type AriaRole =
  | 'alert'
  | 'alertdialog'
  | 'application'
  | 'article'
  | 'banner'
  | 'button'
  | 'cell'
  | 'checkbox'
  | 'columnheader'
  | 'combobox'
  | 'complementary'
  | 'contentinfo'
  | 'dialog'
  | 'document'
  | 'feed'
  | 'figure'
  | 'form'
  | 'grid'
  | 'gridcell'
  | 'group'
  | 'heading'
  | 'img'
  | 'link'
  | 'list'
  | 'listbox'
  | 'listitem'
  | 'log'
  | 'main'
  | 'marquee'
  | 'math'
  | 'menu'
  | 'menubar'
  | 'menuitem'
  | 'menuitemcheckbox'
  | 'menuitemradio'
  | 'navigation'
  | 'none'
  | 'note'
  | 'option'
  | 'presentation'
  | 'progressbar'
  | 'radio'
  | 'radiogroup'
  | 'region'
  | 'row'
  | 'rowgroup'
  | 'rowheader'
  | 'scrollbar'
  | 'search'
  | 'searchbox'
  | 'separator'
  | 'slider'
  | 'spinbutton'
  | 'status'
  | 'switch'
  | 'tab'
  | 'table'
  | 'tablist'
  | 'tabpanel'
  | 'term'
  | 'textbox'
  | 'timer'
  | 'toolbar'
  | 'tooltip'
  | 'tree'
  | 'treegrid'
  | 'treeitem';

/**
 * Generate unique ID for ARIA relationships
 */
let idCounter = 0;
export function generateId(prefix: string = 'a11y'): string {
  return `${prefix}-${++idCounter}`;
}

/**
 * Reset ID counter (for testing)
 */
export function resetIdCounter(): void {
  idCounter = 0;
}

/**
 * Create aria-describedby string from multiple IDs
 */
export function createAriaDescribedBy(...ids: (string | null | undefined)[]): string | undefined {
  const validIds = ids.filter((id): id is string => Boolean(id));
  return validIds.length > 0 ? validIds.join(' ') : undefined;
}

/**
 * Create aria-labelledby string from multiple IDs
 */
export function createAriaLabelledBy(...ids: (string | null | undefined)[]): string | undefined {
  return createAriaDescribedBy(...ids);
}

/**
 * Generate ARIA props for a button that controls another element
 */
export interface AriaControlsProps {
  'aria-controls': string;
  'aria-expanded': boolean;
  id: string;
}

export function createAriaControls(
  controlId: string,
  targetId: string,
  isExpanded: boolean
): AriaControlsProps {
  return {
    id: controlId,
    'aria-controls': targetId,
    'aria-expanded': isExpanded,
  };
}

/**
 * Generate ARIA props for a controlled element
 */
export interface AriaControlledProps {
  id: string;
  'aria-labelledby': string;
  role?: AriaRole;
  hidden?: boolean;
}

export function createAriaControlled(
  targetId: string,
  controlId: string,
  role?: AriaRole,
  isHidden: boolean = false
): AriaControlledProps {
  const props: AriaControlledProps = {
    id: targetId,
    'aria-labelledby': controlId,
  };

  if (role) {
    props.role = role;
  }

  if (isHidden) {
    props.hidden = true;
  }

  return props;
}

/**
 * Generate ARIA props for tabs
 */
export interface TabAriaProps {
  role: 'tab';
  id: string;
  'aria-selected': boolean;
  'aria-controls': string;
  tabIndex: number;
}

export function createTabProps(
  tabId: string,
  panelId: string,
  isSelected: boolean
): TabAriaProps {
  return {
    role: 'tab',
    id: tabId,
    'aria-selected': isSelected,
    'aria-controls': panelId,
    tabIndex: isSelected ? 0 : -1,
  };
}

export interface TabPanelAriaProps {
  role: 'tabpanel';
  id: string;
  'aria-labelledby': string;
  tabIndex: number;
  hidden?: boolean;
}

export function createTabPanelProps(
  panelId: string,
  tabId: string,
  isSelected: boolean
): TabPanelAriaProps {
  const props: TabPanelAriaProps = {
    role: 'tabpanel',
    id: panelId,
    'aria-labelledby': tabId,
    tabIndex: 0,
  };

  if (!isSelected) {
    props.hidden = true;
  }

  return props;
}

/**
 * Generate ARIA props for modal dialogs
 */
export interface DialogAriaProps {
  role: 'dialog' | 'alertdialog';
  'aria-modal': true;
  'aria-labelledby': string;
  'aria-describedby'?: string;
}

export function createDialogProps(
  titleId: string,
  descriptionId?: string,
  isAlert: boolean = false
): DialogAriaProps {
  const props: DialogAriaProps = {
    role: isAlert ? 'alertdialog' : 'dialog',
    'aria-modal': true,
    'aria-labelledby': titleId,
  };

  if (descriptionId) {
    props['aria-describedby'] = descriptionId;
  }

  return props;
}

/**
 * Generate ARIA live region attributes
 */
export interface LiveRegionAriaProps {
  'aria-live': 'polite' | 'assertive' | 'off';
  'aria-atomic'?: boolean;
  'aria-relevant'?: 'additions' | 'removals' | 'text' | 'all';
  role?: 'status' | 'alert' | 'log';
}

export function createLiveRegionProps(
  priority: 'polite' | 'assertive' = 'polite',
  options: {
    atomic?: boolean;
    relevant?: 'additions' | 'removals' | 'text' | 'all';
    role?: 'status' | 'alert' | 'log';
  } = {}
): LiveRegionAriaProps {
  const props: LiveRegionAriaProps = {
    'aria-live': priority,
  };

  if (options.atomic !== undefined) {
    props['aria-atomic'] = options.atomic;
  }

  if (options.relevant) {
    props['aria-relevant'] = options.relevant;
  }

  if (options.role) {
    props.role = options.role;
  }

  return props;
}

/**
 * Get the accessible name of an element
 */
export function getAccessibleName(element: HTMLElement): string {
  // Check aria-labelledby first
  const labelledById = element.getAttribute('aria-labelledby');
  if (labelledById) {
    const labels = labelledById
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent)
      .filter(Boolean);
    if (labels.length > 0) {
      return labels.join(' ');
    }
  }

  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) {
    return ariaLabel;
  }

  // Check for associated label (for form elements)
  const id = element.getAttribute('id');
  if (id) {
    const label = document.querySelector<HTMLLabelElement>(`label[for="${id}"]`);
    if (label?.textContent) {
      return label.textContent.trim();
    }
  }

  // Fall back to text content
  return element.textContent?.trim() || '';
}

export default {
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
};
