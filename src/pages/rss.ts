import type {APIContext} from 'astro'
import {buildFeed, fetchFeedItems} from '../utils/feed'

export async function GET(context: APIContext) {
  const items = await fetchFeedItems(context.locals.runtime.env)
  const feed = await buildFeed(items)
  return new Response(feed.rss2(), {headers: {'Content-Type': 'application/rss+xml'}})
}
