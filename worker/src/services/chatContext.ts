/**
 * ============================================================
 * 🧠 Chat Context Service (KV-backed)
 * ============================================================
 *
 * Lưu lịch sử hội thoại gần nhất theo user (hoặc IP nếu ẩn danh)
 */

export type ChatTurn = { role: 'user' | 'assistant'; content: string; ts: number };

const PREFIX = 'chatctx';
const MAX_TURNS = 8; // 8 tin nhắn gần nhất (4 cặp)
const TTL_SEC = 6 * 60 * 60; // 6 giờ

function keyFor(id: string) {
  return `${PREFIX}:${id}`;
}

export async function getChatContext(kv: KVNamespace, id: string): Promise<ChatTurn[]> {
  try {
    const raw = await kv.get(keyFor(id), 'json');
    if (!raw) return [];
    const arr = raw as ChatTurn[];
    return Array.isArray(arr) ? arr.slice(-MAX_TURNS) : [];
  } catch {
    return [];
  }
}

export async function appendChatContext(
  kv: KVNamespace,
  id: string,
  userMsg: string,
  assistantMsg: string
): Promise<void> {
  try {
    const existing = await getChatContext(kv, id);
    const now = Date.now();
    const updated: ChatTurn[] = [
      ...existing,
      { role: 'user', content: userMsg, ts: now },
      { role: 'assistant', content: assistantMsg, ts: now },
    ].slice(-MAX_TURNS);

    await kv.put(keyFor(id), JSON.stringify(updated), { expirationTtl: TTL_SEC });
  } catch {
    // ignore
  }
}

export function renderContextAsText(turns: ChatTurn[], lang: 'vi' | 'en'): string {
  if (!turns.length) return '';
  const header = lang === 'vi' ? 'Lịch sử hội thoại gần đây:' : 'Recent conversation context:';
  const lines = turns.map(t => `${t.role === 'user' ? (lang === 'vi' ? 'Người dùng' : 'User') : 'Eva'}: ${t.content}`);
  return `${header}\n${lines.join('\n')}`;
}

