export interface FeedItem {
  id: string
  title: string
  link: string
  date: Date
  content?: string
  hn: string | false
  twitter: string | false
  twitterUsername?: string
}
