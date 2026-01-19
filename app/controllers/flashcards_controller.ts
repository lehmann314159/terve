import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Word from '#models/word'
import UserWord from '#models/user_word'
import FlashcardService from '#services/flashcard_service'

export default class FlashcardsController {
  async index({ view, auth }: HttpContext) {
    const user = auth.user!
    
    // Get user's flashcard statistics
    const stats = await this.getFlashcardStats(user)
    
    return view.render('flashcards/index', { stats })
  }

  async practice({ view, auth, request }: HttpContext) {
    const user = auth.user!
    const category = request.input('category', 'learning')
    
    // Get next card for practice
    const flashcardService = new FlashcardService()
    const card = await flashcardService.getNextCard(user, category)
    
    if (!card) {
      return view.render('flashcards/no-cards', { category })
    }
    
    return view.render('flashcards/practice', { card, category })
  }

  async answer({ response, auth, request }: HttpContext) {
    const user = auth.user!
    const { wordId, correct } = request.only(['wordId', 'correct'])
    
    // Update user word statistics
    const userWord = await UserWord.query()
      .where('userId', user.id)
      .where('wordId', wordId)
      .firstOrFail()
    
    userWord.reviewCount += 1
    if (correct) {
      userWord.correctCount += 1
    }
    userWord.lastReviewedAt = new Date()
    
    // Simple spaced repetition: next review based on success rate
    const masteryRate = userWord.correctCount / userWord.reviewCount
    const hoursUntilNext = masteryRate > 0.8 ? 24 : masteryRate > 0.6 ? 12 : 4
    userWord.nextReviewAt = new Date(Date.now() + hoursUntilNext * 60 * 60 * 1000)
    
    await userWord.save()
    
    return response.json({ success: true, mastery: userWord.masteryPercentage })
  }

  async moveCategory({ response, auth, request }: HttpContext) {
    const user = auth.user!
    const { wordId, newCategory } = request.only(['wordId', 'newCategory'])
    
    const userWord = await UserWord.query()
      .where('userId', user.id)
      .where('wordId', wordId)
      .firstOrFail()
    
    const oldCategory = userWord.category
    userWord.category = newCategory
    await userWord.save()
    
    // If moving out of learning category, might need to add new words
    if (oldCategory === 'learning' && newCategory !== 'learning') {
      const flashcardService = new FlashcardService()
      await flashcardService.maintainLearningCategorySize(user)
    }
    
    return response.json({ success: true })
  }

  async addWord({ response, auth, request }: HttpContext) {
    const user = auth.user!
    const { wordId } = request.only(['wordId'])
    
    // Check if user already has this word
    const existingUserWord = await UserWord.query()
      .where('userId', user.id)
      .where('wordId', wordId)
      .first()
    
    if (existingUserWord) {
      return response.json({ success: false, message: 'Word already in your collection' })
    }
    
    // Add to learning category
    await UserWord.create({
      userId: user.id,
      wordId: wordId,
      category: 'learning',
      reviewCount: 0,
      correctCount: 0
    })
    
    return response.json({ success: true })
  }

  private async getFlashcardStats(user: User) {
    const stats = await UserWord.query()
      .where('userId', user.id)
      .select('category')
      .count('* as total')
      .groupBy('category')
    
    const result = {
      learning: 0,
      well_known: 0,
      todo: 0,
      not_interested: 0
    }
    
    stats.forEach(stat => {
      result[stat.category] = stat.$extras.total
    })
    
    return result
  }
}
