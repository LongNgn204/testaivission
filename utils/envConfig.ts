/**
 * Environment Configuration Helper
 * Centralized place to check and validate API keys
 */

export const ENV_CONFIG = {
    // OpenRouter API Key for AI Reports, Chat, Dashboard
    OPENROUTER_API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY || '',

    // Optional: override model via .env
    OPENROUTER_MODEL: import.meta.env.VITE_OPENROUTER_MODEL || 'amazon/nova-2-lite-v1:free',

    // Optional: default temperature
    OPENROUTER_TEMPERATURE: Number(import.meta.env.VITE_OPENROUTER_TEMPERATURE ?? '0.3'),
    
    // Google Gemini API Key for Voice Chat
    GEMINI_API_KEY: import.meta.env.VITE_GEMINI_API_KEY || '',
    
    // API Base URL
    API_URL: import.meta.env.VITE_API_URL || 'https://vision-coach-worker.stu725114073.workers.dev',
};

/**
 * Check if OpenRouter API Key is configured
 */
export function hasOpenRouterKey(): boolean {
    const key = ENV_CONFIG.OPENROUTER_API_KEY;
    return !!key && key.length > 10 && !key.includes('YOUR_KEY');
}

/**
 * Check if Gemini API Key is configured
 */
export function hasGeminiKey(): boolean {
    const key = ENV_CONFIG.GEMINI_API_KEY;
    return !!key && key.length > 10 && !key.includes('YOUR_KEY');
}

/**
 * Get OpenRouter API Key with validation
 */
export function getOpenRouterKey(): string {
    const key = ENV_CONFIG.OPENROUTER_API_KEY;
    if (!key || key.length < 10) {
        console.error('❌ VITE_OPENROUTER_API_KEY not configured in .env');
        throw new Error('OpenRouter API key not configured. Add VITE_OPENROUTER_API_KEY to .env');
    }
    return key;
}

/**
 * Get Gemini API Key with validation
 */
export function getGeminiKey(): string {
    const key = ENV_CONFIG.GEMINI_API_KEY;
    if (!key || key.length < 10) {
        console.error('❌ VITE_GEMINI_API_KEY not configured in .env');
        throw new Error('Gemini API key not configured. Add VITE_GEMINI_API_KEY to .env');
    }
    return key;
}

/**
 * Log configuration status (for debugging)
 */
export function logConfigStatus(): void {
    console.log('📋 Environment Configuration Status:');
    console.log(`  OpenRouter Key: ${hasOpenRouterKey() ? '✅ Configured' : '❌ Missing'}`);
    console.log(`  Gemini Key: ${hasGeminiKey() ? '✅ Configured' : '❌ Missing'}`);
    console.log(`  API URL: ${ENV_CONFIG.API_URL}`);
}

// Log on module load
if (typeof window !== 'undefined') {
    logConfigStatus();
}

