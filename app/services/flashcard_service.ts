import User from '#models/user'
import Word from '#models/word'
import UserWord from '#models/user_word'
import { DateTime } from 'luxon'

export default class FlashcardService {
  async getNextCard(user: User, category: string = 'learning') {
    const query = UserWord.query()
      .where('userId', user.id)
      .where('category', category)
      .preload('word')
    
    // For learning category, prioritize cards that need review
    if (category === 'learning') {
      query.where((builder) => {
        builder
          .whereNull('nextReviewAt')
          .orWhere('nextReviewAt', '<=', DateTime.now().toSQL())
      })
    }
    
    // Add some randomization to avoid predictability
    const userWord = await query.orderByRaw('RANDOM()').first()
    
    if (!userWord) {
      return null
    }
    
    return {
      id: userWord.id,
      wordId: userWord.word.id,
      finnish: userWord.word.finnish,
      english: userWord.word.english,
      partOfSpeech: userWord.word.partOfSpeech,
      context: userWord.word.context,
      category: userWord.category,
      masteryPercentage: userWord.masteryPercentage,
      reviewCount: userWord.reviewCount
    }
  }

  async maintainLearningCategorySize(user: User) {
    const learningCount = await UserWord.query()
      .where('userId', user.id)
      .where('category', 'learning')
      .count('* as total')
      .first()
    
    const currentCount = learningCount?.$extras.total || 0
    
    if (currentCount >= 90) {
      return // No need to add words
    }
    
    const wordsToAdd = Math.min(10, 100 - currentCount)
    
    // Get user's recent word additions to determine complexity
    const recentWords = await this.getRecentUserWords(user, 10)
    const targetComplexity = this.calculateTargetComplexity(recentWords)
    
    // Find suitable new words
    const newWords = await this.findSuitableWords(user, wordsToAdd, targetComplexity)
    
    // Add them to learning category
    const userWordsToCreate = newWords.map(word => ({
      userId: user.id,
      wordId: word.id,
      category: 'learning' as const,
      reviewCount: 0,
      correctCount: 0
    }))
    
    await UserWord.createMany(userWordsToCreate)
  }

  private async getRecentUserWords(user: User, limit: number) {
    return UserWord.query()
      .where('userId', user.id)
      .preload('word')
      .orderBy('createdAt', 'desc')
      .limit(limit)
  }

  private calculateTargetComplexity(recentWords: UserWord[]) {
    if (recentWords.length === 0) {
      return { cefrLevel: 'A1', difficulty: 1 }
    }
    
    // Calculate average difficulty and most common CEFR level
    const difficulties = recentWords.map(uw => uw.word.difficulty)
    const cefrLevels = recentWords.map(uw => uw.word.cefrLevel)
    
    const avgDifficulty = difficulties.reduce((sum, d) => sum + d, 0) / difficulties.length
    
    // Find most common CEFR level
    const cefrCounts = cefrLevels.reduce((counts, level) => {
      counts[level] = (counts[level] || 0) + 1
      return counts
    }, {} as Record<string, number>)
    
    const mostCommonCefr = Object.keys(cefrCounts).reduce((a, b) => 
      cefrCounts[a] > cefrCounts[b] ? a : b
    )
    
    return { 
      cefrLevel: mostCommonCefr, 
      difficulty: Math.round(avgDifficulty) 
    }
  }

  private async findSuitableWords(user: User, count: number, targetComplexity: any) {
    // Find words not yet in user's collection
    const existingWordIds = await UserWord.query()
      .where('userId', user.id)
      .select('wordId')
    
    const existingIds = existingWordIds.map(uw => uw.wordId)
    
    // Get words with similar complexity
    return Word.query()
      .whereNotIn('id', existingIds)
      .where('cefrLevel', targetComplexity.cefrLevel)
      .where('difficulty', '>=', Math.max(1, targetComplexity.difficulty - 1))
      .where('difficulty', '<=', Math.min(5, targetComplexity.difficulty + 1))
      .orderBy('commonalityRank', 'asc') // Prefer more common words
      .limit(count)
  }

  async initializeNewUserWords(user: User) {
    // Add 100 basic A1 words to learning category for new users
    const basicWords = await Word.query()
      .where('cefrLevel', 'A1')
      .orderBy('commonalityRank', 'asc')
      .limit(100)
    
    const userWordsToCreate = basicWords.map(word => ({
      userId: user.id,
      wordId: word.id,
      category: 'learning' as const,
      reviewCount: 0,
      correctCount: 0
    }))
    
    await UserWord.createMany(userWordsToCreate)
  }

  async getFlashcardStats(user: User) {
    const stats = await UserWord.query()
      .where('userId', user.id)
      .select('category')
      .count('* as total')
      .groupBy('category')
    
    const result = {
      learning: 0,
      well_known: 0,
      todo: 0,
      not_interested: 0,
      total: 0
    }
    
    stats.forEach(stat => {
      result[stat.category] = Number(stat.$extras.total)
      result.total += Number(stat.$extras.total)
    })
    
    return result
  }

  async getDueForReview(user: User): Promise<number> {
    const due = await UserWord.query()
      .where('userId', user.id)
      .where('category', 'learning')
      .where((builder) => {
        builder
          .whereNull('nextReviewAt')
          .orWhere('nextReviewAt', '<=', DateTime.now().toSQL())
      })
      .count('* as total')
      .first()
    
    return due?.$extras.total || 0
  }
}
