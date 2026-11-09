import assert from 'node:assert/strict';
import { test } from 'node:test';
import { baseDomain, canonicalPageUrl, isSameSite, isThirdParty, normalizeStartUrl } from '../scripts/lib/url.mjs';
import { classifyPage, selectDeepCheckUrls } from '../scripts/lib/page-types.mjs';
import { parseSitemap, sitemapsFromRobots } from '../scripts/lib/sitemap.mjs';
import { matchService, policyMentions } from '../scripts/lib/third-parties.mjs';
import { PATTERNS } from '../scripts/lib/checks/helpers.mjs';
import { consentRunUrls, matchesChoice } from '../scripts/lib/consent-runs.mjs';
import { checkConsentChoice, consentModeState } from '../scripts/lib/checks/consent-choice.mjs';
import { checkScriptTags, parseScriptTagUrls } from '../scripts/lib/checks/script-tags.mjs';

test('normalizeStartUrl adds https and rejects unsafe input', () => {
  assert.equal(normalizeStartUrl('www.xyz.de').toString(), 'https://www.xyz.de/');
  assert.equal(normalizeStartUrl(' http://xyz.de/a#top ').toString(), 'http://xyz.de/a');
  assert.throws(() => normalizeStartUrl('file:///etc/passwd'), /Only http and https/);
  assert.throws(() => normalizeStartUrl('javascript://alert(1)'), /Only http and https/);
  assert.throws(() => normalizeStartUrl('https://user:pw@xyz.de'), /credentials/);
  assert.throws(() => normalizeStartUrl(''), /No URL/);
});

test('third-party and same-site decisions', () => {
  assert.equal(baseDomain('shop.example.co.uk'), 'example.co.uk');
  assert.equal(isThirdParty('https://cdn.xyz.de/a.js', 'www.xyz.de'), false);
  assert.equal(isThirdParty('https://fonts.googleapis.com/css', 'www.xyz.de'), true);
  assert.equal(isSameSite('https://xyz.de/impressum', new URL('https://www.xyz.de/')), true);
  assert.equal(isSameSite('mailto:info@xyz.de', new URL('https://www.xyz.de/')), false);
  assert.equal(canonicalPageUrl('/a/#x', new URL('https://xyz.de/')), 'https://xyz.de/a');
});

test('classifyPage recognises legal and shop pages', () => {
  assert.equal(classifyPage('https://x.de/impressum'), 'imprint');
  assert.equal(classifyPage('https://x.de/datenschutzerklaerung'), 'privacy');
  assert.equal(classifyPage('https://x.de/widerrufsbelehrung'), 'withdrawal');
  assert.equal(classifyPage('https://x.de/kasse'), 'checkout');
  assert.equal(classifyPage('https://x.de/produkt/tasse'), 'product');
  assert.equal(classifyPage('https://x.de/ueber-uns'), 'other');
});

test('deep check picks at most n pages per missing type', () => {
  const urls = ['https://x.de/kasse', 'https://x.de/blog/a/', 'https://x.de/blog/b/', 'https://x.de/produkt/1', 'https://x.de/produkt/2'];
  const picked = selectDeepCheckUrls(urls, new Set(['product']), new Set(), 1);
  assert.deepEqual(picked.map((p) => p.type), ['checkout', 'blog']);
});

test('sitemap parsing', () => {
  const xml = '<urlset><url><loc>https://x.de/a</loc></url><url><loc><![CDATA[https://x.de/b?x=1&amp;y=2]]></loc></url></urlset>';
  assert.deepEqual(parseSitemap(xml), { isIndex: false, locs: ['https://x.de/a', 'https://x.de/b?x=1&y=2'] });
  assert.equal(parseSitemap('<sitemapindex><sitemap><loc>https://x.de/s.xml</loc></sitemap></sitemapindex>').isIndex, true);
  assert.deepEqual(sitemapsFromRobots('User-agent: *\nSitemap: https://x.de/s.xml\n'), ['https://x.de/s.xml']);
});

test('known services are matched, including path restrictions', () => {
  assert.equal(matchService('https://fonts.gstatic.com/s/roboto.woff2').name, 'Google Fonts');
  assert.equal(matchService('https://www.google.com/recaptcha/api.js').name, 'Google reCAPTCHA');
  assert.equal(matchService('https://www.google.com/search'), null);
  assert.equal(policyMentions(matchService('https://www.googletagmanager.com/gtm.js'), 'Wir nutzen den Google Tag Manager.'), true);
});

test('price and consent wording patterns', () => {
  assert.ok(PATTERNS.vatNote.test('Alle Preise inkl. gesetzl. MwSt.'));
  assert.ok(PATTERNS.vatNote.test('inklusive 19 % Umsatzsteuer'));
  assert.ok(PATTERNS.netNote.test('zzgl. MwSt.'));
  assert.ok(PATTERNS.reject.test('Nur notwendige Cookies'));
  assert.ok(!PATTERNS.accept.test('Cookie-Einstellungen'));
});

test('deep check recognises product pages by link text and shop overviews by path', () => {
  assert.equal(classifyPage('https://x.de/shop/'), 'shop');
  const picked = selectDeepCheckUrls([{ url: 'https://x.de/project/deo', text: 'LOOK & FEEL & ORDER' }], new Set(['shop']), new Set());
  assert.deepEqual(picked, [{ type: 'product', url: 'https://x.de/project/deo' }]);
});

test('order button: only exact accepted labels pass; small-business VAT note counts', async () => {
  const { isCompliantOrderLabel } = await import('../scripts/lib/checks/shop.mjs');
  assert.ok(isCompliantOrderLabel('zahlungspflichtig bestellen'));
  assert.ok(isCompliantOrderLabel(' Jetzt kaufen '));
  assert.ok(!isCompliantOrderLabel('Jetzt kaufen und weiter zur Zahlung'));
  assert.ok(!isCompliantOrderLabel('Bestellung absenden'));
  assert.ok(PATTERNS.vatNote.test('Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.'));
});

test('contact forms with a reply wording are not treated as user content', async () => {
  const { COMMENT_TEXT } = await import('../scripts/lib/checks/site.mjs');
  assert.ok(!COMMENT_TEXT.test('Wir antworten innerhalb von 24 Stunden. Nachricht senden'));
  assert.ok(COMMENT_TEXT.test('Kommentar schreiben'));
});

test('consent buttons: reject wins over accept, settings are not clicked, strict accept outside the banner', () => {
  assert.equal(matchesChoice('Alle ablehnen', 'reject'), true);
  assert.equal(matchesChoice('Nur notwendige akzeptieren', 'reject'), true);
  assert.equal(matchesChoice('Nur notwendige akzeptieren', 'accept'), false);
  assert.equal(matchesChoice('Alle akzeptieren', 'accept'), true);
  assert.equal(matchesChoice('Einstellungen', 'accept'), false);
  assert.equal(matchesChoice('Einwilligen und weiter', 'accept', true), true);
  assert.equal(matchesChoice('OK', 'accept'), true);
  assert.equal(matchesChoice('OK', 'accept', true), false);
  assert.equal(matchesChoice('', 'reject'), false);
});

test('Google Consent Mode state from the gcs parameter', () => {
  assert.equal(consentModeState('https://www.google-analytics.com/g/collect?v=2&gcs=G100'), 'denied');
  assert.equal(consentModeState('https://www.google-analytics.com/g/collect?gcs=G101'), 'granted');
  assert.equal(consentModeState('https://www.google-analytics.com/g/collect?gcs=G111'), 'granted');
  assert.equal(consentModeState('https://www.google-analytics.com/g/collect?v=2'), null);
  assert.equal(consentModeState('not a url'), null);
});

test('reject run: not clickable is a hint only when a dialog is known; granted Consent Mode after reject is a gap', () => {
  const page = { index: 1, url: 'https://x.de/', finalUrl: 'https://x.de/', facts: { banner: null } };
  const scan = (consentRuns) => ({ pages: [page], consentRuns });
  const notClicked = { clicked: false, reason: 'no matching button found' };
  assert.deepEqual(checkConsentChoice(scan({ reject: notClicked, accept: { clicked: false } })), []);
  assert.equal(checkConsentChoice(scan({ reject: notClicked, accept: { clicked: true } }))[0].status, 'hint');
  const ga = (gcs) => ({ url: `https://www.google-analytics.com/g/collect?gcs=${gcs}`, thirdParty: true, service: 'Google Analytics', category: 'analytics' });
  const reject = (requests) => ({ reject: { clicked: true, button: 'Ablehnen', bannerGone: true, visited: ['https://x.de/'], requests, newCookies: [] } });
  const [granted] = checkConsentChoice(scan(reject([ga('G100'), ga('G111')])));
  assert.equal(granted.check, 'TDD-06');
  assert.match(granted.title, /consent granted/);
  assert.equal(checkConsentChoice(scan(reject([ga('G100')])))[0].check, 'TDD-07');
});

test('consent runs prefer content pages over legal pages; legal pages only as a fallback (decision 50a)', () => {
  const page = (url, pageType, extra = {}) => ({ url, finalUrl: url, pageType, ...extra });
  const pages = [page('/', 'home'), page('/impressum', 'imprint'), page('/datenschutz', 'privacy'), page('/kaputt', 'other', { error: 'x' }), page('/angebot', 'other'), page('/blog', 'blog')];
  assert.deepEqual(consentRunUrls(pages), ['/', '/angebot', '/blog', '/impressum', '/datenschutz']);
  assert.deepEqual(consentRunUrls([page('/', 'home'), page('/impressum', 'imprint')]), ['/', '/impressum']);
  assert.deepEqual(consentRunUrls([]), []);
});

test('Shopify script tag URLs: JSON escapes, protocol-relative URLs and the Shopify proxy are resolved', () => {
  const source = 'function asyncLoad() { var urls = ["https:\\/\\/cdn.example-reviews.com\\/w.js?a=1\\u0026shop=x.myshopify.com",'
    + '"//cdn.shopify.com/proxy/0a1b2c/api.example-affiliate.com/loader.js?shop=x.myshopify.com","//beacon.example.com/?shop=x"]; }';
  assert.deepEqual(parseScriptTagUrls(source), [
    'https://cdn.example-reviews.com/w.js?a=1&shop=x.myshopify.com',
    'https://api.example-affiliate.com/loader.js?shop=x.myshopify.com',
    'https://beacon.example.com/?shop=x',
  ]);
  assert.deepEqual(parseScriptTagUrls('var other = 1;'), []);
  assert.deepEqual(parseScriptTagUrls(null), []);
});

test('Shopify script tags: a consent tool is reported separately; wording depends on the scan date (decisions 52a, 54a)', () => {
  const source = 'var urls = ["https://cdn.example-consent.com/cookie-banner.js?shop=x","https://cdn.example-reviews.com/w.js?shop=x"];';
  const scan = (scannedAt, script = source) => ({ scannedAt, pages: [{ url: 'https://x.de/', finalUrl: 'https://x.de/', facts: { asyncLoadScript: script } }] });
  const before = checkScriptTags(scan('2026-11-09T10:00:00.000Z'));
  assert.deepEqual(before.map((f) => [f.check, f.status]), [['TDD-08', 'hint'], ['TDD-08', 'hint']]);
  assert.deepEqual(before[0].evidence.scriptTags, ['https://cdn.example-consent.com/cookie-banner.js?shop=x']);
  assert.equal(before[0].evidence.consentTool, true);
  assert.equal(before[0].evidence.afterCutoff, false);
  assert.deepEqual(before[1].evidence.scriptTags, ['https://cdn.example-reviews.com/w.js?shop=x']);
  assert.equal(checkScriptTags(scan('2027-03-01T08:00:00.000Z'))[0].evidence.afterCutoff, true);
  assert.deepEqual(checkScriptTags(scan('2026-11-09T10:00:00.000Z', null)), []);
});
