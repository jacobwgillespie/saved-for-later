import parse from 'date-fns/parse'
import emojiRegex from 'emoji-regex'
import {FeedItem} from './feed'

const allEmojiRegex = emojiRegex()

/** Call the Twitter API, caching responses */
async function twitter(endpoint: string): Promise<TwitterFavorite[]> {
  const url = `https://api.twitter.com/1.1/${endpoint}`

  // Return the cached response if present
  const cachedResponse = await CACHE_KV.get(url, 'json')
  if (cachedResponse) {
    return cachedResponse
  }

  // Fetch the response from the API
  const response = await fetch(url, {headers: {Authorization: `bearer ${TWITTER_API_KEY}`}})
  const result = await response.json()

  // Store in the cache
  if (!Array.isArray(result)) {
    throw new Error('Twitter API error')
  }
  await CACHE_KV.put(url, JSON.stringify(result), {expirationTtl: 60})
  return result
}

interface TwitterFavorite {
  created_at: string
  id_str: string
  full_text: string
  user: {
    id_str: string
    screen_name: string
  }
  in_reply_to_screen_name: string | null
  entities: {
    urls: {
      url: string
      expanded_url: string
      display_url: string
      indices: [number, number]
    }[]
    media?: {
      url: string
      expanded_url: string
      display_url: string
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

function buildPlaceholder(idx: number) {
  return `__T_ENTITY_${idx}__`
}

function buildTweetTitle(tweet: TwitterFavorite): string {
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

  // Take first sentence
  title = title.split(/[.?!](?=(\s|$))/)[0]

  // Remove trailing placeholders
  for (const [idx] of [...entities].reverse().entries()) {
    const placeholder = buildPlaceholder(entities.length - idx - 1)
    title = title.replace(new RegExp(`${placeholder} via @[a-zA-Z0-9_]+$`), '').trim()
    title = title.replace(new RegExp(`${placeholder}$`), '').trim()
    if (title === '') {
      title = placeholder
    }
  }

  // Remove trailing punctuation
  title = title.replace(/[:;,]$/, '')

  // Replace placeholders with display URLs
  for (const [idx, entity] of entities.entries()) {
    title = title.replace(buildPlaceholder(idx), entity.display_url)
  }

  // Remove @-mention at the beginning of the line
  if (tweet.in_reply_to_screen_name) {
    title = title.replace(new RegExp(`^@${tweet.in_reply_to_screen_name}`), '').trim()
  }

  // Strip emoji
  title = title.replace(allEmojiRegex, '')

  // Fix instances of html encoding, which get double-escaped
  title = title
    .replace(/&amp;/g, '&')
    .replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")

  return title
}

function renderContent(tweet: TwitterFavorite): string {
  let content = tweet.full_text

  // Build sorted list of entities (URLs)
  const entities = [...tweet.entities.urls, ...(tweet.entities.media || [])].sort((a, b) => {
    if (a.indices[0] < b.indices[0]) return -1
    if (a.indices[0] > b.indices[0]) return 1
    return 0
  })

  for (const entity of entities) {
    content = content.replace(entity.url, `<a href="${entity.expanded_url}">${entity.display_url}</a>`)
  }

  content = `${content} — <a href="https://twitter.com/${tweet.user.screen_name}/status/${tweet.id_str}">Tweet</a>`

  return content
}

/** Fetch Twitter favorites as feed items */
export async function fetchFavorites(): Promise<FeedItem[]> {
  const favorites = await twitter('favorites/list.json?screen_name=jacobwgillespie&count=200&tweet_mode=extended')

  return Promise.all(
    favorites.map(async favorite => {
      const cacheKey = `v1-twitter-item-${favorite.id_str}`
      const cachedItem = await CACHE_KV.get(cacheKey, 'json')
      if (cachedItem) {
        return cachedItem
      }

      // Parse date
      const date = parseTwitterDate(favorite.created_at).toISOString()

      // Resolve link
      const tweetLink = `https://twitter.com/${favorite.user.screen_name}/status/${favorite.id_str}`
      const firstURL = favorite.entities.urls.length ? favorite.entities.urls[0] : undefined
      const link = firstURL ? firstURL.expanded_url : tweetLink

      // Construct title from first line of tweet, cleaning up trailing URLs or punctuation
      let title = buildTweetTitle(favorite)

      const feedItem: FeedItem = {
        id: tweetLink,
        title,
        link,
        date,
        content: renderContent(favorite),
        hn: false,
        twitter: {
          link: tweetLink,
          username: favorite.user.screen_name,
        },
      }

      await CACHE_KV.put(cacheKey, JSON.stringify(feedItem))

      return feedItem
    }),
  )
}
