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
      const source = image?.currentSrc || image?.src || image?.dataset.src;
      if (!source) return;
      const dialog = document.createElement('dialog');
      dialog.className = 'replica-image-dialog';
      const close = document.createElement('button');
      close.type = 'button';
      close.textContent = 'Close';
      close.addEventListener('click', () => dialog.close());
      const large = document.createElement('img');
      large.src = source;
      large.alt = image.alt || '';
      dialog.append(close, large);
      dialog.addEventListener('close', () => dialog.remove());
      document.body.append(dialog);
      dialog.showModal();
    });
  });
})();
