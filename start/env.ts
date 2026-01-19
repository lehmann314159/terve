/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

export default await Env.create(new URL('../', import.meta.url), {
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Application key
  |----------------------------------------------------------
  */
  APP_KEY: Env.schema.string(),

  /*
  |----------------------------------------------------------
  | Database
  |----------------------------------------------------------
  */
  DB_CONNECTION: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | Session
  |----------------------------------------------------------
  */
  SESSION_DRIVER: Env.schema.string.optional(),
  SESSION_COOKIE_NAME: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | OAuth providers
  |----------------------------------------------------------
  */
  OAUTH_GOOGLE_CLIENT_ID: Env.schema.string.optional(),
  OAUTH_GOOGLE_CLIENT_SECRET: Env.schema.string.optional(),
  OAUTH_GITHUB_CLIENT_ID: Env.schema.string.optional(),
  OAUTH_GITHUB_CLIENT_SECRET: Env.schema.string.optional(),

  /*
  |----------------------------------------------------------
  | External APIs
  |----------------------------------------------------------
  */
  CLAUDE_API_KEY: Env.schema.string.optional(),
})
