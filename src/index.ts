import {getAssetFromKV} from '@cloudflare/kv-asset-handler'
import CloudflareWorkerGlobalScope, {CloudflareWorkerKV} from 'types-cloudflare-worker'
import {buildFeed, fetchFeedItems, template} from './feed'
import {fetchFeedbinEntries} from './feedbin'
import {fetchFavorites} from './twitter'

// Loads Cloudflare Worker TypeScript types into the global scope
declare var self: CloudflareWorkerGlobalScope
declare global {
  const CACHE_KV: CloudflareWorkerKV
}

self.addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

async function handleRequest(event: FetchEvent) {
  const request = event.request
  const url = new URL(request.url)

  // Remove trailing slash, if present
  const pathname = url.pathname.endsWith('/') && url.pathname != '/' ? url.pathname.slice(0, -1) : url.pathname

  switch (pathname) {
    // Homepage
    case '/':
      return new Response(template(url.pathname, await fetchFeedItems()), {
        headers: {'Content-Type': 'text/html; charset=utf-8'},
      })

    case '/_debug':
      return new Response(JSON.stringify(await fetchFavorites()), {headers: {'Content-Type': 'application/json'}})

    // API endpoints
    case '/api/feedbin':
      return new Response(JSON.stringify(await fetchFeedbinEntries()), {headers: {'Content-Type': 'application/json'}})
    case '/api/twitter':
      return new Response(JSON.stringify(await fetchFavorites()), {headers: {'Content-Type': 'application/json'}})

    // RSS feed formats
    case '/rss':
      return new Response((await buildFeed()).rss2(), {
        headers: {'Content-Type': 'application/rss+xml; charset=utf-8'},
      })
    case '/atom':
      return new Response((await buildFeed()).atom1(), {
        headers: {'Content-Type': 'application/atom+xml; charset=utf-8'},
      })
    case '/json':
      return new Response((await buildFeed()).json1(), {
        headers: {'Content-Type': 'application/json; charset=utf-8'},
      })

    // Legacy redirects
    case '/tech':
      return Response.redirect(`https://${url.hostname}/`, 301)
    case '/feed.xml':
      return Response.redirect(`https://${url.hostname}/rss`, 301)
    case '/tech-feed.xml':
      return Response.redirect(`https://${url.hostname}/rss`, 301)

    // Catch-all route
    default:
      try {
        return await getAssetFromKV(event)
      } catch {
        return new Response('not found', {status: 404})
      }
  }
}
