/**
 * SQL Injection Prevention
 *
 * Utilities to detect and prevent SQL injection attacks.
 */

// SQL injection patterns
const SQL_PATTERNS = [
  // Basic SQL keywords in suspicious contexts
  /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER|CREATE|TRUNCATE|EXEC|EXECUTE)\b)/i,
  // SQL comments
  /(--|#|\/\*|\*\/)/,
  // Quote manipulation
  /('|")\s*(OR|AND)\s*('|"|\d)/i,
  // Boolean-based injection
  /'\s*(OR|AND)\s*'?\d+\s*=\s*\d+/i,
  /'\s*(OR|AND)\s*'[^']+'\s*=\s*'[^']+'/i,
  // Time-based injection
  /(SLEEP|WAITFOR|DELAY|BENCHMARK)\s*\(/i,
  // Union-based injection
  /UNION\s+(ALL\s+)?SELECT/i,
  // Stacked queries
  /;\s*(SELECT|INSERT|UPDATE|DELETE|DROP)/i,
  // SQL functions
  /(CHAR|CHR|ASCII|CONCAT|SUBSTRING|MID)\s*\(/i,
  // Null byte
  /%00|\\x00|\\0/,
  // Hex encoding
  /0x[0-9a-fA-F]+/,
];

/**
 * Check if input contains SQL injection patterns
 */
export function containsSQLInjection(input: string): boolean {
  for (const pattern of SQL_PATTERNS) {
    if (pattern.test(input)) {
      return true;
    }
  }
  return false;
}

/**
 * Get detected SQL injection patterns
 */
export function detectSQLPatterns(input: string): string[] {
  const detected: string[] = [];

  for (const pattern of SQL_PATTERNS) {
    if (pattern.test(input)) {
      detected.push(pattern.source);
    }
  }

  return detected;
}

/**
 * Escape value for SQL (basic - use parameterized queries instead)
 */
export function escapeSQL(input: string): string {
  return input
    .replace(/'/g, "''")
    .replace(/\\/g, '\\\\')
    .replace(/\0/g, '\\0')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\x1a/g, '\\Z');
}

/**
 * Escape identifier (table/column names)
 */
export function escapeIdentifier(input: string): string {
  // Only allow alphanumeric and underscore
  if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(input)) {
    throw new Error('Invalid identifier');
  }
  return `"${input}"`;
}

/**
 * Validate that value is safe for LIKE clause
 */
export function escapeLike(input: string): string {
  return input
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/\[/g, '\\[');
}

/**
 * Create a parameterized query placeholder
 */
export function createPlaceholder(index: number, dialect: 'pg' | 'mysql' | 'sqlite' = 'pg'): string {
  switch (dialect) {
    case 'pg':
      return `$${index}`;
    case 'mysql':
      return '?';
    case 'sqlite':
      return '?';
    default:
      return `$${index}`;
  }
}

/**
 * Validate column name
 */
export function isValidColumnName(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

/**
 * Validate table name
 */
export function isValidTableName(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

/**
 * Validate ORDER BY direction
 */
export function isValidOrderDirection(direction: string): boolean {
  return /^(ASC|DESC)$/i.test(direction);
}

/**
 * Build safe ORDER BY clause
 */
export function buildOrderBy(
  column: string,
  direction: 'ASC' | 'DESC' = 'ASC',
  allowedColumns: string[]
): string | null {
  if (!allowedColumns.includes(column)) {
    return null;
  }

  if (!isValidOrderDirection(direction)) {
    return null;
  }

  return `"${column}" ${direction}`;
}

/**
 * Build safe WHERE IN clause
 */
export function buildWhereIn(
  values: (string | number)[],
  startIndex = 1,
  dialect: 'pg' | 'mysql' | 'sqlite' = 'pg'
): { clause: string; params: (string | number)[] } {
  const placeholders = values.map((_, i) =>
    createPlaceholder(startIndex + i, dialect)
  );

  return {
    clause: `(${placeholders.join(', ')})`,
    params: values,
  };
}
