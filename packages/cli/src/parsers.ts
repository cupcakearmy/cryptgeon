import { InvalidArgumentError, InvalidOptionArgumentError } from '@commander-js/extra-typings'
import { accessSync, constants } from 'node:fs'
import path from 'node:path'

export function parseFile(value: string, before: string[] = []) {
  try {
    const file = path.resolve(value)
    accessSync(file, constants.R_OK)
    return [...before, file]
  } catch {
    throw new InvalidArgumentError('cannot access file')
  }
}

export function parseURL(value: string, _: URL): URL {
  try {
    return new URL(value)
  } catch {
    throw new InvalidArgumentError('is not a valid url')
  }
}

export function parseNumber(value: string, _: number): number {
  const n = parseInt(value, 10)
  if (isNaN(n)) throw new InvalidOptionArgumentError('invalid number')
  return n
}
