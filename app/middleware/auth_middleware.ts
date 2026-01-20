import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import User from '#models/user'
import FlashcardService from '#services/flashcard_service'

/**
 * Auth middleware - auto-creates and logs in a default user.
 */
export default class AuthMiddleware {
  async handle({ session, auth }: HttpContext, next: NextFn) {
    let userId = session.get('user_id')

    if (!userId) {
      // Find or create default user
      let user = await User.findBy('email', 'default@terve.local')

      if (!user) {
        user = await User.create({
          email: 'default@terve.local',
          name: 'Learner',
          oauthProvider: 'local',
          oauthId: 'default',
          cefrLevel: 'A1',
          preferredStoryLength: 'medium',
        })

        // Initialize flashcards for new user
        const flashcardService = new FlashcardService()
        await flashcardService.initializeNewUserWords(user)
      }

      session.put('user_id', user.id)
      userId = user.id
    }

    // Load user for auth context
    const user = await User.find(userId)
    if (user) {
      auth.user = user
    }

    await next()
  }
}
