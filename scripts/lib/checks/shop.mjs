// Duties for online sales to consumers: prices (PAngV), order button and cancellation
// button (BGB), dispute resolution notice, product safety and environmental claims.

import { finding, looksLikeShop, okPages, shotsOf } from './helpers.mjs';
import { PATTERNS } from './helpers.mjs';

const url = (p) => p.finalUrl ?? p.url;
const ORDER_BUTTON = /bestell|kaufen|buy|order|zahlen|bezahlen|abschlie(ß|ss)en|absenden|submit/i;
// Whole label must match: extra words ("Jetzt kaufen und weiter zur Zahlung") are not accepted.
const COMPLIANT_ORDER_BUTTON = /^(jetzt )?(zahlungspflichtig|kostenpflichtig) bestellen$|^zahlungspflichtigen vertrag abschlie(ß|ss)en$|^(jetzt )?kaufen$/i;

/** True when an order button label is "zahlungspflichtig bestellen" or an accepted equivalent. */
export function isCompliantOrderLabel(label) {
  return COMPLIANT_ORDER_BUTTON.test(String(label).replace(/\s+/g, ' ').trim());
}
const SUBSCRIPTION = /\babo\b|abonnement|mitgliedschaft|monatlich kündbar|mindestlaufzeit|\/\s?monat|pro monat|im monat/i;
const CANCEL_BUTTON = /verträge hier kündigen|vertrag hier kündigen|kündigungsbutton/i;
const WITHDRAW_FUNCTION = /vertrag widerrufen|widerruf hier|widerruf erklären/i;
const ODR_LINK = /ec\.europa\.eu\/consumers\/odr/i;
const DISPUTE_NOTICE = /streitbeilegung|schlichtungsstelle|verbraucherschlichtung/i;
const GREEN_CLAIM = /klimaneutral|co2-?neutral|co₂-?neutral|klimapositiv|umweltfreundlich|nachhaltig(er|e|es)?\b|ökologisch|grün(er|e)? (produkt|energie)/i;

function pricesWithoutVat(pages) {
  return pages.filter((p) => p.facts.prices.length > 0)
    .filter((p) => !PATTERNS.vatNote.test(p.facts.bodyText) && !PATTERNS.netNote.test(p.facts.bodyText));
}

function priceChecks(pages) {
  const results = [];
  const noVat = pricesWithoutVat(pages);
  if (noVat.length > 0) {
    results.push(finding('PRC-01', 'gap', 'Prices shown without a VAT note (inkl. MwSt.)', noVat.map(url), {
      priceExamples: noVat.slice(0, 3).map((p) => p.facts.prices[0]), screenshots: noVat.slice(0, 2).flatMap(shotsOf),
    }));
  }
  const netOnly = pages.filter((p) => p.facts.prices.length > 0 && PATTERNS.netNote.test(p.facts.bodyText) && !PATTERNS.vatNote.test(p.facts.bodyText));
  if (netOnly.length > 0) {
    results.push(finding('PRC-01', 'hint', 'Only net prices (zzgl. MwSt.) – allowed only if the site addresses businesses exclusively', netOnly.map(url)));
  }
  const noShipping = pages.filter((p) => p.facts.prices.length > 0 && !PATTERNS.shippingNote.test(p.facts.bodyText));
  if (noShipping.length > 0) {
    results.push(finding('PRC-02', 'hint', 'Prices without a note on shipping costs', noShipping.map(url)));
  }
  return results;
}

function orderButton(pages) {
  const checkout = pages.filter((p) => p.pageType === 'checkout');
  if (checkout.length === 0) {
    return [finding('BTN-01', 'hint', 'Final order button not reachable without account or payment; check manually', [])];
  }
  const buttons = checkout.flatMap((p) => p.facts.buttons.filter((b) => b.visible && ORDER_BUTTON.test(b.text)).map((b) => ({ page: url(p), text: b.text })));
  const bad = buttons.filter((b) => !isCompliantOrderLabel(b.text));
  if (bad.length === 0) return [];
  return [finding('BTN-01', 'gap', 'Order button label is not "zahlungspflichtig bestellen" or equally clear', [...new Set(bad.map((b) => b.page))], { buttons: bad })];
}

function textChecks(pages) {
  const all = pages.map((p) => p.facts.bodyText).join('\n');
  const links = pages.flatMap((p) => p.facts.links);
  const results = [];
  if (SUBSCRIPTION.test(all) && !CANCEL_BUTTON.test(all)) {
    results.push(finding('KUE-01', 'hint', 'Subscription wording found, but no "Verträge hier kündigen" button', []));
  }
  if (!WITHDRAW_FUNCTION.test(all)) {
    results.push(finding('WID-02', 'hint', 'No online withdrawal function labelled "Vertrag widerrufen" found (§ 356a BGB since 19.06.2026)', []));
  }
  const odr = links.filter((l) => ODR_LINK.test(l.href));
  if (odr.length > 0) results.push(finding('ODR-01', 'gap', 'Outdated link to the EU online dispute resolution platform', [], { links: odr.slice(0, 3).map((l) => l.href) }));
  if (!DISPUTE_NOTICE.test(all)) results.push(finding('VSB-01', 'hint', 'No statement on consumer dispute resolution found (VSBG)', []));
  return results;
}

function productChecks(pages) {
  const products = pages.filter((p) => p.pageType === 'product');
  const noMaker = products.filter((p) => !/hersteller|manufacturer|marke|brand/i.test(p.facts.bodyText));
  return noMaker.length > 0 ? [finding('GPSR-01', 'hint', 'Product pages without manufacturer information (GPSR Art. 19)', noMaker.map(url))] : [];
}

function greenClaims(pages) {
  const hits = pages.filter((p) => GREEN_CLAIM.test(p.facts.bodyText))
    .map((p) => ({ page: url(p), claim: p.facts.bodyText.match(GREEN_CLAIM)[0] }));
  return hits.length > 0 ? [finding('UWG-02', 'hint', 'Environmental claims found; they need specific proof', hits.map((h) => h.page), { claims: hits.slice(0, 5) })] : [];
}

export function checkShop(scan) {
  const pages = okPages(scan);
  const results = [...greenClaims(pages)];
  if (!looksLikeShop(scan)) return results;
  return [...priceChecks(pages), ...orderButton(pages), ...textChecks(pages), ...productChecks(pages), ...results];
}
