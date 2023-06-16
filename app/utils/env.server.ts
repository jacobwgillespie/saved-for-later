export let FEEDBIN_API_KEY = ''

export function loadEnvFromContext(context: any) {
  if (!FEEDBIN_API_KEY) FEEDBIN_API_KEY = context.FEEDBIN_API_KEY
}
