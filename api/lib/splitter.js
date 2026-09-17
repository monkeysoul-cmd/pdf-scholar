/**
 * Recursive character splitter for chunking document text for RAG.
 * Supports both raw text chunking and page-aware chunking with exact page index attribution.
 */
export class RecursiveCharacterTextSplitter {
  constructor(options = {}) {
    this.chunkSize = options.chunkSize ?? 800;
    this.chunkOverlap = options.chunkOverlap ?? 150;
    this.separators = options.separators ?? ["\n\n", "\n", ". ", " ", ""];
  }

  /**
   * Split text into chunks
   */
  splitText(text) {
    return this.split(text, this.separators);
  }

  /**
   * Split pages array into chunks preserving exact page index attribution.
   * @param {Array<{pageIndex: number, text: string}>} pages
   * @returns {Array<{text: string, pageIndex: number}>}
   */
  splitPages(pages) {
    if (!Array.isArray(pages) || pages.length === 0) return [];

    const chunkItems = [];

    for (const page of pages) {
      const pageText = (page.text || "").trim();
      if (!pageText) continue;

      const chunks = this.split(pageText, this.separators);
      for (const chunkText of chunks) {
        if (chunkText.trim().length > 0) {
          chunkItems.push({
            text: chunkText.trim(),
            pageIndex: page.pageIndex || 1,
          });
        }
      }
    }

    return chunkItems;
  }

  split(text, separators) {
    if (!text || text.length <= this.chunkSize) {
      return text ? [text.trim()] : [];
    }

    // Find the first separator that appears in the text
    let separator = separators[separators.length - 1];
    let nextSeparators = [];

    for (let i = 0; i < separators.length; i++) {
      if (text.includes(separators[i])) {
        separator = separators[i];
        nextSeparators = separators.slice(i + 1);
        break;
      }
    }

    const parts = text.split(separator);
    const chunks = [];
    let currentChunk = "";

    for (const part of parts) {
      const candidate = currentChunk ? currentChunk + separator + part : part;

      if (candidate.length <= this.chunkSize) {
        currentChunk = candidate;
      } else {
        if (currentChunk) {
          chunks.push(currentChunk);
        }

        if (part.length > this.chunkSize) {
          if (nextSeparators.length > 0) {
            const subChunks = this.split(part, nextSeparators);
            for (const sub of subChunks) {
              if (currentChunk && (currentChunk + separator + sub).length <= this.chunkSize) {
                currentChunk = currentChunk + separator + sub;
              } else {
                if (currentChunk) chunks.push(currentChunk);
                currentChunk = sub;
              }
            }
          } else {
            let start = 0;
            while (start < part.length) {
              chunks.push(part.slice(start, start + this.chunkSize));
              start += this.chunkSize - this.chunkOverlap;
            }
            currentChunk = "";
          }
        } else {
          if (currentChunk) {
            const overlapText = currentChunk.slice(-this.chunkOverlap);
            const candidateWithOverlap = overlapText + separator + part;
            if (candidateWithOverlap.length <= this.chunkSize) {
              currentChunk = candidateWithOverlap;
            } else {
              currentChunk = part;
            }
          } else {
            currentChunk = part;
          }
        }
      }
    }

    if (currentChunk) {
      chunks.push(currentChunk);
    }

    return chunks.map(c => c.trim()).filter(c => c.length > 0);
  }
}
