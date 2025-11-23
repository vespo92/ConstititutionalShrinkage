/**
 * Citation Utilities
 * Utilities for extracting and formatting citations
 */

export interface Citation {
  source: string;
  section?: string;
  quote?: string;
  page?: number;
  url?: string;
}

export interface ExtractedCitation {
  text: string;
  startIndex: number;
  endIndex: number;
  citation: Citation;
}

/**
 * Extract citations from text
 */
export function extractCitations(text: string): ExtractedCitation[] {
  const citations: ExtractedCitation[] = [];

  // Pattern for [Source N] style citations
  const sourcePattern = /\[Source\s+(\d+)\]/gi;
  let match;

  while ((match = sourcePattern.exec(text)) !== null) {
    citations.push({
      text: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      citation: {
        source: `Source ${match[1]}`,
      },
    });
  }

  // Pattern for (Author, Year) style citations
  const authorPattern = /\(([A-Z][a-z]+(?:\s+(?:and|&)\s+[A-Z][a-z]+)?,\s+\d{4})\)/g;

  while ((match = authorPattern.exec(text)) !== null) {
    citations.push({
      text: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      citation: {
        source: match[1],
      },
    });
  }

  // Pattern for Section references
  const sectionPattern = /(?:Section|Sec\.|§)\s*(\d+(?:\.\d+)?(?:\([a-z]\))?)/gi;

  while ((match = sectionPattern.exec(text)) !== null) {
    citations.push({
      text: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      citation: {
        source: 'Legislation',
        section: match[1],
      },
    });
  }

  return citations.sort((a, b) => a.startIndex - b.startIndex);
}

/**
 * Format a citation for display
 */
export function formatCitation(citation: Citation): string {
  let formatted = citation.source;

  if (citation.section) {
    formatted += `, Section ${citation.section}`;
  }

  if (citation.page) {
    formatted += `, p. ${citation.page}`;
  }

  if (citation.quote) {
    formatted += `: "${citation.quote}"`;
  }

  return formatted;
}

/**
 * Format citations as footnotes
 */
export function formatAsFootnotes(citations: Citation[]): string {
  return citations
    .map((c, i) => `[${i + 1}] ${formatCitation(c)}`)
    .join('\n');
}

/**
 * Format citations as bibliography
 */
export function formatAsBibliography(citations: Citation[]): string {
  const unique = deduplicateCitations(citations);
  return unique
    .sort((a, b) => a.source.localeCompare(b.source))
    .map((c) => `- ${formatCitation(c)}`)
    .join('\n');
}

/**
 * Remove duplicate citations
 */
export function deduplicateCitations(citations: Citation[]): Citation[] {
  const seen = new Set<string>();
  const unique: Citation[] = [];

  for (const citation of citations) {
    const key = `${citation.source}|${citation.section || ''}|${citation.page || ''}`;
    if (!seen.has(key)) {
      seen.add(key);
      unique.push(citation);
    }
  }

  return unique;
}

/**
 * Link citations to their sources in text
 */
export function linkCitations(
  text: string,
  sources: { id: string; title: string }[]
): string {
  let result = text;

  // Replace [Source N] with linked version
  for (let i = 0; i < sources.length; i++) {
    const pattern = new RegExp(`\\[Source\\s+${i + 1}\\]`, 'gi');
    result = result.replace(pattern, `[${sources[i].title}]`);
  }

  return result;
}

/**
 * Extract quotes from text
 */
export function extractQuotes(text: string): string[] {
  const quotes: string[] = [];

  // Double quotes
  const doubleQuotePattern = /"([^"]+)"/g;
  let match;

  while ((match = doubleQuotePattern.exec(text)) !== null) {
    quotes.push(match[1]);
  }

  // Single quotes (for quoted text, not apostrophes)
  const singleQuotePattern = /'([^']{10,})'/g;

  while ((match = singleQuotePattern.exec(text)) !== null) {
    quotes.push(match[1]);
  }

  return quotes;
}

/**
 * Create citation from bill reference
 */
export function createBillCitation(
  billId: string,
  title: string,
  section?: string,
  quote?: string
): Citation {
  return {
    source: `${title} (${billId})`,
    section,
    quote,
  };
}

/**
 * Validate citation format
 */
export function isValidCitation(citation: Citation): boolean {
  if (!citation.source || citation.source.trim() === '') {
    return false;
  }

  if (citation.quote && citation.quote.length > 500) {
    return false;
  }

  return true;
}
