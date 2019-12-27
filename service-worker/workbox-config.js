module.exports = {
  clientsClaim: true,
  globDirectory: 'public/',
  globPatterns: ['**/*.{png,css,html}'],
  runtimeCaching: [
    {
      urlPattern: /\/.*/,
      handler: 'NetworkFirst',
    },
  ],
  skipWaiting: true,
  swDest: 'public/sw.js',
}
