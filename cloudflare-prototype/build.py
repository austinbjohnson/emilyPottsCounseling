"""Stage only public site files for a separate Cloudflare Workers preview.

Each build uses a new output directory. Source files and earlier builds are never
overwritten or deleted. Supply the preview's actual origin before deployment.
"""

import argparse
from dataclasses import dataclass, field
import hashlib
from html import escape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import shutil
from urllib.parse import urlsplit


PROJECT = Path(__file__).resolve().parent
SOURCE = PROJECT.parent
PREVIEW_BASE = "https://austinbjohnson.github.io/emilyPottsCounseling"
OLD_PATH = "/emilyPottsCounseling/"
PAGES = (
    "index.html", "404.html", "about/index.html", "contact/index.html",
    "faqs/index.html", "home/index.html", "privacy-page/index.html",
    "resources/index.html", "resources/Blog Post Title One-y2epy-y63ns/index.html",
    "resources/exploring-solutions-for-climate-anxiety/index.html",
    "services-and-fees/index.html", "speaking/index.html", "therapy/index.html",
    "design-variants/open-shore/index.html",
    "design-variants/in-good-company/index.html",
    "design-variants/clear-practice/index.html",
    "design-variants/field-notes/index.html",
    "design-variants/conversation-in-margins/index.html",
    "design-variants/room-to-unfold/index.html",
    "design-variants/near-across/index.html",
    "design-variants/reading-depth/index.html",
    "design-variants/meeting-settings/index.html",
    "design-variants/short-guide/index.html",
    "design-variants/quote-handwritten/index.html",
    "design-variants/quote-clean/index.html",
    "live-replica/index.html", "live-replica/home/index.html",
    "live-replica/about/index.html", "live-replica/services-and-fees/index.html",
    "live-replica/speaking/index.html", "live-replica/therapy/index.html",
    "live-replica/resources/index.html",
    "live-replica/resources/what-to-know-before-your-first-therapy-session/index.html",
    "live-replica/resources/exploring-solutions-for-climate-anxiety/index.html",
    "live-replica/faqs/index.html", "live-replica/contact/index.html",
    "live-replica/privacy-page/index.html", "live-replica/group-events-1/index.html",
)
OTHER_TEXT = ("llms.txt", "robots.txt", "sitemap.xml", "assets/css/styles.css", "assets/js/main.js", "assets/fonts/OFL-Caveat.txt", "live-replica/replica.css", "live-replica/replica.js")
REVIEW_PAGES = (
    ("design-variants/em-review-hub/index.html", "em-review/index.html"),
    ("design-variants/em-review-1/index.html", "em-review/1/index.html"),
    ("design-variants/em-review-2/index.html", "em-review/2/index.html"),
    ("design-variants/em-review-3/index.html", "em-review/3/index.html"),
    ("design-variants/em-review-4/index.html", "em-review/4/index.html"),
    ("design-variants/em-review-5/index.html", "em-review/5/index.html"),
    ("design-variants/em-review-6/index.html", "em-review/6/index.html"),
)
LIVE_REPLICA_ROUTES = (
    "", "home", "about", "services-and-fees", "speaking", "therapy",
    "resources", "resources/what-to-know-before-your-first-therapy-session",
    "resources/exploring-solutions-for-climate-anxiety", "faqs", "contact",
    "privacy-page", "group-events-1",
)
CONTACT_NOTICE = (
    '          <p class="contact-delivery-note">This form opens your email app. '
    'Review and send the drafted email there; this website does not submit your message.</p>\n'
)
FORM_OPEN = '          <form class="form-stack" action="mailto:hello@emilypotts.ca" method="post" enctype="text/plain">'


@dataclass
class Node:
    tag: str
    attrs: dict = field(default_factory=dict)
    children: list = field(default_factory=list)


class TreeParser(HTMLParser):
    VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.root = Node("root")
        self.stack = [self.root]

    def handle_starttag(self, tag, attrs):
        node = Node(tag, dict(attrs))
        self.stack[-1].children.append(node)
        if tag not in self.VOID:
            self.stack.append(node)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID:
            self.handle_endtag(tag)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, 0, -1):
            if self.stack[index].tag == tag:
                del self.stack[index:]
                break

    def handle_data(self, data):
        self.stack[-1].children.append(data)


def first_tag(node, name):
    if isinstance(node, Node):
        if node.tag == name:
            return node
        for child in node.children:
            found = first_tag(child, name)
            if found:
                return found
    return None


def compact(text):
    return " ".join(text.split())


def inline(node):
    if isinstance(node, str):
        return node
    content = "".join(inline(child) for child in node.children)
    if node.tag == "a" and node.attrs.get("href"):
        label = compact(content).replace("[", "\\[").replace("]", "\\]")
        return f"[{label}]({node.attrs['href']})"
    return content


def home_markdown(html):
    parser = TreeParser()
    parser.feed(html)
    main = first_tag(parser.root, "main")
    if main is None:
        raise ValueError("Homepage has no main content")
    blocks = []

    def walk(node):
        if isinstance(node, str):
            return
        # The live Squarespace homepage authors separate mobile and desktop
        # hero sections. Markdown has no viewport, so emit the desktop copy
        # once instead of repeating the heading and consultation CTA.
        if node.attrs.get("data-section-id") == "680277a8ea31015ff40228ec":
            return
        if re.fullmatch(r"h[1-6]", node.tag):
            blocks.append("#" * int(node.tag[1]) + " " + compact(inline(node)))
            return
        if node.tag == "summary":
            blocks.append("### " + compact(inline(node)))
            return
        if node.tag == "p":
            value = compact(inline(node))
            if value:
                blocks.append(value)
            return
        if node.tag == "a":
            blocks.append("- " + inline(node))
            return
        for child in node.children:
            walk(child)

    walk(main)
    markdown = "\n\n".join(blocks) + "\n"
    if len(markdown) < 500 or not markdown.startswith("# "):
        raise ValueError("Generated homepage Markdown is incomplete")
    return markdown


def etag(content):
    return '"' + hashlib.sha256(content.encode("utf-8")).hexdigest() + '"'


def check_origin(origin, local):
    parsed = urlsplit(origin)
    if parsed.path not in ("", "/") or parsed.query or parsed.fragment or parsed.username or parsed.password:
        raise ValueError("Origin must have no path, query, credentials, or fragment")
    if parsed.scheme == "https" and parsed.netloc:
        return origin.rstrip("/")
    if local and parsed.scheme == "http" and parsed.hostname in ("127.0.0.1", "localhost") and parsed.port:
        return origin.rstrip("/")
    raise ValueError("Use an HTTPS origin, or --local with a loopback HTTP origin")


def build(output, origin, local, platform="workers"):
    origin = check_origin(origin, local)
    output.mkdir(parents=True, exist_ok=False)
    public = output / "public"
    public.mkdir()
    homepage_html = None

    for relative in PAGES + OTHER_TEXT:
        source = SOURCE / relative
        text = source.read_text(encoding="utf-8")
        text = text.replace(PREVIEW_BASE, origin).replace(OLD_PATH, "/")
        if relative == "contact/index.html":
            if text.count(FORM_OPEN) != 1:
                raise ValueError("Expected mailto form was not found exactly once")
            text = text.replace(FORM_OPEN, CONTACT_NOTICE + FORM_OPEN)
        if PREVIEW_BASE in text or OLD_PATH in text:
            raise ValueError(f"Old preview reference remains in {relative}")
        if relative == "index.html":
            # No root index asset: the asset router invokes the Worker for /.
            # Other existing assets bypass it and stay free on Workers Free.
            homepage_html = text
            continue
        target = public / relative
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text, encoding="utf-8")

    for source in (SOURCE / "assets/img").iterdir():
        if source.is_file() and not source.name.startswith("."):
            target = public / "assets/img" / source.name
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(source, target)

    # Stage additive review paths for this preview artifact. Production release
    # builds must omit these paths while retaining their source for comparison.
    for source_name, public_name in REVIEW_PAGES:
        target = public / public_name
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text((SOURCE / source_name).read_text(encoding="utf-8"), encoding="utf-8")

    font = SOURCE / "assets/fonts/Caveat-variable.ttf"
    target = public / "assets/fonts" / font.name
    shutil.copyfile(font, target)

    # Promote the public live replica to the preview's normal routes. Only the
    # fresh generated output is written; the older source pages and all design
    # variants remain intact for review. The /live-replica paths remain too.
    for route in LIVE_REPLICA_ROUTES:
        clone = (public / "live-replica" / route / "index.html").read_text(encoding="utf-8")
        clone = clone.replace('href="/live-replica/', 'href="/')
        clone = clone.replace('action="/live-replica/', 'action="/')
        clone = clone.replace('href="/replica.css', 'href="/live-replica/replica.css')
        clone = clone.replace('src="/replica.js"', 'src="/live-replica/replica.js"')
        if route == "":
            # Keep the earlier truthful identity fix when this public page is
            # promoted. The official live URL identifies Emily; no address or
            # private contact detail is inferred for structured data.
            person = {
                "@context": "https://schema.org",
                "@type": "Person",
                "@id": "https://emilypotts.ca/#emily-potts",
                "name": "Emily Potts",
                "description": "Anxiety, burnout, grief, trauma, and climate grief therapy in North Vancouver and online across BC. Book a free 20-minute consult with Emily Potts, RCC.",
                "url": "https://emilypotts.ca/",
                "jobTitle": "Registered Clinical Counsellor",
            }
            clone = clone.replace(
                "</head>",
                '<script type="application/ld+json">' + json.dumps(person, ensure_ascii=False) + '</script></head>',
                1,
            )
            homepage_html = clone
        else:
            target = public / route / "index.html"
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(clone, encoding="utf-8")

    # List only the copied live pages, not the repository's older article slug
    # or design review routes, in the preview's machine-readable sitemap.
    locations = "\n".join(
        f"  <url><loc>{escape(origin + '/' + (route + '/' if route else ''))}</loc></url>"
        for route in LIVE_REPLICA_ROUTES
    )
    (public / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + locations + '\n</urlset>\n', encoding="utf-8"
    )
    llms = (public / "llms.txt").read_text(encoding="utf-8")
    llms = llms.replace(
        "- [Contact]({origin}/contact/): Contact and booking links.".format(origin=origin),
        "- [Contact]({origin}/contact/): The preview links to Emily’s live contact form; the preview does not collect inquiries.".format(origin=origin),
    )
    llms += (
        f"\n- [First therapy session article]({origin}/resources/what-to-know-before-your-first-therapy-session/): "
        "Public article from Emily’s live website.\n"
    )
    (public / "llms.txt").write_text(llms, encoding="utf-8")

    html = homepage_html
    not_found_html = (public / "404.html").read_text(encoding="utf-8")
    markdown = home_markdown(html)
    not_found_markdown = (
        "# Page not found\n\nThe requested page could not be found. "
        f"See the [sitemap]({origin}/sitemap.xml) or "
        f"[site overview]({origin}/llms.txt) to find a page.\n"
    )
    content = {
        "HOME_HTML": html,
        "HOME_MARKDOWN": markdown,
        "NOT_FOUND_HTML": not_found_html,
        "NOT_FOUND_MARKDOWN": not_found_markdown,
        "ETAGS": {"html": etag(html), "markdown": etag(markdown)},
    }
    generated = "// Generated by build.py from the reviewed public site files.\n"
    generated += "\n".join(f"export const {name} = {json.dumps(value, ensure_ascii=False)};" for name, value in content.items()) + "\n"
    (output / "generated_content.mjs").write_text(generated, encoding="utf-8")
    worker_source = (PROJECT / "worker.mjs").read_text(encoding="utf-8")
    if platform == "pages":
        # Pages advanced mode requires a self-contained _worker.js in its
        # uploaded directory. The normal HTML file is also an emergency
        # static fallback if the free Functions quota is exhausted.
        (public / "index.html").write_text(html, encoding="utf-8")
        import_statement = (
            "import {\n"
            "  HOME_HTML, HOME_MARKDOWN, NOT_FOUND_HTML, NOT_FOUND_MARKDOWN, ETAGS,\n"
            "} from './generated_content.mjs';\n\n"
        )
        if not worker_source.startswith(import_statement):
            raise ValueError("Worker import changed; Pages bundle was not generated")
        pages_worker = generated.replace("export const ", "const ")
        worker_body = worker_source[len(import_statement):]
        if worker_body.count("export function selectRepresentation") != 1:
            raise ValueError("Worker export changed; Pages bundle was not generated")
        pages_worker += "\n" + worker_body.replace(
            "export function selectRepresentation", "function selectRepresentation", 1
        )
        (public / "_worker.js").write_text(pages_worker, encoding="utf-8")
        # Exclude only known static URLs from Functions billing. Unknown routes,
        # including missing assets, still reach the Markdown-capable 404.
        exclusions = []
        for file in public.rglob("*"):
            if not file.is_file() or file.name in ("_worker.js", "404.html"):
                continue
            relative = file.relative_to(public).as_posix()
            if relative == "index.html":
                continue
            if relative.endswith("/index.html"):
                exclusions.append("/" + relative.removesuffix("index.html"))
            else:
                exclusions.append("/" + relative)
        if len(exclusions) + 1 > 100 or any(len(rule) > 100 for rule in exclusions):
            raise ValueError("Pages Functions routing exceeds Free plan limits")
        routes = {"version": 1, "include": ["/*"], "exclude": sorted(exclusions)}
        (public / "_routes.json").write_text(json.dumps(routes, indent=2) + "\n", encoding="utf-8")
        # The Pages Direct Upload command needs only the public directory.
        # It creates a separate Pages project and never uses Worker config.
        return len(PAGES) + len(OTHER_TEXT) + len(REVIEW_PAGES) + len(list((public / "assets/img").iterdir())) + 1
    if platform != "workers":
        raise ValueError("Platform must be 'workers' or 'pages'")
    (output / "worker.mjs").write_text(worker_source, encoding="utf-8")
    config = {
        "name": "emily-potts-counselling-preview",
        "compatibility_date": "2026-08-06",
        "compatibility_flags": ["assets_navigation_has_no_effect"],
        "main": "./worker.mjs",
        "workers_dev": True,
        "assets": {
            "directory": "./public",
            "binding": "ASSETS",
            "not_found_handling": "404-page",
            "html_handling": "auto-trailing-slash",
        },
    }
    (output / "wrangler.jsonc").write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")
    return len(PAGES) - 1 + len(OTHER_TEXT) + len(REVIEW_PAGES) + len(list((public / "assets/img").iterdir())) + 1


if __name__ == "__main__":
    argument_parser = argparse.ArgumentParser(description=__doc__)
    argument_parser.add_argument("--output", type=Path, required=True, help="New, nonexistent build directory")
    argument_parser.add_argument("--origin", required=True, help="Actual preview origin, without a path")
    argument_parser.add_argument("--local", action="store_true", help="Permit a loopback HTTP origin for tests")
    argument_parser.add_argument("--platform", choices=("workers", "pages"), default="workers")
    args = argument_parser.parse_args()
    count = build(args.output.resolve(), args.origin, args.local, args.platform)
    print(f"Staged {count} public files at {args.output.resolve()}")
