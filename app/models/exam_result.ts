import { DateTime } from 'luxon'
import { BaseModel, column, belongsTo } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from './user.js'

export default class ExamResult extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare examType: 'mock_cefr' | 'custom'

  @column()
  declare targetLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

  @column()
  declare score: number // Percentage

  @column()
  declare maxScore: number

  @column()
  declare questionsCorrect: number

  @column()
  declare totalQuestions: number

  @column()
  declare timeSpentMinutes: number

  @column()
  declare sections: string // JSON string of section scores

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>

  // Calculated properties
  get percentage(): number {
    return Math.round((this.score / this.maxScore) * 100)
  }

  get passed(): boolean {
    return this.percentage >= 70 // CEFR typically requires 70%
  }

  get sectionScores(): Record<string, number> {
    try {
      return JSON.parse(this.sections)
    } catch {
      return {}
    }
  }
}
