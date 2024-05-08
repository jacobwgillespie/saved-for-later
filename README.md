# 🌐 Saved for Later [![Build Status](https://github.com/jacobwgillespie/saved-for-later/workflows/CI/badge.svg)](https://github.com/jacobwgillespie/saved-for-later/actions)

> A linkblog, from Jacob—[https://savedforlater.dev](https://savedforlater.dev)

### What

This linkblog represents items starred in my feed reader ([Feedbin](https://feedbin.com/)). Links are displayed in reverse-chronological order. Special handling is taken for Hacker News links, where the website will display a link to the HN discussion in addition to a link to the article or website being discussed.

Additionally, the links are available as an RSS feed, allowing anyone the ability to subscribe to these links. The feed is available in three formats, [RSS 2.0](https://savedforlater.dev/rss), [Atom 1.0](https://savedforlater.dev/atom), and [JSON Feed 1.0](https://savedforlater.dev/json).

Items are starred or favorited so that I can return to them later, typically for one of three reasons:

1. Something in the linked article seems interesting or valuable to save
2. Something in the _comments_ about the article seems worth exploring
3. Less frequently, the topic in general sparked an idea, and I want to be reminded of this topic, not necessarily the specific link, again at a later date

As such, not all items appearing on this linkblog remain on this list, as I may return to them, discover them uninteresting, and remove. Relatedly, items that are _currently_ on the list may be there not on merit, but instead, pending investigation.

### Why

The purpose is two-fold. Firstly, _Saved for Later_ is useful to me as a destination for finding and reading items I've saved for later. And secondly, I have hopes that this curated list of links may be useful to others, if only to spark some sort of intellectual curiosity towards a linked topic.

### How

_Saved for Later_ is powered by [Astro](https://astro.build/) and [Cloudflare Pages](https://pages.cloudflare.com/).

Feed items are scraped directly from the Feedbin API and saved into a Cloudflare KV key, with a 15 minute expiration. Then every 5 minutes, a background cron job fetches the latest items and updates the key. In effect, this should mean that a visitor to the site should view the latest data, at most 5 minutes old.

### Contributing

Contributions are welcome! Feel free to open an issue or pull request if you so desire.

### License

MIT License, see `LICENSE`.
