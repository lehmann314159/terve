import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'words'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('finnish', 255).notNullable()
      table.string('english', 255).notNullable()
      table.string('part_of_speech', 50).notNullable()
      table.string('cefr_level', 2).notNullable()
      table.integer('commonality_rank').notNullable().defaultTo(0)
      table.integer('difficulty').notNullable().defaultTo(1)
      table.text('context').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.index(['cefr_level'])
      table.index(['part_of_speech'])
      table.index(['commonality_rank'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
