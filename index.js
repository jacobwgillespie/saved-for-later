const {send} = require('micro')
const cldrData = require('cldr-data')
const escape = require('escape-html')
const fetch = require('node-fetch')
const Globalize = require('globalize')
const handler = require('serve-handler')
const path = require('path')
const RelativeTime = require('relative-time').default
const xml = require('xml-js')

Globalize.load(cldrData.entireSupplemental(), cldrData.entireMainFor('en'))
Globalize.locale('en')
const relativeTime = new RelativeTime()

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

async function getStarsFeed(req) {
  const starsFeed = await fetch(SOURCE_FEED).then(res => res.text())
  const feed = xml.xml2js(starsFeed)

  const rss = feed.elements[0]
  const channel = rss.elements[0]

  // Rewrite title
  const titleElement = channel.elements.find(el => el.name === 'title')
  const titleTextElement = titleElement ? titleElement.elements.find(el => el.type === 'text') : false
  if (titleTextElement) {
    titleTextElement.text = 'Links by Jacob'
  }

  // Rewrite link
  const linkElement = channel.elements.find(el => el.name === 'atom:link')
  if (linkElement) {
    linkElement.attributes.href = `https://links.jacobwgillespie.com${req.url}`
  }

  return feed
}

function extractValue(feedItem, tag) {
  const element = feedItem.elements.find(e => e.name === tag)
  const textElement = element ? element.elements.find(e => e.type === 'text') : false
  return textElement ? textElement.text : false
}

function getFeedItems(feed) {
  const rss = feed.elements[0]
  const channel = rss.elements[0]
  return channel.elements
    .filter(element => element.type === 'element' && element.name === 'item')
    .map(element => {
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
        title,
        description,
        pubDate,
        date,
        isoDate: date.toISOString(),
        relativeDate: relativeTime.format(date),
        link,
        creator,
        hn,
      }
    })
}

function filterNonTech(feed) {
  const clonedFeed = xml.xml2js(xml.js2xml(feed))
  const rss = clonedFeed.elements[0]
  const channel = rss.elements[0]
  channel.elements = channel.elements.filter(element => {
    if (element.type !== 'element' || element.name !== 'item') {
      return true
    }
    const creator = extractValue(element, 'dc:creator')
    return !TECH_BLACKLIST.some(blacklistedSource => creator.includes(blacklistedSource))
  })
  return clonedFeed
}

function template(req, items, tech = false) {
  const feedTitle = `Links by Jacob RSS ${tech ? 'tech ' : ''}feed`
  const feedLink = `/${tech ? 'tech-' : ''}feed.xml`

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta property="og:title" content="Links by Jacob" />
<meta property="og:url" content="https://links.jacobwgillespie.com${req.url}" />
<meta property="og:description" content="Starred ${tech ? 'tech ' : ''}links from my feed reader." />
<title>${tech ? 'Tech ' : ''}Links by Jacob</title>
<link rel="stylesheet" href="/style.css" />
<link rel="alternate" type="application/rss+xml" title="${feedTitle}" href="${feedLink}" />
</head>
<body>
<h1>${tech ? 'Tech ' : ''}Links by Jacob</h1>
${items
  .map(item => {
    const hnLink = item.hn
      ? `<a href="https://news.ycombinator.com/item?id=${item.hn}" target="_blank" class="hn">HN</a> `
      : ''

    return `
<article>
<h2><a href="${escape(item.link)}" target="_blank">${escape(item.title)}</a></h2>
${hnLink}<time datetime="${escape(item.isoDate)}" title="${escape(item.isoDate)}">${escape(item.relativeDate)}</time>
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

module.exports = async (req, res) => {
  // Cache everything for 5 minutes
  res.setHeader('Cache-Control', 'private, max-age=300')

  const starsFeed = await getStarsFeed(req)
  switch (req.url) {
    case '/':
      res.setHeader('Content-Type', 'text/html')
      return send(res, 200, template(req, getFeedItems(starsFeed)))

    case '/tech':
      res.setHeader('Content-Type', 'text/html')
      return send(res, 200, template(req, getFeedItems(filterNonTech(starsFeed)), true))

    case '/tech-feed.xml':
      res.setHeader('Content-Type', 'application/rss+xml')
      return send(res, 200, xml.js2xml(filterNonTech(starsFeed)))

    case '/feed.xml':
      res.setHeader('Content-Type', 'application/rss+xml')
      return send(res, 200, xml.js2xml(starsFeed))

    default:
      return handler(req, res, {public: path.join(__dirname, 'public')})
  }
}
