# Live-site replica preview

These 13 page files are static, sanitized snapshots of the public pages listed at
<https://emilypotts.ca/sitemap.xml> on 21 October 2026. `prepare.py` documents the
transformation from temporary public HTML downloads. The original Squarespace
application scripts, analytics, reCAPTCHA, embedded map and form delivery code are
not included. Public responsive markup, authored text and layout styles remain.
Inert Squarespace text-mark settings are retained; small local SVGs recreate the
authored scribble on “exhaled.” and circle on “burnt out” with their measured
colors, dimensions and draw durations. Reduced-motion visitors see completed marks.

The Cloudflare build promotes these pages to the preview's normal routes while
also retaining `/live-replica/` as a review path. Older repository pages and design
variants remain in source control. The visible booking and consultation links use
the Jane destinations found on the live site. Three live buttons with empty booking
links and one broken first-article link are repaired in the preview.

This preview **does not receive client or workshop messages**. Its Contact page and
workshop dialog direct visitors to Emily's existing live contact form. The public
page styling still uses Squarespace's CDN and Adobe Typekit, so independent hosting
and font licensing should be resolved before any production migration. The Google
map, original lightbox animation, form validation/delivery, and some entrance or
scroll effects are not reproduced exactly. Do not use this preview for production
or change `emilypotts.ca` DNS based on visual similarity alone.
