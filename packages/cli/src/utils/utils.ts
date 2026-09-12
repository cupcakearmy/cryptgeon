import { exit as exitNode } from 'node:process'
import { status } from '@cryptgeon/shared'

export function exit(message: string) {
  console.error(message)
  exitNode(1)
}

export async function checkConstrains(constrains: { views?: number; minutes?: number }) {
  if (!constrains.views && !constrains.minutes) constrains.views = 1

  const response = await status()
  if (constrains.views && constrains.views > response.max_views)
    exit(`Only a maximum of ${response.max_views} views allowed. ${constrains.views} given.`)
  if (constrains.minutes && constrains.minutes > response.max_expiration)
    exit(`Only a maximum of ${response.max_expiration} minutes allowed. ${constrains.minutes} given.`)
}