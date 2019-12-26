import DataLoader from 'dataloader'

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
export interface FeedbinEntry {
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
export async function fetchFeedbinEntries() {
  // Fetch IDs of starred entries
  const entryIDs = await feedbin<number[]>('starred_entries.json')

  // Fetch full entries
  const entries = await Promise.all(entryIDs.map(id => entryLoader.load(id)))

  // Return entries, sorted in reverse chronological order
  return entries.sort((a, b) => {
    if (a.published < b.published) return 1
    if (b.published < a.published) return -1
    return 0
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
