# Emily design review · October 2026

Public comparison route: `/em-review/`. Review pages: `/em-review/1/` through `/em-review/6/`. These routes are unlinked from the faithful homepage but publicly accessible. They are excluded from the sitemap and marked `noindex,nofollow`.

## Source and direction

The two authorized feedback messages and all five inline colour and website moodboard images were inspected privately. The prototypes use Emily's existing public copy and photographs; reference images and private correspondence are not in the site. Current links, consultation duration and fees were checked against emilypotts.ca and its Jane booking page. The official States of Sage site informed the emphasis on nature imagery and composed page structure, without copying its imagery or code.

The official Anthropic frontend-design skill was applied. Astra proposed and revised the concepts; Sol and Luna challenged them before construction. Their initial objection was that three soft editorial pages with different colours would repeat earlier rejected static variants. The revised set separates a spatial index, a personal introduction with optional depth, and a practical service guide.

| Route | Distinct premise | Tradeoff |
| --- | --- | --- |
| 1 · The Clearing | A landscape and portrait share a single entrance with a native page index; therapy sections read as a navigable field guide. | Its first screen is more visual than the others and longer personal copy remains lower on the page. |
| 2 · Beside the Portrait | Emily's personal welcome leads; a native disclosure lets the visitor choose whether to read the longer approach story. | Most restrained direction; its quality relies on portrait crop and type rhythm. |
| 3 · At a Glance | Direct routes to service descriptions and a semantic fee table; a broader outdoor image offsets the dense practical information. | More utilitarian and less atmospheric. |

Postbuild Astra, Sol and Luna source reviews found mobile width, first-touch link, portrait-crop and service-language defects. The mobile hero in route 3 now uses one column; service rows and prices use readable widths and type. Route 2 now puts Emily's greeting before its photo on narrow screens and gives the photo a controlled crop. Route 1 now offers direct fees and FAQ links and uses a continuous desktop service list. All three have current Jane booking and a return to the comparison route.

Each page is semantic HTML with visible focus styles, a working no-JavaScript path and reduced-motion handling. Longer text is optional in route 2, but booking and service information are always reachable. No intake form or tracking flow was added. The faithful root and shared replica files are byte-identical to the previous published review build; only the four new review paths differ.

## Verification limit

HTTP, file, link and regression tests passed locally. The Mac browser was locked during this review, so actual Chrome screenshots, keyboard traversal, phone-sized reflow and photo-crop approval remain to be checked on the public preview before treating any direction as a finished design. `noindex` is not access protection.

## Second composition study: routes 4–6

Austin asked for stronger silhouettes at phone width as well as desktop. The five privately viewed moodboard images informed the darker forest/photo contrast, lavender and blue-green fields, typewriter-adjacent annotations, and botanical mood. The moodboard photographs and layouts were not copied or published. The public source asset named `home-olive-branch.jpg` is a dark conifer photograph, so it is used as a forest strip rather than described as a delicate olive drawing.

Before building, Astra proposed three different visual structures; Sol and Luna independently challenged novelty, mobile reading order, booking access, and sensory comfort. An inset landscape proposal for route 5 was rejected because it resembled route 1. Astra replaced it with a vertical photographic edge and contiguous lavender reading field, retained at 390px. The accepted concepts were:

| Route | Composition at desktop and 390px | Deliberate tradeoff |
| --- | --- | --- |
| 4 · Botanical Poster | A shallow, wide forest strip over an oversized, two-line typographic field; on mobile the photo remains a short horizontal band above the large title and two-column orientation links. | The poster makes a stronger first impression but includes less service detail on the first page. |
| 5 · Along the Shore | A tall photograph runs beside a lavender reading field, with the seam retained on phones; the greeting opens into a full-width blue-gray field. | The image gets a narrow crop on phones, so live visual crop review is important. |
| 6 · Open Folio | Four adjoining planes on desktop: welcome and three service leaves. The planes become stacked native disclosures on mobile, with direct fees and FAQ links outside disclosures. | More useful first-screen service information, but less photographic atmosphere than routes 4 or 5. |

Postbuild Sol, Luna and Astra challenged each other's source. Route 4 gained a compact sticky booking masthead and a typewriter-style location line. Route 5 dropped a fixed bottom booking overlay that could hide content; its sticky header now carries a compact booking link. Route 6 was restructured from a conventional introduction followed by columns into a contiguous folio and compact mobile disclosure set. Its dark-panel focus indicator was replaced with a light, high-contrast ring. All variants use current public Emily words/photos, Jane booking, keyboard-native links and disclosure, and reduced-motion styles. No new form, tracking flow, or private moodboard material was added.

Source review and endpoint tests are distinct from visual verification. Chrome was not available through the authorized UI connection when this second study was built (the app selection timed out), so desktop/phone visual comparison, actual touch, keyboard focus traversal and photo crop remain unverified. A public preview can be reviewed in a browser after deployment; `noindex` does not make these paths private.
