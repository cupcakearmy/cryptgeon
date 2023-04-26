#!/usr/bin/env node

import { Argument, Option, program } from '@commander-js/extra-typings'
import { setBase, status } from '@cryptgeon/shared'

import { download } from './download.js'
import { parseFile, parseNumber } from './parsers.js'
import { uploadFiles, uploadText } from './upload.js'
import { exit } from './utils.js'

const defaultServer = process.env['CRYPTGEON_SERVER'] || 'https://cryptgeon.org'
const server = new Option('-s --server <url>', 'the cryptgeon server to use').default(defaultServer)
const files = new Argument('<file...>', 'Files to be sent').argParser(parseFile)
const text = new Argument('<text>', 'Text content of the note')
const password = new Option('-p --password <string>', 'manually set a password')
const url = new Argument('<url>', 'The url to open')
const views = new Option('-v --views <number>', 'Amount of views before getting destroyed').argParser(parseNumber)
const minutes = new Option('-m --minutes <number>', 'Minutes before the note expires').argParser(parseNumber)

async function checkConstrains(constrains: { views?: number; minutes?: number }) {
  const { views, minutes } = constrains
  if (views && minutes) exit('cannot set view and minutes constrains simultaneously')
  if (!views && !minutes) constrains.views = 1

  const response = await status()
  if (views && views > response.max_views)
    exit(`Only a maximum of ${response.max_views} views allowed. ${views} given.`)
  if (minutes && minutes > response.max_expiration)
    exit(`Only a maximum of ${response.max_expiration} minutes allowed. ${minutes} given.`)
}

program.name('cryptgeon').version('1.0.0').configureHelp({ showGlobalOptions: true })

program
  .command('info')
  .addOption(server)
  .action(async (options) => {
    setBase(options.server)
    const response = await status()
    for (const key of Object.keys(response)) {
      if (key.startsWith('theme_')) delete response[key as keyof typeof response]
    }
    console.table(response)
  })

const send = program.command('send')
send
  .command('file')
  .addArgument(files)
  .addOption(server)
  .addOption(views)
  .addOption(minutes)
  .action(async (files, options) => {
    setBase(options.server!)
    await checkConstrains(options)
    await uploadFiles(files, { views: options.views, expiration: options.minutes })
  })
send
  .command('text')
  .addArgument(text)
  .addOption(server)
  .addOption(views)
  .addOption(minutes)
  .action(async (text, options) => {
    setBase(options.server!)
    await checkConstrains(options)
    await uploadText(text, { views: options.views, expiration: options.minutes })
  })

program
  .command('open')
  .addArgument(url)
  .action(async (note, options) => {
    try {
      const url = new URL(note)
      await download(url)
    } catch {
      exit('Invalid URL')
    }
  })

program.parse()
