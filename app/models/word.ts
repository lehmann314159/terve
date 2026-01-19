import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Word extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare finnish: string

  @column()
  declare english: string

  @column()
  declare partOfSpeech: string

  @column()
  declare cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

  @column()
  declare commonalityRank: number

  @column()
  declare difficulty: number

  @column()
  declare context: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
