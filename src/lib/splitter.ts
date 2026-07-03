/**
 * Recursive character splitter for chunking document text for RAG.
 */
export class RecursiveCharacterTextSplitter {
  private chunkSize: number;
  private chunkOverlap: number;
  private separators: string[];

  constructor(options: { chunkSize?: number; chunkOverlap?: number; separators?: string[] } = {}) {
    this.chunkSize = options.chunkSize ?? 1000;
    this.chunkOverlap = options.chunkOverlap ?? 200;
    this.separators = options.separators ?? ["\n\n", "\n", " ", ""];
  }

  public splitText(text: string): string[] {
    return this.split(text, this.separators);
  }

  private split(text: string, separators: string[]): string[] {
    if (text.length <= this.chunkSize) {
      return [text];
    }

    // Find the first separator that appears in the text
    let separator = separators[separators.length - 1];
    let nextSeparators: string[] = [];

    for (let i = 0; i < separators.length; i++) {
      if (text.includes(separators[i])) {
        separator = separators[i];
        nextSeparators = separators.slice(i + 1);
        break;
      }
    }

    const parts = text.split(separator);
    const chunks: string[] = [];
    let currentChunk = "";

    for (const part of parts) {
      const candidate = currentChunk ? currentChunk + separator + part : part;

      if (candidate.length <= this.chunkSize) {
        currentChunk = candidate;
      } else {
        // If current chunk is not empty, push it
        if (currentChunk) {
          chunks.push(currentChunk);
        }

        // Handle the part that was too large
        if (part.length > this.chunkSize) {
          // If there are more separators, split further
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
            // Otherwise, hard slice it
            let start = 0;
            while (start < part.length) {
              chunks.push(part.slice(start, start + this.chunkSize));
              start += this.chunkSize - this.chunkOverlap;
            }
            currentChunk = "";
          }
        } else {
          // Calculate overlap from previous chunk if possible
          if (currentChunk) {
            const overlapText = currentChunk.slice(-this.chunkOverlap);
            currentChunk = overlapText + separator + part;
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
