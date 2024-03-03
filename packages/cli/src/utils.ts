import { status } from '@cryptgeon/shared'
import { exit as exitNode } from 'node:process'

export function exit(message: string) {
  console.error(message)
  exitNode(1)
}

export async function checkConstrains(constrains: { views?: number; minutes?: number }) {
  const { views, minutes } = constrains
  if (views && minutes) exit('cannot set view and minutes constrains simultaneously')
  if (!views && !minutes) constrains.views = 1

  const response = await status()
  if (views && views > response.max_views)
    exit(`Only a maximum of ${response.max_views} views allowed. ${views} given.`)
  if (minutes && minutes > response.max_expiration)
    exit(`Only a maximum of ${response.max_expiration} minutes allowed. ${minutes} given.`)
}
