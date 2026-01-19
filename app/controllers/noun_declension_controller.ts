import type { HttpContext } from '@adonisjs/core/http'
import Noun from '#models/noun'

export default class NounDeclensionController {
  async index({ view, auth }: HttpContext) {
    const user = auth.user!
    
    return view.render('noun-declension/index', { 
      cefrLevel: user.cefrLevel 
    })
  }

  async practice({ view, auth, request }: HttpContext) {
    const user = auth.user!
    const caseType = request.input('case', 'random')
    const number = request.input('number', 'random')
    
    // Get a random noun appropriate for user's CEFR level
    const noun = await this.getRandomNoun(user.cefrLevel)
    
    if (!noun) {
      return view.render('noun-declension/no-nouns')
    }
    
    // Generate the exercise
    const exercise = this.generateDeclensionExercise(noun, caseType, number)
    
    return view.render('noun-declension/practice', { 
      exercise,
      noun,
      caseType,
      number
    })
  }

  async check({ response, request }: HttpContext) {
    const { nounId, answer, case: caseType, number } = request.only(['nounId', 'answer', 'case', 'number'])
    
    const noun = await Noun.findOrFail(nounId)
    const correctAnswer = this.getCorrectDeclension(noun, caseType, number)
    
    const isCorrect = answer.toLowerCase().trim() === correctAnswer.toLowerCase()
    
    return response.json({
      correct: isCorrect,
      correctAnswer,
      explanation: this.getDeclensionExplanation(caseType, number)
    })
  }

  async cases({ view }: HttpContext) {
    const cases = this.getAllCases()
    return view.render('noun-declension/cases', { cases })
  }

  private async getRandomNoun(cefrLevel: string) {
    // Get nouns at or below the user's CEFR level
    const levelOrder = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    const maxLevelIndex = levelOrder.indexOf(cefrLevel)
    const allowedLevels = levelOrder.slice(0, maxLevelIndex + 1)
    
    return await Noun.query()
      .whereIn('cefrLevel', allowedLevels)
      .orderByRaw('RANDOM()')
      .first()
  }

  private generateDeclensionExercise(noun: Noun, caseType: string, number: string) {
    const cases = ['nominative', 'genitive', 'partitive', 'illative', 'inessive', 'elative', 'allative', 'adessive', 'ablative']
    const numbers = ['singular', 'plural']
    
    const actualCase = caseType === 'random' ? 
      cases[Math.floor(Math.random() * cases.length)] : caseType
    
    const actualNumber = number === 'random' ? 
      numbers[Math.floor(Math.random() * numbers.length)] : number
    
    return {
      nominative: noun.nominative,
      english: noun.english,
      case: actualCase,
      number: actualNumber,
      prompt: `Decline "${noun.nominative}" (${noun.english}) to ${actualCase} ${actualNumber}:`
    }
  }

  private getCorrectDeclension(noun: Noun, caseType: string, number: string): string {
    const declensionMap = {
      singular: {
        'nominative': noun.nominative,
        'genitive': noun.genitiveSg,
        'partitive': noun.partitiveSg,
        'illative': noun.illativeSg,
        'inessive': noun.inessiveSg,
        'elative': noun.elativeSg,
        'allative': noun.allativeSg,
        'adessive': noun.adessiveSg,
        'ablative': noun.ablativeSg
      },
      plural: {
        'nominative': noun.nominativePl,
        'genitive': noun.genitivePl,
        'partitive': noun.partitivePl,
        'illative': noun.illativePl,
        'inessive': noun.inessivePl,
        'elative': noun.elativePl,
        'allative': noun.allativePl,
        'adessive': noun.adessivePl,
        'ablative': noun.ablativePl
      }
    }
    
    return declensionMap[number]?.[caseType] || ''
  }

  private getDeclensionExplanation(caseType: string, number: string): string {
    const explanations = {
      'nominative': 'The nominative case is the basic form, used for the subject of a sentence.',
      'genitive': 'The genitive case shows possession or is used after numbers and certain prepositions.',
      'partitive': 'The partitive case is used for incomplete amounts, direct objects of negative sentences, and after certain verbs.',
      'illative': 'The illative case indicates motion into something (where to).',
      'inessive': 'The inessive case indicates location inside something (where).',
      'elative': 'The elative case indicates motion out of something (where from).',
      'allative': 'The allative case indicates motion onto a surface (where to).',
      'adessive': 'The adessive case indicates location on a surface (where).',
      'ablative': 'The ablative case indicates motion away from a surface (where from).'
    }
    
    const baseExplanation = explanations[caseType] || 'This is a Finnish grammatical case.'
    const numberNote = number === 'plural' ? ' The plural form adds specific endings.' : ''
    
    return baseExplanation + numberNote
  }

  private getAllCases() {
    return [
      {
        name: 'Nominative',
        finnish: 'Nominatiivi',
        usage: 'Subject of sentence',
        question: 'Mikä? Kuka? (What? Who?)',
        example: 'Kissa juoksee (The cat runs)'
      },
      {
        name: 'Genitive',
        finnish: 'Genetiivi',
        usage: 'Possession, after numbers',
        question: 'Kenen? Minkä? (Whose? What of?)',
        example: 'Kissan häntä (The cat\'s tail)'
      },
      {
        name: 'Partitive',
        finnish: 'Partitiivi',
        usage: 'Incomplete amount, negative object',
        question: 'Mitä? Ketä? (What? Whom?)',
        example: 'Juo maitoa (Drink milk)'
      },
      {
        name: 'Illative',
        finnish: 'Illatiivi',
        usage: 'Motion into',
        question: 'Mihin? Keneen? (Into what? Into whom?)',
        example: 'Menen taloon (I go into the house)'
      },
      {
        name: 'Inessive',
        finnish: 'Inessiivi',
        usage: 'Location inside',
        question: 'Missä? Kenessä? (In what? In whom?)',
        example: 'Olen talossa (I am in the house)'
      },
      {
        name: 'Elative',
        finnish: 'Elatiivi',
        usage: 'Motion out of',
        question: 'Mistä? Kenestä? (Out of what? Out of whom?)',
        example: 'Tulen talosta (I come from the house)'
      },
      {
        name: 'Allative',
        finnish: 'Allatiivi',
        usage: 'Motion onto surface',
        question: 'Mille? Kenelle? (Onto what? To whom?)',
        example: 'Menen pöydälle (I go onto the table)'
      },
      {
        name: 'Adessive',
        finnish: 'Adessiivi',
        usage: 'Location on surface',
        question: 'Millä? Kenellä? (On what? On whom?)',
        example: 'Olen pöydällä (I am on the table)'
      },
      {
        name: 'Ablative',
        finnish: 'Ablatiivi',
        usage: 'Motion from surface',
        question: 'Miltä? Keneltä? (From what? From whom?)',
        example: 'Tulen pöydältä (I come from the table)'
      }
    ]
  }
}
