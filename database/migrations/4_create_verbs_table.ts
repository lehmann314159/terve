import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'verbs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('infinitive', 255).notNullable()
      table.string('english', 255).notNullable()
      table.integer('verb_type').notNullable()
      table.string('cefr_level', 2).notNullable()

      // Present tense forms
      table.string('present_mina', 255).notNullable()
      table.string('present_sina', 255).notNullable()
      table.string('present_han', 255).notNullable()
      table.string('present_me', 255).notNullable()
      table.string('present_te', 255).notNullable()
      table.string('present_he', 255).notNullable()

      // Past tense forms
      table.string('past_mina', 255).notNullable()
      table.string('past_sina', 255).notNullable()
      table.string('past_han', 255).notNullable()
      table.string('past_me', 255).notNullable()
      table.string('past_te', 255).notNullable()
      table.string('past_he', 255).notNullable()

      // Conditional forms
      table.string('conditional_mina', 255).notNullable()
      table.string('conditional_sina', 255).notNullable()
      table.string('conditional_han', 255).notNullable()
      table.string('conditional_me', 255).notNullable()
      table.string('conditional_te', 255).notNullable()
      table.string('conditional_he', 255).notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['cefr_level'])
      table.index(['verb_type'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
