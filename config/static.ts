import { defineConfig } from '@adonisjs/static'

/**
 * Configuration for the static file server
 */
const staticServerConfig = defineConfig({
  /**
   * Enable or disable the static file server
   */
  enabled: true,

  /**
   * Path to the directory to serve static files from
   */
  assetsPath: new URL('../public', import.meta.url),

  /**
   * When the file to serve does not exist, the static
   * middleware will call next to let the remaining
   * middleware handle the request.
   */
  immutable: true,
  maxAge: '30 days',

  /**
   * Etag support
   */
  etag: true,

  /**
   * Headers to set on the response
   */
  headers: (path) => {
    if (path.endsWith('.js') || path.endsWith('.css')) {
      return {
        'cache-control': 'public, max-age=31536000, immutable',
      }
    }
    return {}
  },
})

export default staticServerConfig
