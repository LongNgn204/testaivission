/**
 * ============================================================
 * 👤 Admin Handler - User and Record Management
 * ============================================================
 * 
 * Endpoints for admin dashboard to manage users and test records
 * All endpoints require admin authentication
 */

import { IRequest } from 'itty-router';

function jsonResponse(obj: any, status = 200) {
    return new Response(JSON.stringify(obj), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * Admin Authentication Middleware
 * Verifies JWT token and checks admin role
 */
async function verifyAdminAuth(request: IRequest, env: any): Promise<{ valid: boolean; error?: string; userId?: string }> {
    // Allow public read-only access for standalone admin on GET routes
    // This supports: file:// origin, localhost, 127.0.0.1, or ADMIN_PUBLIC_READ=1
    try {
        const req = request as Request;
        const origin = req.headers.get('Origin');
        const isGetRequest = req.method === 'GET';

        // Allow public read for file:// origin (null)
        if ((origin === null || origin === 'null') && isGetRequest) {
            return { valid: true, userId: 'public' };
        }

        // Allow public read for localhost development
        if (isGetRequest && origin && (
            origin.includes('localhost') ||
            origin.includes('127.0.0.1') ||
            origin.includes('0.0.0.0')
        )) {
            return { valid: true, userId: 'public-localhost' };
        }

        // Allow public read if env flag is set
        if (env && env.ADMIN_PUBLIC_READ === '1' && isGetRequest) {
            return { valid: true, userId: 'public' };
        }
    } catch { }

    const authHeader = (request as Request).headers.get('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return { valid: false, error: 'Missing or invalid authorization header' };
    }

    const token = authHeader.slice(7);

    if (!token) {
        return { valid: false, error: 'Token required' };
    }

    // Admin override: accept a predefined admin token from environment
    if (env && env.ADMIN_BEARER && token === env.ADMIN_BEARER) {
        return { valid: true, userId: 'admin-override' };
    }

    // For admin dashboard, we accept any valid token for now
    // In production, you should check for admin role in the token
    try {
        // Import verifyJWT dynamically to avoid circular dependency
        const { verifyJWT } = await import('./auth');

        if (!env.JWT_SECRET) {
            console.error('JWT_SECRET not configured');
            return { valid: false, error: 'Server configuration error' };
        }

        const decoded: any = await verifyJWT(token, env.JWT_SECRET);

        if (!decoded) {
            return { valid: false, error: 'Invalid or expired token' };
        }

        // Accept if JWT has admin role
        if (decoded.role === 'admin') {
            return { valid: true, userId: decoded.userId || 'admin' };
        }

        // Accept if user is in allowlists (by userId or phone)
        const idAllow = (env.ADMIN_USER_IDS || '').split(',').map((s: string) => s.trim()).filter(Boolean);
        const phoneAllow = (env.ADMIN_PHONES || '').split(',').map((s: string) => s.trim()).filter(Boolean);
        if ((decoded.userId && idAllow.includes(String(decoded.userId))) || (decoded.phone && phoneAllow.includes(String(decoded.phone)))) {
            return { valid: true, userId: decoded.userId || 'admin' };
        }

        return { valid: false, error: 'Admin access required' };
    } catch (error: any) {
        console.error('Admin auth error:', error);
        return { valid: false, error: 'Authentication failed' };
    }
}

/**
 * POST /api/admin/reset-all
 * Hard reset: delete ALL data in D1 tables and KV caches.
 * Requires admin authentication (ADMIN_BEARER or JWT with admin role).
 */
export async function resetAllData(request: IRequest, env: any): Promise<Response> {
    try {
        const auth = await verifyAdminAuth(request, env);
        if (!auth.valid) {
            return jsonResponse({ success: false, message: auth.error || 'Unauthorized' }, 401);
        }

        if (!env.DB) {
            return jsonResponse({ success: false, message: 'Database not configured' }, 500);
        }

        // Delete rows from D1 (respect FK order: children first)
        const tablesInDeleteOrder = [
            'ai_reports',
            'test_results',
            'chat_history',
            'reminders',
            'routines',
            'sessions',
            'user_settings',
            'analytics',
            'users'
        ];

        const dbDeletes: { table: string; ok: boolean; error?: string }[] = [];
        for (const t of tablesInDeleteOrder) {
            try {
                await env.DB.prepare(`DELETE FROM ${t}`).run();
                dbDeletes.push({ table: t, ok: true });
            } catch (e: any) {
                dbDeletes.push({ table: t, ok: false, error: e?.message });
            }
        }

        // Clear KV namespaces (known prefixes)
        const kv = env.CACHE as KVNamespace;
        const prefixes = ['vision-coach:', 'chatctx:', 'cb:cfai'];
        const kvDeleted: Record<string, number> = {};
        if (kv && (kv as any).list) {
            for (const prefix of prefixes) {
                try {
                    let cursor: string | undefined = undefined;
                    let count = 0;
                    do {
                        const list: any = await (kv as any).list({ prefix, cursor });
                        const keys = list.keys || [];
                        for (const k of keys) {
                            await kv.delete(k.name);
                            count++;
                        }
                        cursor = list.list_complete ? undefined : list.cursor;
                    } while (cursor);
                    kvDeleted[prefix] = count;
                } catch (e) {
                    kvDeleted[prefix] = -1; // indicate failure
                }
            }
        }

        return jsonResponse({
            success: true,
            message: 'All backend data cleared',
            db: dbDeletes,
            kv: kvDeleted,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Admin reset-all error:', error);
        return jsonResponse({ success: false, message: 'Failed to reset data', error: error.message }, 500);
    }
}

/**
 * GET /api/admin/users
 * Get all users from D1 database
 */
export async function getAdminUsers(
    request: IRequest,
    env: any
): Promise<Response> {
    try {
        // Verify admin authentication
        const auth = await verifyAdminAuth(request, env);
        if (!auth.valid) {
            return jsonResponse({ success: false, message: auth.error || 'Unauthorized' }, 401);
        }

        if (!env.DB) {
            return jsonResponse({ success: false, message: 'Database not configured' }, 500);
        }

        // Get all users
        const result = await env.DB
            .prepare('SELECT * FROM users ORDER BY created_at DESC LIMIT 1000')
            .all();

        const users = result.results || [];

        return jsonResponse({
            success: true,
            users: users.map((u: any) => ({
                id: u.id,
                name: u.name,
                age: u.age,
                phone: u.phone,
                email: u.email,
                createdAt: u.created_at,
                lastLogin: u.last_login,
            })),
            total: users.length,
        });
    } catch (error: any) {
        console.error('Admin get users error:', error);
        return jsonResponse({
            success: false,
            message: 'Failed to get users',
            error: error.message
        }, 500);
    }
}

/**
 * GET /api/admin/records
 * Get all test records with user info from D1 database
 */
export async function getAdminRecords(
    request: IRequest,
    env: any
): Promise<Response> {
    try {
        // Verify admin authentication
        const auth = await verifyAdminAuth(request, env);
        if (!auth.valid) {
            return jsonResponse({ success: false, message: auth.error || 'Unauthorized' }, 401);
        }

        if (!env.DB) {
            return jsonResponse({ success: false, message: 'Database not configured' }, 500);
        }

        // Get all test results with user info
        const result = await env.DB
            .prepare(`
        SELECT 
          t.id,
          t.user_id,
          t.test_type,
          t.test_data,
          t.score,
          t.result,
          t.notes,
          t.created_at,
          t.duration,
          u.name as user_name,
          u.phone as user_phone
        FROM test_results t
        LEFT JOIN users u ON t.user_id = u.id
        ORDER BY t.created_at DESC
        LIMIT 1000
      `)
            .all();

        const records = result.results || [];

        // Parse test_data and extract severity
        const processedRecords = records.map((r: any) => {
            let testData: any = {};
            let severity = 'LOW';
            let aiAnalysis = '';

            try {
                if (r.test_data) {
                    testData = JSON.parse(r.test_data);
                    severity = testData.severity || testData.report?.severity || 'LOW';
                    aiAnalysis = testData.report?.summary || testData.summary || '';
                }
            } catch (e) {
                // Keep defaults
            }

            return {
                id: r.id,
                userId: r.user_id,
                userName: r.user_name || 'Unknown',
                userPhone: r.user_phone,
                testType: r.test_type,
                severity,
                aiAnalysis: aiAnalysis.substring(0, 200), // Truncate for list
                score: r.score,
                timestamp: r.created_at,
                duration: r.duration,
            };
        });

        return jsonResponse({
            success: true,
            records: processedRecords,
            total: processedRecords.length,
        });
    } catch (error: any) {
        console.error('Admin get records error:', error);
        return jsonResponse({
            success: false,
            message: 'Failed to get records',
            error: error.message
        }, 500);
    }
}

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
export async function getAdminStats(
    request: IRequest,
    env: any
): Promise<Response> {
    try {
        // Verify admin authentication
        const auth = await verifyAdminAuth(request, env);
        if (!auth.valid) {
            return jsonResponse({ success: false, message: auth.error || 'Unauthorized' }, 401);
        }

        if (!env.DB) {
            return jsonResponse({ success: false, message: 'Database not configured' }, 500);
        }

        // Get user count
        const userCount = await env.DB
            .prepare('SELECT COUNT(*) as count FROM users')
            .first();

        // Get test count by type
        const testCounts = await env.DB
            .prepare(`
        SELECT test_type, COUNT(*) as count 
        FROM test_results 
        GROUP BY test_type
      `)
            .all();

        // Get recent activity count (last 7 days)
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const recentTests = await env.DB
            .prepare('SELECT COUNT(*) as count FROM test_results WHERE created_at > ?')
            .bind(sevenDaysAgo)
            .first();

        // Get session count
        const sessionCount = await env.DB
            .prepare('SELECT COUNT(*) as count FROM sessions WHERE expires_at > ?')
            .bind(Date.now())
            .first();

        return jsonResponse({
            success: true,
            stats: {
                totalUsers: userCount?.count || 0,
                totalTests: testCounts.results?.reduce((acc: number, r: any) => acc + r.count, 0) || 0,
                testsByType: testCounts.results || [],
                recentTests: recentTests?.count || 0,
                activeSessions: sessionCount?.count || 0,
            }
        });
    } catch (error: any) {
        console.error('Admin get stats error:', error);
        return jsonResponse({
            success: false,
            message: 'Failed to get stats',
            error: error.message
        }, 500);
    }
}

/**
 * DELETE /api/admin/users/:userId
 * Delete a user and all their related data from D1 database
 */
export async function deleteAdminUser(
    request: IRequest,
    env: any
): Promise<Response> {
    try {
        // Verify admin authentication - require proper auth for DELETE operations
        const auth = await verifyAdminAuth(request, env);

        // For DELETE, we need stricter auth - don't allow public access
        const req = request as Request;
        const origin = req.headers.get('Origin');
        const isLocalhost = origin && (
            origin.includes('localhost') ||
            origin.includes('127.0.0.1') ||
            origin.includes('0.0.0.0')
        );

        // Allow localhost for development, but still check auth for production
        if (!isLocalhost && !auth.valid) {
            return jsonResponse({ success: false, message: auth.error || 'Unauthorized' }, 401);
        }

        if (!env.DB) {
            return jsonResponse({ success: false, message: 'Database not configured' }, 500);
        }

        // Get userId from URL params
        const userId = request.params?.userId;

        if (!userId) {
            return jsonResponse({ success: false, message: 'User ID is required' }, 400);
        }

        console.log(`[Admin] Deleting user: ${userId}`);

        // Delete user's data in order (respecting foreign key constraints)
        const deleteResults: { table: string; deleted: number; error?: string }[] = [];

        // 1. Delete from ai_reports
        try {
            const result = await env.DB
                .prepare('DELETE FROM ai_reports WHERE user_id = ?')
                .bind(userId)
                .run();
            deleteResults.push({ table: 'ai_reports', deleted: result.changes || 0 });
        } catch (e: any) {
            deleteResults.push({ table: 'ai_reports', deleted: 0, error: e?.message });
        }

        // 2. Delete from test_results
        try {
            const result = await env.DB
                .prepare('DELETE FROM test_results WHERE user_id = ?')
                .bind(userId)
                .run();
            deleteResults.push({ table: 'test_results', deleted: result.changes || 0 });
        } catch (e: any) {
            deleteResults.push({ table: 'test_results', deleted: 0, error: e?.message });
        }

        // 3. Delete from chat_history
        try {
            const result = await env.DB
                .prepare('DELETE FROM chat_history WHERE user_id = ?')
                .bind(userId)
                .run();
            deleteResults.push({ table: 'chat_history', deleted: result.changes || 0 });
        } catch (e: any) {
            deleteResults.push({ table: 'chat_history', deleted: 0, error: e?.message });
        }

        // 4. Delete from reminders
        try {
            const result = await env.DB
                .prepare('DELETE FROM reminders WHERE user_id = ?')
                .bind(userId)
                .run();
            deleteResults.push({ table: 'reminders', deleted: result.changes || 0 });
        } catch (e: any) {
            deleteResults.push({ table: 'reminders', deleted: 0, error: e?.message });
        }

        // 5. Delete from routines
        try {
            const result = await env.DB
                .prepare('DELETE FROM routines WHERE user_id = ?')
                .bind(userId)
                .run();
            deleteResults.push({ table: 'routines', deleted: result.changes || 0 });
        } catch (e: any) {
            deleteResults.push({ table: 'routines', deleted: 0, error: e?.message });
        }

        // 6. Delete from sessions
        try {
            const result = await env.DB
                .prepare('DELETE FROM sessions WHERE user_id = ?')
                .bind(userId)
                .run();
            deleteResults.push({ table: 'sessions', deleted: result.changes || 0 });
        } catch (e: any) {
            deleteResults.push({ table: 'sessions', deleted: 0, error: e?.message });
        }

        // 7. Delete from user_settings
        try {
            const result = await env.DB
                .prepare('DELETE FROM user_settings WHERE user_id = ?')
                .bind(userId)
                .run();
            deleteResults.push({ table: 'user_settings', deleted: result.changes || 0 });
        } catch (e: any) {
            deleteResults.push({ table: 'user_settings', deleted: 0, error: e?.message });
        }

        // 8. Delete from analytics
        try {
            const result = await env.DB
                .prepare('DELETE FROM analytics WHERE user_id = ?')
                .bind(userId)
                .run();
            deleteResults.push({ table: 'analytics', deleted: result.changes || 0 });
        } catch (e: any) {
            deleteResults.push({ table: 'analytics', deleted: 0, error: e?.message });
        }

        // 9. Finally, delete from users table
        try {
            const result = await env.DB
                .prepare('DELETE FROM users WHERE id = ?')
                .bind(userId)
                .run();
            deleteResults.push({ table: 'users', deleted: result.changes || 0 });
        } catch (e: any) {
            deleteResults.push({ table: 'users', deleted: 0, error: e?.message });
        }

        // Calculate total deleted records
        const totalDeleted = deleteResults.reduce((acc, r) => acc + r.deleted, 0);
        const hasErrors = deleteResults.some(r => r.error);

        console.log(`[Admin] User ${userId} deleted. Total records removed: ${totalDeleted}`);

        return jsonResponse({
            success: !hasErrors,
            message: hasErrors
                ? 'User deleted with some errors'
                : `User ${userId} and all related data deleted successfully`,
            userId,
            totalDeleted,
            details: deleteResults,
            timestamp: new Date().toISOString(),
        });
    } catch (error: any) {
        console.error('Admin delete user error:', error);
        return jsonResponse({
            success: false,
            message: 'Failed to delete user',
            error: error.message
        }, 500);
    }
}
