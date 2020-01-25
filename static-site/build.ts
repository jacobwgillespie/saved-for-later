import {format, parseISO} from 'date-fns'
import 'dotenv/config'
import escapeHTML from 'escape-html'
import fs from 'fs'
import {buildFeed, fetchFeedItems} from './feed'

const template = fs.readFileSync('static-site/template.html').toString('utf8')
const style = fs.readFileSync('static-site/style.css').toString('utf8')

export async function build() {
  const items = await fetchFeedItems()

  const itemsHTML: string[] = []

  for (const item of items) {
    const isoDate = item.date
    const formattedDate = format(parseISO(item.date), 'LLL d yyyy')

    const hnLink = item.hn
      ? `<a href="https://news.ycombinator.com/item?id=${item.hn}" target="_blank" rel="noopener" class="hn">HN</a> `
      : ''

    const lobstersLink = item.lobsters
      ? `<a href="${item.lobsters}" target="_blank" rel="noopener" class="lobsters">L</a> `
      : ''

    const twitterLink = item.twitter
      ? `<a href="${escapeHTML(item.twitter.link)}" target="_blank" rel="noopener" class="tw">${
          item.twitter.username
        }</a> `
      : ''

    itemsHTML.push(
      `
<article>
<a href="${escapeHTML(item.link)}" target="_blank" rel="noopener"><h2>${escapeHTML(item.title)}</h2></a>
${hnLink}${lobstersLink}${twitterLink}
<time datetime="${escapeHTML(isoDate)}" title="${escapeHTML(isoDate)}">${escapeHTML(formattedDate)}</time>
</article>
  `.trim(),
    )
  }

  const indexHTML = template
    .replace('YEAR', new Date().getFullYear().toString())
    // .replace('SERVICE_WORKER', serviceWorker)
    .replace('STYLE', `<style>${style}</style>`)
    .replace('ITEMS', itemsHTML.join('\n'))

  fs.writeFileSync('public/index.html', indexHTML)

  const feed = await buildFeed(items)
  fs.writeFileSync('public/atom.xml', feed.atom1())
  fs.writeFileSync('public/feed.json', feed.json1())
  fs.writeFileSync('public/rss.xml', feed.rss2())
}

build()
