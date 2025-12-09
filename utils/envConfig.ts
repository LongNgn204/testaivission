/**
 * Environment Configuration Helper
 * 
 * ALL AI FEATURES ARE 100% FREE!
 * - Chat: Cloudflare Workers AI (LLAMA 3.1)
 * - Voice: Browser Web Speech API + Cloudflare AI
 * - Reports: Cloudflare Workers AI
 * 
 * NO API KEYS REQUIRED ON FRONTEND!
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
    console.log('  AI Chat: ✅ Free via Cloudflare Workers AI');
    console.log('  Voice Chat: ✅ Free via Browser Speech API');
    console.log('  AI Reports: ✅ Free via Cloudflare Workers AI');
}

// Log on module load
if (typeof window !== 'undefined') {
    logConfigStatus();
}
