/**
 * XSS Prevention
 *
 * Cross-site scripting protection utilities.
 */

// XSS attack patterns
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /vbscript:/gi,
  /on\w+\s*=/gi,
  /<iframe/gi,
  /<object/gi,
  /<embed/gi,
  /<svg[^>]*onload/gi,
  /<img[^>]*onerror/gi,
  /expression\s*\(/gi,
  /data:\s*text\/html/gi,
  /<!--[\s\S]*?-->/g,
  /<!\[CDATA\[[\s\S]*?\]\]>/gi,
];

// Dangerous attributes
const DANGEROUS_ATTRS = [
  'onload',
  'onerror',
  'onclick',
  'onmouseover',
  'onmouseout',
  'onkeydown',
  'onkeypress',
  'onkeyup',
  'onfocus',
  'onblur',
  'onchange',
  'onsubmit',
  'onreset',
  'onselect',
  'onabort',
  'ondblclick',
  'ondrag',
  'ondragend',
  'ondragenter',
  'ondragleave',
  'ondragover',
  'ondragstart',
  'ondrop',
];

/**
 * Check if content contains XSS patterns
 */
export function containsXSS(input: string): boolean {
  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(input)) {
      return true;
    }
    pattern.lastIndex = 0; // Reset regex state
  }
  return false;
}

/**
 * Filter XSS from content
 */
export function filterXSS(
  input: string,
  options: {
    stripTags?: boolean;
    allowedTags?: string[];
    allowedAttributes?: string[];
  } = {}
): string {
  let result = input;

  // Remove script tags and content
  result = result.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ''
  );

  // Remove style tags and content
  result = result.replace(
    /<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi,
    ''
  );

  // Remove event handlers
  for (const attr of DANGEROUS_ATTRS) {
    const regex = new RegExp(`\\s*${attr}\\s*=\\s*["'][^"']*["']`, 'gi');
    result = result.replace(regex, '');
  }

  // Remove javascript: and vbscript: protocols
  result = result.replace(/javascript:/gi, '');
  result = result.replace(/vbscript:/gi, '');

  // Remove data: URIs with text/html
  result = result.replace(/data:\s*text\/html[^"']*/gi, '');

  // Remove expression() CSS
  result = result.replace(/expression\s*\([^)]*\)/gi, '');

  if (options.stripTags) {
    const allowedTags = options.allowedTags || [];
    const allowedTagsRegex = allowedTags.length
      ? new RegExp(`<(?!\/?(${allowedTags.join('|')})\\b)[^>]+>`, 'gi')
      : /<[^>]+>/g;
    result = result.replace(allowedTagsRegex, '');
  }

  return result;
}

/**
 * Encode for HTML context
 */
export function encodeForHTML(input: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return input.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Encode for HTML attribute context
 */
export function encodeForHTMLAttribute(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/`/g, '&#x60;')
    .replace(/=/g, '&#x3D;');
}

/**
 * Encode for JavaScript string context
 */
export function encodeForJS(input: string): string {
  return input
    .replace(/\\/g, '\\\\')
    .replace(/'/g, "\\'")
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .replace(/\f/g, '\\f')
    .replace(/\v/g, '\\v')
    .replace(/\0/g, '\\0');
}

/**
 * Encode for URL context
 */
export function encodeForURL(input: string): string {
  return encodeURIComponent(input);
}

/**
 * Encode for CSS context
 */
export function encodeForCSS(input: string): string {
  return input.replace(/[^a-zA-Z0-9]/g, (char) => {
    return '\\' + char.charCodeAt(0).toString(16) + ' ';
  });
}

/**
 * Safe JSON stringify (prevents XSS in JSON context)
 */
export function safeJSONStringify(obj: unknown): string {
  return JSON.stringify(obj)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/'/g, '\\u0027');
}
