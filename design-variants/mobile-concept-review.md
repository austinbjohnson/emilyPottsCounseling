# Mobile interaction exploration — pre-build review

Status: ten concepts reviewed before implementation. One additional, conditionally approved visual experiment was built locally and rejected after Chrome phone-size review. Nothing from this exploration has been deployed. Existing design variants are preserved. Each original concept received independent critique from Sol and Luna. A go decision requires truthful site content, direct Jane booking, a useful interaction on a narrow phone, normal scrolling, keyboard and reduced-motion access, and a complete static reading path.

The first visit should show Emily's name, the kind and location of counselling, a direct Jane action, and a small choice of useful detail routes. Longer explanations belong on the relevant existing pages. Motion never makes the visitor complete a journey or express a personal concern.

## Ten first touches

| # | Original premise and mobile mechanism | First self-critique | Revised premise before outside review |
|---|---|---|---|
| 1. A page that yields | The page edge bends as the visitor scrolls, suggesting a responsive surface. | A resisting edge is decorative and could make scrolling feel sticky. | Keep scroll stable; intentional taps on large detail links produce a shallow local press response. All links work immediately. |
| 2. Keep a picture | Three labelled documentary photographs contract into a small navigation strip while scrolling, then share visual continuity with detail pages. | A shrinking header may be decoration; portrait motion might unsettle; labels must carry meaning. | A photographic introduction becomes persistent, labelled route navigation. Never zoom or animate faces; normal links are complete fallback. |
| 3. Try the setting | A single photographic surface changes among in-person, walk-and-talk and online settings by tapping; audience choices stay separate. | Could be a carousel or imply combinations Emily does not offer. Generic photos would be misleading. | Show clearly labelled settings; any optional reveal explores one verified setting rather than compares people or recommends care. Jane never depends on choosing. |
| 4. The open enclosure | A sealed letter opens into Emily and then an appointment invitation. | A seal suggests confidential correspondence and hides the site's purpose. | Begin with an already-open note. An exposed portrait edge and explicit `Meet Emily` control bring one short enclosure forward; an equally direct practical enclosure follows. |
| 5. From either chair | A draggable split shows two perspectives on the same counselling room. | Before/after slider, implied mind-reading, and inaccurate room details are substantial risks. | Only if paired authentic photographs and concrete access facts exist, labelled controls align the same room detail across two perspectives. |
| 6. See where to start | A zoomable constellation of concerns guides people across the site. | Spatial navigation can become a puzzle or staged therapeutic progress. | One optional overview shows four ordinary routes and one verified fact each; direct booking remains visible. The camera change is explicit, short and interruptible. |
| 7. The person stays | Emily's portrait remains briefly in place while in-person and online settings pass beside it on a phone. | Narrow columns, watchful portrait and familiar sticky marketing treatment. | Keep a short interval only with authentic imagery; release pinning at narrow/high-zoom sizes. |
| 8. Keep your place | Short homepage scenes begin the content of their actual detail pages; shared image and heading continue into the destination and Back restores position. | The interesting behavior happens after a tap; the first scroll could still be a static page. | Make each scene a real, useful beginning of its destination, not a teaser. Keep one restrained image crop; invest in reliable navigation and return. |
| 9. A sentence becomes a page | A chosen sentence stays in position as its detail page forms around it. | This may be just a polished page transition; moving text can disturb reading. | Literal continuity of reading: the sentence is the first sentence of the deeper page, stable in size, with an obvious return link. |
| 10. A little more room | Normal scrolling unfolds a photograph of Emily's real room. | Familiar reveal, less useful than a full photograph, and layout movement can be uncomfortable. | Optional aperture control shows more of an authentic room with no autoplay; the proposer ultimately recommended no prototype. |

## Decision gates

Review each concept for **mobile novelty**, **actual information gained**, **comfort and agency**, **authentic source material**, and **engineering feasibility**. Reject a concept if its interaction can be removed without losing meaning, if it requires unverified professional or room claims, if the phone version is static, or if it competes with the direct booking action.

## Independent adversarial reviews

| # | Sol critique | Luna critique | Pre-build decision |
|---|---|---|---|
| 1 | No information gained; ordinary press feedback. | Imperceptible or distracting on a small screen. | **No-go.** It reduces to a static route list. |
| 2 | Conditional if persistent labelled routes measurably improve navigation, without crowding text. | No-go: shrinking photo header is familiar, strip steals mobile space. | **No-go as a standalone concept.** Test only as a small navigation treatment within another prototype. |
| 3 | Strongest conditional: each setting must reveal a verified practical difference, not just a photo. | Conditional: every setting and booking action must remain findable at 320px without horizontal scrolling. | **Revise and retest before code.** A factual, optional service viewer may earn one prototype; generic photography or suitability inference kills it. |
| 4 | No-go: envelope ceremony adds a task; may obscure reading order. | No-go: portrait reveal gates information and adds little value. | **No-go.** |
| 5 | No-go: paired photographs and room facts cannot be assumed; comparison is weak. | No-go: drag has poor narrow-screen value and misleading implications. | **No-go.** The repository's office images are not proof of Emily's current room. |
| 6 | No-go: a four-route constellation is unnecessary spatial work. | No-go as proposed: camera movement may disorient. | **No-go.** A direct index would be useful but is not this concept. |
| 7 | No-go: sticky portrait is familiar and possibly watchful. | No-go: narrow columns and pinning are fragile. | **No-go.** |
| 8 | Conditional as supporting infrastructure: truthful content continuation and reliable return help orientation, but not first-scroll novelty. | Conditional: test Back/Forward, direct loads, no JavaScript and slow connection. | **Use as an engineering pattern, not a standalone concept.** |
| 9 | No-go independently; overlaps 8 and adds fragile moving text. | Conditional only merged into 8 without animated reflow. | **No-go independently.** |
| 10 | No-go: a full labelled photo is more useful than an aperture. | No-go: layout shift and authentic-room dependency. | **No-go.** |

Both reviewers found **zero unconditional go decisions**. Their proposed synthesis is an optional service exploration that reveals concrete, verified practical differences while normal links continue into detail pages. It must survive a second adversarial round before code. Without a substantive phone storyboard, the correct result is no new prototype rather than another static variant.

## Second pass with original concept owners

- **2, photographic navigation: no-go.** Astra's revision made the photo continue into an actual detail page and removed the crowding strip. It improved orientation after navigation but left the first scroll as a static photographic route list. The owner judged it insufficiently dynamic for this brief.
- **3, service viewer: no-go.** Astra abandoned unverified setting photos and tested a factual duration/fee comparison instead. The live service page supports 50/75-minute individual and walk-and-talk fees of CAD 174/262, couples fees of CAD 227/339, and a free 20-minute consultation. A mobile instrument that expands equal-length service bars would convey these facts, but it risks feeling like a purchase configurator, and a compact table explains them as well. The owner recommended keeping any comparison for the service detail page, not the main experience.

Thus **none of the original ten authorizes a prototype** under the instruction to avoid more static pages. A separate creative challenge may be considered only if it survives its own independent adversarial review before code.

## Extra creative challenge: the landscape makes room

An Astra second-round challenge produced one expressive candidate after the ten no-go outcomes. Sol and Luna conditionally approved one short local prototype for falsification, without approving publication. The proposed first mobile screen shows Emily's name, RCC identity, location, Jane action, a lakeshore photograph, and a separate bordered portrait of Emily. A broad white opening around the portrait is already visible. Over approximately the first 220px of native phone scrolling, only the landscape's irregular clipping boundary moves outward. The two source images do not zoom or move; words and links remain in normal flow. After that short interval, the artwork scrolls away and short links to About, Services and fees, Therapy, FAQs and Contact come into view with another Jane action. An explicit `Still images` control and OS reduced-motion state show the complete static composition. No information is hidden in the moving region and no scroll action is needed to book.

The rationale is expressive rather than factual: Emily's existing About copy describes years guiding groups outdoors, so the landscape framing a visible person is specific to her practice. The lakeshore and portrait are two distinct repository photographs, never composited as if they show the same place or moment. The strongest risk is that this is another generic image reveal, akin to idea 10, and broad mask movement might still feel confining or disorienting. It must be rejected if the first phone stroke suggests a tunnel, wound or compulsory journey, if it crowds booking and practical information, or if it is too subtle to justify itself. External adversarial review of this candidate is required before prototype work.

### Cross-model verdict and 320 × 568 storyboard, before code

Sol and Luna independently gave **conditional permission for one short prototype**, explicitly for a mobile falsification test. Both said the landscape's opening must remain connected to an outer edge; a closed ring around Emily would look like confinement. Luna asked for a simple, bounded clip shape and a finished static composition as the baseline. Sol accepted expressive visual value but warned that identity, Jane and detail routes must stay prominent at 320px.

The following are CSS-pixel layout targets, not forced coordinates at enlarged text sizes. Emily's name and a direct Jane link appear above the artwork. The opening is white space connected to the **top and bottom edges** of the image box at every state. Emily's separate bordered portrait sits in that open space. Ordinary scrolling moves the entire document; only the decorative opening width changes, over a short bounded interval.

| 320 × 568 phone frame | Header and copy | Artwork and onward route |
|---|---|---|
| Initial, scroll 0 | Header y0–60; name and RCC visible. Headline `Counselling, with room for you` y75–157; North Vancouver / online BC y165–193. Header Jane link remains visible. | Artwork x16–304, y204–460. Initial open center about 112px wide where the portrait sits, connected to both outer edges. `Meet Emily` begins y480, inside the first screen. |
| Midpoint, scroll about 110px | Header moves with native page scrolling; it does not pin. | Artwork moves upward normally. Center opening widens without scaling either photo. Portrait remains recognisable. `Meet Emily` and the practical routes follow. |
| End, scroll about 220px | The booking link has scrolled naturally; a second direct Jane action appears after the detail routes. | Artwork moves upward normally; opening remains connected to both outer edges. About, Services and fees, Therapy, FAQs and Contact links enter normal flow. No pinned runway remains. |

At 390px, increase gutters and artwork width, keeping the opening proportional. If 200% text zoom or a short viewport makes the composition cramped, use the complete static frame. No words or required image content sit under the animated layer. The local prototype must be rejected if Chrome screenshots at 320/390 contradict these frames, if reverse scroll feels like closing a tunnel, if the action is unnoticeable, or if Jane/focus is obstructed. The source images already appear as public imagery in this repository (`about-intro-portrait.jpg` is explicitly used for Emily's About portrait; `emily-lakeshore.jpg` is an unoccupied shoreline). Their shared location is unknown and must not be implied.

### Local browser falsification and final decision

The prototype lives privately at `design-variants/landscape-makes-room/index.html`. It has **not** been added to the Cloudflare build or published. In Google Chrome viewport tests at 320 × 568 and 390 × 780, identity, RCC credential, North Vancouver / online BC, direct Jane consultation, portrait and `Meet Emily` fit in the first screen, without horizontal overflow. The CSS scroll timeline advanced its white opening over the first 220px of ordinary scrolling; at 320px, computed clip edges changed from roughly 29%/69% to 22.5%/76% by 142px. A stronger 12%/88% end frame was also tested at 390px: the landscape reduced to narrow vertical strips around a floating portrait. The `Still images` control froze the opening at its current shape. Static HTML retained all links and copy.

**No-go for public preview.** The 320px change remained too subtle, while the stronger 390px change weakened the relationship between portrait and landscape. The first scroll still read as a conventional photographic reveal around a static content column, not the novel but supportive experience Austin requested. More motion would be spectacle without a clearer visitor benefit. This is a design judgment from Chrome viewport emulation, not a physical-device or visitor study. No interaction from this round has yet met the gate for publication. Reduced motion, 200% text, no-JavaScript and assistive-technology checks were not completed because the concept failed the earlier visual/interaction gate.
