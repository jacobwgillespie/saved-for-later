import * as precaching from 'workbox-precaching'
import * as routing from 'workbox-routing'
import {NetworkFirst} from 'workbox-strategies/NetworkFirst'

const workbox = {precaching, routing}
workbox.precaching.precacheAndRoute([])
workbox.routing.registerRoute(new RegExp('/.*'), new NetworkFirst())
