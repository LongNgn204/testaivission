// Simple Auth0 SPA integration (no React dependency)
// - Initializes Auth0 if env provided
// - Handles redirect callback
// - Stores access_token in localStorage as 'vision_coach_token' for API calls

import createAuth0Client, { Auth0Client, RedirectLoginOptions } from '@auth0/auth0-spa-js';
import { logger } from './logger';
import { config } from './config';

let auth0Client: Auth0Client | null = null;

export async function initAuth0(): Promise<void> {
  if (!config.auth0?.enabled || !config.auth0.domain || !config.auth0.clientId) {
    logger.info('Auth0 disabled or missing config', {}, 'Auth0');
    return;
  }

  try {
    auth0Client = await createAuth0Client({
      domain: config.auth0.domain,
      clientId: config.auth0.clientId,
      cacheLocation: 'localstorage',
      useRefreshTokens: true,
      authorizationParams: {
        audience: config.auth0.audience,
        redirect_uri: window.location.origin + '/#/auth/callback',
      },
    });

    // If returning from Auth0 redirect, handle callback
    if (window.location.hash.includes('code=') && window.location.hash.includes('state=')) {
      await auth0Client.handleRedirectCallback();
      window.location.replace(window.location.origin + '/#/home');
      return;
    }

    // If already authenticated, ensure token is stored
    const isAuth = await auth0Client.isAuthenticated();
    if (isAuth) {
      const token = await auth0Client.getTokenSilently({
        authorizationParams: { audience: config.auth0.audience },
      });
      if (token) localStorage.setItem('vision_coach_token', token);
    }
  } catch (e) {
    logger.warn('Auth0 init failed', { error: String(e) }, 'Auth0');
  }
}

export async function loginWithAuth0(options?: RedirectLoginOptions): Promise<void> {
  if (!auth0Client) await initAuth0();
  if (!auth0Client) throw new Error('Auth0 not initialized');
  await auth0Client.loginWithRedirect(options);
}

export async function logoutAuth0(): Promise<void> {
  if (!auth0Client) return;
  try {
    auth0Client.logout({ logoutParams: { returnTo: window.location.origin + '/#/' } });
  } catch (e) {
    logger.warn('Auth0 logout failed', { error: String(e) }, 'Auth0');
  }
}

export async function refreshAuth0Token(): Promise<string | null> {
  try {
    if (!auth0Client) return null;
    const token = await auth0Client.getTokenSilently({ authorizationParams: { audience: config.auth0?.audience } });
    if (token) localStorage.setItem('vision_coach_token', token);
    return token ?? null;
  } catch (e) {
    logger.warn('Auth0 token refresh failed', { error: String(e) }, 'Auth0');
    return null;
  }
}

