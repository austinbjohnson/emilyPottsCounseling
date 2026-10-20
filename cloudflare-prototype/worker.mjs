import {
  HOME_HTML, HOME_MARKDOWN, NOT_FOUND_HTML, NOT_FOUND_MARKDOWN, ETAGS,
} from './generated_content.mjs';

const CACHE_CONTROL = 'public, max-age=0, must-revalidate';
const VARY = 'Accept, Accept-Encoding';
const QVALUE = /^(?:0(?:\.\d{0,3})?|1(?:\.0{0,3})?)$/;

// HTTP media type quality follows the most specific matching range first.
// This site offers two representations at /; HTML wins equal-quality ties.
function parseAccept(header) {
  if (header === null || header.trim() === '') return null;
  return header.split(',').flatMap((item) => {
    const [media, ...parameters] = item.trim().split(';');
    const type = media.trim().toLowerCase();
    if (!/^(?:\*\/\*|text\/(?:\*|html|markdown))$/.test(type)) return [];
    let quality = 1;
    let charset = null;
    for (const parameter of parameters) {
      const match = parameter.trim().match(/^([a-z0-9_-]+)\s*=\s*(.+)$/i);
      if (!match) return [];
      const key = match[1].toLowerCase();
      const value = match[2].trim().replace(/^"(.*)"$/, '$1');
      if (key === 'q') {
        if (!QVALUE.test(value)) return [];
        quality = Number(value);
      } else if (key === 'charset') {
        charset = value.toLowerCase();
      } else {
        // An unknown media parameter does not describe either representation.
        return [];
      }
    }
    if (charset !== null && charset !== 'utf-8') return [];
    return [{ type, quality, parameters: charset === null ? 0 : 1 }];
  });
}

function qualityFor(ranges, variant) {
  if (ranges === null) return 1;
  let best = { specificity: -1, parameters: -1, quality: 0 };
  for (const range of ranges) {
    const specificity = range.type === `text/${variant}` ? 2
      : range.type === 'text/*' ? 1
      : range.type === '*/*' ? 0 : -1;
    if (specificity < 0) continue;
    if (specificity > best.specificity
        || (specificity === best.specificity && range.parameters > best.parameters)
        || (specificity === best.specificity && range.parameters === best.parameters
            && range.quality > best.quality)) {
      best = { specificity, parameters: range.parameters, quality: range.quality };
    }
  }
  return best.quality;
}

export function selectRepresentation(accept) {
  const ranges = parseAccept(accept);
  const html = qualityFor(ranges, 'html');
  const markdown = qualityFor(ranges, 'markdown');
  if (html === 0 && markdown === 0) return 'none';
  return markdown > html ? 'markdown' : 'html';
}

function ifNoneMatchMatches(header, etag) {
  if (header === null) return false;
  const candidates = header.match(/(?:W\/)?"[^"]*"|\*/g);
  if (!candidates) return false;
  return candidates.some((candidate) => candidate === '*'
    || candidate.replace(/^W\//, '').trim() === etag);
}

function representedResponse(request, variant, status) {
  const markdown = variant === 'markdown';
  const body = markdown
    ? (status === 404 ? NOT_FOUND_MARKDOWN : HOME_MARKDOWN)
    : (status === 404 ? NOT_FOUND_HTML : HOME_HTML);
  const headers = new Headers({
    'Content-Type': markdown ? 'text/markdown; charset=utf-8' : 'text/html; charset=utf-8',
    'Cache-Control': CACHE_CONTROL,
    Vary: VARY,
    'X-Content-Type-Options': 'nosniff',
  });
  if (status === 200) {
    const etag = markdown ? ETAGS.markdown : ETAGS.html;
    headers.set('ETag', etag);
    if (ifNoneMatchMatches(request.headers.get('If-None-Match'), etag)) {
      return new Response(null, { status: 304, headers });
    }
  }
  return new Response(request.method === 'HEAD' ? null : body, { status, headers });
}

export default {
  async fetch(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', {
        status: 405,
        headers: { Allow: 'GET, HEAD', 'Cache-Control': 'no-store' },
      });
    }
    const pathname = new URL(request.url).pathname;
    const variant = selectRepresentation(request.headers.get('Accept'));
    if (pathname === '/' || pathname === '/index.html') {
      if (variant === 'none') {
        return new Response(request.method === 'HEAD' ? null : 'Available types: text/html, text/markdown', {
          status: 406,
          headers: { 'Content-Type': 'text/plain; charset=utf-8', Vary: VARY, 'Cache-Control': 'no-store' },
        });
      }
      return representedResponse(request, variant, 200);
    }
    // Pages treats this file as its Function entrypoint, not a site asset.
    if (pathname === '/_worker.js' || pathname === '/_routes.json') {
      return representedResponse(request, variant === 'markdown' ? 'markdown' : 'html', 404);
    }
    const assetResponse = await env.ASSETS.fetch(request);
    if (assetResponse.status === 404) {
      return representedResponse(request, variant === 'markdown' ? 'markdown' : 'html', 404);
    }
    return assetResponse;
  },
};
