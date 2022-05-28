import type {LoaderFunction} from '@remix-run/cloudflare'
import {loadEnvFromContext} from '~/utils/env.server'
import {buildFeed, fetchFeedItems} from '~/utils/feed.server'

export const loader: LoaderFunction = async ({context}) => {
  loadEnvFromContext(context)
  const items = await fetchFeedItems(context)
  const feed = await buildFeed(items)
  return new Response(feed.atom1(), {headers: {'Content-Type': 'application/atom+xml'}})
}
