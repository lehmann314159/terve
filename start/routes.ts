/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

const FlashcardsController = () => import('#controllers/flashcards_controller')
const VerbConjugationController = () => import('#controllers/verb_conjugation_controller')
const NounDeclensionController = () => import('#controllers/noun_declension_controller')
const ReadingController = () => import('#controllers/reading_controller')
const ExamController = () => import('#controllers/exam_controller')
const AuthController = () => import('#controllers/auth_controller')

/*
|--------------------------------------------------------------------------
| Health Check
|--------------------------------------------------------------------------
*/
router.get('/health', async ({ response }) => {
  return response.json({ status: 'ok', timestamp: new Date().toISOString() })
})

/*
|--------------------------------------------------------------------------
| Home
|--------------------------------------------------------------------------
*/
router.get('/', async ({ view }) => {
  return view.render('welcome')
})

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
*/
router.group(() => {
  router.get('/login', [AuthController, 'showLogin']).as('auth.login')
  router.get('/logout', [AuthController, 'logout']).as('auth.logout')

  // OAuth routes
  router.get('/:provider/redirect', [AuthController, 'redirect']).as('auth.redirect')
  router.get('/:provider/callback', [AuthController, 'callback']).as('auth.callback')
}).prefix('/auth')

/*
|--------------------------------------------------------------------------
| Protected Routes (require authentication)
|--------------------------------------------------------------------------
*/
router.group(() => {
  /*
  |--------------------------------------------------------------------------
  | Dashboard
  |--------------------------------------------------------------------------
  */
  router.get('/dashboard', async ({ view, auth }) => {
    return view.render('dashboard', { user: auth.user })
  }).as('dashboard')

  /*
  |--------------------------------------------------------------------------
  | Flashcards
  |--------------------------------------------------------------------------
  */
  router.group(() => {
    router.get('/', [FlashcardsController, 'index']).as('flashcards.index')
    router.get('/practice', [FlashcardsController, 'practice']).as('flashcards.practice')
    router.post('/answer', [FlashcardsController, 'answer']).as('flashcards.answer')
    router.post('/move', [FlashcardsController, 'moveCategory']).as('flashcards.move')
    router.post('/add', [FlashcardsController, 'addWord']).as('flashcards.add')
  }).prefix('/flashcards')

  /*
  |--------------------------------------------------------------------------
  | Verb Conjugation
  |--------------------------------------------------------------------------
  */
  router.group(() => {
    router.get('/', [VerbConjugationController, 'index']).as('verbs.index')
    router.get('/practice', [VerbConjugationController, 'practice']).as('verbs.practice')
    router.post('/check', [VerbConjugationController, 'check']).as('verbs.check')
    router.get('/levels', [VerbConjugationController, 'levels']).as('verbs.levels')
  }).prefix('/verbs')

  /*
  |--------------------------------------------------------------------------
  | Noun Declension
  |--------------------------------------------------------------------------
  */
  router.group(() => {
    router.get('/', [NounDeclensionController, 'index']).as('nouns.index')
    router.get('/practice', [NounDeclensionController, 'practice']).as('nouns.practice')
    router.post('/check', [NounDeclensionController, 'check']).as('nouns.check')
    router.get('/cases', [NounDeclensionController, 'cases']).as('nouns.cases')
  }).prefix('/nouns')

  /*
  |--------------------------------------------------------------------------
  | Reading
  |--------------------------------------------------------------------------
  */
  router.group(() => {
    router.get('/', [ReadingController, 'index']).as('reading.index')
    router.post('/generate', [ReadingController, 'generate']).as('reading.generate')
    router.get('/comprehension/:storyId', [ReadingController, 'comprehension']).as('reading.comprehension')
    router.post('/comprehension/check', [ReadingController, 'checkComprehension']).as('reading.check')
    router.post('/add-flashcard', [ReadingController, 'addToFlashcards']).as('reading.addFlashcard')
  }).prefix('/reading')

  /*
  |--------------------------------------------------------------------------
  | Exams
  |--------------------------------------------------------------------------
  */
  router.group(() => {
    router.get('/', [ExamController, 'index']).as('exams.index')
    router.get('/start', [ExamController, 'start']).as('exams.start')
    router.post('/begin', [ExamController, 'begin']).as('exams.begin')
    router.post('/submit', [ExamController, 'submit']).as('exams.submit')
    router.get('/result/:id', [ExamController, 'result']).as('exams.result')
    router.get('/history', [ExamController, 'history']).as('exams.history')
    router.get('/stats', [ExamController, 'stats']).as('exams.stats')
  }).prefix('/exams')

}).use(middleware.auth())

/*
|--------------------------------------------------------------------------
| API Routes (JSON responses)
|--------------------------------------------------------------------------
*/
router.group(() => {
  router.get('/health', async ({ response }) => {
    return response.json({ status: 'ok', timestamp: new Date().toISOString() })
  })
}).prefix('/api')
