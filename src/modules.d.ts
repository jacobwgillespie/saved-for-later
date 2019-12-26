declare module '*.css' {
  var source: string
  export default source
}

declare module '*.ico' {
  var source: string
  export default source
}

// This will be populated by Webpack
declare const FEEDBIN_API_KEY: string
