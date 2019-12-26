import formatDistanceToNow from 'date-fns/formatDistanceToNow'
import parseISO from 'date-fns/parseISO'
import escapeHTML from 'escape-html'
import {Feed} from 'feed'
import CloudflareWorkerGlobalScope from 'types-cloudflare-worker'
import favicon from '../public/favicon.png'
import style from '../public/style.css'
import {FeedbinEntry, fetchFeedbinEntries} from './feedbin'

// Loads Cloudflare Worker TypeScript types into the global scope
declare var self: CloudflareWorkerGlobalScope

/** ID of the Hacker News feed in Feedbin */
const HACKER_NEWS_FEED_ID = 10102

async function buildFeed() {
  const entries = await fetchFeedbinEntries()

  const feed = new Feed({
    title: 'Links by Jacob',
    id: 'https://links.jacobwgillespie.com/feed.xml',
    copyright: '',
    generator: 'https://github.com/jacobwgillespie/links-by-jacob',
    feedLinks: {
      atom: 'https://links.jacobwgillespie.com/atom',
      json: 'https://links.jacobwgillespie.com/json',
    },
  })

  for (const entry of entries) {
    feed.addItem({
      title: entry.title,
      guid: `https://feedbin.me/entries/${entry.id}`,
      link: entry.url,
      date: parseISO(entry.published),
      content: entry.content,
    })
  }

  return feed
}

self.addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request: Request) {
  const url = new URL(request.url)

  // Remove trailing slash, if present
  const pathname = url.pathname.endsWith('/') && url.pathname != '/' ? url.pathname.slice(0, -1) : url.pathname

  switch (pathname) {
    // Homepage
    case '/':
      return new Response(template(url.pathname, await fetchFeedbinEntries()), {
        headers: {'Content-Type': 'text/html; charset=utf-8'},
      })

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

    // PWA service worker, manifest, and icon
    case '/manifest.json':
      return new Response(
        JSON.stringify({
          name: 'Links by Jacob',
          short_name: 'Links by Jacob',
          theme_color: '#222222',
          background_color: '#222222',
          display: 'minimal-ui',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/icon-192x192.png',
              sizes: '192x192',
              type: 'image/png',
            },
          ],
        }),
        {headers: {'Content-Type': 'application/manifest+json'}},
      )
    case '/icon-192x192.png':
      return new Response(favicon, {headers: {'Content-Type': 'image/png'}})

    // Legacy redirects
    case '/tech':
      return Response.redirect(`https://${url.hostname}/`, 301)
    case '/feed.xml':
      return Response.redirect(`https://${url.hostname}/rss`, 301)
    case '/tech-feed.xml':
      return Response.redirect(`https://${url.hostname}/rss`, 301)

    // 404 route
    default:
      return new Response('not found', {status: 404})
  }
}

function feedItems(entries: FeedbinEntry[]) {
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

    // Determine if this is a Twitter tweet
    let title = entry.title
    if (entry.twitter_id !== null) {
      title = entry.summary || entry.title
    }

    return {
      title,
      link: entry.url,
      isoDate: date.toISOString(),
      relativeDate: `${formatDistanceToNow(date)} ago`,
      hn,
      twitter: entry.twitter_id !== null,
    }
  })
}

function template(url: string, entries: FeedbinEntry[]) {
  const items = feedItems(entries)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="theme-color" content="#222222"/>
<meta property="og:title" content="Links by Jacob" />
<meta property="og:url" content="https://links.jacobwgillespie.com${url}" />
<meta property="og:description" content="Starred links from my feed reader." />
<title>Links by Jacob</title>
<meta name="Description" content="Starred links from my feed reader." />
<style>${style}</style>
<link rel="shortcut icon" href="/icon-192x192.png" />
<link rel="apple-touch-icon" href="/icon-192x192.png">
<link rel="alternate" type="application/rss+xml" title="Links by Jacob RSS feed" href="/rss" />
<link rel="alternate" type="application/atom+xml" title="Links by Jacob RSS feed" href="/atom" />
<link rel="alternate" type="application/json" title="Links by Jacob RSS feed" href="/json" />
</head>
<body>
<h1>Links by Jacob</h1>
${items
  .map(item => {
    const hnLink = item.hn
      ? `<a href="https://news.ycombinator.com/item?id=${item.hn}" target="_blank" rel="noopener" class="hn">HN</a> `
      : ''
    const twitterLink = item.twitter
      ? `<a href="${escapeHTML(
          item.link,
        )}" target="_blank" rel="noopener" class="tw"><svg viewBox="0 0 24 24"><g><path d="M23.643 4.937c-.835.37-1.732.62-2.675.733.962-.576 1.7-1.49 2.048-2.578-.9.534-1.897.922-2.958 1.13-.85-.904-2.06-1.47-3.4-1.47-2.572 0-4.658 2.086-4.658 4.66 0 .364.042.718.12 1.06-3.873-.195-7.304-2.05-9.602-4.868-.4.69-.63 1.49-.63 2.342 0 1.616.823 3.043 2.072 3.878-.764-.025-1.482-.234-2.11-.583v.06c0 2.257 1.605 4.14 3.737 4.568-.392.106-.803.162-1.227.162-.3 0-.593-.028-.877-.082.593 1.85 2.313 3.198 4.352 3.234-1.595 1.25-3.604 1.995-5.786 1.995-.376 0-.747-.022-1.112-.065 2.062 1.323 4.51 2.093 7.14 2.093 8.57 0 13.255-7.098 13.255-13.254 0-.2-.005-.402-.014-.602.91-.658 1.7-1.477 2.323-2.41z"></path></g></svg></a> `
      : ''
    const time = `<time datetime="${escapeHTML(item.isoDate)}" title="${escapeHTML(item.isoDate)}">${escapeHTML(
      item.relativeDate,
    )}</time>`

    return `
<article>
<h2><a href="${escapeHTML(item.link)}" target="_blank" rel="noopener">${escapeHTML(item.title)}</a></h2>
${hnLink}${twitterLink}${time}
</article>
`.trim()
  })
  .join('\n')}
<footer>
<span>Copyright &copy; ${new Date().getFullYear()} <a href="https://jacobwgillespie.com" target="_blank" rel="noopener">Jacob Gillespie</a></span> <a href="/rss">RSS</a> <a href="/atom">Atom</a> <a href="/json">JSON</a>
</footer>
<body>
</html>
  `.trim()
}
