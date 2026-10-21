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
and font licensing should be resolved before any production migration. The saved
Squarespace markup and runtime identify a dark, single-image lightbox with a close
control and 0.6-second transition. The preview uses the authored full-size image,
a dark modal, outside-click/Escape/close controls, and focus return. Saved animation
settings specify fade/ease/1.5 seconds; later content fades into view, while
already visible content and reduced-motion content remain static. Browser visual
parity is still unverified. The Google map and form validation/delivery are not
reproduced. Do not use this preview for production
or change `emilypotts.ca` DNS based on visual similarity alone.
