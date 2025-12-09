/**
 * ============================================================
 * 👤 Admin Handler - User and Record Management
 * ============================================================
 * 
 * Endpoints for admin dashboard to manage users and test records
 */

import { IRequest } from 'itty-router';

function jsonResponse(obj: any, status = 200) {
    return new Response(JSON.stringify(obj), {
        status,
        headers: { 'Content-Type': 'application/json' }
    });
}

/**
 * GET /api/admin/users
 * Get all users from D1 database
 */
export async function getAdminUsers(
    _request: IRequest,
    env: any
): Promise<Response> {
    try {
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
    _request: IRequest,
    env: any
): Promise<Response> {
    try {
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
    _request: IRequest,
    env: any
): Promise<Response> {
    try {
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
