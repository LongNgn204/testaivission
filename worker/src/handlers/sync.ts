/**
 * ============================================================
 * 🔄 Sync Handler - Frontend-Backend Data Synchronization
 * ============================================================
 * 
 * Handles syncing data between frontend localStorage and backend D1 database.
 */

import { IRequest } from 'itty-router';
import { DatabaseService } from '../services/database';

// Helper to verify JWT and get user
async function authenticateRequest(request: IRequest, env: any): Promise<{ userId: string } | Response> {
    const req = request as Request;
    const auth = req.headers.get('authorization') || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';

    if (!token) {
        return new Response(JSON.stringify({ success: false, message: 'Unauthorized' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    const { verifyJWT } = await import('./auth');
    const decoded: any = await verifyJWT(token, env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
        return new Response(JSON.stringify({ success: false, message: 'Invalid token' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    return { userId: decoded.userId };
}

/**
 * POST /api/sync/pull
 * Pull all user data from backend
 */
export async function syncPull(request: IRequest, env: any): Promise<Response> {
    try {
        const auth = await authenticateRequest(request, env);
        if (auth instanceof Response) return auth;
        const { userId } = auth;

        const db = new DatabaseService(env.DB);

        // Get user's test history
        const history = await db.getUserTestHistory(userId, 50);

        // Get user's settings
        const settings = await db.getUserSettings(userId);

        // Get user's routine
        const routine = await db.getUserRoutine(userId);

        return new Response(JSON.stringify({
            success: true,
            history: history || [],
            settings: settings || {},
            routine: routine || null,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Sync pull error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * POST /api/sync/history
 * Sync test history from frontend to backend
 */
export async function syncHistory(request: IRequest, env: any): Promise<Response> {
    try {
        const auth = await authenticateRequest(request, env);
        if (auth instanceof Response) return auth;
        const { userId } = auth;

        const { history } = await (request as Request).json() as any;

        if (!history || !Array.isArray(history)) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid history data'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const db = new DatabaseService(env.DB);
        let synced = 0;

        for (const item of history) {
            try {
                // Check if already exists
                const existing = await db.getTestResultById(item.id);
                if (!existing) {
                    await db.saveTestResult({
                        user_id: userId,
                        test_type: item.testType || item.test_type,
                        result: typeof item.resultData === 'string' ? item.resultData : JSON.stringify(item.resultData),
                        ai_analysis: item.report?.aiAnalysis || item.aiAnalysis || '',
                        ai_recommendations: item.report?.recommendations ? JSON.stringify(item.report.recommendations) : '[]',
                        severity: item.report?.severity || item.severity || 'NORMAL',
                        test_date: item.date || new Date().toISOString(),
                    });
                    synced++;
                }
            } catch (err) {
                console.warn('Failed to sync item:', item.id, err);
            }
        }

        return new Response(JSON.stringify({
            success: true,
            message: `Synced ${synced} items`,
            synced,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Sync history error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * POST /api/sync/settings
 * Sync user settings from frontend to backend
 */
export async function syncSettings(request: IRequest, env: any): Promise<Response> {
    try {
        const auth = await authenticateRequest(request, env);
        if (auth instanceof Response) return auth;
        const { userId } = auth;

        const { settings } = await (request as Request).json() as any;

        if (!settings) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid settings data'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const db = new DatabaseService(env.DB);
        await db.saveUserSettings({
            user_id: userId,
            language: settings.language || 'vi',
            theme: settings.theme || 'light',
            notifications_enabled: settings.notifications ?? true,
            voice_enabled: settings.voice ?? true,
        });

        return new Response(JSON.stringify({
            success: true,
            message: 'Settings synced',
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Sync settings error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

/**
 * POST /api/sync/routine
 * Sync routine from frontend to backend
 */
export async function syncRoutine(request: IRequest, env: any): Promise<Response> {
    try {
        const auth = await authenticateRequest(request, env);
        if (auth instanceof Response) return auth;
        const { userId } = auth;

        const { routine } = await (request as Request).json() as any;

        if (!routine) {
            return new Response(JSON.stringify({
                success: false,
                message: 'Invalid routine data'
            }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const db = new DatabaseService(env.DB);
        await db.saveRoutine({
            user_id: userId,
            routine_data: typeof routine === 'string' ? routine : JSON.stringify(routine),
            generated_at: new Date().toISOString(),
        });

        return new Response(JSON.stringify({
            success: true,
            message: 'Routine synced',
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error: any) {
        console.error('Sync routine error:', error);
        return new Response(JSON.stringify({
            success: false,
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
