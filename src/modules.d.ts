declare module '@cloudflare/kv-asset-handler'

declare module '*.css' {
  var source: string
  export default source
}

declare module '*.png' {
  var source: string
  export default source
}

// This will be populated by Webpack
declare const FEEDBIN_API_KEY: string
