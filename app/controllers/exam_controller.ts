import type { HttpContext } from '@adonisjs/core/http'
import ExamResult from '#models/exam_result'
import ExamService from '#services/exam_service'

export default class ExamController {
  async index({ view, auth }: HttpContext) {
    const user = auth.user!
    
    // Get user's recent exam results
    const recentResults = await ExamResult.query()
      .where('userId', user.id)
      .orderBy('createdAt', 'desc')
      .limit(5)
    
    // Calculate average scores by level
    const averageScores = await this.calculateAverageScores(user.id)
    
    return view.render('exams/index', { 
      recentResults,
      averageScores,
      currentLevel: user.cefrLevel
    })
  }

  async start({ view, request }: HttpContext) {
    const targetLevel = request.input('level', 'A1')
    
    return view.render('exams/start', { 
      targetLevel,
      levelInfo: this.getLevelInfo(targetLevel)
    })
  }

  async begin({ response, auth, request }: HttpContext) {
    const user = auth.user!
    const targetLevel = request.input('level', 'A1')
    
    try {
      const examService = new ExamService()
      const exam = await examService.generateExam(targetLevel)
      
      // Store exam start time in session
      const session = request.session()
      session.put('exam_start_time', Date.now())
      session.put('exam_target_level', targetLevel)
      
      return response.json({
        success: true,
        examId: exam.id,
        questions: exam.questions,
        timeLimit: exam.timeLimit
      })
      
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to generate exam'
      })
    }
  }

  async submit({ response, auth, request }: HttpContext) {
    const user = auth.user!
    const { answers, examId } = request.only(['answers', 'examId'])
    
    const session = request.session()
    const startTime = session.get('exam_start_time')
    const targetLevel = session.get('exam_target_level')
    
    if (!startTime || !targetLevel) {
      return response.status(400).json({
        success: false,
        message: 'Invalid exam session'
      })
    }
    
    const timeSpentMinutes = Math.round((Date.now() - startTime) / (1000 * 60))
    
    try {
      const examService = new ExamService()
      const result = await examService.gradeExam(examId, answers)
      
      // Save result to database
      const examResult = await ExamResult.create({
        userId: user.id,
        examType: 'mock_cefr',
        targetLevel,
        score: result.score,
        maxScore: result.maxScore,
        questionsCorrect: result.correct,
        totalQuestions: result.total,
        timeSpentMinutes,
        sections: JSON.stringify(result.sectionScores)
      })
      
      // Clear session
      session.forget(['exam_start_time', 'exam_target_level'])
      
      return response.json({
        success: true,
        result: {
          ...result,
          id: examResult.id,
          timeSpent: timeSpentMinutes,
          passed: examResult.passed
        }
      })
      
    } catch (error) {
      return response.status(500).json({
        success: false,
        message: 'Failed to grade exam'
      })
    }
  }

  async result({ view, request }: HttpContext) {
    const { id } = request.params()
    
    const result = await ExamResult.findOrFail(id)
    await result.load('user')
    
    return view.render('exams/result', { 
      result,
      sectionScores: result.sectionScores
    })
  }

  async history({ view, auth }: HttpContext) {
    const user = auth.user!
    
    const results = await ExamResult.query()
      .where('userId', user.id)
      .orderBy('createdAt', 'desc')
      .paginate(1, 20)
    
    return view.render('exams/history', { results })
  }

  async stats({ response, auth }: HttpContext) {
    const user = auth.user!
    
    const stats = await this.calculateDetailedStats(user.id)
    
    return response.json(stats)
  }

  private getLevelInfo(level: string) {
    const levelInfo = {
      'A1': {
        name: 'Beginner',
        description: 'Can understand and use familiar everyday expressions and very basic phrases.',
        skills: ['Basic greetings', 'Simple present tense', 'Numbers and time', 'Family and personal info']
      },
      'A2': {
        name: 'Elementary',
        description: 'Can communicate in simple routine tasks requiring direct exchange of information.',
        skills: ['Past tense', 'Future expressions', 'Shopping and services', 'Describing experiences']
      },
      'B1': {
        name: 'Intermediate',
        description: 'Can deal with most situations likely to arise whilst travelling in Finland.',
        skills: ['Complex sentences', 'Expressing opinions', 'Conditional mood', 'Abstract topics']
      },
      'B2': {
        name: 'Upper Intermediate',
        description: 'Can interact with native speakers with fluency and spontaneity.',
        skills: ['Advanced grammar', 'Nuanced expressions', 'Professional communication', 'Complex texts']
      },
      'C1': {
        name: 'Advanced',
        description: 'Can express ideas fluently and spontaneously without searching for expressions.',
        skills: ['Subtle language use', 'Academic writing', 'Professional contexts', 'Cultural references']
      },
      'C2': {
        name: 'Proficient',
        description: 'Can understand virtually everything heard or read with ease.',
        skills: ['Native-like fluency', 'Complex literature', 'Specialized topics', 'Perfect accuracy']
      }
    }
    
    return levelInfo[level] || levelInfo['A1']
  }

  private async calculateAverageScores(userId: number) {
    const results = await ExamResult.query()
      .where('userId', userId)
      .select('targetLevel')
      .avg('score as avgScore')
      .count('* as attempts')
      .groupBy('targetLevel')
    
    const averages = {}
    results.forEach(result => {
      averages[result.targetLevel] = {
        average: Math.round(result.$extras.avgScore),
        attempts: result.$extras.attempts
      }
    })
    
    return averages
  }

  private async calculateDetailedStats(userId: number) {
    const allResults = await ExamResult.query()
      .where('userId', userId)
      .orderBy('createdAt', 'desc')
    
    const totalExams = allResults.length
    const averageScore = totalExams > 0 ? 
      Math.round(allResults.reduce((sum, result) => sum + result.percentage, 0) / totalExams) : 0
    
    const levelProgress = {}
    const recentTrend = allResults.slice(0, 5).reverse()
    
    allResults.forEach(result => {
      if (!levelProgress[result.targetLevel]) {
        levelProgress[result.targetLevel] = {
          attempts: 0,
          bestScore: 0,
          averageScore: 0,
          passed: 0
        }
      }
      
      const level = levelProgress[result.targetLevel]
      level.attempts++
      level.bestScore = Math.max(level.bestScore, result.percentage)
      if (result.passed) level.passed++
    })
    
    // Calculate averages for each level
    Object.keys(levelProgress).forEach(level => {
      const levelResults = allResults.filter(r => r.targetLevel === level)
      levelProgress[level].averageScore = Math.round(
        levelResults.reduce((sum, r) => sum + r.percentage, 0) / levelResults.length
      )
    })
    
    return {
      totalExams,
      averageScore,
      levelProgress,
      recentTrend: recentTrend.map(r => ({
        date: r.createdAt.toFormat('yyyy-MM-dd'),
        score: r.percentage,
        level: r.targetLevel
      }))
    }
  }
}
