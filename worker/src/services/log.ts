/**
 * Structured Logger for Cloudflare Worker
 * - Log JSON lines with minimal overhead
 */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogRecord {
  level: LogLevel;
  msg: string;
  time: string; // ISO
  traceId?: string;
  userId?: string;
  data?: Record<string, unknown>;
}

function emit(rec: LogRecord) {
  const line = JSON.stringify(rec);
  switch (rec.level) {
    case 'debug':
      console.debug(line); break;
    case 'info':
      console.info(line); break;
    case 'warn':
      console.warn(line); break;
    case 'error':
    default:
      console.error(line); break;
  }
}

export const workerLog = {
  debug(msg: string, data?: Record<string, unknown>, traceId?: string, userId?: string) {
    emit({ level: 'debug', msg, time: new Date().toISOString(), data, traceId, userId });
  },
  info(msg: string, data?: Record<string, unknown>, traceId?: string, userId?: string) {
    emit({ level: 'info', msg, time: new Date().toISOString(), data, traceId, userId });
  },
  warn(msg: string, data?: Record<string, unknown>, traceId?: string, userId?: string) {
    emit({ level: 'warn', msg, time: new Date().toISOString(), data, traceId, userId });
  },
  error(msg: string, data?: Record<string, unknown>, traceId?: string, userId?: string) {
    emit({ level: 'error', msg, time: new Date().toISOString(), data, traceId, userId });
  }
};

export function newTraceId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

