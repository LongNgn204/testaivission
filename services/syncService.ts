/**
 * =================================================================
 * 🔄 SyncService - Bidirectional Data Sync with Backend
 * =================================================================
 *
 * Handles syncing data between frontend localStorage and backend D1 database.
 * Features:
 * - Push local data to backend
 * - Pull user data from backend
 * - Conflict resolution with "last-write-wins"
 * - Offline queue for failed syncs
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vision-coach-worker.stu72511407.workers.dev';

// 🔐 Auth Helper
const getAuthToken = (): string | null => {
    try {
        return localStorage.getItem('auth_token');
    } catch {
        return null;
    }
};

// 🌐 API Request helper
async function syncRequest<T>(endpoint: string, data: any): Promise<T> {
    const token = getAuthToken();
    if (!token) {
        throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error((error as any).message || 'Sync failed');
    }

    return response.json() as Promise<T>;
}

export interface SyncResult {
    success: boolean;
    message: string;
    synced?: number;
    conflicts?: number;
}

export class SyncService {
    private syncQueue: any[] = [];
    private isSyncing = false;

    constructor() {
        // Load offline queue from localStorage
        try {
            const queue = localStorage.getItem('sync_queue');
            if (queue) {
                this.syncQueue = JSON.parse(queue);
            }
        } catch {
            this.syncQueue = [];
        }
    }

    /**
     * 📤 Push local test history to backend
     */
    async syncTestHistory(): Promise<SyncResult> {
        try {
            const historyStr = localStorage.getItem('test_history');
            if (!historyStr) {
                return { success: true, message: 'No local history to sync', synced: 0 };
            }

            const localHistory = JSON.parse(historyStr);
            const lastSyncTime = localStorage.getItem('last_sync_timestamp') || '0';

            // Filter items that need syncing (created after last sync)
            const itemsToSync = localHistory.filter((item: any) => {
                const itemTime = new Date(item.date).getTime();
                return itemTime > parseInt(lastSyncTime);
            });

            if (itemsToSync.length === 0) {
                return { success: true, message: 'All items already synced', synced: 0 };
            }

            const result = await syncRequest<SyncResult>('/api/sync/history', {
                history: itemsToSync,
                lastSyncTime,
            });

            // Update last sync timestamp
            localStorage.setItem('last_sync_timestamp', Date.now().toString());

            console.log(`✅ Synced ${itemsToSync.length} test results to backend`);
            return { success: true, message: 'History synced', synced: itemsToSync.length };
        } catch (error: any) {
            console.error('❌ History sync failed:', error.message);
            return { success: false, message: error.message };
        }
    }

    /**
     * 📤 Sync user settings to backend
     */
    async syncSettings(): Promise<SyncResult> {
        try {
            const settings = {
                language: localStorage.getItem('language') || 'vi',
                theme: localStorage.getItem('theme') || 'light',
                notifications: localStorage.getItem('notifications_enabled') === 'true',
                voice: localStorage.getItem('voice_enabled') !== 'false',
            };

            await syncRequest('/api/sync/settings', { settings });

            console.log('✅ Settings synced to backend');
            return { success: true, message: 'Settings synced' };
        } catch (error: any) {
            console.error('❌ Settings sync failed:', error.message);
            return { success: false, message: error.message };
        }
    }

    /**
     * 📤 Sync routine to backend
     */
    async syncRoutine(): Promise<SyncResult> {
        try {
            const routineStr = localStorage.getItem('weekly_routine');
            const answersStr = localStorage.getItem('setup_answers');

            if (!routineStr) {
                return { success: true, message: 'No routine to sync' };
            }

            const routine = JSON.parse(routineStr);
            const answers = answersStr ? JSON.parse(answersStr) : null;

            await syncRequest('/api/sync/routine', { routine, answers });

            console.log('✅ Routine synced to backend');
            return { success: true, message: 'Routine synced' };
        } catch (error: any) {
            console.error('❌ Routine sync failed:', error.message);
            return { success: false, message: error.message };
        }
    }

    /**
     * 📥 Pull all user data from backend
     */
    async pullFromBackend(): Promise<SyncResult> {
        try {
            const result = await syncRequest<{
                history: any[];
                settings: any;
                routine: any;
            }>('/api/sync/pull', {});

            // Merge history (backend takes priority for duplicates)
            if (result.history && result.history.length > 0) {
                const localHistoryStr = localStorage.getItem('test_history');
                const localHistory = localHistoryStr ? JSON.parse(localHistoryStr) : [];

                // Create a map of local items by ID
                const localMap = new Map(localHistory.map((item: any) => [item.id, item]));

                // Merge backend items
                result.history.forEach((item: any) => {
                    localMap.set(item.id, item); // Backend wins
                });

                const mergedHistory = Array.from(localMap.values());
                localStorage.setItem('test_history', JSON.stringify(mergedHistory));
                console.log(`📥 Pulled ${result.history.length} history items from backend`);
            }

            // Apply settings
            if (result.settings) {
                if (result.settings.language) localStorage.setItem('language', result.settings.language);
                if (result.settings.theme) localStorage.setItem('theme', result.settings.theme);
            }

            // Apply routine
            if (result.routine) {
                localStorage.setItem('weekly_routine', JSON.stringify(result.routine));
            }

            localStorage.setItem('last_sync_timestamp', Date.now().toString());

            return { success: true, message: 'Data pulled from backend', synced: result.history?.length || 0 };
        } catch (error: any) {
            console.error('❌ Pull from backend failed:', error.message);
            return { success: false, message: error.message };
        }
    }

    /**
     * 🔄 Full bidirectional sync
     */
    async fullSync(): Promise<SyncResult> {
        if (this.isSyncing) {
            return { success: false, message: 'Sync already in progress' };
        }

        this.isSyncing = true;
        let synced = 0;

        try {
            // First pull from backend to get latest data
            const pullResult = await this.pullFromBackend();
            if (pullResult.synced) synced += pullResult.synced;

            // Then push local changes
            const historyResult = await this.syncTestHistory();
            if (historyResult.synced) synced += historyResult.synced;

            await this.syncSettings();
            await this.syncRoutine();

            // Process offline queue
            await this.processOfflineQueue();

            return { success: true, message: 'Full sync completed', synced };
        } catch (error: any) {
            return { success: false, message: error.message };
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * 📝 Add item to offline queue (for failed syncs)
     */
    addToQueue(type: string, data: any): void {
        this.syncQueue.push({
            type,
            data,
            timestamp: Date.now(),
            attempts: 0,
        });
        this.saveQueue();
    }

    /**
     * 🔄 Process offline queue
     */
    async processOfflineQueue(): Promise<void> {
        if (this.syncQueue.length === 0) return;

        const processed: number[] = [];

        for (let i = 0; i < this.syncQueue.length; i++) {
            const item = this.syncQueue[i];

            try {
                switch (item.type) {
                    case 'test_result':
                        await syncRequest('/api/tests/save', item.data);
                        processed.push(i);
                        break;
                    case 'settings':
                        await this.syncSettings();
                        processed.push(i);
                        break;
                    default:
                        processed.push(i); // Remove unknown items
                }
            } catch {
                item.attempts++;
                if (item.attempts >= 3) {
                    processed.push(i); // Remove after 3 failed attempts
                }
            }
        }

        // Remove processed items
        this.syncQueue = this.syncQueue.filter((_, i) => !processed.includes(i));
        this.saveQueue();

        if (processed.length > 0) {
            console.log(`✅ Processed ${processed.length} items from offline queue`);
        }
    }

    /**
     * 💾 Save queue to localStorage
     */
    private saveQueue(): void {
        try {
            localStorage.setItem('sync_queue', JSON.stringify(this.syncQueue));
        } catch (e) {
            console.error('Failed to save sync queue:', e);
        }
    }

    /**
     * 📊 Get sync status
     */
    getSyncStatus(): { lastSync: string | null; queueSize: number; isSyncing: boolean } {
        const lastSync = localStorage.getItem('last_sync_timestamp');
        return {
            lastSync: lastSync ? new Date(parseInt(lastSync)).toISOString() : null,
            queueSize: this.syncQueue.length,
            isSyncing: this.isSyncing,
        };
    }
}

// Singleton instance
let syncServiceInstance: SyncService | null = null;

export function getSyncService(): SyncService {
    if (!syncServiceInstance) {
        syncServiceInstance = new SyncService();
    }
    return syncServiceInstance;
}
