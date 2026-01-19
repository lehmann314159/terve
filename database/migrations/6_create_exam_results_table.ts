import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'exam_results'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')

      table.string('exam_type', 50).notNullable()
      table.string('target_level', 2).notNullable()
      table.integer('score').notNullable()
      table.integer('max_score').notNullable()
      table.integer('questions_correct').notNullable()
      table.integer('total_questions').notNullable()
      table.integer('time_spent_minutes').notNullable()
      table.text('sections').notNullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['user_id'])
      table.index(['user_id', 'target_level'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
