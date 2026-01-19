import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Guest middleware redirects authenticated users away from
 * certain routes like login or register.
 */
export default class GuestMiddleware {
  async handle({ session, response }: HttpContext, next: NextFn) {
    const userId = session.get('user_id')

    if (userId) {
      return response.redirect().toRoute('dashboard')
    }

    await next()
  }
}
