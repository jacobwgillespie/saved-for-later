import {getAssetFromKV, mapRequestToAsset} from '@cloudflare/kv-asset-handler'
import CloudflareWorkerGlobalScope from 'types-cloudflare-worker'

// Loads Cloudflare Worker TypeScript types into the global scope
declare var self: CloudflareWorkerGlobalScope

self.addEventListener('fetch', event => {
  event.respondWith(handleRequest(event))
})

function customAssetMapper(request: Request) {
  const url = new URL(request.url)

  if (url.pathname === '/rss') {
    url.pathname = '/rss.xml'
  }
  if (url.pathname === '/atom') {
    url.pathname = '/atom.xml'
  }

  if (url.pathname === '/json') {
    url.pathname = '/feed.json'
  }

  if (url.pathname.endsWith('/')) {
    url.pathname += 'index.html'
  }

  return mapRequestToAsset(new Request(url.href, request))
}

async function handleRequest(event: FetchEvent) {
  const request = event.request
  const url = new URL(request.url)

  if (url.hostname === 'links.jacobwgillespie.com') {
    url.hostname = 'savedforlater.dev'
    return Response.redirect(url.href, 301)
  }

  // Remove trailing slash, if present
  const pathname = url.pathname.endsWith('/') && url.pathname != '/' ? url.pathname.slice(0, -1) : url.pathname

  switch (pathname) {
    // Legacy redirects
    case '/tech':
      return Response.redirect(`https://${url.hostname}/`, 301)
    case '/feed.xml':
      return Response.redirect(`https://${url.hostname}/rss`, 301)
    case '/tech-feed.xml':
      return Response.redirect(`https://${url.hostname}/rss`, 301)

    // Catch-all route, serve static assets from Workers Sites
    default:
      try {
        return await getAssetFromKV(event, {mapRequestToAsset: customAssetMapper})
      } catch {
        return new Response('not found', {status: 404})
      }
  }
}
