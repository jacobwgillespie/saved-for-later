import type {LinksFunction, LoaderFunction, MetaFunction} from '@remix-run/cloudflare'
import {json} from '@remix-run/cloudflare'
import {useLoaderData} from '@remix-run/react'
import {formatDistanceToNow, parseISO} from 'date-fns'
import {useEffect, useState} from 'react'
import {loadEnvFromContext} from '~/utils/env.server'
import type {FeedItem} from '~/utils/feed.server'
import {fetchFeedItems} from '~/utils/feed.server'

export const meta: MetaFunction = () => {
  return {
    title: 'Saved for Later',
    'og:title': 'Saved for Later',
    'og:url': 'https://savedforlater.dev/',
    'og:description': 'Starred links from my feed reader.',
  }
}

export const links: LinksFunction = () => {
  return [
    {rel: 'shortcut icon', href: '/icon-512x512.png'},
    {rel: 'alternate', type: 'application/rss+xml', title: 'Saved for Later RSS feed', href: '/rss'},
    {rel: 'alternate', type: 'application/atom+xml', title: 'Saved for Later RSS feed', href: '/atom'},
    {rel: 'alternate', type: 'application/json', title: 'Saved for Later RSS feed', href: '/json'},
  ]
}

interface LoaderData {
  items: FeedItem[]
}

export const loader: LoaderFunction = async ({context, request}) => {
  loadEnvFromContext(context)
  const url = new URL(request.url)
  const items = await fetchFeedItems(context, url.searchParams.has('refresh'))
  return json<LoaderData>({items})
}

export default function Index() {
  const {items} = useLoaderData<LoaderData>()
  return (
    <div className="flex min-h-screen flex-col p-4 md:p-16 md:pb-8">
      <div className="flex-1 space-y-4 font-light">
        <h1 className="text-2xl leading-none md:text-4xl">Saved for Later</h1>

        {items.map((item) => (
          <Item key={item.id} item={item} />
        ))}
      </div>

      <footer className="mt-4 space-x-4 border-t border-stone-700 pt-4 text-sm text-stone-400 md:mt-8 md:pt-8">
        <span>
          Copyright &copy; {new Date().getFullYear()}{' '}
          <a className="hover:text-slate-50" href="https://jacobwgillespie.com" target="_blank" rel="noreferrer">
            Jacob Gillespie
          </a>
        </span>
        <a className="hover:text-slate-50" href="/rss">
          RSS
        </a>
        <a className="hover:text-slate-50" href="/atom">
          Atom
        </a>
        <a className="hover:text-slate-50" href="/json">
          JSON
        </a>
        <a
          className="hover:text-slate-50"
          href="https://github.com/jacobwgillespie/saved-for-later"
          target="_blank"
          rel="noreferrer"
        >
          Source
        </a>
      </footer>
    </div>
  )
}

interface ItemProps {
  item: FeedItem
}

const Item: React.FC<ItemProps> = ({item}) => {
  const [timeAgo, setTimeAgo] = useState(() => formatTimeAgo(item.date))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeAgo(formatTimeAgo(item.date))
    }, 1000 * 60)
    return () => clearInterval(timer)
  }, [item.date])

  return (
    <div className="flex flex-col items-baseline gap-1 leading-none md:flex-row">
      <a
        href={item.link}
        className="overflow-hidden overflow-ellipsis text-lg visited:text-stone-500 md:whitespace-nowrap"
      >
        {item.title}
      </a>
      {item.hn && (
        <a
          href={`https://news.ycombinator.com/item?id=${item.hn}`}
          target="_blank"
          rel="noreferrer"
          className="font-normal text-[#f60]"
        >
          HN
        </a>
      )}
      {item.lobsters && (
        <a href={item.lobsters} target="_blank" rel="noreferrer" className="font-normal text-[#c40000]">
          L
        </a>
      )}
      <time dateTime={item.date} title={item.date} className="whitespace-nowrap text-sm text-stone-500">
        {timeAgo}
      </time>
    </div>
  )
}

function formatTimeAgo(time: string) {
  return `${formatDistanceToNow(parseISO(time))} ago`
}
