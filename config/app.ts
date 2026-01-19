import env from '#start/env'
import { defineConfig } from '@adonisjs/core/http'

/**
 * The app key is used for encrypting cookies, sessions
 * and other sensitive values. Make sure to keep it
 * secure.
 */
export const appKey = env.get('APP_KEY')

/**
 * Configuration for the HTTP server.
 */
export const http = defineConfig({
  /**
   * Generate request IDs for logging and debugging
   */
  generateRequestId: true,

  /**
   * Trusted proxy settings for load balancers
   */
  allowMethodSpoofing: false,
  trustProxy: () => true,

  /**
   * Maximum request body size. Make sure to use
   * the unit suffix.
   */
  maxRequestBodySize: '10mb',

  /**
   * Configure the behavior of the error handler
   */
  useAsyncLocalStorage: true,

  /**
   * Cookie configuration
   */
  cookie: {
    domain: '',
    path: '/',
    maxAge: '2h',
    httpOnly: true,
    secure: env.get('NODE_ENV') === 'production',
    sameSite: 'lax',
  },
})
