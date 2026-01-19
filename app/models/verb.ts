import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Verb extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare infinitive: string

  @column()
  declare english: string

  @column()
  declare verbType: number // Finnish verb type (1-6)

  @column()
  declare cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

  // Present tense forms
  @column()
  declare presentMina: string // minä

  @column()
  declare presentSina: string // sinä

  @column()
  declare presentHan: string // hän

  @column()
  declare presentMe: string // me

  @column()
  declare presentTe: string // te

  @column()
  declare presentHe: string // he

  // Past tense forms
  @column()
  declare pastMina: string

  @column()
  declare pastSina: string

  @column()
  declare pastHan: string

  @column()
  declare pastMe: string

  @column()
  declare pastTe: string

  @column()
  declare pastHe: string

  // Conditional forms
  @column()
  declare conditionalMina: string

  @column()
  declare conditionalSina: string

  @column()
  declare conditionalHan: string

  @column()
  declare conditionalMe: string

  @column()
  declare conditionalTe: string

  @column()
  declare conditionalHe: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
