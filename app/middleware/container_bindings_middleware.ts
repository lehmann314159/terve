import { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'

/**
 * Container bindings middleware is used to bind the authenticated
 * user to the HTTP context.
 */
export default class ContainerBindingsMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const userId = ctx.session?.get('user_id')

    if (userId) {
      const user = await User.find(userId)
      if (user) {
        ctx.auth = { user, isAuthenticated: true }
      }
    }

    if (!ctx.auth) {
      ctx.auth = { user: null, isAuthenticated: false }
    }

    await next()
  }
}

/**
 * Extend HTTP context with auth property
 */
declare module '@adonisjs/core/http' {
  interface HttpContext {
    auth: {
      user: User | null
      isAuthenticated: boolean
    }
  }
}
