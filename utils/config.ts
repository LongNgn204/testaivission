/**
 * ========================================
 * CONFIGURATION MANAGEMENT
 * ========================================
 * Centralized configuration cho dev/staging/prod
 * Tuân thủ 12-factor app principles
 */

export type Environment = 'development' | 'staging' | 'production';

export interface AppConfig {
  env: Environment;
  isDev: boolean;
  isProd: boolean;
  apiUrl: string;
  apiTimeout: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
  auth0?: {
    domain?: string;
    clientId?: string;
    audience?: string;
    enabled: boolean;
  };
  features: {
    enableAnalytics: boolean;
    enableErrorTracking: boolean;
    enablePerformanceMonitoring: boolean;
    enableOfflineMode: boolean;
  };
  limits: {
    maxChatLength: number;
    maxTestDuration: number;
    maxRetries: number;
    rateLimitPerMinute: number;
  };
  cache: {
    enabled: boolean;
    ttl: number; // seconds
  };
}

/**
 * Get environment variable with fallback
 */
function getEnv(key: string, fallback: string = ''): string {
  return import.meta.env[`VITE_${key}`] ?? fallback;
}

/**
 * Determine current environment
 */
function getEnvironment(): Environment {
  const env = getEnv('ENV', 'development');
  if (env === 'staging' || env === 'production') {
    return env;
  }
  return 'development';
}

/**
 * Build configuration based on environment
 */
function buildConfig(): AppConfig {
  const env = getEnvironment();
  const isDev = env === 'development';
  const isProd = env === 'production';

  // Base config
  const baseConfig: AppConfig = {
    env,
    isDev,
    isProd,
    apiUrl: getEnv('API_URL', 'http://localhost:8787'),
    apiTimeout: 30000,
    logLevel: isDev ? 'debug' : 'info',
    auth0: {
      domain: getEnv('AUTH0_DOMAIN', ''),
      clientId: getEnv('AUTH0_CLIENT_ID', ''),
      audience: getEnv('AUTH0_AUDIENCE', ''),
      enabled: Boolean(getEnv('AUTH0_DOMAIN') && getEnv('AUTH0_CLIENT_ID')),
    },
    features: {
      enableAnalytics: !isDev,
      enableErrorTracking: !isDev,
      enablePerformanceMonitoring: !isDev,
      enableOfflineMode: true,
    },
    limits: {
      maxChatLength: 2000,
      maxTestDuration: 600, // 10 minutes
      maxRetries: 3,
      rateLimitPerMinute: 60,
    },
    cache: {
      enabled: true,
      ttl: 3600, // 1 hour
    },
  };

  // Environment-specific overrides
  if (isProd) {
    return {
      ...baseConfig,
      apiTimeout: 20000,
      logLevel: 'warn',
      features: {
        ...baseConfig.features,
        enableAnalytics: true,
        enableErrorTracking: true,
        enablePerformanceMonitoring: true,
      },
      limits: {
        ...baseConfig.limits,
        maxRetries: 2,
        rateLimitPerMinute: 30,
      },
    };
  }

  if (env === 'staging') {
    return {
      ...baseConfig,
      logLevel: 'info',
      features: {
        ...baseConfig.features,
        enableAnalytics: true,
        enableErrorTracking: true,
      },
    };
  }

  return baseConfig;
}

/**
 * Export singleton config instance
 */
export const config = buildConfig();

/**
 * Validate configuration
 */
export function validateConfig(): void {
  if (!config.apiUrl) {
    throw new Error('API_URL is not configured');
  }

  if (config.limits.maxChatLength < 10) {
    throw new Error('maxChatLength must be at least 10');
  }

  if (config.apiTimeout < 1000) {
    throw new Error('apiTimeout must be at least 1000ms');
  }
}

/**
 * Get config value with type safety
 */
export function getConfig<K extends keyof AppConfig>(key: K): AppConfig[K] {
  return config[key];
}

/**
 * Check if feature is enabled
 */
export function isFeatureEnabled(feature: keyof AppConfig['features']): boolean {
  return config.features[feature];
}

/**
 * Log configuration (safe - no secrets)
 */
export function logConfig(): void {
  console.log('[Config]', {
    env: config.env,
    apiUrl: config.apiUrl,
    logLevel: config.logLevel,
    features: config.features,
  });
}

