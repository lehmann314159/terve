import type { HttpContext } from '@adonisjs/core/http'

export default class AuthController {
  async logout({ session, response }: HttpContext) {
    session.clear()
    return response.redirect().toRoute('dashboard')
  }
}