import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Auth middleware is used to authenticate the user.
 */
export default class AuthMiddleware {
  async handle({ session, response }: HttpContext, next: NextFn) {
    const userId = session.get('user_id')

    if (!userId) {
      return response.redirect().toRoute('auth.login')
    }

    await next()
  }
}
