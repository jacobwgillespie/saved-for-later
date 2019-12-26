declare module '@cloudflare/kv-asset-handler'

declare module '*.css' {
  var source: string
  export default source
}

declare module '*.png' {
  var source: string
  export default source
}

// These will be populated by Webpack
declare const DEBUG: boolean
declare const FEEDBIN_API_KEY: string
declare const TWITTER_API_KEY: string
