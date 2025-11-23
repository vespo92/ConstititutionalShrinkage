/**
 * Text Chunking Utilities
 * Utilities for splitting text into manageable chunks
 */

export interface ChunkOptions {
  maxChunkSize: number;
  overlap: number;
  preserveParagraphs: boolean;
  preserveSentences: boolean;
}

export interface Chunk {
  content: string;
  index: number;
  startChar: number;
  endChar: number;
  metadata?: Record<string, unknown>;
}

const DEFAULT_OPTIONS: ChunkOptions = {
  maxChunkSize: 1000,
  overlap: 100,
  preserveParagraphs: true,
  preserveSentences: true,
};

/**
 * Split text into chunks with overlap
 */
export function chunkText(text: string, options?: Partial<ChunkOptions>): Chunk[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const chunks: Chunk[] = [];

  if (opts.preserveParagraphs) {
    return chunkByParagraphs(text, opts);
  }

  if (opts.preserveSentences) {
    return chunkBySentences(text, opts);
  }

  return chunkBySize(text, opts);
}

/**
 * Chunk by paragraphs
 */
function chunkByParagraphs(text: string, opts: ChunkOptions): Chunk[] {
  const paragraphs = text.split(/\n\n+/);
  const chunks: Chunk[] = [];
  let currentChunk = '';
  let currentStart = 0;
  let charIndex = 0;

  for (const paragraph of paragraphs) {
    const newLength = currentChunk.length + paragraph.length + 2;

    if (newLength > opts.maxChunkSize && currentChunk) {
      chunks.push({
        content: currentChunk.trim(),
        index: chunks.length,
        startChar: currentStart,
        endChar: charIndex - 2,
      });

      // Start new chunk with overlap
      if (opts.overlap > 0 && currentChunk.length > opts.overlap) {
        currentChunk = currentChunk.slice(-opts.overlap) + '\n\n' + paragraph;
        currentStart = charIndex - opts.overlap;
      } else {
        currentChunk = paragraph;
        currentStart = charIndex;
      }
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }

    charIndex += paragraph.length + 2;
  }

  if (currentChunk) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunks.length,
      startChar: currentStart,
      endChar: text.length,
    });
  }

  return chunks;
}

/**
 * Chunk by sentences
 */
function chunkBySentences(text: string, opts: ChunkOptions): Chunk[] {
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
  const chunks: Chunk[] = [];
  let currentChunk = '';
  let currentStart = 0;
  let charIndex = 0;

  for (const sentence of sentences) {
    const trimmedSentence = sentence.trim();
    const newLength = currentChunk.length + trimmedSentence.length + 1;

    if (newLength > opts.maxChunkSize && currentChunk) {
      chunks.push({
        content: currentChunk.trim(),
        index: chunks.length,
        startChar: currentStart,
        endChar: charIndex - 1,
      });

      // Start new chunk with overlap
      if (opts.overlap > 0 && currentChunk.length > opts.overlap) {
        currentChunk = currentChunk.slice(-opts.overlap) + ' ' + trimmedSentence;
        currentStart = charIndex - opts.overlap;
      } else {
        currentChunk = trimmedSentence;
        currentStart = charIndex;
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + trimmedSentence;
    }

    charIndex += sentence.length;
  }

  if (currentChunk) {
    chunks.push({
      content: currentChunk.trim(),
      index: chunks.length,
      startChar: currentStart,
      endChar: text.length,
    });
  }

  return chunks;
}

/**
 * Chunk by fixed size
 */
function chunkBySize(text: string, opts: ChunkOptions): Chunk[] {
  const chunks: Chunk[] = [];
  let start = 0;

  while (start < text.length) {
    let end = Math.min(start + opts.maxChunkSize, text.length);

    // Try to break at word boundary
    if (end < text.length) {
      const lastSpace = text.lastIndexOf(' ', end);
      if (lastSpace > start + opts.maxChunkSize / 2) {
        end = lastSpace;
      }
    }

    chunks.push({
      content: text.slice(start, end).trim(),
      index: chunks.length,
      startChar: start,
      endChar: end,
    });

    start = end - opts.overlap;
  }

  return chunks;
}

/**
 * Merge chunks back together
 */
export function mergeChunks(chunks: Chunk[]): string {
  if (chunks.length === 0) return '';
  if (chunks.length === 1) return chunks[0].content;

  // Sort by index
  const sorted = [...chunks].sort((a, b) => a.index - b.index);

  let result = sorted[0].content;
  for (let i = 1; i < sorted.length; i++) {
    const chunk = sorted[i];
    // Try to find overlap and avoid duplication
    const overlapStart = result.slice(-200);
    const overlapIndex = chunk.content.indexOf(overlapStart.slice(-50));

    if (overlapIndex > 0 && overlapIndex < 100) {
      result += chunk.content.slice(overlapIndex + 50);
    } else {
      result += '\n\n' + chunk.content;
    }
  }

  return result;
}

/**
 * Split legislation by sections
 */
export function chunkLegislation(text: string): Chunk[] {
  const sectionPattern = /(?:SECTION|SEC\.|Article|ARTICLE|Chapter|CHAPTER)\s+\d+[.:]/gi;
  const matches = [...text.matchAll(sectionPattern)];

  if (matches.length === 0) {
    return chunkText(text);
  }

  const chunks: Chunk[] = [];

  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index!;
    const end = matches[i + 1]?.index || text.length;
    const content = text.slice(start, end).trim();

    chunks.push({
      content,
      index: i,
      startChar: start,
      endChar: end,
      metadata: {
        section: matches[i][0].trim(),
      },
    });
  }

  // Include any content before the first section
  if (matches[0].index! > 0) {
    const preamble = text.slice(0, matches[0].index).trim();
    if (preamble) {
      chunks.unshift({
        content: preamble,
        index: -1,
        startChar: 0,
        endChar: matches[0].index!,
        metadata: { section: 'Preamble' },
      });
    }
  }

  return chunks;
}
