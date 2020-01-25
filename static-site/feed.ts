import {parseISO} from 'date-fns'
import {Feed} from 'feed'
import {fetchFavorites} from './twitter'
import {fetchFeedbinEntries} from './feedbin'

export interface FeedItem {
  id: string
  title: string
  link: string
  date: string
  content?: string
  hn: string | false
  lobsters: string | false
  twitter?: {
    link: string
    username: string
  }
}

export async function fetchFeedItems() {
  const feedbinItems: Promise<FeedItem[]> = fetchFeedbinEntries()
  const twitterItems: Promise<FeedItem[]> = fetchFavorites()

  const items = (await Promise.all([feedbinItems, twitterItems])).flat()

  // Return entries, sorted in reverse chronological order
  return items.sort((a, b) => {
    if (a.date < b.date) return 1
    if (b.date < a.date) return -1
    return 0
  })
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
      date: parseISO(item.date),
      content: item.content,
    })
  }

  return feed
}
