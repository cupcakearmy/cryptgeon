#!/usr/bin/env node

import { Argument, Option, program } from '@commander-js/extra-typings'
import prettyBytes from 'pretty-bytes'

import { download } from './actions/download.js'
import { upload } from './actions/upload.js'
import { setServer, status } from '@cryptgeon/shared'
import { parseFile, parseNumber } from './utils/parsers.js'
import { getStdin } from './utils/stdin.js'
import { checkConstrains, exit } from './utils/utils.js'

const defaultServer = process.env['CRYPTGEON_SERVER'] || 'https://cryptgeon.org'
const server = new Option('-s --server <url>', 'the cryptgeon server to use').default(defaultServer)
const files = new Argument('<file...>', 'Files to be sent').argParser(parseFile)
const text = new Argument('<text>', 'Text content of the note')
const password = new Option('-p --password <string>', 'manually set a password')
const all = new Option('-a --all', 'Save all files without prompt').default(false)
const url = new Argument('<url>', 'The url to open')
const views = new Option('-v --views <number>', 'Amount of views before getting destroyed').argParser(parseNumber)
const minutes = new Option('-m --minutes <number>', 'Minutes before the note expires').argParser(parseNumber)

// Node 18 guard
const major = Number(process.version.slice(1).split('.')[0])
if (!Number.isFinite(major) || major < 18) exit('Node 18 or higher is required')

// @ts-ignore
const version: string = VERSION

program.name('cryptgeon').version(version).configureHelp({ showGlobalOptions: true })

program
  .command('info')
  .description('show information about the server')
  .addOption(server)
  .action(async (options) => {
    setServer(options.server!)
    const response = await status()
    const formatted = Object.fromEntries(
      Object.entries({ ...response, max_size: prettyBytes(response.max_size) })
        .filter(([key]) => !key.startsWith('theme_'))
    )
    console.table(formatted)
  })

const send = program.command('send').description('send a note')
send
  .command('file')
  .addArgument(files)
  .addOption(server)
  .addOption(views)
  .addOption(minutes)
  .addOption(password)
  .action(async (files, options) => {
    setServer(options.server!)
    await checkConstrains(options)
    options.password ||= await getStdin()
    try {
      const url = await upload(files, {
        ...(options.views !== undefined ? { views: options.views } : {}),
        ...(options.minutes !== undefined ? { expiration: options.minutes } : {}),
        password: options.password,
      })
      console.log(`Note created:\n\n${url}`)
    } catch {
      exit('Could not create note')
    }
  })
send
  .command('text')
  .addArgument(text)
  .addOption(server)
  .addOption(views)
  .addOption(minutes)
  .addOption(password)
  .action(async (text, options) => {
    setServer(options.server!)
    await checkConstrains(options)
    options.password ||= await getStdin()
    try {
      const url = await upload(text, {
        ...(options.views !== undefined ? { views: options.views } : {}),
        ...(options.minutes !== undefined ? { expiration: options.minutes } : {}),
        password: options.password,
      })
      console.log(`Note created:\n\n${url}`)
    } catch {
      exit('Could not create note')
    }
  })

program
  .command('open')
  .description('open a link with text or files inside')
  .addArgument(url)
  .addOption(password)
  .addOption(all)
  .action(async (note, options) => {
    try {
      const url = new URL(note)
      options.password ||= await getStdin()
      try {
        await download(url, options.all, options.password)
      } catch (e) {
        exit(e instanceof Error ? e.message : 'Unknown error occurred')
      }
    } catch {
      exit('Invalid URL')
    }
  })

program.parse()