module.exports = {
  clientsClaim: true,
  globDirectory: 'public/',
  globPatterns: ['**/*.{png,css,html,js,webmanifest}'],
  runtimeCaching: [
    {
      urlPattern: /\/.*/,
      handler: 'NetworkFirst',
    },
  ],
  skipWaiting: true,
  swDest: 'public/sw.js',
}
