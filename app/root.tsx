import type {LinksFunction, MetaFunction} from '@remix-run/cloudflare'
import {Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration} from '@remix-run/react'
import stylesUrl from '~/styles/app.css'

export const links: LinksFunction = () => {
  return [{rel: 'stylesheet', href: stylesUrl}]
}

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  viewport: 'width=device-width,initial-scale=1',
})

export default function App() {
  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
      </head>
      <body className="bg-stone-800 text-stone-100">
        <Outlet />
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
