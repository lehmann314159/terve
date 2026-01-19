interface ExamQuestion {
  id: number
  type: 'multiple_choice' | 'fill_blank' | 'matching' | 'true_false'
  section: 'grammar' | 'vocabulary' | 'reading' | 'listening'
  difficulty: string
  question: string
  options?: string[]
  correct: any
  explanation: string
  points: number
}

interface Exam {
  id: string
  targetLevel: string
  questions: ExamQuestion[]
  timeLimit: number // minutes
  sections: string[]
}

interface ExamResult {
  score: number
  maxScore: number
  correct: number
  total: number
  sectionScores: Record<string, { score: number, maxScore: number }>
  feedback: any[]
}

export default class ExamService {
  private sectionWeights = {
    grammar: 0.3,
    vocabulary: 0.25,
    reading: 0.25,
    listening: 0.2
  }

  private timeLimits = {
    'A1': 45,
    'A2': 60,
    'B1': 75,
    'B2': 90,
    'C1': 105,
    'C2': 120
  }

  async generateExam(targetLevel: string): Promise<Exam> {
    const examId = this.generateExamId()
    const questions = await this.generateQuestions(targetLevel)
    
    return {
      id: examId,
      targetLevel,
      questions,
      timeLimit: this.timeLimits[targetLevel] || 60,
      sections: ['grammar', 'vocabulary', 'reading', 'listening']
    }
  }

  async gradeExam(examId: string, answers: Record<string, any>): Promise<ExamResult> {
    // In production, you'd fetch the exam from database/cache
    // For now, we'll simulate grading
    
    const questions = await this.getExamQuestions(examId)
    let totalScore = 0
    let maxScore = 0
    let correctAnswers = 0
    const sectionScores = {}
    const feedback = []

    for (const question of questions) {
      const userAnswer = answers[question.id.toString()]
      const isCorrect = this.checkAnswer(question, userAnswer)
      
      if (isCorrect) {
        totalScore += question.points
        correctAnswers++
      }
      maxScore += question.points
      
      // Track section scores
      if (!sectionScores[question.section]) {
        sectionScores[question.section] = { score: 0, maxScore: 0 }
      }
      
      if (isCorrect) {
        sectionScores[question.section].score += question.points
      }
      sectionScores[question.section].maxScore += question.points
      
      feedback.push({
        questionId: question.id,
        correct: isCorrect,
        userAnswer,
        correctAnswer: question.correct,
        explanation: question.explanation
      })
    }

    return {
      score: totalScore,
      maxScore,
      correct: correctAnswers,
      total: questions.length,
      sectionScores,
      feedback
    }
  }

  private async generateQuestions(targetLevel: string): Promise<ExamQuestion[]> {
    const questions: ExamQuestion[] = []
    let questionId = 1

    // Grammar questions (30%)
    const grammarQuestions = await this.generateGrammarQuestions(targetLevel, 15)
    grammarQuestions.forEach(q => {
      q.id = questionId++
      questions.push(q)
    })

    // Vocabulary questions (25%)
    const vocabularyQuestions = await this.generateVocabularyQuestions(targetLevel, 12)
    vocabularyQuestions.forEach(q => {
      q.id = questionId++
      questions.push(q)
    })

    // Reading questions (25%)
    const readingQuestions = await this.generateReadingQuestions(targetLevel, 12)
    readingQuestions.forEach(q => {
      q.id = questionId++
      questions.push(q)
    })

    // Listening questions (20%) - simplified for this demo
    const listeningQuestions = await this.generateListeningQuestions(targetLevel, 10)
    listeningQuestions.forEach(q => {
      q.id = questionId++
      questions.push(q)
    })

    return questions
  }

  private async generateGrammarQuestions(level: string, count: number): Promise<ExamQuestion[]> {
    const grammarTopics = this.getGrammarTopics(level)
    const questions: ExamQuestion[] = []

    for (let i = 0; i < count; i++) {
      const topic = grammarTopics[i % grammarTopics.length]
      questions.push(this.createGrammarQuestion(topic, level))
    }

    return questions
  }

  private async generateVocabularyQuestions(level: string, count: number): Promise<ExamQuestion[]> {
    const questions: ExamQuestion[] = []
    
    for (let i = 0; i < count; i++) {
      questions.push(this.createVocabularyQuestion(level))
    }

    return questions
  }

  private async generateReadingQuestions(level: string, count: number): Promise<ExamQuestion[]> {
    const questions: ExamQuestion[] = []
    
    // Create reading passages and questions
    const passages = this.getReadingPassages(level)
    
    passages.forEach((passage, index) => {
      const passageQuestions = this.createReadingQuestionsForPassage(passage, level)
      questions.push(...passageQuestions.slice(0, Math.ceil(count / passages.length)))
    })

    return questions.slice(0, count)
  }

  private async generateListeningQuestions(level: string, count: number): Promise<ExamQuestion[]> {
    // Simplified listening questions - in production would have audio files
    const questions: ExamQuestion[] = []
    
    for (let i = 0; i < count; i++) {
      questions.push({
        id: 0, // Will be set later
        type: 'multiple_choice',
        section: 'listening',
        difficulty: level,
        question: `Kuuntele äänitiedosto ${i + 1} ja vastaa: Mistä puhuja keskustelee?`,
        options: ['Työstä', 'Perheestä', 'Matkustamisesta', 'Ruoasta'],
        correct: i % 4,
        explanation: 'Kuuntele tarkasti avainsanoja.',
        points: 2
      })
    }

    return questions
  }

  private getGrammarTopics(level: string): string[] {
    const topics = {
      'A1': ['present_tense', 'basic_cases', 'pronouns', 'numbers'],
      'A2': ['past_tense', 'partitive', 'possessive', 'object_cases'],
      'B1': ['conditional', 'passive', 'participles', 'local_cases'],
      'B2': ['potential_mood', 'temporal_cases', 'advanced_participles'],
      'C1': ['subjunctive', 'complex_sentences', 'stylistic_variation'],
      'C2': ['archaic_forms', 'dialectal_features', 'literary_language']
    }
    
    return topics[level] || topics['A1']
  }

  private createGrammarQuestion(topic: string, level: string): ExamQuestion {
    const questions = {
      'present_tense': {
        question: 'Valitse oikea muoto: "Hän _____ koulussa."',
        options: ['on', 'ovat', 'olet', 'olen'],
        correct: 0,
        explanation: 'Kolmas persoona yksikkö: "hän on"'
      },
      'past_tense': {
        question: 'Valitse oikea muoto: "Eilen me _____ elokuvissa."',
        options: ['kävin', 'kävimme', 'kävit', 'kävivät'],
        correct: 1,
        explanation: 'Ensimmäinen persoona monikko imperfektissä: "me kävimme"'
      },
      'conditional': {
        question: 'Täydennä lause: "Jos minulla _____ aikaa, matkustaisin Lappiin."',
        options: ['on', 'oli', 'olisi', 'ole'],
        correct: 2,
        explanation: 'Konditionaali: "Jos minulla olisi aikaa..."'
      }
    }

    const template = questions[topic] || questions['present_tense']
    
    return {
      id: 0,
      type: 'multiple_choice',
      section: 'grammar',
      difficulty: level,
      question: template.question,
      options: template.options,
      correct: template.correct,
      explanation: template.explanation,
      points: 2
    }
  }

  private createVocabularyQuestion(level: string): ExamQuestion {
    const vocabularyQuestions = [
      {
        question: 'Mikä sana tarkoittaa "kirja" englanniksi?',
        options: ['book', 'table', 'chair', 'pen'],
        correct: 0,
        explanation: '"Kirja" on "book" englanniksi.'
      },
      {
        question: 'Valitse oikea sana: "Haluan _____ kahvia."',
        options: ['juoda', 'syödä', 'lukea', 'kirjoittaa'],
        correct: 0,
        explanation: 'Kahvia juodaan, ei syödä.'
      }
    ]

    const template = vocabularyQuestions[Math.floor(Math.random() * vocabularyQuestions.length)]
    
    return {
      id: 0,
      type: 'multiple_choice',
      section: 'vocabulary',
      difficulty: level,
      question: template.question,
      options: template.options,
      correct: template.correct,
      explanation: template.explanation,
      points: 1
    }
  }

  private getReadingPassages(level: string) {
    const passages = {
      'A1': [{
        text: 'Hei! Minun nimeni on Anna. Olen 25-vuotias ja asun Helsingissä. Työskentelen kaupassa. Vapaa-ajallani pidän lukemisesta ja uinnista.',
        title: 'Esittely'
      }],
      'A2': [{
        text: 'Viime viikonloppuna kävin ystäväni kanssa museossa. Näimme siellä mielenkiintoisen näyttelyn suomalaisesta taiteesta. Museo oli täynnä ihmisiä, mutta saimme rauhassa katsella tauluja.',
        title: 'Museovierailu'
      }],
      'B1': [{
        text: 'Ilmastonmuutos on yksi aikamme suurimmista haasteista. Meidän kaikkien tulisi miettiä, miten voimme omilla toimillaamme vähentää hiilijalanjälkeämme. Pienet teot, kuten julkisten kulkuneuvojen käyttäminen, voivat yhdessä tehdä ison eron.',
        title: 'Ympäristöajattelu'
      }]
    }

    return passages[level] || passages['A1']
  }

  private createReadingQuestionsForPassage(passage: any, level: string): ExamQuestion[] {
    // Create 2-3 questions per passage
    return [
      {
        id: 0,
        type: 'multiple_choice' as const,
        section: 'reading' as const,
        difficulty: level,
        question: 'Mikä on tekstin pääajatus?',
        options: ['Henkilökohtainen tarina', 'Ohjeita', 'Mielipide', 'Uutinen'],
        correct: 0,
        explanation: 'Teksti kertoo henkilökohtaisen tarinan.',
        points: 3
      },
      {
        id: 0,
        type: 'true_false' as const,
        section: 'reading' as const,
        difficulty: level,
        question: 'Tekstissä mainitaan konkreettisia esimerkkejä.',
        correct: true,
        explanation: 'Tekstissä on useita konkreettisia esimerkkejä.',
        points: 2
      }
    ]
  }

  private checkAnswer(question: ExamQuestion, userAnswer: any): boolean {
    if (question.type === 'multiple_choice') {
      return parseInt(userAnswer) === question.correct
    } else if (question.type === 'true_false') {
      return (userAnswer === 'true') === question.correct
    } else if (question.type === 'fill_blank') {
      const correct = question.correct.toLowerCase().trim()
      const user = (userAnswer || '').toLowerCase().trim()
      return correct === user
    }
    
    return false
  }

  private async getExamQuestions(examId: string): Promise<ExamQuestion[]> {
    // In production, fetch from database
    // For now, return sample questions
    return []
  }

  private generateExamId(): string {
    return 'exam_' + Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}
