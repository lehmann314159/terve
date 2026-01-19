import { defineConfig } from '@adonisjs/core/app'

export default defineConfig({
  /*
  |--------------------------------------------------------------------------
  | Commands
  |--------------------------------------------------------------------------
  |
  | List of ace commands to register from packages. The application commands
  | will be scanned automatically from the "./commands" directory.
  |
  */
  commands: [
    () => import('@adonisjs/core/commands'),
    () => import('@adonisjs/lucid/commands'),
      ],

  /*
  |--------------------------------------------------------------------------
  | Service providers
  |--------------------------------------------------------------------------
  |
  | List of service providers to import and register when booting the
  | application
  |
  */
  providers: [
    () => import('@adonisjs/core/providers/app_provider'),
    () => import('@adonisjs/core/providers/hash_provider'),
    {
      file: () => import('@adonisjs/core/providers/repl_provider'),
      environment: ['repl', 'test'],
    },
    () => import('@adonisjs/core/providers/vinejs_provider'),
    () => import('@adonisjs/core/providers/edge_provider'),
    () => import('@adonisjs/session/session_provider'),
    () => import('@adonisjs/shield/shield_provider'),
    () => import('@adonisjs/static/static_provider'),
    () => import('@adonisjs/lucid/database_provider'),
    () => import('@adonisjs/ally/ally_provider'),
  ],

  /*
  |--------------------------------------------------------------------------
  | Preloads
  |--------------------------------------------------------------------------
  |
  | List of modules to import before starting the application.
  |
  */
  preloads: [],

  /*
  |--------------------------------------------------------------------------
  | Tests
  |--------------------------------------------------------------------------
  |
  | List of test suites to organize tests by their type. Feel free to remove
  | and add additional suites.
  |
  */
  tests: {
    suites: [
      {
        files: ['tests/unit/**/*.spec(.ts|.js)'],
        name: 'unit',
        timeout: 2000,
      },
      {
        files: ['tests/functional/**/*.spec(.ts|.js)'],
        name: 'functional',
        timeout: 30000,
      },
    ],
  },

  /*
  |--------------------------------------------------------------------------
  | Directories
  |--------------------------------------------------------------------------
  */
  directories: {
    config: 'config',
    public: 'public',
    contracts: 'contracts',
    providers: 'providers',
    languageFiles: 'resources/lang',
    migrations: 'database/migrations',
    seeders: 'database/seeders',
    factories: 'database/factories',
    views: 'resources/views',
    start: 'start',
    tmp: 'tmp',
    httpControllers: 'app/controllers',
    models: 'app/models',
    services: 'app/services',
    exceptions: 'app/exceptions',
    middleware: 'app/middleware',
    validators: 'app/validators',
  },
})
