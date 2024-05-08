import {Feed} from 'feed'
import {fetchFeedbinEntries} from './feedbin'

export interface FeedItem {
  id: string
  title: string
  link: string
  date: Date
  content?: string
  hn: string | false
  lobsters: string | false
}

export async function fetchFeedItems(env: Env, refresh = false) {
  const existing = await env.SAVEDFORLATER_DATA.get<FeedItem[]>('feedItems', 'json')
  if (!refresh && existing) return existing

  const feedbinItems: Promise<FeedItem[]> = fetchFeedbinEntries(env)

  const items = (await Promise.all([feedbinItems])).flat()

  // Sort entries in reverse chronological order
  const sortedItems = items.sort((a, b) => {
    if (a.date < b.date) return 1
    if (b.date < a.date) return -1
    return 0
  })

  // Cache items for 5 minutes
  await env.SAVEDFORLATER_DATA.put('feedItems', JSON.stringify(sortedItems), {
    expirationTtl: 60 * 15,
  })

  return sortedItems
}

export async function buildFeed(items: FeedItem[]) {
  const feed = new Feed({
    title: 'Saved for Later',
    id: 'https://savedforlater.dev/feed.xml',
    copyright: '',
    generator: 'https://github.com/jacobwgillespie/saved-for-later',
    feedLinks: {
      atom: 'https://savedforlater.dev/atom',
      json: 'https://savedforlater.dev/json',
    },
  })

  for (const item of items) {
    feed.addItem({
      title: item.title,
      guid: item.id,
      link: item.link,
      date: item.date,
      content: item.content ?? '',
    })
  }

  return feed
}
