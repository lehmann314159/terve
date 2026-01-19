import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import FlashcardService from '#services/flashcard_service'

export default class AuthController {
  async showLogin({ view }: HttpContext) {
    return view.render('auth/login')
  }

  async redirect({ ally, params }: HttpContext) {
    const provider = params.provider as 'google' | 'github'
    return ally.use(provider).redirect()
  }

  async callback({ ally, params, session, response }: HttpContext) {
    const provider = params.provider as 'google' | 'github'
    const social = ally.use(provider)

    /**
     * User has denied access to their account
     */
    if (social.accessDenied()) {
      return response.redirect().toRoute('auth.login')
    }

    /**
     * OAuth state verification failed
     */
    if (social.stateMisMatch()) {
      return response.redirect().toRoute('auth.login')
    }

    /**
     * There was an unknown error
     */
    if (social.hasError()) {
      return response.redirect().toRoute('auth.login')
    }

    /**
     * Get user info from OAuth provider
     */
    const socialUser = await social.user()

    /**
     * Find or create user
     */
    let user = await User.query()
      .where('oauthProvider', provider)
      .where('oauthId', socialUser.id)
      .first()

    if (!user) {
      // Create new user
      user = await User.create({
        email: socialUser.email!,
        name: socialUser.name || socialUser.email!.split('@')[0],
        oauthProvider: provider,
        oauthId: socialUser.id,
        cefrLevel: 'A1',
        preferredStoryLength: 'medium',
      })

      // Initialize flashcards for new user
      const flashcardService = new FlashcardService()
      await flashcardService.initializeNewUserWords(user)
    }

    /**
     * Store user id in session
     */
    session.put('user_id', user.id)

    return response.redirect().toRoute('dashboard')
  }

  async logout({ session, response }: HttpContext) {
    session.clear()
    return response.redirect().toRoute('auth.login')
  }
}
