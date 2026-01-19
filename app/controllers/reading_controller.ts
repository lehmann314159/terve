import type { HttpContext } from '@adonisjs/core/http'
import ReadingService from '#services/reading_service'
import UserWord from '#models/user_word'
import Word from '#models/word'

export default class ReadingController {
  async index({ view, auth }: HttpContext) {
    const user = auth.user!
    
    return view.render('reading/index', { 
      cefrLevel: user.cefrLevel,
      preferredLength: user.preferredStoryLength || 'medium'
    })
  }

  async generate({ view, auth, request }: HttpContext) {
    const user = auth.user!
    const { length, keywords } = request.only(['length', 'keywords'])
    
    // Parse keywords (comma-separated string to array)
    const keywordArray = keywords ? 
      keywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 0) : 
      []
    
    if (keywordArray.length > 3) {
      return view.render('reading/index', {
        error: 'Please provide maximum 3 keywords',
        cefrLevel: user.cefrLevel,
        preferredLength: user.preferredStoryLength || 'medium'
      })
    }
    
    try {
      const readingService = new ReadingService()
      const story = await readingService.generateStory({
        cefrLevel: user.cefrLevel,
        length: length || 'medium',
        keywords: keywordArray
      })
      
      // Extract vocabulary for potential flashcard addition
      const vocabulary = await this.extractVocabulary(story.content, user)
      
      return view.render('reading/story', {
        story,
        vocabulary,
        keywords: keywordArray
      })
      
    } catch (error) {
      return view.render('reading/index', {
        error: 'Failed to generate story. Please try again.',
        cefrLevel: user.cefrLevel,
        preferredLength: user.preferredStoryLength || 'medium'
      })
    }
  }

  async comprehension({ view, request }: HttpContext) {
    const { storyId } = request.params()
    
    // In a real implementation, you'd fetch the story and generate comprehension questions
    // For now, we'll create sample questions
    const questions = [
      {
        id: 1,
        type: 'multiple_choice',
        question: 'Mikä oli päähenkilön nimi?',
        options: ['Aino', 'Liisa', 'Marja', 'Elina'],
        correct: 0
      },
      {
        id: 2,
        type: 'true_false',
        question: 'Tarina tapahtui kesällä.',
        correct: true
      },
      {
        id: 3,
        type: 'open_ended',
        question: 'Kuvaile päähenkilön tunnelmaa tarinan lopussa.'
      }
    ]
    
    return view.render('reading/comprehension', { questions, storyId })
  }

  async checkComprehension({ response, request }: HttpContext) {
    const { answers, storyId } = request.only(['answers', 'storyId'])
    
    // Simple scoring logic - in production this would be more sophisticated
    let correct = 0
    let total = 0
    
    const feedback = []
    
    // Mock scoring - replace with actual question data
    if (answers['1'] === '0') correct++
    if (answers['2'] === 'true') correct++
    total = 3 // Including open-ended
    
    feedback.push({
      question: 1,
      correct: answers['1'] === '0',
      explanation: 'Correct! The main character was indeed Aino.'
    })
    
    feedback.push({
      question: 2,
      correct: answers['2'] === 'true',
      explanation: 'The story mentioned it was summer several times.'
    })
    
    return response.json({
      score: Math.round((correct / total) * 100),
      correct,
      total,
      feedback
    })
  }

  async addToFlashcards({ response, auth, request }: HttpContext) {
    const user = auth.user!
    const { wordId } = request.only(['wordId'])
    
    // Check if word already exists in user's collection
    const existingUserWord = await UserWord.query()
      .where('userId', user.id)
      .where('wordId', wordId)
      .first()
    
    if (existingUserWord) {
      return response.json({ 
        success: false, 
        message: 'Word already in your flashcards' 
      })
    }
    
    // Add to learning category
    await UserWord.create({
      userId: user.id,
      wordId: wordId,
      category: 'learning',
      reviewCount: 0,
      correctCount: 0
    })
    
    return response.json({ 
      success: true, 
      message: 'Word added to your learning flashcards!' 
    })
  }

  private async extractVocabulary(content: string, user: any) {
    // Simple vocabulary extraction - in production this would use NLP
    const words = content.toLowerCase()
      .replace(/[^\w\säöüé]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
    
    // Get unique words and find them in database
    const uniqueWords = [...new Set(words)]
    
    const vocabulary = await Word.query()
      .whereIn('finnish', uniqueWords)
      .whereNotIn('id', (query) => {
        query.select('wordId').from('user_words').where('userId', user.id)
      })
      .limit(10) // Limit to avoid overwhelming the user
    
    return vocabulary
  }
}
