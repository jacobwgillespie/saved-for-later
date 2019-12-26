import parse from 'date-fns/parse'
import {FeedItem} from './feed'
import favoritesMock from './favorites.json'

/** Call the Twitter API, caching responses */
async function twitter<APIResponse = any>(endpoint: string): Promise<APIResponse> {
  const cache = caches.default
  const url = `https://api.twitter.com/1.1/${endpoint}`

  // Return the cached response if present
  const cachedResponse = await cache.match(url)
  if (cachedResponse !== undefined) {
    return await cachedResponse.json()
  }

  // Fetch the response from the API
  const response = await fetch(url, {
    headers: {Authorization: `bearer ${TWITTER_API_KEY}`},
  })
  await cache.put(url, response.clone())
  return response.json()
}

interface TwitterFavorite {
  created_at: string
  id_str: string
  full_text: string
  user: {
    id_str: string
    screen_name: string
  }
  entities: {
    urls: {
      url: string
      expanded_url: string
      indices: [number, number]
    }[]
    media?: {
      url: string
      expanded_url: string
      indices: [number, number]
    }[]
  }
}

/** Parse Twitter's date format */
function parseTwitterDate(twitterDate: string): Date {
  return parse(twitterDate, 'EEE LLL dd HH:mm:ss XX yyyy', new Date())
}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function buildTweetTitle(tweet: TwitterFavorite): string {
  function buildPlaceholder(idx: number) {
    return `__T_ENTITY_${idx}__`
  }

  // Build sorted list of entities (URLs) to replace with placeholders
  const entities = [...tweet.entities.urls, ...(tweet.entities.media || [])].sort((a, b) => {
    if (a.indices[0] < b.indices[0]) return -1
    if (a.indices[0] > b.indices[0]) return 1
    return 0
  })

  // Replace entities with placeholders
  let title = tweet.full_text
  for (const [idx, entity] of entities.entries()) {
    title = title.replace(new RegExp(escapeRegExp(entity.url)), buildPlaceholder(idx))
  }

  // Take first line of the tweet
  title = title.split('\n')[0]

  title = title.split(/[.?!]/)[0]

  // Remove trailing placeholders
  for (const [idx] of entities.reverse().entries()) {
    const placeholder = buildPlaceholder(entities.length - idx - 1)
    title = title.replace(new RegExp(`${placeholder} via @[a-zA-Z0-9_]+$`), '').trim()
    title = title.replace(new RegExp(`${placeholder}$`), '').trim()
  }

  title = title.replace(/[:;,]$/, '')

  return title
}

/** Fetch Twitter favorites as feed items */
export async function fetchFavorites(): Promise<FeedItem[]> {
  const favorites: TwitterFavorite[] = DEBUG
    ? favoritesMock
    : await twitter<TwitterFavorite[]>('favorites/list.json?screen_name=jacobwgillespie&count=200&tweet_mode=extended')

  return favorites.map(favorite => {
    // Parse date
    const date = parseTwitterDate(favorite.created_at)

    // Resolve link
    const tweetLink = `https://twitter.com/${favorite.user.screen_name}/status/${favorite.id_str}`
    const firstURL = favorite.entities.urls.length ? favorite.entities.urls[0] : undefined
    const link = firstURL ? firstURL.expanded_url : tweetLink

    // Construct title from first line of tweet, cleaning up trailing URLs or punctuation
    let title = buildTweetTitle(favorite)

    return {
      id: tweetLink,
      title,
      link,
      date,
      content: favorite.full_text,
      hn: false,
      twitter: tweetLink,
      twitterUsername: favorite.user.screen_name,
    }
  })
}
