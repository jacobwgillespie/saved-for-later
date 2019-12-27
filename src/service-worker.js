// @ts-check

importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js')

workbox.precaching.precacheAndRoute([])

workbox.routing.registerRoute(
  new RegExp('/.*'),
  new workbox.strategies.StaleWhileRevalidate({plugins: [new workbox.broadcastUpdate.Plugin()]}),
)
workbox.routing.registerRoute(new RegExp('/.*'), new workbox.strategies.NetworkFirst())
