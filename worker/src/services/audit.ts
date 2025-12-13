/**
 * Audit Service (Worker)
 * - Ghi audit trail vào bảng audit_logs (D1)
 * - Dùng cho compliance và theo dõi hành vi quan trọng
 */

export type AuditAction =
  | 'auth.login'
  | 'auth.logout'
  | 'chat.send'
  | 'report.generate'
  | 'test.save'
  | 'admin.access'
  | 'error'
  | 'cost.track';

export interface AuditEntry {
  userId?: string;
  action: AuditAction;
  resourceType?: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  ip?: string | null;
  userAgent?: string | null;
}

export class AuditService {
  constructor(private db: D1Database) {}

  async log(entry: AuditEntry): Promise<void> {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const ip = entry.ip ?? null;
    const ua = entry.userAgent ?? null;

    await this.db
      .prepare(
        `INSERT INTO audit_logs (id, user_id, action, resource_type, resource_id, details, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`
      )
      .bind(
        id,
        entry.userId ?? null,
        entry.action,
        entry.resourceType ?? null,
        entry.resourceId ?? null,
        entry.details ? JSON.stringify(entry.details) : null,
        ip,
        ua
      )
      .run();
  }
}

export function createAuditService(db: D1Database): AuditService {
  return new AuditService(db);
}

