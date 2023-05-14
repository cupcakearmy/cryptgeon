import { exit as exitNode } from 'node:process'

export function exit(message: string) {
  console.error(message)
  exitNode(1)
}
