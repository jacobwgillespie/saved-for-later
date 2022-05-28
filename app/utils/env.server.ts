export let FEEDBIN_API_KEY = ''
export let TWITTER_API_KEY = ''

export function loadEnvFromContext(context: any) {
  if (!FEEDBIN_API_KEY) FEEDBIN_API_KEY = context.FEEDBIN_API_KEY
  if (!TWITTER_API_KEY) TWITTER_API_KEY = context.TWITTER_API_KEY
}
