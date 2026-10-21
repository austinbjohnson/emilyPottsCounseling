import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { runInNewContext } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const script = readFileSync(resolve(root, 'live-replica/replica.js'), 'utf8');
const css = readFileSync(resolve(root, 'live-replica/replica.css'), 'utf8');
const services = readFileSync(resolve(root, 'live-replica/services-and-fees/index.html'), 'utf8');

function element(rect = { top: 0, bottom: 100, width: 100, height: 100 }) {
  const classes = new Set();
  const listeners = new Map();
  return {
    classList: {
      add: (...names) => names.forEach(name => classes.add(name)),
      remove: (...names) => names.forEach(name => classes.delete(name)),
      toggle: (name, value) => value ? classes.add(name) : classes.delete(name),
      contains: name => classes.has(name),
    },
    style: { setProperty(name, value) { this[name] = value; } },
    dataset: {},
    children: [],
    getBoundingClientRect: () => rect,
    addEventListener: (name, callback) => listeners.set(name, callback),
    dispatch(name, event = {}) { listeners.get(name)?.(event); },
    setAttribute(name, value) { this[name] = value; },
    append(...children) { this.children.push(...children); },
    focus() { this.focused = true; },
    showModal() { this.open = true; },
    close() { this.open = false; this.dispatch('close'); },
    remove() { this.removed = true; },
  };
}

function setup({ reduce = false, noObserver = false } = {}) {
  const highResolution = 'https://images.squarespace-cdn.com/content/v1/example/IMG_8151.jpg';
  const image = element();
  image.dataset = { image: highResolution, imageDimensions: '2500x1875' };
  image.currentSrc = highResolution + '?format=500w';
  image.alt = '';
  const trigger = element();
  trigger.closest = () => ({ querySelector: () => image });
  const visible = element();
  const later = element({ top: 1200, bottom: 1300, width: 100, height: 100 });
  const observed = [];
  const timers = [];
  const dialogs = [];
  let motionChange;
  let entranceObserver;
  class IntersectionObserver {
    constructor(callback) { this.callback = callback; entranceObserver = this; }
    observe(node) { observed.push(node); }
    unobserve(node) { this.unobserved = node; }
    disconnect() { this.disconnected = true; }
  }
  const document = {
    documentElement: element(),
    body: { classList: element().classList, append(node) { dialogs.push(node); } },
    querySelector: () => null,
    querySelectorAll(selector) {
      if (selector === '[data-sqsp-image-block-lightbox-button]') return [trigger];
      if (selector.startsWith('h1, h2, h3')) return [visible, later];
      return [];
    },
    addEventListener() {},
    createElement: () => element(),
  };
  const window = {
    innerHeight: 800,
    matchMedia: () => ({ matches: reduce, addEventListener: (_, callback) => { motionChange = callback; } }),
    addEventListener() {},
    setTimeout: callback => { timers.push(callback); },
  };
  if (!noObserver) window.IntersectionObserver = IntersectionObserver;
  runInNewContext(script, { document, window, IntersectionObserver, requestAnimationFrame: callback => callback() });
  return { trigger, visible, later, observed, dialogs, timers, highResolution,
    document,
    get entranceObserver() { return entranceObserver; }, motionChange: value => motionChange?.({ matches: value }) };
}

assert.match(services, /data-sqsp-image-block-lightbox-button[\s\S]*?data-lightbox-theme="dark"/);
assert.match(services, /data-image-dimensions="2500x1875"/);
assert.match(css, /\.replica-entrance-pending\s*\{\s*opacity:\s*0\s*!important/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.replica-image-dialog, \.replica-entrance-pending\s*\{\s*opacity:\s*1\s*!important/);
assert.match(css, /\.replica-image-dialog--open::backdrop \{ background: rgba\(0, 0, 0, \.95\); \}/);
assert.match(css, /max-width: calc\(100vw - 48px\)/);
assert.match(css, /@media \(max-width: 800px\)[\s\S]*max-width: calc\(100vw - 16px\)/);

const normal = setup();
assert.equal(normal.visible.classList.contains('replica-entrance-pending'), false, 'above-fold text stays visible');
assert.equal(normal.later.classList.contains('replica-entrance-pending'), true, 'later content fades on entry');
assert.deepEqual(normal.observed, [normal.later]);
normal.entranceObserver.callback([{ target: normal.later, isIntersecting: true }]);
assert.equal(normal.later.classList.contains('replica-entrance-pending'), false);
assert.equal(normal.later.classList.contains('replica-entrance-visible'), true);
normal.trigger.dispatch('click');
const dialog = normal.dialogs[0];
const [close, large] = dialog.children;
assert.equal(dialog.open, true);
assert.equal(normal.document.documentElement.classList.contains('replica-image-open'), true);
assert.equal(dialog['aria-label'], 'Full size image');
assert.equal(close['aria-label'], 'Close image');
assert.equal(close.focused, true);
assert.equal(large.src, normal.highResolution, 'lightbox uses original image, not inline 500w');
assert.equal(large.width, 2500);
assert.equal(large.height, 1875);
let defaultPrevented = false;
dialog.dispatch('cancel', { preventDefault() { defaultPrevented = true; } });
assert.equal(defaultPrevented, true, 'Escape uses the same close transition');
assert.equal(normal.timers.length, 1);
normal.timers[0]();
assert.equal(dialog.removed, true);
assert.equal(normal.document.documentElement.classList.contains('replica-image-open'), false);
assert.equal(normal.trigger.focused, true, 'focus returns to the image button');

const reduced = setup({ reduce: true });
assert.equal(reduced.later.classList.contains('replica-entrance-pending'), false);
reduced.trigger.dispatch('click');
const reducedDialog = reduced.dialogs[0];
assert.equal(reducedDialog.classList.contains('replica-image-dialog--open'), true);
reducedDialog.children[0].dispatch('click');
assert.equal(reducedDialog.removed, true, 'reduced motion closes without waiting');
assert.equal(reduced.document.documentElement.classList.contains('replica-image-open'), false);
assert.equal(reduced.timers.length, 0);

const changed = setup();
changed.motionChange(true);
assert.equal(changed.later.classList.contains('replica-entrance-pending'), false);
assert.equal(changed.entranceObserver.disconnected, true);

const fallback = setup({ noObserver: true });
assert.equal(fallback.later.classList.contains('replica-entrance-pending'), false);
fallback.trigger.dispatch('click');
const backdropDialog = fallback.dialogs[0];
backdropDialog.dispatch('click', { target: backdropDialog });
assert.equal(fallback.timers.length, 1, 'clicking outside the image dismisses the modal');
fallback.timers[0]();
assert.equal(backdropDialog.removed, true);

console.log('ok - live lightbox source, controls, close paths, focus, and entrance motion fallbacks');
