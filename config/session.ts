import env from '#start/env'
import { defineConfig, stores } from '@adonisjs/session'

const sessionConfig = defineConfig({
  /**
   * Make it enabled by default
   */
  enabled: true,

  /**
   * Cookie name for the session id
   */
  cookieName: env.get('SESSION_COOKIE_NAME', 'terve_session'),

  /**
   * Clear session when browser closes
   */
  clearWithBrowser: false,

  /**
   * Session age
   */
  age: '2h',

  /**
   * Cookie settings
   */
  cookie: {
    path: '/',
    httpOnly: true,
    secure: env.get('NODE_ENV') === 'production',
    sameSite: 'lax',
  },

  /**
   * Store to use for saving sessions
   */
  store: env.get('SESSION_DRIVER', 'cookie'),

  /**
   * Available stores
   */
  stores: {
    cookie: stores.cookie(),
  },
})

export default sessionConfig
