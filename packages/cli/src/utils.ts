import process from 'node:process'

export function exit(message: string) {
  console.error(message)
  process.exit(1)
}
