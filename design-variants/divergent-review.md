# Divergent review paths — pre-build decision

The public main route stays the faithful copy. These three paths are separate, unlinked, and publicly reachable by URL. They use current facts from emilypotts.ca/about, /services-and-fees, and /faqs, reviewed 2026-10-21. No visitor data is sent or stored. Booking goes directly to Emily's Jane page.

## Review and selection

Astra's first landscape, folded sheet, and illustrated scroll chapters were rejected before implementation. The landscape repeated Near / Across and the earlier atlas probe; folding repeated the rejected folio/disclosure work; the scroll chapter art repeated an earlier Alongside idea. Sol and Luna independently challenged these and Astra revised them into three different operations on information: adjust explanation depth, explore meeting settings, and compose a short practical guide. Sol conditionally supported all three. Luna supported the guide, considered the reading control a utility feature rather than a flagship, and objected to a narrow drag divider. Therefore the meeting prototype uses explicit setting controls and one shared illustrated scene; no narrow comparison text or drag puzzle. The reading prototype must prove its value on a phone or be retained as a local experiment only. These are bounded review experiments, not claims about what Emily recommends.

## Concepts and art direction

### Reading depth — `/design-variants/reading-depth/`

One stable page lets the visitor ask for brief facts, more context, or the complete explanation. Essential services, prices, geography, source links, and Jane remain visible in every state. No preference persists, no focus or scroll hijacking. Ink blue `#17455b`, cloud `#edf4f4`, pale violet `#e6e2ef`, leaf `#4e6c5c`, white `#fff`, with an Optima/Arial humanist stack. One large typographic sentence is the hero; a compact three-way reading control is the only strong interface motif. Review risk: it may still feel like a text-size setting or move the reading point.

### Meeting settings — `/design-variants/meeting-settings/`

One illustrated frame has three explicitly named settings: North Vancouver in person, virtual in BC, and Walk & Talk. Selecting one changes the frame's visual grammar while all factual differences remain legible as ordinary text below. This is not a suitability quiz, a picture of Emily's actual room, or a requirement before booking. Moss `#25574d`, mist `#eaf1ed`, coastal blue `#466c83`, chalk `#fafcf9`, and ochre `#a76a34`, with a humanist sans and wide illustrated chapter. The shared frame is the distinctive element; navigation elsewhere stays quiet. Review risk: if the scene adds no clarity, it is a decorative selector and should be rejected.

### Short guide — `/design-variants/short-guide/`

A visitor can keep or remove four practical sections to make a shorter reading page: Emily, meeting formats, fees, and first contact. All are on by default, none asks for private concerns, and Show everything restores the full page. The selected sections form one ordered document, with direct source links and Jane. Lilac `#e9e8f3`, indigo `#333e70`, ink `#252d4d`, crisp white `#fff`, and soft blue `#dce8ed`, with a rounded system humanist stack. Large typeset question labels become a table of contents, not separate FAQ cards. Review risk: if the output reads as a stack of accordions rather than a concise coherent guide, stop.

## Common acceptance bar

- At 320px the first screen shows Emily's identity and a direct Jane action. Every control has a large touch target and visible focus.
- Native page scrolling, no autoplay, no flashing, no parallax, no step gate. Reduced motion changes state instantly. No JavaScript exposes all content in normal order.
- Test interaction, browser Back, keyboard, 200% text zoom/reflow, 320px and 390px phone dimensions, desktop, and direct links. Current public facts are not expanded into advice or guarantees.
- Main route generated HTML, replica CSS/JS, and existing endpoints must remain byte-identical after adding these paths.

## Mary Oliver attribution study

The current live quote section was inspected in Chrome. It uses a warm `#f0efee` field, Sorts Mill Goudy for the quotation and a small sans credit with a large visual gap. The exact public wording is retained in both focused studies at `/design-variants/quote-handwritten/` and `/design-variants/quote-clean/`. Both keep the words and attribution as selectable HTML text. No image or claimed reproduction of Mary Oliver’s signature appears.

The handwritten option uses the Caveat variable font from the official Google Fonts repository, `ofl/caveat/Caveat[wght].ttf`, bundled locally with its original SIL Open Font License 1.1. The downloaded binary and license match the official repository’s Git blob identifiers `f84acf2ce2d1b3329b194749530dbaec047e6df6` and `6e5220c9576d98dfc684e550ddf0d87f68b3edc5`. No external font request is made by visitors. The clean option needs no added font. At mobile width, both place the credit just below the quote; on desktop the handwritten study groups it within one bounded quotation frame. The handwritten option is the recommended **review candidate** because it gives the credit a human tone while remaining openly typeset. It is shown in the full reading-depth alternative only. The faithful main route remains unchanged until Austin chooses a treatment.
