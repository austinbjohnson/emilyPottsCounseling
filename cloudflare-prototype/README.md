# Cloudflare Worker review prototype

This directory builds a review preview from the public files in
`austinbjohnson/emilyPottsCounseling`. The existing Cloudflare Worker is
`emilypottscounseling` in Austin Personal. Its Git integration previews
non-production branches. The repository root `wrangler.jsonc` points to the
tracked `deploy-codex-emily-preview/` build because Cloudflare's build command
is currently empty; `npx wrangler preview` does not run Wrangler's custom
build command from its configuration in Workers Builds.

## What it does

- Stages a fixed list of public pages, styles, script, images, and machine
  files. It rewrites the GitHub Pages path and preview origin for a separate
  root-hosted preview. Every build requires a **new** output directory.
- Serves the existing HTML homepage or Markdown generated from its existing
  main content according to `Accept`. HTML wins an equal-quality tie. Both
  variants have `Vary: Accept, Accept-Encoding` and distinct ETags.
- Serves HTML or Markdown for missing routes with HTTP 404. The Worker uses
  `env.ASSETS.fetch` for known files and generates the negotiated response for
  the homepage and missing routes.
- Keeps the existing `mailto:` contact form and states beside it that the
  visitor must send the drafted message from their email app. No submissions
  are collected by Cloudflare.

The source site contains public counselling information, photos, booking and
email links, and its committed privacy notice. That notice includes a postal
address also present on the current public privacy page. The preview exposes
the same notice at a second public URL; whether it is a home or business
address remains unverified.

## Local use

Use an existing local Wrangler 4 runtime. No account login is needed for
local tests. Run from the repository root with a fresh output path and an
unused loopback port:

```sh
python3 cloudflare-prototype/build.py --platform pages \
  --output cloudflare-prototype/builds/local-review-1 \
  --origin http://127.0.0.1:38741 --local
wrangler pages dev cloudflare-prototype/builds/local-review-1/public \
  --ip 127.0.0.1 --port 38741 --compatibility-date 2026-08-06
node cloudflare-prototype/test-http.mjs \
  http://127.0.0.1:38741 \
  "$(pwd)/cloudflare-prototype/builds/local-review-1"
python3 -m unittest discover -s tests -v
```

`builds/` and `.wrangler/` are ignored. Previous local builds are retained.
The tracked review build uses the review branch's expected Worker preview
origin. The pinned Wrangler version and repository-root configuration should
be used for a final local check, followed by tests on the actual preview URL.

## Review deployment

Austin's Git integration points this existing Worker at the personal GitHub
repository. The production branch is `main`; builds for preview branches are
enabled. This branch is `codex-emily-preview`. The configuration targets the
existing Worker name and leaves custom domains and DNS unchanged. Workers
Free was confirmed in the account billing view; no upgrade is part of this
work. A preview URL is public even if search engines do not index it.

After a source edit, stage a **new** build directory with `build.py`, then
point root `wrangler.jsonc` to it and test locally before committing. The
generated files under `deploy-codex-emily-preview/` are committed because
the Cloudflare build command is empty. Do not commit the nested generated
`wrangler.jsonc`; the repository-root file is the deployment configuration.
The review origin is
`https://codex-emily-preview-emilypottscounseling.austinbjohnson.workers.dev`.
Verify that Cloudflare actually assigns that origin before presenting it as
working. The live `emilypotts.ca` site is separate and is not changed here.
