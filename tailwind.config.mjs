import * as colors from '@radix-ui/colors'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        ...colors.sandDark,
        ...colors.sageDark,
        ...colors.oliveDark,
      },
    },
  },
  plugins: [],
}
