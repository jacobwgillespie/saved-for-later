import 'workbox-sw'

workbox.precaching.precacheAndRoute([])

workbox.routing.registerRoute(new RegExp('/.*'), new workbox.strategies.NetworkFirst())
