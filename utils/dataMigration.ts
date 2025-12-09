/**
 * =================================================================
 * 🧹 Data Migration v2.2.0 - Aggressive Cache Invalidation
 * =================================================================
 * 
 * Tự động xóa localStorage cũ khi có version/build mới
 * Đảm bảo app hoạt động ổn định trên mọi thiết bị
 * 
 * Debug commands (open DevTools Console):
 *   window.visionCoach.version()      - Show version info
 *   window.visionCoach.listKeys()     - List all localStorage keys
 *   window.visionCoach.resetAll()     - Clear all data & reload
 *   window.visionCoach.forceMigrate() - Force migration check
 */

// App version - MUST update this when deploying breaking changes
const CURRENT_VERSION = '2.2.0';
const VERSION_KEY = 'app_version';
const BUILD_HASH_KEY = 'app_build_hash';
const LAST_CLEAR_KEY = 'last_cache_clear';

// Build hash - injected by Vite at build time (fallback to timestamp)
declare const __BUILD_HASH__: string;
const BUILD_HASH = typeof __BUILD_HASH__ !== 'undefined' ? __BUILD_HASH__ : 'dev';

// Keys to PRESERVE when clearing (user preferences)
const KEYS_TO_PRESERVE = [
    'theme',           // Dark/light mode preference
    'language',        // vi/en preference
    LAST_CLEAR_KEY,    // Prevent multiple clears
];

// All app localStorage keys that should be cleared on version change
const CLEARABLE_KEY_PATTERNS = [
    // Auth
    'auth_token',
    'user_data',
    'saved_accounts',

    // Test history (user-specific)
    'aiVisionTestHistory_',
    'test_history',
    'visionTestHistory',

    // AI/Cache
    'ai_cache',
    'cached_reports',
    'cached_insights',
    'openrouter_cache',
    'gemini_cache',

    // Sync
    'sync_queue',
    'last_sync_timestamp',
    'offline_queue',

    // Settings (except theme/language)
    'notifications_enabled',
    'voice_enabled',
    'tour_completed',
    'setup_completed',

    // Routine
    'weekly_routine',
    'setup_answers',
    'routine_completed',
    'routine_data',

    // Admin
    'admin_token',
    'admin_session',
    'adminExpiresAt',

    // Error/Debug
    'vision_coach_error_state',
    'performance_cache',

    // Version (allow updating)
    VERSION_KEY,
    BUILD_HASH_KEY,
];

/**
 * Check if we need to migrate data (version or build changed)
 * Called on app startup (App.tsx)
 */
export function checkAndMigrateData(): void {
    try {
        const storedVersion = localStorage.getItem(VERSION_KEY);
        const storedBuildHash = localStorage.getItem(BUILD_HASH_KEY);

        // Check if version changed
        const versionChanged = storedVersion !== CURRENT_VERSION;

        // Check if build hash changed (for same-version deploys)
        const buildChanged = BUILD_HASH !== 'dev' && storedBuildHash !== BUILD_HASH;

        // Check if first visit
        const isFirstVisit = !storedVersion;

        if (versionChanged || buildChanged) {
            const changeType = versionChanged ? 'version' : 'build';
            console.log(`📦 ${changeType} change: ${storedVersion || 'none'}/${storedBuildHash || 'none'} → ${CURRENT_VERSION}/${BUILD_HASH}`);

            // Clear all cached data
            const clearedCount = clearAllAppData();

            // Update version markers
            localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
            if (BUILD_HASH !== 'dev') {
                localStorage.setItem(BUILD_HASH_KEY, BUILD_HASH);
            }
            localStorage.setItem(LAST_CLEAR_KEY, Date.now().toString());

            console.log(`✅ Cleared ${clearedCount} items. Migration complete.`);

            // Show notification (unless first visit)
            if (!isFirstVisit) {
                showMigrationNotice(versionChanged ? 'version' : 'update');
            }
        }
    } catch (error) {
        console.error('Migration error:', error);
        // On error, try to clear everything to recover
        try {
            clearAllAppData();
            localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
        } catch {
            // If storage is completely broken, clear all
            localStorage.clear();
        }
    }
}

/**
 * Clear all app data except preserved preferences
 * Returns number of items cleared
 */
function clearAllAppData(): number {
    const keysToRemove: string[] = [];

    // Iterate all localStorage keys
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key) continue;

        // Skip preserved keys
        if (KEYS_TO_PRESERVE.includes(key)) continue;

        // Check if key matches any clearable pattern
        const shouldClear = CLEARABLE_KEY_PATTERNS.some(pattern => {
            return key === pattern || key.startsWith(pattern);
        });

        if (shouldClear) {
            keysToRemove.push(key);
        }
    }

    // Also clear any keys that look like app data (prefix-based)
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || keysToRemove.includes(key)) continue;
        if (KEYS_TO_PRESERVE.includes(key)) continue;

        // Clear keys with common app prefixes
        const appPrefixes = ['vision', 'test_', 'user_', 'admin_', 'routine_', 'ai_', 'sync_', 'cached_'];
        if (appPrefixes.some(prefix => key.toLowerCase().startsWith(prefix))) {
            keysToRemove.push(key);
        }
    }

    // Remove all matched keys
    keysToRemove.forEach(key => {
        try {
            localStorage.removeItem(key);
            console.log(`  🧹 Cleared: ${key}`);
        } catch {
            // Ignore individual key errors
        }
    });

    return keysToRemove.length;
}

/**
 * Show notification to user about data migration
 */
function showMigrationNotice(type: 'version' | 'update'): void {
    // Wait for DOM to be ready
    const show = () => {
        const isVietnamese = localStorage.getItem('language') !== 'en';

        const messages = {
            version: {
                title: isVietnamese ? '🆕 Phiên bản mới!' : '🆕 New Version!',
                desc: isVietnamese
                    ? 'Dữ liệu cũ đã được xóa để cập nhật.'
                    : 'Old data cleared for update.',
            },
            update: {
                title: isVietnamese ? '🔄 Đã cập nhật!' : '🔄 Updated!',
                desc: isVietnamese
                    ? 'Code mới đã được tải.'
                    : 'New code loaded.',
            },
        };

        const msg = messages[type];
        const btnText = isVietnamese ? 'Đăng nhập ngay' : 'Login Now';

        const toast = document.createElement('div');
        toast.id = 'migration-toast';
        toast.className = 'fixed bottom-4 left-4 right-4 sm:left-4 sm:right-auto sm:max-w-sm z-[9999] animate-fade-in';
        toast.innerHTML = `
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-3 rounded-xl shadow-2xl">
                <div class="flex items-center gap-3">
                    <div class="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                    </div>
                    <div class="flex-1">
                        <p class="font-semibold">${msg.title}</p>
                        <p class="text-sm text-indigo-100">${msg.desc}</p>
                    </div>
                    <button id="migration-close-btn" class="flex-shrink-0 text-white/60 hover:text-white p-1">
                        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                </div>
                <button id="migration-action-btn" class="mt-2 w-full bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                    ${btnText}
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </button>
            </div>
        `;

        document.body.appendChild(toast);

        // Close button handler
        document.getElementById('migration-close-btn')?.addEventListener('click', () => {
            dismissToast(toast);
        });

        // Action button handler - go to login
        document.getElementById('migration-action-btn')?.addEventListener('click', () => {
            dismissToast(toast);
            // Navigate to auth page
            if (window.location.hash !== '#/auth') {
                window.location.hash = '#/auth';
            }
        });

        // Auto dismiss after 10 seconds
        setTimeout(() => dismissToast(toast), 10000);
    };

    // Wait for DOM if needed
    if (document.body) {
        setTimeout(show, 500); // Small delay to ensure CSS is loaded
    } else {
        document.addEventListener('DOMContentLoaded', () => setTimeout(show, 500));
    }
}

function dismissToast(toast: HTMLElement): void {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease-out';
    setTimeout(() => toast.remove(), 300);
}

/**
 * Force clear ALL app data (for debugging/reset)
 * Clears everything except theme
 */
export function forceResetAllData(): void {
    const keysToKeep = ['theme'];
    const allKeys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToKeep.includes(key)) {
            allKeys.push(key);
        }
    }

    allKeys.forEach(key => localStorage.removeItem(key));
    console.log(`🔥 Cleared ${allKeys.length} items. Reloading...`);

    window.location.reload();
}

// ============================================================
// DEBUG TOOLS - Available in browser console
// ============================================================
if (typeof window !== 'undefined') {
    (window as any).visionCoach = {
        // Show version info
        version: () => {
            const info = {
                currentVersion: CURRENT_VERSION,
                storedVersion: localStorage.getItem(VERSION_KEY),
                buildHash: BUILD_HASH,
                storedBuildHash: localStorage.getItem(BUILD_HASH_KEY),
                lastClear: localStorage.getItem(LAST_CLEAR_KEY)
                    ? new Date(parseInt(localStorage.getItem(LAST_CLEAR_KEY)!)).toLocaleString()
                    : 'never',
            };
            console.table(info);
            return info;
        },

        // List all localStorage keys with sizes
        listKeys: () => {
            const keys: { key: string; size: number; value: string }[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key) {
                    const value = localStorage.getItem(key) || '';
                    keys.push({
                        key,
                        size: value.length,
                        value: value.length > 50 ? value.substring(0, 50) + '...' : value
                    });
                }
            }
            keys.sort((a, b) => b.size - a.size);
            console.table(keys);
            return keys;
        },

        // Clear ALL data and reload
        resetAll: () => {
            if (confirm('Xóa TẤT CẢ dữ liệu và tải lại trang?')) {
                localStorage.clear();
                console.log('🔥 All localStorage cleared. Reloading...');
                window.location.reload();
            }
        },

        // Force trigger migration
        forceMigrate: () => {
            localStorage.removeItem(VERSION_KEY);
            localStorage.removeItem(BUILD_HASH_KEY);
            console.log('🔄 Cleared version markers. Reloading to trigger migration...');
            window.location.reload();
        },

        // Clear cache only (keep auth)
        clearCache: () => {
            const cacheKeys = ['ai_cache', 'cached_reports', 'cached_insights', 'sync_queue'];
            cacheKeys.forEach(key => {
                if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                    console.log(`🧹 Cleared: ${key}`);
                }
            });
            console.log('✅ Cache cleared (auth preserved)');
        },
    };

    // Log available commands on load
    console.log('🛠️ Vision Coach Debug Tools:');
    console.log('   window.visionCoach.version()      - Show version info');
    console.log('   window.visionCoach.listKeys()     - List localStorage');
    console.log('   window.visionCoach.resetAll()     - Clear all & reload');
    console.log('   window.visionCoach.forceMigrate() - Force migration');
    console.log('   window.visionCoach.clearCache()   - Clear cache only');
}
