# Kitchens By Newline (GitHub Pages)

## Why users were seeing old updates
The site referenced non-versioned static files (`styles.css`, `script.js`, media paths). Some browsers and network layers kept serving cached copies after a deploy, so users could remain on older frontend assets.

## What was changed
- Added cache-busting query versions to local CSS/JS/media URLs in `index.html`.
- Added `version.json` as a lightweight deployment version marker.
- Added frontend version polling in `script.js`:
  - fetches `version.json` with `cache: no-store`
  - detects a newer deployed version
  - triggers one safe page refresh to pick up new asset references
- No service worker is currently used, so there is no SW cache to migrate.
- No localStorage or IndexedDB data is cleared.

## Release step for future deploys
On each deploy, update the version string in:
- `index.html` (`?v=...` query values)
- `version.json` (`"version": "..."`)

Use the same version value in both files (for example: date-based `20260726` or timestamp-based `202607261530`).
