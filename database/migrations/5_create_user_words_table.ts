import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'user_words'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE')
      table.integer('word_id').unsigned().references('id').inTable('words').onDelete('CASCADE')

      table.string('category', 50).notNullable().defaultTo('learning')
      table.integer('review_count').notNullable().defaultTo(0)
      table.integer('correct_count').notNullable().defaultTo(0)
      table.timestamp('last_reviewed_at').nullable()
      table.timestamp('next_review_at').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['user_id', 'word_id'])
      table.index(['user_id', 'category'])
      table.index(['user_id', 'next_review_at'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
