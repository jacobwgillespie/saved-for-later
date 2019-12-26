import DataLoader from 'dataloader'
import parseISO from 'date-fns/parseISO'
import {FeedItem} from './feed'

/** ID of the Hacker News feed in Feedbin */
const HACKER_NEWS_FEED_ID = 10102

/** Call the Feedbin API, caching responses */
async function feedbin<APIResponse = any>(endpoint: string): Promise<APIResponse> {
  const cache = caches.default
  const url = `https://api.feedbin.com/v2/${endpoint}`

  // Return the cached response if present
  const cachedResponse = await cache.match(url)
  if (cachedResponse !== undefined) {
    return await cachedResponse.json()
  }

  // Fetch the response from the API
  const response = await fetch(url, {
    headers: {Authorization: `Basic ${FEEDBIN_API_KEY}`},
  })
  await cache.put(url, response.clone())
  return response.json()
}

/** Represents a starred entry in Feedbin */
interface FeedbinEntry {
  id: number
  feed_id: number
  title: string
  author: string | null
  summary: string
  content: string
  url: string
  published: string
  twitter_id: number | null
}

/** entryLoader loads full entries from Feedbin in chunks of 100 */
const entryLoader = new DataLoader<number, FeedbinEntry>(
  async ids => feedbin<FeedbinEntry[]>(`entries.json?ids=${ids.join(',')}&mode=extended`),
  {maxBatchSize: 100},
)

/** Fetch Feedbin entries */
export async function fetchFeedbinEntries(): Promise<FeedItem[]> {
  // Fetch IDs of starred entries
  const entryIDs = await feedbin<number[]>('starred_entries.json')

  // Fetch full entries
  const entries = await Promise.all(entryIDs.map(id => entryLoader.load(id)))

  return entries.map(entry => {
    // Parse date
    const date = parseISO(entry.published)

    // Determine if this is a HN post
    let hn: string | false = false
    if (entry.feed_id === HACKER_NEWS_FEED_ID) {
      const match = entry.content.match(/https:\/\/news\.ycombinator\.com\/item\?id=(\d+)/)
      if (match && match[1]) {
        hn = match[1]
      }
    }

    return {
      id: `https://feedbin.me/entries/${entry.id}`,
      title: entry.title,
      link: entry.url,
      date,
      content: entry.content,
      hn,
      twitter: false,
    }
  })
}

/** Fetch map of feed IDs to tags */
export async function fetchTagMap() {
  const tagMap: {[id: number]: string[]} = {}

  const taggings = await feedbin<{feed_id: number; name: string}[]>('taggings.json')
  for (const tagging of taggings) {
    const tags = tagMap[tagging.feed_id] || []
    tags.push(tagging.name)
    tagMap[tagging.feed_id] = tags.sort()
  }

  return tagMap
}
