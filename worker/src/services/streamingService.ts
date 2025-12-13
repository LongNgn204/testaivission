/**
 * ========================================
 * STREAMING SERVICE
 * ========================================
 * Server-side streaming cho LLM responses
 * Tuân thủ TypeScript strict mode
 */

export interface StreamingConfig {
  chunkSize?: number;
  delayMs?: number;
}

/**
 * Streaming service for LLM responses
 */
export class StreamingService {
  private config: StreamingConfig;

  constructor(config: StreamingConfig = {}) {
    this.config = {
      chunkSize: config.chunkSize ?? 50, // characters per chunk
      delayMs: config.delayMs ?? 10, // delay between chunks
    };
  }

  /**
   * Create streaming response from text
   */
  createTextStream(text: string): ReadableStream<Uint8Array> {
    const { chunkSize, delayMs } = this.config;

    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for (let i = 0; i < text.length; i += chunkSize) {
            const chunk = text.substring(i, i + chunkSize);
            const encoded = new TextEncoder().encode(chunk);

            controller.enqueue(encoded);

            // Add delay between chunks
            if (delayMs > 0) {
              await new Promise((resolve) => setTimeout(resolve, delayMs));
            }
          }

          controller.close();
        } catch (error) {
          controller.error(error);
        }
      },
    });
  }

  /**
   * Create streaming response with SSE (Server-Sent Events)
   */
  createSSEStream(
    dataGenerator: AsyncGenerator<string, void, unknown>
  ): ReadableStream<Uint8Array> {
    return new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const data of dataGenerator) {
            const sseMessage = `data: ${JSON.stringify({ content: data })}\n\n`;
            const encoded = new TextEncoder().encode(sseMessage);

            controller.enqueue(encoded);
          }

          // Send completion message
          const doneMessage = `data: ${JSON.stringify({ done: true })}\n\n`;
          const encoded = new TextEncoder().encode(doneMessage);
          controller.enqueue(encoded);

          controller.close();
        } catch (error) {
          const errorMessage = `data: ${JSON.stringify({ error: String(error) })}\n\n`;
          const encoded = new TextEncoder().encode(errorMessage);
          controller.enqueue(encoded);
          controller.close();
        }
      },
    });
  }

  /**
   * Create streaming response object
   */
  createStreamingResponse(
    stream: ReadableStream<Uint8Array>,
    contentType: string = 'text/plain'
  ): Response {
    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  }

  /**
   * Create SSE response
   */
  createSSEResponse(
    dataGenerator: AsyncGenerator<string, void, unknown>
  ): Response {
    const stream = this.createSSEStream(dataGenerator);

    return new Response(stream, {
      status: 200,
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}

/**
 * Export singleton instance
 */
export const streamingService = new StreamingService();

/**
 * Example: Generate response chunks
 */
export async function* generateResponseChunks(
  text: string,
  chunkSize: number = 50
): AsyncGenerator<string, void, unknown> {
  for (let i = 0; i < text.length; i += chunkSize) {
    const chunk = text.substring(i, i + chunkSize);
    yield chunk;

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}

