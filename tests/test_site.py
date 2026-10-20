"""Local checks for this static GitHub Pages project site.

The standard-library server tests the source files, not GitHub Pages or emilypotts.ca.
"""

from html.parser import HTMLParser
import json
from pathlib import Path
import re
import socket
import subprocess
import sys
import time
import unittest
from urllib.error import HTTPError, URLError
from urllib.parse import unquote, urlparse
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET


ROOT = Path(__file__).resolve().parents[1]
SITE_PATH = "/emilyPottsCounseling"
SITE_URL = "https://austinbjohnson.github.io" + SITE_PATH + "/"


class HomeParser(HTMLParser):
    VOID_TAGS = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.main_depth = 0
        self.hidden_depth = 0
        self.main_text = []
        self.headings = []
        self.jsonld = []
        self.in_jsonld = False
        self.jsonld_text = []
        self.describedby = None
        self.meta_description = None
        self.og_url = None

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "main":
            self.main_depth += 1
        elif self.main_depth and tag not in self.VOID_TAGS:
            self.main_depth += 1
        if self.main_depth and tag in ("script", "style"):
            self.hidden_depth += 1
        if self.main_depth and re.fullmatch(r"h[1-6]", tag):
            self.headings.append(int(tag[1]))
        if tag == "script" and attrs.get("type") == "application/ld+json":
            self.in_jsonld = True
            self.jsonld_text = []
        if tag == "link" and "describedby" in attrs.get("rel", "").split():
            self.describedby = attrs.get("href")
        if tag == "meta" and attrs.get("name") == "description":
            self.meta_description = attrs.get("content")
        if tag == "meta" and attrs.get("property") == "og:url":
            self.og_url = attrs.get("content")

    def handle_endtag(self, tag):
        if tag == "script" and self.in_jsonld:
            self.jsonld.append(json.loads("".join(self.jsonld_text)))
            self.in_jsonld = False
        if self.main_depth and tag not in self.VOID_TAGS:
            if tag in ("script", "style") and self.hidden_depth:
                self.hidden_depth -= 1
            self.main_depth -= 1

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in self.VOID_TAGS:
            self.handle_endtag(tag)

    def handle_data(self, data):
        if self.in_jsonld:
            self.jsonld_text.append(data)
        elif self.main_depth and not self.hidden_depth:
            self.main_text.append(data)


class SiteTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        with socket.socket() as sock:
            sock.bind(("127.0.0.1", 0))
            cls.port = sock.getsockname()[1]
        cls.base = f"http://127.0.0.1:{cls.port}{SITE_PATH}"
        cls.server = subprocess.Popen(
            [sys.executable, "-m", "http.server", str(cls.port), "--bind", "127.0.0.1", "--directory", str(ROOT.parent)],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        for _ in range(60):
            try:
                urlopen(cls.base + "/", timeout=1).close()
                break
            except (OSError, URLError):
                time.sleep(0.05)
        else:
            cls.server.terminate()
            raise RuntimeError("Local static server did not start")

    @classmethod
    def tearDownClass(cls):
        cls.server.terminate()
        cls.server.wait(timeout=5)

    def fetch(self, path, accept="text/html", method="GET"):
        headers = {} if accept is None else {"Accept": accept}
        request = Request(self.base + path, headers=headers, method=method)
        try:
            with urlopen(request, timeout=5) as response:
                return response.status, response.headers, response.read()
        except HTTPError as response:
            with response:
                return response.code, response.headers, response.read()

    def test_home_is_readable_without_javascript(self):
        status, headers, body = self.fetch("/")
        self.assertEqual(status, 200)
        self.assertEqual(headers.get_content_type(), "text/html")
        parser = HomeParser()
        parser.feed(body.decode("utf-8"))
        meaningful = " ".join(" ".join(parser.main_text).split())
        self.assertGreaterEqual(len(meaningful), 500)
        self.assertEqual(parser.headings[0], 1)
        self.assertEqual(parser.headings.count(1), 1)
        self.assertTrue(all(b <= a + 1 for a, b in zip(parser.headings, parser.headings[1:])))
        self.assertIn("registered clinical counsellor", meaningful)

    def test_home_has_verified_person_identity(self):
        parser = HomeParser()
        parser.feed((ROOT / "index.html").read_text())
        self.assertEqual(parser.describedby, SITE_PATH + "/llms.txt")
        self.assertEqual(len(parser.jsonld), 1)
        identity = parser.jsonld[0]
        self.assertEqual(identity["@context"], "https://schema.org")
        self.assertEqual(identity["@type"], "Person")
        self.assertEqual(identity["@id"], SITE_URL + "#emily-potts")
        self.assertEqual(identity["name"], "Emily Potts")
        self.assertEqual(identity["url"], parser.og_url)
        self.assertEqual(identity["description"], parser.meta_description)
        self.assertEqual(identity["jobTitle"], "Registered Clinical Counsellor")
        self.assertTrue(identity["description"])
        self.assertNotIn("address", identity)
        self.assertNotIn("telephone", identity)

    def test_llms_and_existing_machine_readable_files(self):
        for path, media_type in (("/llms.txt", "text/plain"), ("/robots.txt", "text/plain"), ("/sitemap.xml", "application/xml")):
            status, headers, body = self.fetch(path, "text/plain")
            self.assertEqual(status, 200, path)
            self.assertEqual(headers.get_content_type(), media_type, path)
            self.assertTrue(body, path)
        llms = (ROOT / "llms.txt").read_text()
        self.assertTrue(llms.startswith("# Emily Potts Counselling\n\n> "))
        self.assertIn("Use this site when", llms)
        for url in re.findall(r"\]\((https://[^)]+)\)", llms):
            self.assertTrue(url.startswith(SITE_URL))
            self.assertTrue((ROOT.parent / unquote(urlparse(url).path).lstrip("/") / "index.html").is_file(), url)
        sitemap = ET.parse(ROOT / "sitemap.xml")
        self.assertGreaterEqual(len(sitemap.findall("{*}url")), 1)
        self.assertIn("Sitemap: " + SITE_URL + "sitemap.xml", (ROOT / "robots.txt").read_text())

    def test_static_host_accept_variants_and_404(self):
        html = None
        for accept in (
            None, "text/html", "text/markdown", "text/markdown;q=0", "text/markdown;q=1,text/html;q=0.5",
            "text/html;q=1,text/markdown;q=0.2", "text/markdown; q=1", "Text/Markdown", "text/*", "*/*",
        ):
            status, headers, body = self.fetch("/", accept)
            self.assertEqual(status, 200, accept)
            self.assertEqual(headers.get_content_type(), "text/html", accept)
            self.assertNotIn("Accept", headers.get("Vary", ""), accept)
            if html is None:
                html = body
            else:
                self.assertEqual(body, html, accept)

        for accept in ("text/html", "text/markdown"):
            for path in ("/__missing__", "/nested/__missing__/", "/assets/img/__missing__.jpg"):
                status, headers, body = self.fetch(path, accept)
                self.assertEqual(status, 404, path)
                self.assertEqual(headers.get_content_type(), "text/html")
                self.assertIn(b"Error response", body)
            status, headers, body = self.fetch("/", accept, method="HEAD")
            self.assertEqual(status, 200)
            self.assertEqual(headers.get_content_type(), "text/html")
            self.assertFalse(body)
        custom_404 = (ROOT / "404.html").read_text()
        self.assertIn("We can&rsquo;t find that page.", custom_404)
        self.assertIn(SITE_PATH + "/contact/", custom_404)

    def test_design_assets_and_navigation_remain_available(self):
        for path in ("/assets/css/styles.css", "/assets/js/main.js", "/assets/img/emily-hero-bw.jpg", "/about/", "/contact/"):
            status, _, body = self.fetch(path)
            self.assertEqual(status, 200, path)
            self.assertTrue(body, path)
        home = (ROOT / "index.html").read_text()
        self.assertIn('class="hero hero-split"', home)
        self.assertIn('class="site-nav"', home)


if __name__ == "__main__":
    unittest.main()
