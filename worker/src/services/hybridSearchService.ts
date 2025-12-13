/**
 * ========================================
 * HYBRID SEARCH SERVICE
 * ========================================
 * BM25 + Dense vector search
 * Tuân thủ TypeScript strict mode
 */

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface SearchDocument {
  id: string;
  content: string;
  source: string;
  metadata?: Record<string, unknown>;
}

/**
 * BM25 (Best Matching 25) implementation
 * Simple full-text search algorithm
 */
class BM25Searcher {
  private documents: SearchDocument[] = [];
  private tokenizedDocs: string[][] = [];
  private avgDocLength: number = 0;
  private k1: number = 1.5; // term frequency saturation
  private b: number = 0.75; // length normalization

  /**
   * Index documents
   */
  index(documents: SearchDocument[]): void {
    this.documents = documents;
    this.tokenizedDocs = documents.map((doc) => this.tokenize(doc.content));

    const totalLength = this.tokenizedDocs.reduce((sum, tokens) => sum + tokens.length, 0);
    this.avgDocLength = totalLength / this.tokenizedDocs.length || 0;
  }

  /**
   * Search documents
   */
  search(query: string, topK: number = 5): SearchResult[] {
    const queryTokens = this.tokenize(query);
    const scores: Array<{ index: number; score: number }> = [];

    for (let i = 0; i < this.tokenizedDocs.length; i++) {
      const docTokens = this.tokenizedDocs[i]!;
      let score = 0;

      for (const token of queryTokens) {
        const freq = docTokens.filter((t) => t === token).length;
        const idf = this.calculateIDF(token);
        const normLength = docTokens.length / this.avgDocLength;

        const bm25Score =
          idf *
          ((this.k1 + 1) * freq) /
          (this.k1 * (1 - this.b + this.b * normLength) + freq);

        score += bm25Score;
      }

      if (score > 0) {
        scores.push({ index: i, score });
      }
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Return top K results
    return scores.slice(0, topK).map(({ index, score }) => ({
      id: this.documents[index]!.id,
      content: this.documents[index]!.content,
      score,
      source: this.documents[index]!.source,
      metadata: this.documents[index]!.metadata,
    }));
  }

  /**
   * Calculate IDF (Inverse Document Frequency)
   */
  private calculateIDF(token: string): number {
    const docCount = this.tokenizedDocs.filter((tokens) =>
      tokens.includes(token)
    ).length;

    if (docCount === 0) {
      return 0;
    }

    return Math.log(
      (this.tokenizedDocs.length - docCount + 0.5) / (docCount + 0.5) + 1
    );
  }

  /**
   * Tokenize text
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\s+/)
      .filter((token) => token.length > 0);
  }
}

/**
 * Dense vector search (placeholder for vector DB)
 * Trong production, sử dụng Pinecone hoặc Weaviate
 */
class DenseSearcher {
  private documents: SearchDocument[] = [];
  private embeddings: Map<string, number[]> = new Map();

  /**
   * Index documents
   */
  async index(documents: SearchDocument[], embeddingFn: (text: string) => Promise<number[]>): Promise<void> {
    this.documents = documents;

    for (const doc of documents) {
      const embedding = await embeddingFn(doc.content);
      this.embeddings.set(doc.id, embedding);
    }
  }

  /**
   * Search documents
   */
  async search(
    query: string,
    embeddingFn: (text: string) => Promise<number[]>,
    topK: number = 5
  ): Promise<SearchResult[]> {
    const queryEmbedding = await embeddingFn(query);
    const scores: Array<{ index: number; score: number }> = [];

    for (let i = 0; i < this.documents.length; i++) {
      const doc = this.documents[i]!;
      const docEmbedding = this.embeddings.get(doc.id);

      if (!docEmbedding) {
        continue;
      }

      const similarity = this.cosineSimilarity(queryEmbedding, docEmbedding);
      scores.push({ index: i, score: similarity });
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score);

    // Return top K results
    return scores.slice(0, topK).map(({ index, score }) => ({
      id: this.documents[index]!.id,
      content: this.documents[index]!.content,
      score,
      source: this.documents[index]!.source,
      metadata: this.documents[index]!.metadata,
    }));
  }

  /**
   * Calculate cosine similarity
   */
  private cosineSimilarity(a: number[], b: number[]): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i]! * b[i]!;
      normA += a[i]! * a[i]!;
      normB += b[i]! * b[i]!;
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    return denominator === 0 ? 0 : dotProduct / denominator;
  }
}

/**
 * Hybrid search service
 */
export class HybridSearchService {
  private bm25Searcher = new BM25Searcher();
  private denseSearcher = new DenseSearcher();
  private bm25Weight: number = 0.3;
  private denseWeight: number = 0.7;

  /**
   * Index documents
   */
  async index(
    documents: SearchDocument[],
    embeddingFn?: (text: string) => Promise<number[]>
  ): Promise<void> {
    // Index with BM25
    this.bm25Searcher.index(documents);

    // Index with dense search if embedding function provided
    if (embeddingFn) {
      await this.denseSearcher.index(documents, embeddingFn);
    }
  }

  /**
   * Hybrid search
   */
  async search(
    query: string,
    topK: number = 5,
    embeddingFn?: (text: string) => Promise<number[]>
  ): Promise<SearchResult[]> {
    const bm25Results = this.bm25Searcher.search(query, topK * 2);

    let denseResults: SearchResult[] = [];
    if (embeddingFn) {
      denseResults = await this.denseSearcher.search(query, embeddingFn, topK * 2);
    }

    // Merge and rerank results
    const merged = this.mergeResults(bm25Results, denseResults);
    return merged.slice(0, topK);
  }

  /**
   * Merge and rerank results from both search methods
   */
  private mergeResults(bm25Results: SearchResult[], denseResults: SearchResult[]): SearchResult[] {
    const resultMap = new Map<string, SearchResult>();

    // Add BM25 results with weighted score
    for (const result of bm25Results) {
      resultMap.set(result.id, {
        ...result,
        score: result.score * this.bm25Weight,
      });
    }

    // Add/merge dense results with weighted score
    for (const result of denseResults) {
      const existing = resultMap.get(result.id);
      if (existing) {
        // Combine scores
        existing.score += result.score * this.denseWeight;
      } else {
        resultMap.set(result.id, {
          ...result,
          score: result.score * this.denseWeight,
        });
      }
    }

    // Convert to array and sort by score
    const merged = Array.from(resultMap.values());
    merged.sort((a, b) => b.score - a.score);

    return merged;
  }

  /**
   * Set search weights
   */
  setWeights(bm25Weight: number, denseWeight: number): void {
    const total = bm25Weight + denseWeight;
    this.bm25Weight = bm25Weight / total;
    this.denseWeight = denseWeight / total;
  }
}

/**
 * Export singleton instance
 */
export const hybridSearchService = new HybridSearchService();

