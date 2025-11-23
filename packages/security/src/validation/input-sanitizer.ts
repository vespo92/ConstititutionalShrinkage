/**
 * Input Sanitization
 *
 * Sanitize user input to prevent injection attacks.
 */

/**
 * Sanitize string input
 */
export function sanitizeString(
  input: string,
  options: {
    maxLength?: number;
    allowHtml?: boolean;
    allowNewlines?: boolean;
    trim?: boolean;
  } = {}
): string {
  let result = input;

  // Trim whitespace
  if (options.trim !== false) {
    result = result.trim();
  }

  // Remove null bytes
  result = result.replace(/\0/g, '');

  // Strip HTML unless allowed
  if (!options.allowHtml) {
    result = stripHtml(result);
  }

  // Handle newlines
  if (!options.allowNewlines) {
    result = result.replace(/[\r\n]/g, ' ');
  }

  // Truncate if too long
  if (options.maxLength && result.length > options.maxLength) {
    result = result.substring(0, options.maxLength);
  }

  return result;
}

/**
 * Strip HTML tags
 */
export function stripHtml(input: string): string {
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

/**
 * Escape HTML entities
 */
export function escapeHtml(input: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return input.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

/**
 * Sanitize filename
 */
export function sanitizeFilename(input: string): string {
  return input
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\.{2,}/g, '.')
    .replace(/^\.+|\.+$/g, '')
    .substring(0, 255);
}

/**
 * Sanitize path
 */
export function sanitizePath(input: string): string {
  return input
    .replace(/\.\./g, '')
    .replace(/\/+/g, '/')
    .replace(/^\/+|\/+$/g, '')
    .replace(/[<>:"|?*\x00-\x1F]/g, '');
}

/**
 * Sanitize email
 */
export function sanitizeEmail(input: string): string {
  return input.toLowerCase().trim().replace(/[^\w.@+-]/g, '');
}

/**
 * Sanitize URL
 */
export function sanitizeUrl(input: string): string | null {
  try {
    const url = new URL(input);

    // Only allow safe protocols
    if (!['http:', 'https:'].includes(url.protocol)) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

/**
 * Sanitize JSON string
 */
export function sanitizeJson(input: string): unknown | null {
  try {
    return JSON.parse(input);
  } catch {
    return null;
  }
}

/**
 * Normalize unicode
 */
export function normalizeUnicode(input: string): string {
  return input.normalize('NFC');
}

/**
 * Remove control characters
 */
export function removeControlChars(input: string): string {
  // eslint-disable-next-line no-control-regex
  return input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

/**
 * Sanitize for logging (prevent log injection)
 */
export function sanitizeForLog(input: string): string {
  return input
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .substring(0, 1000);
}
