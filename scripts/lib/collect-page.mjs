// Runs inside the browser page (passed to page.evaluate). Must be self-contained:
// no imports, no closures over module variables. Collects facts only, judges nothing.

/* global document, window, NodeFilter */
export function collectPageFacts() {
  const LIMITS = { text: 30000, footer: 3000, linkText: 120, prices: 30, banner: 800 };
  const REGION_SELECTOR = 'header, footer, nav, [role="banner"], [role="contentinfo"], [role="navigation"]';
  const BANNER_SELECTORS = [
    '#CybotCookiebotDialog', '#onetrust-banner-sdk', '#usercentrics-root', '#usercentrics-cmp-ui',
    '.cmplz-cookiebanner', '#BorlabsCookieBox', '#cookie-law-info-bar', '#cookie-notice',
    '[id*="cookie" i]', '[class*="cookie" i]', '[id*="consent" i]', '[class*="consent" i]',
    '[id*="cmp" i]', '[aria-modal="true"]', '[role="dialog"]', '[role="alertdialog"]',
  ];
  const clean = (text, max) => (text ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
  const isVisible = (el) => {
    if (!el || !el.getBoundingClientRect) return false;
    const rect = el.getBoundingClientRect();
    const style = window.getComputedStyle(el);
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  };
  const regionOf = (el) => {
    const region = el.closest(REGION_SELECTOR);
    if (region) {
      const tag = region.tagName.toLowerCase();
      const role = region.getAttribute('role');
      if (tag === 'footer' || role === 'contentinfo') return 'footer';
      if (tag === 'header' || role === 'banner') return 'header';
      return 'nav';
    }
    const named = el.closest('[id*="footer" i], [class*="footer" i]');
    return named ? 'footer' : 'main';
  };
  const labelOf = (el) => clean(el.innerText || el.value || el.getAttribute('aria-label') || el.title, LIMITS.linkText);

  // Elements inside open shadow roots (many consent tools render there).
  const allRoots = () => {
    const roots = [document];
    for (let i = 0; i < roots.length; i += 1) {
      roots[i].querySelectorAll('*').forEach((el) => { if (el.shadowRoot) roots.push(el.shadowRoot); });
    }
    return roots;
  };
  const queryAllDeep = (selector) => allRoots().flatMap((root) => [...root.querySelectorAll(selector)]);

  const links = [...document.querySelectorAll('a[href]')].map((a) => ({
    href: a.href, text: labelOf(a), region: regionOf(a), visible: isVisible(a),
  }));

  const buttons = queryAllDeep('button, input[type="submit"], input[type="button"], [role="button"]')
    .map((el) => ({ text: labelOf(el), visible: isVisible(el), region: el.closest ? regionOf(el) : 'main' }))
    .filter((b) => b.text);

  const forms = [...document.querySelectorAll('form')].map((form) => ({
    action: form.action || '',
    method: (form.getAttribute('method') || 'get').toLowerCase(),
    hasEmail: !!form.querySelector('input[type="email"], input[name*="mail" i]'),
    hasPassword: !!form.querySelector('input[type="password"]'),
    hasTextarea: !!form.querySelector('textarea'),
    hasFile: !!form.querySelector('input[type="file"]'),
    text: clean(form.innerText, 300),
  }));

  const iframes = [...document.querySelectorAll('iframe')].map((f) => ({ src: f.src || '', visible: isVisible(f) }));

  const banner = findBanner();
  function findBanner() {
    for (const selector of BANNER_SELECTORS) {
      const candidates = queryAllDeep(selector).filter(isVisible);
      for (const el of candidates) {
        const text = clean(el.innerText || el.textContent, LIMITS.banner);
        if (!/cookie|einwillig|zustimm|consent|datenschutz|tracking|akzept|accept/i.test(text)) continue;
        el.setAttribute('data-wlc-banner', '1');
        const bannerButtons = [...el.querySelectorAll('button, a, [role="button"], input[type="button"], input[type="submit"]')]
          .filter(isVisible).map(labelOf).filter(Boolean);
        return { selector, text, buttons: bannerButtons };
      }
    }
    return null;
  }

  const prices = collectPrices();
  function collectPrices() {
    const pattern = /(\d{1,3}(?:[.\s]\d{3})*,\d{2}|\d+,-)\s?(€|EUR)|(€|EUR)\s?\d/;
    const found = [];
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    while (walker.nextNode() && found.length < LIMITS.prices) {
      const node = walker.currentNode;
      if (!pattern.test(node.nodeValue)) continue;
      const block = node.parentElement?.closest('li, article, tr, section, div, p') ?? node.parentElement;
      if (!block || !isVisible(node.parentElement)) continue;
      found.push({ text: clean(node.nodeValue, 60), context: clean(block.innerText, 240) });
    }
    return found;
  }

  const footers = [...document.querySelectorAll('footer, [role="contentinfo"]')];
  const meta = (name) => document.querySelector(`meta[name="${name}"]`)?.getAttribute('content') ?? null;

  const htmlClasses = clean(`${document.documentElement.className} ${document.body?.className ?? ''}`, 600);
  const htmlDataAttributes = [...document.documentElement.attributes].map((a) => a.name).filter((n) => n.startsWith('data-'));

  return {
    title: clean(document.title, 200),
    generator: meta('generator'),
    htmlClasses, htmlDataAttributes,
    lang: document.documentElement.getAttribute('lang'),
    viewport: meta('viewport'),
    hasFooterElement: footers.length > 0,
    footerText: clean(footers.map((f) => f.innerText).join(' '), LIMITS.footer),
    bodyText: clean(document.body?.innerText, LIMITS.text),
    links, buttons, forms, iframes, banner, prices,
  };
}
