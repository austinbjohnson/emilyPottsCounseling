const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");

const normalizePath = (path) => {
  if (!path) return "/";
  const withoutIndex = path.replace(/index\.html$/i, "");
  const trimmed = withoutIndex.endsWith("/") ? withoutIndex.slice(0, -1) : withoutIndex;
  return trimmed.length ? trimmed : "/";
};

const markCurrentNavLink = () => {
  const navLinks = Array.from(document.querySelectorAll(".site-nav-links a[href]"));
  const currentPath = normalizePath(window.location.pathname);

  const candidates = navLinks
    .map((link) => {
      try {
        const url = new URL(link.getAttribute("href"), window.location.origin);
        if (url.origin !== window.location.origin) return null;
        return { link, path: normalizePath(url.pathname) };
      } catch {
        return null;
      }
    })
    .filter(Boolean);

  let bestMatch = null;
  for (const candidate of candidates) {
    candidate.link.removeAttribute("aria-current");

    if (candidate.path === "/" || candidate.path === currentPath) {
      bestMatch = bestMatch && bestMatch.path.length > candidate.path.length ? bestMatch : candidate;
      continue;
    }

    if (currentPath.startsWith(`${candidate.path}/`)) {
      bestMatch = bestMatch && bestMatch.path.length > candidate.path.length ? bestMatch : candidate;
    }
  }

  if (bestMatch) {
    bestMatch.link.setAttribute("aria-current", "page");
  }
};

markCurrentNavLink();

if (toggle && nav) {
  const setNavOpen = (nextOpen, options = {}) => {
    nav.setAttribute("data-open", String(nextOpen));
    toggle.setAttribute("aria-expanded", String(nextOpen));
    toggle.textContent = nextOpen ? "Close Menu" : "Open Menu";
    document.body.classList.toggle("nav-open", nextOpen);

    if (nextOpen && options.focusFirstLink) {
      const firstLink = nav.querySelector("a[href]");
      firstLink?.focus();
    }
  };

  const isOpen = nav.getAttribute("data-open") === "true";
  setNavOpen(isOpen);

  toggle.addEventListener("click", () => {
    const currentlyOpen = nav.getAttribute("data-open") === "true";
    setNavOpen(!currentlyOpen, { focusFirstLink: !currentlyOpen });
  });

  nav.addEventListener("click", (event) => {
    const link = event.target.closest?.("a[href]");
    if (link) {
      setNavOpen(false);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (nav.getAttribute("data-open") !== "true") return;
    setNavOpen(false);
    toggle.focus();
  });

  document.addEventListener("click", (event) => {
    if (nav.getAttribute("data-open") !== "true") return;
    if (nav.contains(event.target) || toggle.contains(event.target)) return;
    setNavOpen(false);
  });
}
