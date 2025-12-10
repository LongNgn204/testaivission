/**
 * ============================================================
 * 🧯 Circuit Breaker for Cloudflare AI calls (KV-backed)
 * ============================================================
 */

const PREFIX = 'cb:cfai';
const FAIL_KEY = `${PREFIX}:fails`;
const OPEN_KEY = `${PREFIX}:open`; // value: untilTs (ms)

const WINDOW_SEC = 60; // measure failures in 60s window
const THRESHOLD = 5;   // open breaker if >=5 failures within window
const OPEN_SEC = 120;  // keep open for 120s

export async function isBreakerOpen(kv: KVNamespace): Promise<boolean> {
  try {
    const untilRaw = await kv.get(OPEN_KEY);
    if (!untilRaw) return false;
    const until = parseInt(untilRaw, 10);
    if (isNaN(until)) return false;
    if (Date.now() < until) return true;
    // expired -> close
    await kv.delete(OPEN_KEY);
    return false;
  } catch {
    return false;
  }
}

export async function recordFailure(kv: KVNamespace): Promise<void> {
  try {
    const raw = await kv.get(FAIL_KEY);
    const count = raw ? parseInt(raw, 10) || 0 : 0;
    const next = count + 1;
    await kv.put(FAIL_KEY, String(next), { expirationTtl: WINDOW_SEC });
    if (next >= THRESHOLD) {
      const until = Date.now() + OPEN_SEC * 1000;
      await kv.put(OPEN_KEY, String(until), { expirationTtl: OPEN_SEC });
    }
  } catch {
    // ignore
  }
}

export async function recordSuccess(kv: KVNamespace): Promise<void> {
  try {
    await kv.delete(FAIL_KEY);
    await kv.delete(OPEN_KEY);
  } catch {
    // ignore
  }
}

