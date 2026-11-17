# TWOJEYS storefront concept

A redesign concept for the TWOJEYS storefront. Static HTML, CSS and vanilla JS, no build step: open `index.html`.

## What is real

- `catalog.js`: 86 products taken from the public product feed on twojeys.com on 17 Nov 2026 (names, prices, options, stock per variant, descriptions). It is a curated slice of the full catalog: the first in-stock products from each collection.
- `img/`: product photos (up to three per product, 800px wide), campaign images from the homepage, and the logo.
- Manifesto, craft, store list, shipping, returns, care and guarantee copy, taken or condensed from the brand's own pages.

The catalog is a snapshot. Prices and stock will drift from the live store.

## What works

Group, type, new-in and best-seller filters, sorting, search, saved products, product view with photo gallery and per-variant stock, bag drawer with quantity editing and a free-shipping progress bar. Bag and saved products persist in `localStorage`.

## What is not connected

Checkout and the newsletter form. Footer assistance links open the live site.
