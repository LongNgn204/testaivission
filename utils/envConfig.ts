/**
 * Environment Configuration Helper
 * Simplified - AI is now FREE via Worker API (no keys needed!)
 */

export const ENV_CONFIG = {
    // API Base URL for Worker backend
    API_URL: import.meta.env.VITE_API_URL || 'https://vision-coach-worker.stu725114073.workers.dev',
};

/**
 * Log configuration status (for debugging)
 */
export function logConfigStatus(): void {
    console.log('📋 Environment Configuration Status:');
    console.log(`  API URL: ${ENV_CONFIG.API_URL}`);
    console.log('  AI: ✅ Free via Cloudflare Workers AI');
}

// Log on module load
if (typeof window !== 'undefined') {
    logConfigStatus();
}
