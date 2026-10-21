"""Create a static, reviewable preview from public Squarespace page snapshots.

Snapshots are supplied as inputs and are never committed. This deliberately removes
the original site's executable scripts, form configuration, analytics, and submission paths.
Non-executable JSON describing public text marks is retained.
The preview keeps the public page markup and layout rules for visual comparison.
"""

import argparse
import json
from pathlib import Path
import re


ROUTES = (
    "", "home", "about", "services-and-fees", "speaking", "therapy",
    "resources", "resources/what-to-know-before-your-first-therapy-session",
    "resources/exploring-solutions-for-climate-anxiety", "faqs", "contact",
    "privacy-page", "group-events-1",
)
PREFIX = "/live-replica"


def transform(source: str, route: str) -> str:
    # The public HTML is rendered server side. Retain its CSS and body markup,
    # including mobile-specific sections, while removing remote application code.
    font_loader = re.search(r'<script\b[^>]*src="//use\.typekit\.net/ik/[^\"]+"[^>]*></script>', source, re.I | re.S)
    def keep_public_text_marks(match):
        element = match.group(0)
        opening = element[:element.find('>')]
        if 'class="TextAttributes-props"' not in opening or 'type="application/json"' not in opening:
            return ''
        configs = json.loads(element[element.find('>') + 1:element.lower().rfind('</script')])
        if not isinstance(configs, list) or not all(
            isinstance(item, dict)
            and re.fullmatch(r'[0-9a-f-]{36}', str(item.get('id', '')))
            and item.get('shape') in ('circle', 'scribble', 'underline', 'underlineCurve')
            for item in configs
        ):
            raise ValueError('Unexpected public text-mark configuration')
        return element  # inert JSON, not a remotely executed application script
    source = re.sub(r"<script\b[^>]*>.*?</script\s*>", keep_public_text_marks, source, flags=re.I | re.S)
    source = re.sub(r"<iframe\b[^>]*>.*?</iframe\s*>", "", source, flags=re.I | re.S)
    source = re.sub(r"<noscript\b[^>]*>.*?</noscript\s*>", "", source, flags=re.I | re.S)
    source = re.sub(r'<link\b[^>]*rel="canonical"[^>]*>', '', source, flags=re.I)
    source = re.sub(r'<meta\b[^>]*property="og:url"[^>]*>', '', source, flags=re.I)
    source = re.sub(r'<meta\b[^>]*(?:itemprop|name)="(?:url|twitter:url)"[^>]*>', '', source, flags=re.I)
    source = re.sub(r'<link\b[^>]*type="application/rss\+xml"[^>]*>', '', source, flags=re.I)
    # The Squarespace commerce shell is hidden and no cart route exists here.
    source = re.sub(r'href="(?:https://emilypotts\.ca)?/cart"', 'tabindex="-1"', source, flags=re.I)
    def local_link(match):
        url = re.sub(r'^https://(?:www\.)?emilypotts\.ca', '', match['url'], flags=re.I)
        return f'{match["attr"]}={match["quote"]}{PREFIX}{url}{match["quote"]}'
    # The live origin's own navigation stays inside this isolated preview.
    source = re.sub(
        r'(?P<attr>href|action)=(?P<quote>["\'])(?P<url>(?:https://(?:www\.)?emilypotts\.ca)?/[^"\']*)(?P=quote)',
        local_link,
        source,
        flags=re.I,
    )
    if route in ("group-events-1", "resources/what-to-know-before-your-first-therapy-session"):
        # These authored booking buttons have an empty href on the live site.
        # Use its verified Jane root so the preview never traps a visitor.
        source = re.sub(r'(<a\s+href=)""', r'\1"https://emilypotts.janeapp.com/"', source)
    # Correct relative internal links which the source site resolves against its root.
    source = re.sub(
        r'(?P<attr>href|action)=(?P<quote>["\'])(?P<url>(?![a-z]+:|//|/|#)[^"\']+)(?P=quote)',
        lambda m: f'{m["attr"]}={m["quote"]}{PREFIX}/{m["url"]}{m["quote"]}',
        source,
        flags=re.I,
    )
    source = source.replace(
        f'{PREFIX}/what-to-know-before-your-first-therapy-session',
        f'{PREFIX}/resources/what-to-know-before-your-first-therapy-session',
    )
    # The platform form cannot deliver from the preview origin. A conspicuous
    # live-site path is safer than silently accepting counselling inquiries.
    if route == "contact":
        form_wrapper = re.compile(r'<div class="form-wrapper"\s*>\s*</div>', re.I)
        placeholder = (
            '<div class="form-wrapper"><div class="replica-form-placeholder">'
            '<p>Your name · Email · Message</p>'
            '<p>This preview does not receive messages. To send Emily a private message, please use '
            '<a href="https://emilypotts.ca/contact">the live contact form</a>.'
            '</p></div></div>'
        )
        source, count = form_wrapper.subn(placeholder, source, count=1)
        if count != 1:
            raise ValueError("Expected inline contact form placeholder")
    # The original script controls entrances and hidden grid sections. Reveal
    # content immediately for readable, no-JavaScript, reduced-motion output.
    source = source.replace("</head>",
        (font_loader.group(0) if font_loader else '') +
        '<link rel="stylesheet" href="/live-replica/replica.css?v=11">'
        '<script defer src="/live-replica/replica.js?v=11"></script>'
        '<meta name="robots" content="noindex,nofollow">'
        '</head>', 1)
    return source


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--snapshots", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    args.output.mkdir(parents=True, exist_ok=False)
    for route in ROUTES:
        name = route.replace("/", "__") or "index"
        path = args.snapshots / (name + ".html")
        if not path.exists():
            raise FileNotFoundError(path)
        target = args.output / route / "index.html"
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(transform(path.read_text(), route), encoding="utf-8")
    print(f"Prepared {len(ROUTES)} public pages")


if __name__ == "__main__":
    main()
