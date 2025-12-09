/**
 * =================================================================
 * 🧹 Data Migration - Clear old cached data on version change
 * =================================================================
 * 
 * Tự động xóa dữ liệu cũ khi có version mới để tránh lỗi
 */

const CURRENT_VERSION = '2.0.0'; // Cloudflare AI version
const VERSION_KEY = 'app_version';

// Keys to clear when upgrading
const OLD_DATA_KEYS = [
    // Old OpenRouter related
    'openrouter_cache',
    'ai_cache',

    // Old auth format
    'saved_accounts_v2', // old format, we use v3 now

    // Potentially corrupted data
    'test_history', // will be re-synced from backend
    'cached_reports',
    'cached_insights',
];

/**
 * Check if we need to migrate data (version changed)
 */
export function checkAndMigrateData(): void {
    try {
        const storedVersion = localStorage.getItem(VERSION_KEY);

        if (storedVersion !== CURRENT_VERSION) {
            console.log(`📦 Version change detected: ${storedVersion || 'none'} → ${CURRENT_VERSION}`);
            console.log('🧹 Clearing old cached data...');

            // Clear old data
            OLD_DATA_KEYS.forEach(key => {
                if (localStorage.getItem(key)) {
                    localStorage.removeItem(key);
                    console.log(`  ✓ Cleared: ${key}`);
                }
            });

            // Update version
            localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
            console.log('✅ Data migration complete');

            // Show notification to user
            showMigrationNotice();
        }
    } catch (error) {
        console.error('Migration error:', error);
    }
}

/**
 * Show a brief notification that data was cleared
 */
function showMigrationNotice(): void {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 left-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in';
    toast.innerHTML = `
    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>
    <span>Đã cập nhật phiên bản mới! Dữ liệu cũ đã được xóa.</span>
  `;

    document.body.appendChild(toast);

    // Remove after 4 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

/**
 * Force clear all app data (for debugging/reset)
 */
export function forceResetAllData(): void {
    const keysToKeep = ['theme']; // Keep theme preference

    const allKeys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && !keysToKeep.includes(key)) {
            allKeys.push(key);
        }
    }

    allKeys.forEach(key => localStorage.removeItem(key));
    console.log('🔄 All app data has been reset');

    // Reload page
    window.location.reload();
}

// Export for manual use in console: window.forceResetAllData = forceResetAllData
if (typeof window !== 'undefined') {
    (window as any).forceResetAllData = forceResetAllData;
}
