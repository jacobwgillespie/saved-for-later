import {formatDistanceToNow} from 'date-fns'
import escapeHTML from 'escape-html'
import CloudflareWorkerGlobalScope from 'types-cloudflare-worker'
import xml from 'xml-js'
import favicon from '../public/favicon.ico'
import style from '../public/style.css'

declare var self: CloudflareWorkerGlobalScope

self.addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request: Request) {
  const url = new URL(request.url)

  switch (url.pathname) {
    case '/':
      return new Response(template(url.pathname, getFeedItems(await getStarsFeed(url.pathname))), {
        headers: {'Content-Type': 'text/html; charset=utf-8'},
      })

    case '/tech':
      return new Response(template(url.pathname, getFeedItems(filterNonTech(await getStarsFeed(url.pathname))), true), {
        headers: {'Content-Type': 'text/html; charset=utf-8'},
      })

    case '/feed.xml':
      return new Response(xml.js2xml(await getStarsFeed(url.pathname)), {
        headers: {'Content-Type': 'application/atom+xml; charset=utf-8'},
      })

    case '/tech-feed.xml':
      return new Response(xml.js2xml(filterNonTech(await getStarsFeed(url.pathname))), {
        headers: {'Content-Type': 'application/atom+xml; charset=utf-8'},
      })

    case '/style.css':
      return new Response(style, {headers: {'Content-Type': 'text/css; charset=utf-8'}})

    case '/favicon.ico':
      return new Response(favicon, {headers: {'Content-Type': 'image/x-icon; charset=utf-8'}})

    default:
      return new Response('not found', {status: 404})
  }
}

const TECH_BLACKLIST = [
  'Ars Technica',
  'Hyperbole and a Half',
  'In Your Face Cake',
  'Kotaku',
  'Lifehacker',
  'PlayStation.Blog',
  'Polygon',
  'Saturday Morning Breakfast Cereal',
  'Scribbles from a Suitcase',
  'The Oatmeal',
  'The Verge',
]

const SOURCE_FEED = 'https://feedbin.com/starred/4e98e7608d29f0b94f21a0dad25f3a7f.xml'

async function getStarsFeed(url: string) {
  const starsFeed = await fetch(SOURCE_FEED).then(res => res.text())
  const feed = xml.xml2js(starsFeed)

  const rss = feed.elements[0]
  const channel = rss.elements[0]

  // Rewrite title
  const titleElement = channel.elements.find((el: any) => el.name === 'title')
  const titleTextElement = titleElement ? titleElement.elements.find((el: any) => el.type === 'text') : false
  if (titleTextElement) {
    titleTextElement.text = 'Links by Jacob'
  }

  // Rewrite link
  const linkElement = channel.elements.find((el: any) => el.name === 'atom:link')
  if (linkElement) {
    linkElement.attributes.href = `https://links.jacobwgillespie.com${url}`
  }

  return feed
}

function extractValue(feedItem: any, tag: string) {
  const element = feedItem.elements.find((e: any) => e.name === tag)
  const textElement = element ? element.elements.find((e: any) => e.type === 'text') : false
  return textElement ? textElement.text : false
}

function getFeedItems(feed: any) {
  const rss = feed.elements[0]
  const channel = rss.elements[0]
  return channel.elements
    .filter((element: any) => element.type === 'element' && element.name === 'item')
    .map((element: any) => {
      const title = extractValue(element, 'title')
      const description = extractValue(element, 'description')
      const pubDate = extractValue(element, 'pubDate')
      const link = extractValue(element, 'link')
      const creator = extractValue(element, 'dc:creator')
      const date = new Date(pubDate)

      const hn =
        creator === 'Hacker News' ? description.match(/https:\/\/news\.ycombinator\.com\/item\?id=(\d+)/)[1] : false

      return {
        creator,
        date,
        description,
        hn,
        isoDate: date.toISOString(),
        link,
        pubDate,
        relativeDate: `${formatDistanceToNow(date)} ago`,
        title,
      }
    })
}

function filterNonTech(feed: any) {
  const clonedFeed = xml.xml2js(xml.js2xml(feed))
  const rss = clonedFeed.elements[0]
  const channel = rss.elements[0]
  channel.elements = channel.elements.filter((element: any) => {
    if (element.type !== 'element' || element.name !== 'item') {
      return true
    }
    const creator = extractValue(element, 'dc:creator')
    return !TECH_BLACKLIST.some(blacklistedSource => creator.includes(blacklistedSource))
  })
  return clonedFeed
}

function template(url: string, items: any[], tech = false) {
  const feedTitle = `Links by Jacob RSS ${tech ? 'tech ' : ''}feed`
  const feedLink = `/${tech ? 'tech-' : ''}feed.xml`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta property="og:title" content="Links by Jacob" />
<meta property="og:url" content="https://links.jacobwgillespie.com${url}" />
<meta property="og:description" content="Starred ${tech ? 'tech ' : ''}links from my feed reader." />
<title>${tech ? 'Tech ' : ''}Links by Jacob</title>
<link rel="stylesheet" href="/style.css" />
<link rel="alternate" type="application/atom+xml" title="${feedTitle}" href="${feedLink}" />
</head>
<body>
<h1>${tech ? 'Tech ' : ''}Links by Jacob</h1>
${items
  .map(item => {
    const hnLink = item.hn
      ? `<a href="https://news.ycombinator.com/item?id=${item.hn}" target="_blank" class="hn">HN</a> `
      : ''
    const time = `<time datetime="${escapeHTML(item.isoDate)}" title="${escapeHTML(item.isoDate)}">${escapeHTML(
      item.relativeDate,
    )}</time>`

    return `
<article>
<h2><a href="${escapeHTML(item.link)}" target="_blank">${escapeHTML(item.title)}</a></h2>
${hnLink}${time}
</article>
`.trim()
  })
  .join('\n')}
<footer>
<span>Copyright &copy; ${new Date().getFullYear()} <a href="https://jacobwgillespie.com" target="_blank">Jacob Gillespie</a></span> <a href="/feed.xml">RSS</a> <a href="/tech-feed.xml">RSS (Tech Only)</a>
</footer>
<body>
</html>
  `.trim()
}
