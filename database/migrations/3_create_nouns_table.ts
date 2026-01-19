import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'nouns'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('nominative', 255).notNullable()
      table.string('english', 255).notNullable()
      table.string('cefr_level', 2).notNullable()
      table.string('noun_type', 50).notNullable()

      // Singular cases
      table.string('genitive_sg', 255).notNullable()
      table.string('partitive_sg', 255).notNullable()
      table.string('illative_sg', 255).notNullable()
      table.string('inessive_sg', 255).notNullable()
      table.string('elative_sg', 255).notNullable()
      table.string('allative_sg', 255).notNullable()
      table.string('adessive_sg', 255).notNullable()
      table.string('ablative_sg', 255).notNullable()

      // Plural cases
      table.string('nominative_pl', 255).notNullable()
      table.string('genitive_pl', 255).notNullable()
      table.string('partitive_pl', 255).notNullable()
      table.string('illative_pl', 255).notNullable()
      table.string('inessive_pl', 255).notNullable()
      table.string('elative_pl', 255).notNullable()
      table.string('allative_pl', 255).notNullable()
      table.string('adessive_pl', 255).notNullable()
      table.string('ablative_pl', 255).notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['cefr_level'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
