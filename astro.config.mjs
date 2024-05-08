import cloudflare from '@astrojs/cloudflare'
import tailwind from '@astrojs/tailwind'
import {defineConfig} from 'astro/config'

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind()],
  output: 'server',
  adapter: cloudflare({platformProxy: {enabled: true}}),
  vite: {
    resolve: {
      alias: {
        stream: 'node:stream',
        string_decoder: 'node:string_decoder',
      },
    },
    ssr: {
      external: ['node:stream', 'node:string_decoder'],
    },
  },
})
