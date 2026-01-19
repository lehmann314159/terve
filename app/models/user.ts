import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import UserWord from './user_word.js'
import ExamResult from './exam_result.js'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column()
  declare name: string

  @column()
  declare oauthProvider: string

  @column()
  declare oauthId: string

  @column()
  declare cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

  @column()
  declare preferredStoryLength: 'short' | 'medium' | 'long'

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => UserWord)
  declare words: HasMany<typeof UserWord>

  @hasMany(() => ExamResult)
  declare examResults: HasMany<typeof ExamResult>
}
