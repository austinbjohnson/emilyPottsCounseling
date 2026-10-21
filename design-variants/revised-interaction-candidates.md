# Revised mobile interaction candidates

Status: concept review before another build. These revisions follow the ten independent concepts and Sol/Luna critiques in `mobile-concept-review.md`. All keep direct Jane booking and ordinary page links available without interaction. The visitor is never asked to disclose a concern or complete a sequence.

## A. Open Atlas / Look Before You Open

Two independent Astra revisions converged on a page-preview instrument. A 320px first screen shows Emily's identity, location and direct Jane action, followed by clearly labelled About, Sessions, Services and FAQs destinations. One preview surface displays a short verified excerpt or practical facts from the selected destination. A tap on a labelled control changes that surface in place; the corresponding ordinary page link remains direct. Selection stays put while text changes, and browser Back restores the selection and scroll location. No vertical or horizontal scroll is intercepted. At enlarged text sizes, controls and excerpts stack in normal flow.

**User benefit:** a visitor can sample where useful information lives without reading four complete pages or losing their place. The strong variant uses actual verified facts, such as session formats, length and fees, with a canonical detail link. It avoids marketing teaser text.

**Self-critique:** mechanically this is a tab panel. Two sets of page names may confuse visitors; a duplicated navigation grid wastes precious phone space. A 320px sketch must show that switching excerpts is helpful and visually compelling without crowding booking. Avoid drag-card affordances if cards are not draggable. No-JavaScript content must remain available as ordinary links/short excerpts.

## B. Read Across

A compact introduction links directly to About, How sessions work and Services. Each row has a separate optional Preview button. A preview opens one short source-page passage in place, with a clear title and full-page link. One related preview may replace the passage while retaining one previous passage for a local Back control. Ordinary browser Back restores homepage position after a full-page visit.

**User benefit:** resolve one practical uncertainty without losing the context that prompted it.

**Self-critique:** nested preview navigation may become an app inside the site, with more buttons than prose. The second excerpt must save effort compared with a direct page visit; otherwise choose a single preview surface or ordinary links.

## C. The Room Has Openings

One symbolic, code-native illustration maps verified individual-counselling settings. Named controls Indoors, Outdoors and Online reshape a simple boundary around a stationary label: one shared enclosed space, an open outline, or two separate online frames. The caption states only verifiable facts: in person in North Vancouver, walk-and-talk subject to weather, or online across BC. Direct setting buttons are primary; an optional draggable handle could show continuous transformation. A normal link opens the corresponding Services and fees explanation. Ordinary vertical scrolling carries the entire illustration away and reveals the usual service links; no pinning or forced stops. Jane is always direct.

**User benefit:** the same meeting can take different verified forms, while audience and treatment remain separate. The visual relation may be easier to grasp than three paragraphs.

**Self-critique:** moving a line can become a toy; the meaning might be unclear. No shapes stand for a client or Emily, and no boundary closes around a person. Do not imply the visitor should pick a setting before booking. Without JavaScript or under reduced motion, all three labelled facts and links remain readable.

## Selection standard

The first touch at 320px must create a perceptible, comprehensible change with a real information or orientation benefit. Jane and page navigation remain immediately reachable. The experience must feel calm and distinctive without relying on a lecture about the concept. Build one small local probe only after constructive independent review from Sol and Luna. A local probe is evidence to accept or reject, not a promise to publish.

## Independent constructive reviews

Sol and Luna both selected **C** for one bounded local probe. They judged A useful but mechanically a familiar tab panel and B too close to an app within the site. Neither reviewer gave C a blanket go: the concern is whether a small diagram adds understanding beyond three labelled facts.

Sol's repair: replace the abstract boundary with three concrete, labelled structures. Indoors is one room outline; Outdoors is two parallel path edges; Online is two device frames with a simple connection. Keep the name and one verified fact below, not inside, the drawing. Remove the drag handle because intermediate settings have no truthful meaning. At 320 × 568, fit identity and Jane y16–132, setting buttons y188–232, diagram y248–348, one fact y396–436, and a direct Services link y448–492. Ordinary scrolling moves everything; setting selection never follows scroll.

Luna's repair: each selection should change both the drawing and one concise **What to expect** fact. Keep words explicit so the illustration is atmosphere rather than a code a visitor must decipher. Use three named tap controls with minimum 44px targets; no gesture. Reduced motion switches immediately. No-JavaScript shows all three facts and links in normal flow.

**Probe decision:** build only C as a local functional interaction. No hero redesign or Cloudflare integration until the interaction passes Chrome 320px/390px tests for comprehension, comfort, direct Jane and keyboard access. If the graphic is hard to understand without explanation, feels enclosing, or merely invites play without helping identify available settings, reject it and consider A's one-surface preview as the practical fallback.

### C after a final Astra response to both reviewers

The name visible to visitors is **Ways to meet**. The diagram uses one consistent, quiet architectural stroke: Indoors is a room outline with an open doorway; Outdoors is two path edges; Online is two device frames linked by a still line. A short horizontal segment remains in place across the state change. Each setting has a visible, independently verified caption: **Meet indoors in North Vancouver**; **Talk while walking outdoors, weather permitting**; **Meet virtually from within British Columbia**. These summarize Emily's current [Services and fees](https://emilypotts.ca/services-and-fees) page. They apply to the site's individual counselling description; couples stays outside the viewer. No human shape, supposed room photograph or outcome claim appears.

The three direct buttons are the complete control; there is no drag, auto-selection or scroll-driven transformation. A brief optional transition changes only the decorative drawing, while the name/fact updates immediately. The illustration and all links move with normal page scroll. Use a top-of-page Jane link and a second in-flow action after the routes, rather than a bar that might cover content. At 320 × 568, the first view must show Emily's identity, verified scope, Jane, the three controls, the drawing and at least the beginning of the setting fact. The ordinary Services link should follow immediately. The exact pixel storyboard is a test target, not a rigid height contract at larger text sizes.

Astra's final self-critique remains important: three changing glyphs alone are insufficient. This probe succeeds only if the combined structure and concise fact makes practical differences register quickly, while Jane and detail pages stay obvious. On a failed visual or functional test, keep it local rather than publishing a new variant.

### C local test and iteration result

The private `design-variants/ways-to-meet-probe/index.html` was tested in Chrome at 320 × 568 and 390 × 780. Jane and Services were visible on the first screen, all three buttons updated their factual caption and `aria-pressed` state, keyboard Enter selected a button, and there was no horizontal overflow. The content and controls worked, but the drawing read as three small icons swapping below a tab bar. The first touch did not feel as spatial or distinctive as its storyboard.

Sol proposed one continuous line transformation between room, path and online frames; Luna agreed that coherent structure mattered more than a faster crossfade. Astra tested a seven-point contour interpolation across all setting pairs. The intermediate forms became enclosing vases or house-like shapes, and the outdoor endpoint resembled parentheses. The visual topology was confusing despite valid geometry, so that iteration was **not implemented**. C remains a useful practical selector but **no-go as the flagship concept**. It stays local, unintegrated and unpublished. A single-surface page preview is the next bounded candidate to test for real orientation value.

### A local test and second decision

The separate private `design-variants/open-atlas-probe/index.html` was tested in Chrome at 320 × 568 and 390 × 780. The direct Jane action and four preview destinations were visible immediately. Tapping Services replaced the About excerpt with a verified fee table and an ordinary Services and fees link; the selected state changed correctly and there was no horizontal overflow. At 390px the whole compact preview fit almost within one viewport, while at 320px the useful table began below the fold.

**No-go as the flagship experience.** It reduced navigation effort but looked and behaved like a tab panel with a text surface, despite authored typography and layout. The first mobile touch changed copy rather than producing the more distinctive, calm web interaction Austin requested. It remains local, unintegrated and unpublished. This does not invalidate the information architecture: a page preview could still be a useful secondary utility inside a stronger concept.

## Later Astra synthesis: scroll as site architecture

After both tap-driven probes failed the desired creative bar, Astra proposed two further directions for independent adversarial review. Neither has been built.

**Unbound folio.** Three real linked destinations—Meet Emily, How I work, Services and fees—begin as clearly titled, slightly overlapped open sheets. The first 160px of native phone scrolling spreads only the decorative bodies by at most 22px and unwinds small rotations to flat; fixed document boxes keep all 44px link headers still and available from first frame. The portrait and landscape photos remain separate and factual room imagery is not implied. FAQs and Contact follow as ordinary links. Reduced motion/static uses the already separated composition. Risk: a trendy card stack or hidden-content suggestion rather than a genuinely helpful site introduction.

**A sentence becomes an index.** Five actual linked phrases (About, Therapy, Services and fees, FAQs, Contact) begin as a staggered editorial invitation, then align left during the first 140px of normal scrolling, moving at most 36px horizontally. No text changes, fades or moves vertically. The index itself becomes more scannable. Reduced motion/static starts aligned. Risk: ordinary entrance animation and tap targets moving under a finger. A local test would have to show a tangible difference at phone size without making navigation unpredictable.

The folio is the stronger candidate for critique, since the index risks turning a stable target into moving decoration. Both preserve direct Jane booking at the top, no compulsory step, and actual links from the start.

### Sol/Luna adversarial decision before code

Both independent reviewers selected the unbound folio for **one local phone probe**, with explicit falsification. The sentence index was rejected: it moves live link labels near an approaching finger and resembles ordinary entrance animation. The folio must read as a connected directory opening into three distinct destinations. Complete Meet Emily, How I work, Services and fees, FAQs and Contact links and a direct Jane action must be available before any scrolling; FAQ/Contact may sit in a compact ordinary masthead row to preserve room for the three folio leaves. Fixed 44px link headers never move horizontally under touch. Only decorative paper edges separate over the first 150px of native scroll, at most 22px; all preview content and labels remain readable. No extra click, hidden content, scroll lock, fixed scene or animation after scroll stops. Reduced motion and unsupported browsers show the separated composition immediately. If the opening is imperceptible, looks like stacked cards, or makes a boundary harder to understand, reject rather than amplify motion.

### Folio local test and decision

The private `design-variants/unbound-folio-probe/index.html` was tested in Chrome at 320 × 568. Emily's identity, North Vancouver/BC, direct Jane, FAQs, Contact and all three folio destinations fit in the first view; there was no horizontal overflow. At scroll 0, the decorative edge transforms were +12px, −12px, +12px. After a normal 142px scroll they were about −8.8px, +8.8px, −8.8px. The native scroll remained unimpeded and the route boxes followed document flow.

**No-go for publication.** Despite correct behavior, the visible result was three lightly coloured stacked rectangles; the small edge motion did not turn them into a distinctive editorial directory or materially clarify the routes. That is the precise pre-build failure condition Sol and Luna identified. Enlarging the movement would make the decorative effect more conspicuous without giving it a stronger reason to exist. This conclusion is from Chrome viewport emulation, not a physical-device or visitor study. The probe remains local and unintegrated. Reduced-motion/200% text/no-JavaScript and assistive-technology testing were not pursued after the concept failed its first mobile visual gate.
