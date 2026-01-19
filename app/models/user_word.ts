import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'
import Word from './word.js'

export default class UserWord extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare wordId: number

  @column()
  declare category: 'learning' | 'well_known' | 'todo' | 'not_interested'

  @column()
  declare reviewCount: number

  @column()
  declare correctCount: number

  @column.dateTime()
  declare lastReviewedAt: DateTime | null

  @column.dateTime()
  declare nextReviewAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  @belongsTo(() => Word)
  declare word: BelongsTo<typeof Word>

  // Calculated property for mastery percentage
  get masteryPercentage(): number {
    if (this.reviewCount === 0) return 0
    return Math.round((this.correctCount / this.reviewCount) * 100)
  }
}
