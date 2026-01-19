/*
|--------------------------------------------------------------------------
| REPL entrypoint
|--------------------------------------------------------------------------
|
| The "bin/console.ts" file is the entrypoint for starting the AdonisJS
| REPL session.
|
*/

import 'reflect-metadata'
import { Ignitor, prettyPrintError } from '@adonisjs/core'

const APP_ROOT = new URL('../', import.meta.url)

const IMPORTER = (filePath: string) => {
  if (filePath.startsWith('./') || filePath.startsWith('../')) {
    return import(new URL(filePath, APP_ROOT).href)
  }
  return import(filePath)
}

new Ignitor(APP_ROOT, { importer: IMPORTER })
  .tap((app) => {
    app.booting(async () => {
      await import('#start/kernel')
    })
  })
  .repl()
  .start()
  .catch((error) => {
    process.exitCode = 1
    prettyPrintError(error)
  })
