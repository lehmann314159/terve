import type { HttpContext } from '@adonisjs/core/http'
import Verb from '#models/verb'

export default class VerbConjugationController {
  async index({ view, auth }: HttpContext) {
    const user = auth.user!
    
    return view.render('verb-conjugation/index', { 
      cefrLevel: user.cefrLevel 
    })
  }

  async practice({ view, auth, request }: HttpContext) {
    const user = auth.user!
    const tense = request.input('tense', 'present')
    const person = request.input('person', 'random')
    
    // Get a random verb appropriate for user's CEFR level
    const verb = await this.getRandomVerb(user.cefrLevel)
    
    if (!verb) {
      return view.render('verb-conjugation/no-verbs')
    }
    
    // Generate the exercise
    const exercise = this.generateConjugationExercise(verb, tense, person)
    
    return view.render('verb-conjugation/practice', { 
      exercise,
      verb,
      tense,
      person
    })
  }

  async check({ response, request }: HttpContext) {
    const { verbId, answer, tense, person } = request.only(['verbId', 'answer', 'tense', 'person'])
    
    const verb = await Verb.findOrFail(verbId)
    const correctAnswer = this.getCorrectConjugation(verb, tense, person)
    
    const isCorrect = answer.toLowerCase().trim() === correctAnswer.toLowerCase()
    
    return response.json({
      correct: isCorrect,
      correctAnswer,
      explanation: this.getConjugationExplanation(verb, tense, person)
    })
  }

  async levels({ view }: HttpContext) {
    return view.render('verb-conjugation/levels')
  }

  private async getRandomVerb(cefrLevel: string) {
    // Get verbs at or below the user's CEFR level
    const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    const maxLevelIndex = levelOrder.indexOf(cefrLevel)
    const allowedLevels = levelOrder.slice(0, maxLevelIndex + 1)
    
    return await Verb.query()
      .whereIn('cefrLevel', allowedLevels)
      .orderByRaw('RANDOM()')
      .first()
  }

  private generateConjugationExercise(verb: Verb, tense: string, person: string) {
    const persons = ['minä', 'sinä', 'hän', 'me', 'te', 'he']
    const tenses = ['present', 'past', 'conditional']
    
    const actualPerson = person === 'random' ? 
      persons[Math.floor(Math.random() * persons.length)] : person
    
    const actualTense = tense === 'random' ? 
      tenses[Math.floor(Math.random() * tenses.length)] : tense
    
    return {
      infinitive: verb.infinitive,
      english: verb.english,
      person: actualPerson,
      tense: actualTense,
      verbType: verb.verbType,
      prompt: `Conjugate "${verb.infinitive}" (${verb.english}) for "${actualPerson}" in ${actualTense} tense:`
    }
  }

  private getCorrectConjugation(verb: Verb, tense: string, person: string): string {
    const conjugationMap = {
      present: {
        'minä': verb.presentMina,
        'sinä': verb.presentSina,
        'hän': verb.presentHan,
        'me': verb.presentMe,
        'te': verb.presentTe,
        'he': verb.presentHe
      },
      past: {
        'minä': verb.pastMina,
        'sinä': verb.pastSina,
        'hän': verb.pastHan,
        'me': verb.pastMe,
        'te': verb.pastTe,
        'he': verb.pastHe
      },
      conditional: {
        'minä': verb.conditionalMina,
        'sinä': verb.conditionalSina,
        'hän': verb.conditionalHan,
        'me': verb.conditionalMe,
        'te': verb.conditionalTe,
        'he': verb.conditionalHe
      }
    }
    
    return conjugationMap[tense]?.[person] || ''
  }

  private getConjugationExplanation(verb: Verb, tense: string, person: string): string {
    const explanations = {
      present: {
        'minä': `For type ${verb.verbType} verbs, the first person singular present form follows the pattern...`,
        'sinä': `The second person singular adds -t to the stem...`,
        'hän': `Third person singular uses the basic stem form...`,
        'me': `First person plural adds -mme...`,
        'te': `Second person plural adds -tte...`,
        'he': `Third person plural adds -vat/-vät...`
      },
      past: {
        'minä': `Past tense first person adds -in...`,
        'sinä': `Past tense second person adds -it...`,
        'hän': `Past tense third person adds -i...`,
        'me': `Past tense first person plural adds -imme...`,
        'te': `Past tense second person plural adds -itte...`,
        'he': `Past tense third person plural adds -ivat/-ivät...`
      },
      conditional: {
        'minä': `Conditional first person adds -isin...`,
        'sinä': `Conditional second person adds -isit...`,
        'hän': `Conditional third person adds -isi...`,
        'me': `Conditional first person plural adds -isimme...`,
        'te': `Conditional second person plural adds -isitte...`,
        'he': `Conditional third person plural adds -isivat/-isivät...`
      }
    }
    
    return explanations[tense]?.[person] || 'Conjugation follows standard Finnish verb patterns.'
  }
}
