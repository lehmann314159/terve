import { DateTime } from 'luxon'
import { BaseModel, column } from '@adonisjs/lucid/orm'

export default class Noun extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare nominative: string // Basic form

  @column()
  declare english: string

  @column()
  declare cefrLevel: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

  @column()
  declare nounType: string // Strong/weak stem type

  // Singular cases
  @column()
  declare genitiveSg: string // -n (omistava)

  @column()
  declare partitiveSg: string // -a/-ä (osanto)

  @column()
  declare illativeSg: string // -an/-än (tuleva)

  @column()
  declare inessiveSg: string // -ssa/-ssä (sisäolento)

  @column()
  declare elativeSg: string // -sta/-stä (sisäeronto)

  @column()
  declare allativeSg: string // -lle (ulkotuleva)

  @column()
  declare adessiveSg: string // -lla/-llä (ulko-olento)

  @column()
  declare ablativeSg: string // -lta/-ltä (ulkoeronto)

  // Plural cases
  @column()
  declare nominativePl: string // -t

  @column()
  declare genitivePl: string // -en/-in/-ien

  @column()
  declare partitivePl: string // -a/-ä/-ia/-iä

  @column()
  declare illativePl: string // -iin

  @column()
  declare inessivePl: string // -issa/-issä

  @column()
  declare elativePl: string // -ista/-istä

  @column()
  declare allativePl: string // -ille

  @column()
  declare adessivePl: string // -illa/-illä

  @column()
  declare ablativePl: string // -ilta/-iltä

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime
}
