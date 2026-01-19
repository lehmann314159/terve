import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')

      table.string('email', 255).notNullable().unique()
      table.string('name', 255).notNullable()
      table.string('oauth_provider', 50).notNullable()
      table.string('oauth_id', 255).notNullable()
      table.string('cefr_level', 2).notNullable().defaultTo('A1')
      table.string('preferred_story_length', 20).notNullable().defaultTo('medium')

      table.timestamp('created_at')
      table.timestamp('updated_at')

      table.unique(['oauth_provider', 'oauth_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
