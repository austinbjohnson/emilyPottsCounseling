# Near / Across — local design prototype

## Plan before implementation

- Palette: cloud #F1F5F4; marine #193F50; lake #BEDDE2; lilac #DCD6EE; white #FFFFFF. Geography has one solid fill; no coverage gradients.
- Type: system Georgia for expansive short headings; system Helvetica Neue / Arial for concise practical information. No remote font requests.
- Layout: a compact useful masthead; a large `Near. / Across.` title with a genuine portrait; one full-width geographic chapter; a lilac consultation ending. Left-aligned reading; map and labels occupy their own space.
- Mobile structure: identity → scope → Jane → immediate About/Services/FAQs/Contact links → title/portrait → BC illustration → service link → consultation.
- Signature: a precise province silhouette fills the phone, contrasting the human scale of Emily's real portrait. The point identifies North Vancouver only; it is not an office locator, availability map, or coverage checker.

## Generic-template critique and repair

A pale background, serif headline and portrait alone would repeat earlier variants. The defining object is therefore the actual province geometry, drawn large enough to retain its coastal character; typography shifts dramatically between the human introduction and province chapter. No cards, hero-photo mask, tabs, visual effects, sticky scenes, animation, or scripted interaction. Practical routes are available before any large artwork. The map does not require interaction or disclose anything about the visitor.

## Geometry provenance

- Authoritative cartographic primary publisher: Natural Earth, maintained by Nathaniel V. Kelso and Tom Patterson, supported by NACIS. Official project: https://www.naturalearthdata.com/ ; official repository https://github.com/nvkelso/natural-earth-vector . This is cartographic reference data, not a legal boundary survey.
- Actual downloaded file: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_1_states_provinces.geojson
- Natural Earth terms: https://www.naturalearthdata.com/about/terms-of-use/ — public domain.
- Extracted British Columbia feature stored as bc-source.geojson. Source geometry is retained, without invented coastline or SVG smoothing. All exterior rings/islands are rendered.
- Projection: equirectangular with longitude scaled by cos(54.5°), uniform fit to SVG, latitude north-up. Coordinates rounded to 2 SVG decimals; no other simplification.
- North Vancouver city marker: approximately 49.317°N, 123.067°W; city-centre reference from https://en.wikipedia.org/wiki/North_Vancouver_(city). Marker denotes the city, never an exact office address. Uses the same mathematical projection as province geometry.
- Public repository portrait: /assets/img/emily-portrait-3.jpg. No implication that portrait location is an office.

## Content and behavior

Verified facts: Emily Potts, RCC; individual and couples counselling; in-person North Vancouver and online BC; free 20-minute consultation. Exact supplied Jane target is used. All links are ordinary anchors; no JavaScript or external resources. Static map has a textual equivalent; large text extends natural flow. Normal scrolling is the only progression. No publication authorized by this prototype.

## Local QA

Chrome viewport review: 320×568 and 390×780, first frame and geographic chapter during native scrolling. The initial closing heading caused 11px overflow at the narrow size; its small-screen scale and wrapping were repaired. Final 320 test: document clientWidth 305 and scrollWidth 305 (browser scrollbar consumes 15px). At 390: all four initial route targets measured 44px tall. Portrait loaded, script count 0, keyboard skip link focused main. Geography appears during the first phone scroll; duplicate location paragraph was removed after visual inspection. Static SVG contains 23 source polygons. No JavaScript, remote font, animation, fixed or sticky content. Physical-device, screen-reader and 200% text-only zoom review remain unperformed.

## Pacing repair after parent review

Removed the repeated geographic H2 and introductory sentence; reduced mobile hero padding and portrait height; placed the in-person/online caption before the SVG. At Chrome 320×568 (305px content width with scrollbar), caption begins at absolute y393.6 and SVG at y482.1, with a 258.3px height. A roughly 250px native scroll shows the complete silhouette, North Vancouver marker and both service labels together. Header Jane and all practical routes remain unchanged and immediately available. Final client/scroll widths both 305px. This supersedes the earlier first-scroll pacing notes.
