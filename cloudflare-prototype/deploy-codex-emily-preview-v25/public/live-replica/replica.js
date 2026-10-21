// Only local, non-submitting interactions are enabled in this public preview.
(() => {
  document.documentElement.classList.add('replica-js');
  const header = document.querySelector('header');
  const menu = document.querySelector('.header-menu');
  const background = [...document.querySelectorAll('main, footer, .replica-inquiry-note')];
  let opener = null;
  const menuFocusables = () => [...document.querySelectorAll('.header-menu a[href], .header-menu button, .header-burger-btn')]
    .filter(element => element.getClientRects().length && !element.disabled && element.tabIndex >= 0);
  const setMenu = (open, restoreFocus = false) => {
    document.documentElement.classList.toggle('replica-menu-open', open);
    document.body.classList.toggle('header--menu-open', open);
    header?.classList.toggle('white', open);
    background.forEach(element => { element.inert = open; });
    document.querySelectorAll('.header-burger-btn').forEach(button => {
      button.classList.toggle('burger--active', open);
      button.setAttribute('aria-expanded', String(open));
      button.setAttribute('aria-label', open ? 'Close Menu' : 'Open Menu');
    });
    if (open) requestAnimationFrame(() => {
      (menuFocusables().find(element => menu?.contains(element)) || opener)?.focus();
    });
    else if (restoreFocus) opener?.focus();
  };
  const sizeMenu = () => {
    if (!header) return;
    const height = `${header.getBoundingClientRect().height}px`;
    document.documentElement.style.setProperty('--header-height', height);
    if (menu) menu.style.paddingTop = height;
  };
  sizeMenu();
  if (header) new ResizeObserver(sizeMenu).observe(header);
  window.addEventListener('resize', sizeMenu);
  document.querySelectorAll('.header-burger-btn').forEach(button => {
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-label', 'Open Menu');
    button.addEventListener('click', () => {
      const open = !document.documentElement.classList.contains('replica-menu-open');
      if (open) opener = button;
      setMenu(open, !open);
    });
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && document.documentElement.classList.contains('replica-menu-open')) {
      setMenu(false, true);
    }
    if (event.key === 'Tab' && document.documentElement.classList.contains('replica-menu-open')) {
      const focusable = menuFocusables();
      if (!focusable.length) return;
      const index = focusable.indexOf(document.activeElement);
      if (event.shiftKey && index <= 0) {
        event.preventDefault();
        focusable.at(-1).focus();
      } else if (!event.shiftKey && (index === -1 || index === focusable.length - 1)) {
        event.preventDefault();
        focusable[0].focus();
      }
    }
  });
  document.querySelectorAll('.accordion-items-container').forEach(group => {
    const buttons = [...group.querySelectorAll('.accordion-item__click-target')];
    buttons.forEach(button => button.addEventListener('click', () => {
      const next = button.getAttribute('aria-expanded') !== 'true';
      if (group.dataset.shouldAllowMultipleOpenItems !== 'true') {
        buttons.forEach(other => other.setAttribute('aria-expanded', 'false'));
      }
      button.setAttribute('aria-expanded', String(next));
    }));
  });
  document.querySelectorAll('.lightbox-handle').forEach(button => {
    button.addEventListener('click', () => {
      const dialog = document.createElement('dialog');
      dialog.className = 'replica-inquiry-dialog';
      dialog.innerHTML = '<button type="button" aria-label="Close">Close</button>' +
        '<h2>Speaking or Workshop Inquiry</h2>' +
        '<p>This preview does not receive messages. Use ' +
        '<a href="https://emilypotts.ca/contact">Emily’s live contact page</a> ' +
        'to send a private inquiry.</p>';
      dialog.querySelector('button').addEventListener('click', () => dialog.close());
      dialog.addEventListener('close', () => dialog.remove());
      document.body.append(dialog);
      dialog.showModal();
    });
  });
  document.querySelectorAll('[data-sqsp-image-block-lightbox-button]').forEach(button => {
    button.addEventListener('click', () => {
      const image = button.closest('.fluid-image-container')?.querySelector('img');
      // The original lightbox clones the authored image, not its small inline
      // rendering. Its data-image URL is the full-size public Squarespace asset.
      const source = image?.dataset.image || image?.dataset.src || image?.currentSrc || image?.src;
      if (!source) return;
      const dialog = document.createElement('dialog');
      dialog.className = 'replica-image-dialog';
      dialog.setAttribute('aria-label', 'Full size image');
      const close = document.createElement('button');
      close.type = 'button';
      close.className = 'replica-image-dialog__close';
      close.setAttribute('aria-label', 'Close image');
      close.textContent = '×';
      const large = document.createElement('img');
      large.src = source;
      large.alt = image.alt || '';
      const dimensions = image.dataset.imageDimensions?.match(/^(\d+)x(\d+)$/);
      if (dimensions) {
        large.width = Number(dimensions[1]);
        large.height = Number(dimensions[2]);
      }
      dialog.append(close, large);
      let closing = false;
      const dismiss = () => {
        if (closing) return;
        closing = true;
        dialog.classList.remove('replica-image-dialog--open');
        if (reducedMotion.matches) dialog.close();
        else window.setTimeout(() => dialog.close(), 600);
      };
      close.addEventListener('click', dismiss);
      dialog.addEventListener('click', event => {
        if (event.target === dialog) dismiss();
      });
      dialog.addEventListener('cancel', event => {
        event.preventDefault();
        dismiss();
      });
      dialog.addEventListener('close', () => {
        document.documentElement.classList.remove('replica-image-open');
        dialog.remove();
        button.focus();
      });
      document.body.append(dialog);
      document.documentElement.classList.add('replica-image-open');
      dialog.showModal();
      close.focus();
      if (reducedMotion.matches) dialog.classList.add('replica-image-dialog--open');
      else requestAnimationFrame(() => dialog.classList.add('replica-image-dialog--open'));
    });
  });

  // Squarespace stores each authored mark's shape, palette and draw timing in
  // inert TextAttributes JSON. Its original script is excluded from the preview.
  // These normalized paths follow the observed live SVG strokes and resize to
  // the actual text run, including narrower phone layouts.
  const markPaths = {
    scribble: { box: '0 0 66 27', d: 'M0 23.76 c4.95 -.1215 23.1 -.891 33 -.81 c9.9 .081 32.01 1.35 33 1.35 c.99 0 -17.49 -1.5525 -26.4 -1.35 c-8.91 .2025 -32.01 2.376 -33 2.7 c-.99 .324 19.47 -.54 26.4 -.54 c6.93 0 19.8 .2565 19.8 .54 c0 .2835 -14.85 1.1475 -19.8 1.35 c-4.95 .2025 -11.22 0 -13.2 0' },
    circle: { box: '0 0 75 27', d: 'M23.25 30.15 C42.63 31.778 85 29.78 85 14.24 C85 1.105 57.07 0 37.12 0 S-9.05 1.105 -9.05 13.796 S12.895 33.443 60.3 31.778' },
    underline: { box: '0 0 75 27', d: 'M0 24.3 L75 24.3' },
    underlineCurve: { box: '0 0 75 27', d: 'M0 26.7 C18.75 24.5 37.5 23.8 56.25 24 C68 24.1 73.5 24.8 75 24.84' },
  };
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  // The saved Squarespace settings specify fade / ease / 1.50s. Its animation
  // module skips items already in view, then reveals later items on entry.
  // Keep all content visible if JS, IntersectionObserver, or motion is absent.
  if ('IntersectionObserver' in window && !reducedMotion.matches) {
    const selector = 'h1, h2, h3, h4, h5, p, [data-animation-role="image"], [data-animation-role="button"], [data-animation-role="header-element"]';
    const candidates = [...document.querySelectorAll(selector)].filter(element => {
      const rect = element.getBoundingClientRect();
      return rect.width && rect.height && (rect.top >= window.innerHeight || rect.bottom <= 0);
    });
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.remove('replica-entrance-pending');
        entry.target.classList.add('replica-entrance-visible');
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.05 });
    candidates.forEach((element, index) => {
      element.style.setProperty('--replica-entrance-delay', `${index * 0.6 / candidates.length}s`);
      element.classList.add('replica-entrance-pending');
      observer.observe(element);
    });
    reducedMotion.addEventListener?.('change', event => {
      if (!event.matches) return;
      observer.disconnect();
      candidates.forEach(element => {
        element.classList.remove('replica-entrance-pending');
        element.classList.add('replica-entrance-visible');
      });
    });
  }
  document.querySelectorAll('script.TextAttributes-props[type="application/json"]').forEach(script => {
    const block = script.closest('.sqs-block-content');
    if (!block) return;
    let configs;
    try { configs = JSON.parse(script.textContent); } catch { return; }
    const byId = new Map(configs.map(config => [config.id, config]));
    const spans = [...block.querySelectorAll('span.sqsrte-text-highlight[data-text-attribute-id]')];
    const revealed = new Set();
    let observer;
    let scheduled = false;
    const paint = () => {
      scheduled = false;
      observer?.disconnect();
      block.querySelectorAll('.replica-text-mark').forEach(mark => mark.remove());
      block.style.position = 'relative';
      block.style.zIndex = '0';
      const parentRect = block.getBoundingClientRect();
      const pending = new Map();
      for (const span of spans) {
        const id = span.dataset.textAttributeId;
        const config = byId.get(id);
        const shape = markPaths[config?.shape];
        if (!shape) continue;
        const fontSize = Math.round(Number.parseFloat(getComputedStyle(span).fontSize));
        const color = config.color?.type === 'SITE_PALETTE_COLOR'
          ? `hsla(var(--${config.color.sitePaletteColor.colorName}-hsl),${config.color.sitePaletteColor.alphaModifier ?? 1})`
          : 'var(--text-highlight-color, #9b9eb4)';
        for (const rect of span.getClientRects()) {
          if (!rect.width || !rect.height) continue;
          const mark = document.createElement('span');
          mark.className = 'replica-text-mark';
          mark.setAttribute('aria-hidden', 'true');
          const width = Math.round(rect.width + fontSize * .15);
          const height = Math.round(rect.height);
          Object.assign(mark.style, {
            left: `${Math.round(rect.left - parentRect.left - fontSize * .075)}px`,
            top: `${Math.round(rect.top - parentRect.top)}px`,
            width: `${width}px`, height: `${height}px`,
          });
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          svg.setAttribute('viewBox', shape.box);
          svg.setAttribute('preserveAspectRatio', 'none');
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', shape.d);
          path.setAttribute('stroke', color);
          path.setAttribute('stroke-width', String(fontSize * (config.thickness?.value ?? .1)));
          path.setAttribute('vector-effect', 'non-scaling-stroke');
          svg.append(path); mark.append(svg); block.append(mark);
          const length = Math.ceil(path.getTotalLength());
          path.style.strokeDasharray = String(length);
          const animate = config.isAnimationEnabled && !reducedMotion.matches && !revealed.has(id);
          path.style.strokeDashoffset = String(length * (animate ? 3 : 2));
          if (animate) {
            path.style.transition = `stroke-dashoffset ${config.duration || .5}s ease-out`;
            if (!pending.has(span)) pending.set(span, []);
            pending.get(span).push({ path, length, id });
          }
        }
      }
      if (pending.size && 'IntersectionObserver' in window) {
        observer = new IntersectionObserver(entries => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            for (const { path, length, id } of pending.get(entry.target) || []) {
              requestAnimationFrame(() => { path.style.strokeDashoffset = String(length * 2); });
              revealed.add(id);
            }
            observer.unobserve(entry.target);
          }
        }, { threshold: .15 });
        pending.forEach((_, span) => observer.observe(span));
      } else {
        pending.forEach(items => items.forEach(({ path, length }) => {
          path.style.strokeDashoffset = String(length * 2);
        }));
      }
    };
    const schedule = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(paint);
    };
    paint();
    document.fonts?.ready.then(schedule);
    window.addEventListener('resize', schedule);
    if (window.ResizeObserver) new ResizeObserver(schedule).observe(block);
  });
})();
