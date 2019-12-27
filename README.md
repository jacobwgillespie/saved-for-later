# 🌐 Saved for Later [![Build Status](https://github.com/jacobwgillespie/saved-for-later/workflows/CI/badge.svg)](https://github.com/jacobwgillespie/saved-for-later/actions)

> A linkblog, from Jacob—[https://savedforlater.dev](https://savedforlater.dev)

### What

This linkblog represents items starred in my feed reader ([Feedbin](https://feedbin.com/)) or favorited on Twitter ([@jacobwgillespie](https://twitter.com/jacobwgillespie)). Links are displayed in reverse-chronological order. Special handling is taken for Hacker News links and Tweets, where the website will display a link to the HN discussion or original Twitter thread in addition to a link to the article or website being discussed.

Additionally, the links are available as an RSS feed, allowing anyone the ability to subscribe to these links. The feed is available in three formats, [RSS 2.0](https://savedforlater.dev/rss), [Atom 1.0](https://savedforlater.dev/atom), and [JSON Feed 1.0](https://savedforlater.dev/json).

Items are starred or favorited so that I can return to them later, typically for one of three reasons:

1. Something in the linked article seems interesting or valuable to save
2. Something in the _comments_ about the article seems worth exploring
3. Less frequently, the topic in general sparked an idea, and I want to be reminded of this topic, not necessarily the specific link, again at a later date

As such, not all items appearing on this linkblog remain on this list, as I may return to them, discover them uninteresting, and remove. Relatedly, items that are _currently_ on the list may be there not on merit, but instead, pending investigation.

### Why

The purpose is two-fold. Firstly, _Saved for Later_ is useful to me as a destination for finding and reading items I've saved for later, accessible via the web and as a Progressive Web App (PWA) that I can install on my Mac and iPhone. And secondly, I have hopes that this curated list of links may be useful to others, if only to spark some sort of intellectual curiosity towards a linked topic.

This project is also an attempt to further explore new technologies, specifically:

- [CloudFlare Workers](https://workers.cloudflare.com/)
- [Service Workers](https://developers.google.com/web/fundamentals/primers/service-workers)
- [Progressive Web Apps](https://developers.google.com/web/progressive-web-apps)

### How

_Saved for Later_ is comprised of three components:

The **static site generator** reads from the Feedbin API and Twitter API to retrieve starred and favorited items, respectively, and generates static assets for the homepage HTML and feed files.

The **service worker** is a special JavaScript asset that is installed in the browser and is responsible for maintaining an offline cache of the contents of the site. This provides near-instant load times when visiting the site, and is also responsible for the plumbing required to support installing _Saved for Later_ as a progressive web app (PWA). The service worker also updates the site in the background, prompting for refresh if a new copy of the homepage is found.

Finally, the **Cloudflare worker** is responsible for serving the static site and service worker via Cloudflare's [Workers Sites](https://workers.cloudflare.com/sites/). This worker is also responsible for handling redirects and clean URL routing.

### Contributing

Contributions are welcome! Feel free to open an issue or pull request if you so desire.

### License

MIT License, see `LICENSE`.
