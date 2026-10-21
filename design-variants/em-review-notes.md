# Emily design review · October 2026

Public comparison route: `/em-review/`. Review pages: `/em-review/1/`, `/em-review/2/`, `/em-review/3/`. These routes are unlinked from the faithful homepage but publicly accessible. They are excluded from the sitemap and marked `noindex,nofollow`.

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
