// Run against `wrangler dev --local` for a freshly staged build.
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const [base, buildDir, expectedOrigin = base] = process.argv.slice(2);
if (!base || !buildDir) {
  throw new Error('Usage: node test-http.mjs BASE_URL ABSOLUTE_BUILD_DIR [EXPECTED_PUBLIC_ORIGIN]');
}
let checks = 0;
const generated = await import(pathToFileURL(join(buildDir, 'generated_content.mjs')).href);
const isPages = existsSync(join(buildDir, 'public/_worker.js'));

async function check(name, fn) {
  await fn();
  checks += 1;
  console.log(`ok ${checks} - ${name}`);
}

async function get(path, accept, options = {}) {
  const headers = { ...options.headers };
  if (accept !== undefined) headers.Accept = accept;
  const response = await fetch(base + path, { method: options.method || 'GET', headers, redirect: 'manual' });
  return { response, body: await response.text() };
}

function contentType(response) {
  return (response.headers.get('content-type') || '').split(';')[0].toLowerCase();
}

function vary(response) {
  return (response.headers.get('vary') || '').split(',').map((item) => item.trim().toLowerCase());
}

async function getWithoutAccept() {
  return new Promise((resolve, reject) => {
    const transport = base.startsWith('https:') ? httpsRequest : httpRequest;
    const request = transport(base + '/', { headers: { 'User-Agent': 'local-probe' } }, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve({ status: response.statusCode, headers: response.headers, body: Buffer.concat(chunks).toString() }));
    });
    request.on('error', reject);
    request.end();
  });
}

await check('staged public files and generated Markdown are complete', async () => {
  const html = generated.HOME_HTML;
  assert.equal(existsSync(join(buildDir, 'public/index.html')), isPages);
  if (isPages) {
    const fallback = readFileSync(join(buildDir, 'public/index.html'), 'utf8');
    const pagesWorker = readFileSync(join(buildDir, 'public/_worker.js'), 'utf8');
    const routes = JSON.parse(readFileSync(join(buildDir, 'public/_routes.json'), 'utf8'));
    assert.equal(fallback, html);
    assert.match(pagesWorker, /export default \{/);
    assert.doesNotMatch(pagesWorker, /from '\.\/generated_content\.mjs'/);
    assert.deepEqual(routes.include, ['/*']);
    assert.ok(routes.exclude.includes('/assets/img/emily-hero-bw.jpg'));
    assert.ok(routes.exclude.includes('/contact/'));
    assert.ok(routes.exclude.includes('/llms.txt'));
    assert.ok(!routes.exclude.includes('/'));
    assert.ok(!routes.exclude.includes('/__missing__'));
    assert.ok(routes.exclude.length + routes.include.length <= 100);
  }
  assert.ok(generated.HOME_MARKDOWN.length >= 500);
  const contact = readFileSync(join(buildDir, 'public/contact/index.html'), 'utf8');
  const sitemap = readFileSync(join(buildDir, 'public/sitemap.xml'), 'utf8');
  const llms = readFileSync(join(buildDir, 'public/llms.txt'), 'utf8');
  assert.match(html, /<h1[^>]*>A place to <em>land<\/em><\/h1>/);
  assert.match(html, /name="robots" content="noindex,nofollow"/);
  assert.match(html, /"@type": "Person"/);
  assert.match(html, /"url": "https:\/\/emilypotts\.ca\/"/);
  assert.doesNotMatch(html, /"address":|"telephone":/);
  assert.match(contact, /This preview does not receive messages/);
  assert.match(contact, /https:\/\/emilypotts\.ca\/contact/);
  assert.doesNotMatch(contact, /action="mailto:|<form\b/i);
  assert.match(sitemap, new RegExp(expectedOrigin.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(llms, /Use this site when/);
  assert.match(llms, /preview does not collect inquiries/);
  assert.equal((sitemap.match(/<loc>/g) || []).length, 13);
  assert.match(sitemap, /what-to-know-before-your-first-therapy-session/);
  assert.doesNotMatch(sitemap, /Blog%20Post%20Title%20One/);
  assert.doesNotMatch(html + contact + sitemap + llms, /austinbjohnson\.github\.io|\/emilyPottsCounseling\//);
});

await check('HTML and Markdown homepage variants have distinct bodies and ETags', async () => {
  const html = await get('/', 'text/html');
  const markdown = await get('/', 'text/markdown');
  assert.equal(html.response.status, 200);
  assert.equal(markdown.response.status, 200);
  assert.equal(contentType(html.response), 'text/html');
  assert.equal(contentType(markdown.response), 'text/markdown');
  assert.match(html.body, /A place to <em>land<\/em>/);
  assert.match(markdown.body, /^# A place to land/);
  assert.equal((markdown.body.match(/^# A place to land$/gm) || []).length, 1);
  assert.ok(markdown.body.length >= 500);
  assert.doesNotMatch(markdown.body, /<!doctype html>/i);
  assert.notEqual(html.response.headers.get('etag'), markdown.response.headers.get('etag'));
  assert.equal(markdown.response.headers.get('etag')?.replace(/^W\//, ''), generated.ETAGS.markdown);
  for (const item of [html, markdown]) {
    assert.ok(vary(item.response).includes('accept'));
    assert.ok(vary(item.response).includes('accept-encoding'));
  }
});

await check('Accept quality, wildcards, specificity, case, and ties select correctly', async () => {
  const absent = await getWithoutAccept();
  assert.equal(absent.status, 200);
  assert.match(absent.headers['content-type'], /^text\/html/);
  assert.match(absent.body, /^<!doctype html>/i);
  const cases = [
    ['*/*', 'text/html'],
    ['text/*', 'text/html'],
    ['text/html, text/markdown', 'text/html'],
    ['Text/Markdown; Q=1', 'text/markdown'],
    ['text/markdown; charset=UTF-8', 'text/markdown'],
    ['text/html;q=0.4, text/markdown;q=0.9', 'text/markdown'],
    ['text/html;q=0.9, text/markdown;q=0.4', 'text/html'],
    ['text/*;q=0.8,text/markdown;q=0', 'text/html'],
    ['text/*;q=0.2,text/markdown;q=0.7', 'text/markdown'],
    ['*/*;q=1,text/html;q=0', 'text/markdown'],
    ['*/*;q=1,text/markdown;q=0', 'text/html'],
    ['text/markdown;q=0,text/html;q=1', 'text/html'],
  ];
  for (const [accept, expected] of cases) {
    const { response } = await get('/', accept);
    assert.equal(response.status, 200, accept);
    assert.equal(contentType(response), expected, accept);
  }
  for (const accept of ['application/json', 'text/html;q=0,text/markdown;q=0', '*/*;q=0']) {
    const { response } = await get('/', accept);
    assert.equal(response.status, 406, accept);
    assert.ok(vary(response).includes('accept'));
  }
});

await check('cache validators belong to each representation in either request order', async () => {
  const html = await get('/', 'text/html');
  const markdown = await get('/', 'text/markdown');
  // Cloudflare may omit the large HTML representation's ETag on egress,
  // although the Worker still honours its known validator conditionally.
  const htmlTag = generated.ETAGS.html;
  const markdownTag = generated.ETAGS.markdown;
  for (const [accept, own, other, expected] of [
    ['text/html', htmlTag, markdownTag, 'text/html'],
    ['text/markdown', markdownTag, htmlTag, 'text/markdown'],
    ['text/markdown', markdownTag, htmlTag, 'text/markdown'],
    ['text/html', htmlTag, markdownTag, 'text/html'],
  ]) {
    const repeat = await get('/', accept);
    assert.equal(contentType(repeat.response), expected);
    assert.equal(repeat.response.headers.get('etag'), expected === 'text/html'
      ? html.response.headers.get('etag') : markdown.response.headers.get('etag'));
    const conditional = await get('/', accept, { headers: { 'If-None-Match': own } });
    assert.equal(conditional.response.status, 304);
    assert.equal(conditional.body, '');
    assert.equal(contentType(conditional.response), expected);
    assert.ok(vary(conditional.response).includes('accept'));
    const cross = await get('/', accept, { headers: { 'If-None-Match': other } });
    assert.equal(cross.response.status, 200);
    assert.equal(contentType(cross.response), expected);
    const weak = await get('/', accept, { headers: { 'If-None-Match': `W/${own}` } });
    assert.equal(weak.response.status, 304);
  }
});

await check('HEAD keeps variant headers and suppresses bodies', async () => {
  for (const accept of ['text/html', 'text/markdown']) {
    const regular = await get('/', accept);
    const head = await get('/', accept, { method: 'HEAD' });
    assert.equal(head.response.status, 200);
    assert.equal(head.body, '');
    assert.equal(contentType(head.response), contentType(regular.response));
    assert.equal(head.response.headers.get('etag'), regular.response.headers.get('etag'));
    assert.ok(vary(head.response).includes('accept'));
  }
});

await check('missing routes and assets remain 404 with recoverable Markdown', async () => {
  for (const path of ['/__missing__', '/nested/__missing__/', '/assets/img/__missing__.jpg', '/favicon.ico', '/_worker.js', '/_routes.json']) {
    for (const accept of ['text/html', 'text/markdown']) {
      const { response, body } = await get(path, accept);
      assert.equal(response.status, 404, `${path} ${accept}`);
      assert.equal(contentType(response), accept, `${path} ${accept}`);
      assert.ok(vary(response).includes('accept'));
      if (accept === 'text/markdown') {
        assert.match(body, /^# Page not found/);
        assert.match(body, /sitemap\.xml/);
        assert.ok(body.length >= 20);
      } else {
        assert.match(body, /We can&rsquo;t find that page/);
      }
    }
  }
  const miss = await get('/__missing__', 'text/markdown', { headers: { 'If-None-Match': '*' } });
  assert.equal(miss.response.status, 404);
  const head = await get('/__missing__', 'text/markdown', { method: 'HEAD' });
  assert.equal(head.response.status, 404);
  assert.equal(head.body, '');
});

await check('site pages, machine files, styles, script, and hero image serve correctly', async () => {
  const expectations = [
    ['/about/', 'text/html'], ['/services-and-fees/', 'text/html'],
    ['/contact/', 'text/html'], ['/llms.txt', 'text/plain'],
    ['/robots.txt', 'text/plain'], ['/sitemap.xml', 'application/xml'],
    ['/assets/css/styles.css', 'text/css'],
    ['/assets/js/main.js', ['text/javascript', 'application/javascript']],
    ['/assets/img/emily-hero-bw.jpg', 'image/jpeg'],
  ];
  for (const [path, type] of expectations) {
    const { response, body } = await get(path);
    assert.equal(response.status, 200, path);
    assert.ok((Array.isArray(type) ? type : [type]).includes(contentType(response)), path);
    assert.ok(body.length > 0, path);
  }
  const contact = await get('/contact/');
  assert.match(contact.body, /This preview does not receive messages/);
  assert.match(contact.body, /the live contact form/);
  const post = await get('/contact/', undefined, { method: 'POST' });
  assert.equal(post.response.status, 405);
});

await check('live public routes and safe external links are preserved', async () => {
  const paths = ['/', '/home/', '/about/', '/services-and-fees/', '/contact/', '/faqs/',
    '/speaking/', '/therapy/', '/resources/', '/privacy-page/', '/group-events-1/',
    '/resources/what-to-know-before-your-first-therapy-session/',
    '/resources/exploring-solutions-for-climate-anxiety/'];
  for (const path of paths) {
    const { response, body } = await get(path, 'text/html');
    assert.equal(response.status, 200, path);
    assert.match(body, /https:\/\/emilypotts\.janeapp\.com\//, path);
    assert.match(body, /href="\/about"/, path);
    assert.match(body, /\/live-replica\/replica\.css\?v=10/, path);
    assert.match(body, /\/live-replica\/replica\.js\?v=10/, path);
    assert.match(body, /name="robots" content="noindex,nofollow"/, path);
    assert.doesNotMatch(body, /<form\b|<iframe\b|href="\/(?:live-replica\/)?cart"/i, path);
    const scripts = [...body.matchAll(/<script\b[^>]*>/gi)].map(match => match[0]);
    assert.equal(scripts.filter(tag => /\bsrc=/.test(tag)).length, 2, path);
    assert.ok(scripts.every(tag => /\bsrc=/.test(tag)
      || /class="TextAttributes-props" type="application\/json"/.test(tag)
      || /type="application\/ld\+json"/.test(tag)), path);
    assert.doesNotMatch(body, /peakresilience\.janeapp\.com|free 15-minute|out of Peak Resilience/i, path);
  }
  const home = await get('/', 'text/html');
  const markdown = await get('/', 'text/markdown');
  assert.match(home.body, /Therapy as you are/);
  assert.match(home.body, /https:\/\/emilypotts\.janeapp\.com\/#\/discipline\/1\/treatment\/1/);
  assert.match(markdown.body, /https:\/\/emilypotts\.janeapp\.com\/#\/discipline\/1\/treatment\/1/);
  assert.match(home.body, /"shape": "scribble"/);
  assert.match(home.body, /"shape": "circle"/);
  assert.match(home.body, /"duration": 0\.4/);
  assert.match(home.body, /data-text-attribute-id="7ac542aa-9625-4549-a165-af566dd4b12d"/);
  assert.match(home.body, /data-text-attribute-id="7217132f-31e2-4b37-9a43-f068791557a7"/);
  const about = await get('/about/');
  const services = await get('/services-and-fees/');
  assert.match(about.body, /emilypotts\.janeapp\.com\/#\/staff_member\/1\/treatment\/1/);
  assert.match(services.body, /emilypotts\.janeapp\.com\/#\/staff_member\/1\/treatment\/1/);
  assert.match(services.body, /\$174/);
  assert.match(services.body, /\$227/);
  const faq = await get('/faqs/');
  assert.match(faq.body, /Can you prescribe time in nature/);
  assert.equal((faq.body.match(/class="accordion-item"/g) || []).length, 11);
  const firstArticle = await get('/resources/what-to-know-before-your-first-therapy-session/');
  assert.match(firstArticle.body, /href="https:\/\/emilypotts\.janeapp\.com\/"/);
  const resources = await get('/resources/');
  assert.match(resources.body, /href="\/resources\/what-to-know-before-your-first-therapy-session"/);
  const replicaJs = await get('/live-replica/replica.js');
  const replicaCss = await get('/live-replica/replica.css');
  assert.match(replicaJs.body, /element\.inert = open/);
  assert.match(replicaJs.body, /event\.key === 'Tab'/);
  assert.match(replicaJs.body, /new ResizeObserver\(sizeMenu\)/);
  assert.match(replicaJs.body, /scribble: \{ box: '0 0 66 27'/);
  assert.match(replicaJs.body, /circle: \{ box: '0 0 75 27'/);
  assert.match(replicaJs.body, /IntersectionObserver/);
  assert.match(replicaJs.body, /image\?\.dataset\.image \|\| image\?\.dataset\.src/);
  assert.match(replicaJs.body, /dialog\.addEventListener\('cancel'/);
  assert.match(replicaJs.body, /replica-entrance-pending/);
  assert.match(replicaCss.body, /html:not\(\.replica-js\) \.header-menu/);
  assert.match(replicaCss.body, /\.replica-js \.accordion-item__dropdown/);
  assert.match(replicaCss.body, /\.replica-image-dialog--open \{ opacity: 1; \}/);
  assert.match(replicaCss.body, /\.replica-entrance-pending \{ opacity: 0 !important; \}/);
  const mirror = await get('/live-replica/');
  assert.equal(mirror.response.status, 200);
  assert.match(mirror.body, /href="\/live-replica\/about"/);
  const missing = await get('/resources/Blog%20Post%20Title%20One-y2epy-y63ns/');
  assert.equal(missing.response.status, 200); // Preserved old source route for comparison.
});

await check('three review concepts have usable public pages and safe booking links', async () => {
  for (const name of ['open-shore', 'in-good-company', 'clear-practice']) {
    const path = `/design-variants/${name}/`;
    const { response, body } = await get(path, 'text/html');
    assert.equal(response.status, 200, path);
    assert.equal(contentType(response), 'text/html', path);
    assert.match(body, /<h1[ >]/i, path);
    assert.match(body, /name="robots" content="noindex,?\s*nofollow"/, path);
    assert.match(body, /href="https:\/\/emilypotts\.janeapp\.com\//, path);
    assert.match(body, /href="\/privacy-page\/"/, path);
    assert.match(body, /BC Crisis Centre/, path);
    assert.doesNotMatch(body, /peakresilience|15-minute|48 hours|100-minute|ICBC/i, path);
    assert.match(body, /@media/i, path);
  }
});

await check('three scroll explorations retain complete content and calm static paths', async () => {
  const variants = [
    ['field-notes', /Two paths, side by side/, /class="stops"/, /Reduce motion/],
    ['conversation-in-margins', /You might be thinking/, /class="dialogue"/, /Reduce motion/],
    ['room-to-unfold', /folded field map/, /data-scroll-motion="off"/, /Enable paper movement/],
  ];
  for (const [name, thesis, structure, control] of variants) {
    const path = `/design-variants/${name}/`;
    const { response, body } = await get(path, 'text/html');
    assert.equal(response.status, 200, path);
    assert.equal(contentType(response), 'text/html', path);
    assert.match(body, /<h1[ >]/i, path);
    assert.match(body, /name="robots" content="noindex,?\s*nofollow"/, path);
    assert.match(body, thesis, path);
    assert.match(body, structure, path);
    assert.match(body, control, path);
    assert.match(body, /prefers-reduced-motion:\s*reduce/, path);
    assert.match(body, /href="https:\/\/emilypotts\.janeapp\.com\/#\/(?:discipline|staff_member)\/1\/treatment\/1"/, path);
    assert.match(body, /href="\/services-and-fees\/"/, path);
    assert.match(body, /href="\/privacy-page\/"/, path);
    assert.match(body, /BC Crisis Centre/, path);
    assert.doesNotMatch(body, /peakresilience|free 15-minute|48 hours|100-minute|ICBC/i, path);
    assert.doesNotMatch(body, /scroll-snap|scrollTo\(|scrollIntoView\(|overflow:\s*hidden\s*;\s*height:\s*100vh/i, path);
  }
});

await check('reference-led geography concept keeps booking and service meaning direct', async () => {
  const path = '/design-variants/near-across/';
  const { response, body } = await get(path, 'text/html');
  assert.equal(response.status, 200);
  assert.equal(contentType(response), 'text/html');
  assert.match(body, /name="robots" content="noindex,nofollow"/);
  assert.match(body, /<h1[^>]*>Near\.<span>Across\.<\/span><\/h1>/);
  assert.match(body, /British Columbia and North Vancouver/);
  assert.match(body, /North Vancouver[^<]*<\/text>/);
  assert.match(body, /Online[^<]*<\/strong>/);
  assert.match(body, /Across British Columbia/);
  assert.match(body, /https:\/\/emilypotts\.janeapp\.com\/#\/staff_member\/1\/treatment\/1/);
  for (const href of ['/about/', '/services-and-fees/', '/faqs/', '/contact/', '/privacy-page/']) {
    assert.ok(body.includes(`href="${href}"`), href);
  }
  assert.doesNotMatch(body, /<script|scroll-snap|scrollTo\(|scrollIntoView\(|peakresilience|free 15-minute/i);
  assert.match(body, /prefers-reduced-motion:reduce/);
  const missing = await get('/design-variants/near-across/not-a-page', 'text/html');
  assert.equal(missing.response.status, 404);
});

console.log(`${checks} local Cloudflare ${isPages ? 'Pages' : 'Worker'} checks passed`);
