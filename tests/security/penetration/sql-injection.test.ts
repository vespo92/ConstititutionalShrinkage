/**
 * SQL Injection Attack Tests
 *
 * Tests to verify SQL injection protection mechanisms.
 */

import { describe, it, expect } from 'vitest';

// Common SQL injection payloads for testing
const SQL_INJECTION_PAYLOADS = [
  "' OR '1'='1",
  "'; DROP TABLE users; --",
  "' OR '1'='1' --",
  "' UNION SELECT * FROM users --",
  "1'; DELETE FROM users WHERE '1'='1",
  "admin'--",
  "' OR 1=1#",
  "' OR 1=1/*",
  "'-'",
  "' '",
  "' OR ''='",
  "' OR 'x'='x",
  "' AND id IS NULL; --",
  "' UNION ALL SELECT NULL, NULL, NULL--",
  "' UNION SELECT @@version--",
  "1 UNION SELECT null, table_name FROM information_schema.tables",
  "1' ORDER BY 1--+",
  "1' ORDER BY 10--+",
  "1' GROUP BY 1,2,3--+",
  "' HAVING 1=1--",
  "' GROUP BY userid HAVING 1=1--",
  "1 WAITFOR DELAY '0:0:10'--",
  "1; WAITFOR DELAY '0:0:10'--",
  "'; SELECT SLEEP(10);--",
  "1' AND SLEEP(10)--",
  "BENCHMARK(10000000,SHA1('test'))",
  "1' AND 1=1 AND '1'='1",
  "1' AND 1=0 AND '1'='1",
  "admin'/*",
  "*/admin'/*",
  "' OR 'x'='x'/*",
  "' or 1=1 limit 1 -- -+",
  "1'||'asd'||'",
  "' AND extractvalue(1,concat(0x7e,version()))--",
  "' AND updatexml(1,concat(0x7e,version()),1)--",
];

// SQL Injection detection patterns
const SQL_INJECTION_PATTERNS = [
  /(\s|^)(SELECT|INSERT|UPDATE|DELETE|DROP|TRUNCATE|ALTER|CREATE|EXEC)\s/i,
  /(\s|^)(UNION|OR|AND)\s+/i,
  /--\s*$/,
  /\/\*[\s\S]*?\*\//,
  /#\s*$/,
  /;\s*$/,
  /'\s*OR\s+'?\d+\s*=\s*'?\d+/i,
  /'\s*AND\s+'?\d+\s*=\s*'?\d+/i,
  /'\s*OR\s+'.+'\s*=\s*'/i,
  /WAITFOR\s+DELAY/i,
  /BENCHMARK\s*\(/i,
  /SLEEP\s*\(/i,
  /LOAD_FILE\s*\(/i,
  /INTO\s+(OUTFILE|DUMPFILE)/i,
  /INFORMATION_SCHEMA/i,
  /CONCAT\s*\(/i,
  /CHAR\s*\(/i,
  /SUBSTRING\s*\(/i,
  /extractvalue\s*\(/i,
  /updatexml\s*\(/i,
];

function detectSqlInjection(input: string): { detected: boolean; patterns: string[] } {
  const matchedPatterns: string[] = [];

  for (const pattern of SQL_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      matchedPatterns.push(pattern.source);
    }
  }

  return {
    detected: matchedPatterns.length > 0,
    patterns: matchedPatterns,
  };
}

function sanitizeSqlInput(input: string): string {
  // Escape single quotes
  let sanitized = input.replace(/'/g, "''");

  // Remove SQL comments
  sanitized = sanitized.replace(/--.*$/gm, '');
  sanitized = sanitized.replace(/\/\*[\s\S]*?\*\//g, '');
  sanitized = sanitized.replace(/#.*$/gm, '');

  return sanitized;
}

describe('SQL Injection Detection', () => {
  describe('Classic SQL Injection', () => {
    it('should detect OR-based injection', () => {
      const result = detectSqlInjection("' OR '1'='1");
      expect(result.detected).toBe(true);
    });

    it('should detect UNION-based injection', () => {
      const result = detectSqlInjection("' UNION SELECT * FROM users --");
      expect(result.detected).toBe(true);
    });

    it('should detect comment-based termination', () => {
      const result = detectSqlInjection("admin'--");
      expect(result.detected).toBe(true);
    });

    it('should detect stacked queries', () => {
      const result = detectSqlInjection("'; DROP TABLE users; --");
      expect(result.detected).toBe(true);
    });
  });

  describe('Time-Based Blind SQL Injection', () => {
    it('should detect SLEEP injection', () => {
      const result = detectSqlInjection("' AND SLEEP(10)--");
      expect(result.detected).toBe(true);
    });

    it('should detect WAITFOR DELAY injection', () => {
      const result = detectSqlInjection("1 WAITFOR DELAY '0:0:10'--");
      expect(result.detected).toBe(true);
    });

    it('should detect BENCHMARK injection', () => {
      const result = detectSqlInjection("BENCHMARK(10000000,SHA1('test'))");
      expect(result.detected).toBe(true);
    });
  });

  describe('Error-Based SQL Injection', () => {
    it('should detect extractvalue injection', () => {
      const result = detectSqlInjection("' AND extractvalue(1,concat(0x7e,version()))--");
      expect(result.detected).toBe(true);
    });

    it('should detect updatexml injection', () => {
      const result = detectSqlInjection("' AND updatexml(1,concat(0x7e,version()),1)--");
      expect(result.detected).toBe(true);
    });
  });

  describe('Information Schema Access', () => {
    it('should detect information_schema access attempts', () => {
      const result = detectSqlInjection(
        "1 UNION SELECT null, table_name FROM information_schema.tables"
      );
      expect(result.detected).toBe(true);
    });
  });

  describe('All Common Payloads', () => {
    it('should detect all common SQL injection payloads', () => {
      const undetected: string[] = [];

      for (const payload of SQL_INJECTION_PAYLOADS) {
        const result = detectSqlInjection(payload);
        if (!result.detected) {
          undetected.push(payload);
        }
      }

      // Allow some false negatives but most should be caught
      const detectionRate = (SQL_INJECTION_PAYLOADS.length - undetected.length) / SQL_INJECTION_PAYLOADS.length;
      expect(detectionRate).toBeGreaterThan(0.8);
    });
  });

  describe('False Positives', () => {
    it('should not flag legitimate input', () => {
      const legitimateInputs = [
        'John Smith',
        'john.smith@example.com',
        "O'Brien",
        'New York, NY',
        '2024-01-15',
        'Hello, World!',
        '12345',
      ];

      const falsePositives: string[] = [];

      for (const input of legitimateInputs) {
        const result = detectSqlInjection(input);
        if (result.detected) {
          falsePositives.push(input);
        }
      }

      // Irish names with apostrophes may trigger, but should be minimal
      expect(falsePositives.length).toBeLessThanOrEqual(1);
    });
  });
});

describe('SQL Input Sanitization', () => {
  it('should escape single quotes', () => {
    const input = "O'Brien";
    const sanitized = sanitizeSqlInput(input);
    expect(sanitized).toBe("O''Brien");
  });

  it('should remove SQL comments', () => {
    const input = "admin'-- this is a comment";
    const sanitized = sanitizeSqlInput(input);
    expect(sanitized).not.toContain('--');
  });

  it('should remove block comments', () => {
    const input = "admin'/*comment*/password";
    const sanitized = sanitizeSqlInput(input);
    expect(sanitized).not.toContain('/*');
    expect(sanitized).not.toContain('*/');
  });

  it('should neutralize basic injection attempts', () => {
    const input = "' OR '1'='1";
    const sanitized = sanitizeSqlInput(input);
    expect(sanitized).toBe("'' OR ''1''=''1");
  });
});

describe('Parameterized Query Protection', () => {
  interface ParameterizedQuery {
    sql: string;
    params: unknown[];
  }

  function buildSafeQuery(
    table: string,
    conditions: Record<string, unknown>
  ): ParameterizedQuery {
    const keys = Object.keys(conditions);
    const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
    const params = Object.values(conditions);

    return {
      sql: `SELECT * FROM ${table} WHERE ${whereClause}`,
      params,
    };
  }

  it('should use parameterized queries for user input', () => {
    const userInput = "' OR '1'='1";
    const query = buildSafeQuery('users', { email: userInput });

    // SQL should not contain the injection payload
    expect(query.sql).not.toContain("'1'='1");
    expect(query.sql).toBe('SELECT * FROM users WHERE email = $1');
    expect(query.params).toContain(userInput);
  });

  it('should separate data from SQL command', () => {
    const query = buildSafeQuery('users', {
      email: 'test@example.com',
      status: 'active',
    });

    expect(query.sql).toBe('SELECT * FROM users WHERE email = $1 AND status = $2');
    expect(query.params).toEqual(['test@example.com', 'active']);
  });
});

describe('ORM Protection', () => {
  interface User {
    id: number;
    email: string;
    name: string;
  }

  // Mock ORM query builder
  class SafeQueryBuilder {
    private _table: string = '';
    private _conditions: Array<{ field: string; value: unknown }> = [];

    from(table: string): this {
      // Validate table name - only allow alphanumeric and underscore
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
        throw new Error('Invalid table name');
      }
      this._table = table;
      return this;
    }

    where(field: string, value: unknown): this {
      // Validate field name
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(field)) {
        throw new Error('Invalid field name');
      }
      this._conditions.push({ field, value });
      return this;
    }

    toSQL(): ParameterizedQuery {
      const whereClause = this._conditions
        .map((c, i) => `${c.field} = $${i + 1}`)
        .join(' AND ');

      return {
        sql: `SELECT * FROM ${this._table} WHERE ${whereClause}`,
        params: this._conditions.map((c) => c.value),
      };
    }
  }

  it('should reject SQL injection in table names', () => {
    const builder = new SafeQueryBuilder();

    expect(() => {
      builder.from('users; DROP TABLE users;--');
    }).toThrow('Invalid table name');
  });

  it('should reject SQL injection in field names', () => {
    const builder = new SafeQueryBuilder();

    expect(() => {
      builder.from('users').where("email' OR '1'='1", 'test@example.com');
    }).toThrow('Invalid field name');
  });

  it('should safely handle malicious values', () => {
    const builder = new SafeQueryBuilder();
    const maliciousInput = "' OR '1'='1";

    const query = builder.from('users').where('email', maliciousInput).toSQL();

    // Value should be parameterized, not embedded
    expect(query.sql).not.toContain(maliciousInput);
    expect(query.params).toContain(maliciousInput);
  });
});

describe('NoSQL Injection Protection', () => {
  const NOSQL_INJECTION_PATTERNS = [
    /\$where\s*:/i,
    /\$ne\s*:/i,
    /\$gt\s*:/i,
    /\$lt\s*:/i,
    /\$regex\s*:/i,
    /\$or\s*:\s*\[/i,
    /\$and\s*:\s*\[/i,
  ];

  function detectNoSqlInjection(input: string): boolean {
    for (const pattern of NOSQL_INJECTION_PATTERNS) {
      if (pattern.test(input)) {
        return true;
      }
    }
    return false;
  }

  it('should detect $where injection', () => {
    expect(detectNoSqlInjection('{"$where": "this.password == \\'admin\\'"}')).toBe(true);
  });

  it('should detect $ne injection', () => {
    expect(detectNoSqlInjection('{"password": {"$ne": ""}}')).toBe(true);
  });

  it('should detect $or injection', () => {
    expect(detectNoSqlInjection('{"$or": [{"admin": true}, {"password": ""}]}')).toBe(true);
  });

  it('should detect $regex injection', () => {
    expect(detectNoSqlInjection('{"username": {"$regex": ".*"}}')).toBe(true);
  });
});

describe('Second-Order SQL Injection', () => {
  it('should sanitize data before storage', () => {
    const userInput = "Robert'); DROP TABLE Students;--";

    // Data should be sanitized before storage
    const sanitizedForStorage = sanitizeSqlInput(userInput);

    // When retrieved and used in another query, should still be safe
    expect(sanitizedForStorage).not.toContain(';');
    expect(sanitizedForStorage).not.toContain('--');
  });

  it('should validate stored data before use in queries', () => {
    // Even if malicious data was stored, detection should catch it
    const storedMaliciousData = "'; DROP TABLE users; --";

    const result = detectSqlInjection(storedMaliciousData);
    expect(result.detected).toBe(true);
  });
});
