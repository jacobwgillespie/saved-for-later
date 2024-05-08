import cloudflare from '@astrojs/cloudflare'
import tailwind from '@astrojs/tailwind'
import {defineConfig} from 'astro/config'

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  output: 'server',
  adapter: cloudflare({platformProxy: {enabled: true}}),
  vite: {
    ssr: {
      external: ['stream', 'string_decoder'],
    },
  },
})
