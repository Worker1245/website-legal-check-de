# Checklist

Checklist status: 2026-11-07

Maintenance: refresh monthly following references/update.md; change entries only together with `references/sources.md`.

All legal content comes from research fetched on 2026-11-07; source IDs (SRC-xx) are in `references/sources.md`. Points marked **UNVERIFIED** were not confirmed in a fetched official source and must not be presented as fact. Report text (quoted German) is generic; Claude fills `[…]` from scan evidence.

## Priority rules

| Prio | Meaning | Condition |
|---|---|---|
| 1 | Sofort beheben | Clear duty for this site (supported by site evidence, not only by a default assumption), evidence unambiguous after Claude's verification, high risk (consent/tracking, imprint, privacy policy link, HTTPS, prices, withdrawal, order button, cancellation button). |
| 2 | Zeitnah beheben | Gap whose duty depends on a scope assumption without clear site evidence, or medium risk. |
| 3 | Empfehlung / Bitte prüfen | Recommendations, `kind: check` ("Bitte prüfen"), scanner hints that Claude could neither confirm nor rule out. |

General moves:
- A finding resting on a default assumption (see "Scope assumptions") is at most Prio 2. If the site evidence makes the scope clear (e.g. "inkl. MwSt." prices plus cart), the assumption is not needed and the default priority applies.
- A scanner `hint` that Claude confirms with evidence becomes `kind: gap` and takes the check's gap priority; one Claude cannot confirm stays `kind: check`, Prio 3.
- A scanner `gap` that Claude cannot confirm is downgraded to `kind: check`, Prio 3; a false positive is dropped with a one-line reason in the appendix.

⚠ marker (`abmahnung: true`): a fixed property of the duty, taken from research D (evaluation commissioned by the BMJ, court and association cases; SRC-85). Set it only where the entry below says "yes". The report note is always „⚠ häufiger Abmahngrund – Erfahrungswert, keine Bewertung des Einzelfalls“. Background for the long report: since 2020, competitors get no reimbursement of warning costs for information and labelling duties in e-commerce and, for businesses with usually fewer than 250 staff, for GDPR breaches (§ 13 Abs. 4 UWG, SRC-77); the injunction claim stays, and associations and chambers are not covered by that exclusion, so the typical sender is an association (§ 8 Abs. 3 UWG, SRC-75; § 2 UKlaG, SRC-79). The frequency data date from 2021/2022.

## Scope assumptions

The skill never asks the user scope questions. Claude decides from site evidence; without clear evidence it assumes the case in which the duty applies. Every assumption goes into „Annahmen zum Geltungsbereich“ (question, assumption, evidence, consequence) and as one line into the short report; dependent findings say „unter der Annahme, dass …“.

| ID | Question | Evidence for "duty applies" | Evidence against | Default | Affects |
|---|---|---|---|---|---|
| A-1 | Verkauf an Verbraucher (B2C)? | prices „inkl. MwSt.“, consumer products, wording „Verbraucher“/„Privatkunden“, Widerrufsbelehrung, consumer payment methods, cart open to anyone | explicit statement „nur für Unternehmer/Gewerbetreibende“ plus net prices and a safeguard (e.g. mandatory company/VAT ID in sign-up); whether a B2B restriction is effective is a legal question (UNVERIFIED as to adequacy) | B2C | WID-*, AGB-01, BTN-01, KUE-01, PRC-*, ODR-01, VSB-01, GPSR-01, UWG-02, BF-*, MAN-05…MAN-10 |
| A-2 | Geschäftsmäßiger digitaler Dienst? | company name, legal form, products/services, advertising, ad-financed blog | clearly private/family site without any commercial element (interpretation of „geschäftsmäßig“ is case law, UNVERIFIED) | commercial | IMP-*, SEC-01 (§ 19 Abs. 4 TDDDG) |
| A-3 | Vertragsschluss online (shop, booking, subscription)? | cart, checkout, order/booking buttons, prices with "add to cart" | only enquiry/contact forms | online contract if shop signals exist | WID-02, BTN-01, KUE-01, BF-01, BF-02 |
| A-4 | Kleinstunternehmen (BFSG services: < 10 employees and turnover or balance sheet ≤ 2 Mio €)? Also ≤ 10 employees (§ 36 Abs. 3 VSBG)? | team page with many people, several managing directors, register entry of a larger company, several locations, job ads | team page with very few people, sole trader | not a micro-enterprise; no employee exemption | BF-01, BF-02, VSB-01 |
| A-5 | Hosting-Dienst nach DSA (stores user content at the user's request)? | public comments, reviews written by users, forum, public uploads, user profiles, marketplace sellers | only contact form or non-public application upload (classification of small comment sections UNVERIFIED) | hosting if a public UGC feature exists | DSA-01, MAN-13…MAN-15 |
| A-6 | Dauerschuldverhältnis online abschließbar? | „Abo“, „Mitgliedschaft“, „/Monat“, minimum term, online sign-up | instalment financing only, subscription only offline | subscription if signals and online sign-up | KUE-01 |
| A-7 | KI-Chat statt menschlicher Live-Chat? | „KI-Assistent“, „Chatbot“, bot vendor, automated answers | vendor/wording clearly human live chat | AI | AI-01 |
| A-8 | Journalistisch-redaktionelle Inhalte? | blog, news, magazine, articles with author and date | product pages only | editorial if such a section exists | MAN-12 |
| A-9 | Öffentliche Stelle? | `.bund.de` or Land/municipal domain, „Körperschaft des öffentlichen Rechts“ | private legal form | not public | MAN-16 |

## Automatic checks

Scope of the scanner for all checks: "scanned pages" are the pages that loaded without error and were not skipped. The scan never consents, so every request, cookie and storage entry is "before consent". Link checks match link text or the decoded URL path and query. "Shop signals" (`looksLikeShop`): a page classified as cart, checkout, product or shop, or a button „in den Warenkorb / add to cart / jetzt kaufen / buy now“, or prices on at least two pages. Checks marked "shop only" run only with shop signals.

### IMP-01 – Impressum link on every page
- **Obligation:** Provider information easily recognisable, directly reachable, permanently available.
- **Legal basis:** § 5 Abs. 1 DDG.
- **Applies to:** Providers of commercial digital services, in practice nearly all business websites incl. ad-financed blogs. Depends on A-2.
- **Scanner observation:** Per scanned page, a link matching `impressum|imprint|anbieterkennzeichnung|legal notice`. `gap` if missing on any page (title: none at all, or n of m pages), with up to 3 screenshots and 400 characters of footer text; `ok` otherwise.
- **How Claude verifies:** Open the `-fusszeile` screenshots of the listed pages. False positives: icon-only link whose URL has no matching word (e.g. `/legal`), link inside a „Rechtliches“ menu, error or redirect pages in the sample. A link reachable only via an intermediate page is „Bitte prüfen“ (≤ 2 clicks is a convention, not a legal value). Check that the consent dialog does not cover the link (DSK OH Rz. 121).
- **Default priority:** 1. Move to 2 if missing only on isolated special pages (e.g. a landing page outside the main navigation).
- **Common reason for a warning letter:** yes.
- **Report:** Was fehlt: „Auf [n] von [m] geprüften Seiten fehlt ein Link zum Impressum.“ / „Auf keiner geprüften Seite wurde ein Link zum Impressum gefunden.“ Vorschrift: „§ 5 Abs. 1 DDG“.
- **Fix steps:** Add a text link „Impressum“ to the footer of every page (incl. checkout and landing pages); keep it outside the consent dialog's overlay.
- **Help:** draft `impressum.md`; mock-up `IMP-01 / DSE-01 / WID-01 / BF-02` (footer); sources SRC-16, SRC-05.
- **Confidence:** detection high; legal basis verified, scope interpretation UNVERIFIED.

### IMP-02 – Impressum content: e-mail and postal address
- **Obligation:** Name and address of establishment, data for fast electronic contact including an e-mail address, plus (where applicable) legal form, representative, register and number, supervisory authority, regulated-profession data.
- **Legal basis:** § 5 Abs. 1 Nr. 1–8 DDG.
- **Applies to:** As IMP-01 (A-2).
- **Scanner observation:** On the first page classified as imprint: `gap` if the text contains no e-mail pattern, „[at]“, „(at)“ or „@“; `hint` if no postcode + town is recognised (5-digit German, `A-dddd` or 4-digit plus capitalised word). No imprint page → no IMP-02 finding.
- **How Claude verifies:** Read the imprint screenshot. False positives: e-mail shown as image or inserted by script, foreign address formats, imprint split over several pages. Also note visible gaps the scanner does not test: legal form without representative, GmbH/UG without register entry, P.O.-box-only address, contact form instead of e-mail, outdated reference „§ 5 TMG“ (Prio 3, cosmetic).
- **Default priority:** 1 for missing e-mail or address; 3 for an outdated „§ 5 TMG“ reference.
- **Common reason for a warning letter:** yes.
- **Report:** Was fehlt: „Im Impressum fehlt eine E-Mail-Adresse.“ / „Im Impressum wurde keine vollständige Postanschrift erkannt.“ Vorschrift: „§ 5 Abs. 1 Nr. [1|2] DDG“.
- **Fix steps:** Give the e-mail address as text; add street, postcode and town of the establishment; complete legal form, representative and register data.
- **Help:** draft `impressum.md`; no mock-up; sources SRC-16.
- **Confidence:** detection medium (any „@“ counts); legal basis verified.

### IMP-03 – Impressum: VAT ID
- **Obligation:** State the USt-IdNr. or Wirtschafts-IdNr. if one is held.
- **Legal basis:** § 5 Abs. 1 Nr. 6 DDG.
- **Applies to:** As IMP-01, only if a VAT ID exists (not observable).
- **Scanner observation:** `hint` if the imprint text has no `umsatzsteuer|ust-id|ust-idnr|vat`.
- **How Claude verifies:** Check the imprint screenshot; small businesses may have no VAT ID. Never assume one exists.
- **Default priority:** 3 („Bitte prüfen“).
- **Common reason for a warning letter:** yes (as part of the Impressum duty).
- **Report:** Was fehlt: „Im Impressum ist keine USt-IdNr. angegeben – nur nötig, wenn eine vergeben wurde.“ Vorschrift: „§ 5 Abs. 1 Nr. 6 DDG“.
- **Fix steps:** If a VAT ID or Wirtschafts-IdNr. exists, add it to the imprint.
- **Help:** draft `impressum.md`; sources SRC-16.
- **Confidence:** detection high; applicability unknown by design.

### DSE-01 – Privacy policy link on every page
- **Obligation:** Provide the Art. 13 GDPR information when data is collected, in an easily accessible form; server logs with IP addresses alone are personal data processing (DSK OH Rz. 138).
- **Legal basis:** Art. 12, 13 DSGVO; § 25 Abs. 1 S. 2 TDDDG for cookie processes (DSK OH Rz. 139–140).
- **Applies to:** Every website processing personal data; no size exemption.
- **Scanner observation:** As IMP-01 with pattern `datenschutz|privacy`.
- **How Claude verifies:** As IMP-01. A combined page „Impressum & Datenschutz“ counts if the link text names both.
- **Default priority:** 1.
- **Common reason for a warning letter:** uncertain (consumer associations may sue, BGH 2025; DSGVO rarely named in the evaluation).
- **Report:** Was fehlt: „Auf [n] von [m] geprüften Seiten fehlt ein Link zur Datenschutzerklärung.“ Vorschrift: „Art. 13 DSGVO“.
- **Fix steps:** Footer link „Datenschutz“ on every page; reachable while the consent dialog is open.
- **Help:** draft `datenschutz-bausteine.md`; mock-up `IMP-01 / DSE-01 / WID-01 / BF-02`; sources SRC-04, SRC-05, SRC-81.
- **Confidence:** detection high; legal basis verified.

### DSE-02 – Third-party services not named in the privacy policy
- **Obligation:** Name recipients, purposes, legal bases, third-country transfers and safeguards, storage period for each processing.
- **Legal basis:** Art. 13 Abs. 1 lit. c, e, f DSGVO.
- **Applies to:** Sites embedding third-party services.
- **Scanner observation:** Privacy page = first page classified as privacy, else a page whose URL or title matches `datenschutz|privacy`. Every third-party request matched to a service in `data/third-parties.json` (consent tools excluded) whose keywords do not appear in the policy text → one `hint` listing the services. No policy page → no finding.
- **How Claude verifies:** Search the policy text in `scan.json` for the provider under other names (parent company, product name); policies split into sub-pages or PDFs; policy on another host not scanned.
- **Default priority:** 2. Move to 1 if tracking or advertising services are loaded and the policy names no third party at all.
- **Common reason for a warning letter:** uncertain.
- **Report:** Was fehlt: „Die Datenschutzerklärung nennt [Dienste] nicht, obwohl sie beim Seitenaufruf geladen werden.“ Vorschrift: „Art. 13 Abs. 1 DSGVO“.
- **Fix steps:** Add one paragraph per service (provider, purpose, legal basis, data, recipient, third country plus safeguard, storage period, withdrawal/objection).
- **Help:** draft `datenschutz-bausteine.md`; no mock-up; sources SRC-04, SRC-05.
- **Confidence:** detection medium (keyword match); legal basis verified.

### TDD-01 – Tracking and third-party content loaded before consent
- **Obligation:** No storing on or reading from the device without consent unless strictly necessary; no loading of consent-requiring third-party content while the banner is unanswered. Pixels, tracking URLs and identifiers are covered, not only cookies.
- **Legal basis:** § 25 Abs. 1 TDDDG; Art. 6 Abs. 1 DSGVO for the IP transfer; joint controllership for embeds (Art. 26 DSGVO, CJEU C-40/17).
- **Applies to:** All websites; no size exemption.
- **Scanner observation:** One `gap` per known service of category analytics, ads, tagmanager, social, video, maps, chat or captcha contacted before consent, with pages and up to 3 request URLs.
- **How Claude verifies:** Read the request URLs. Typical false positives: request caused by the consent tool itself, a click-to-load placeholder whose preview is self-hosted (then no request appears). CAPTCHA and chat may be argued as needed for a requested function; the DSK says storage may begin only when the function is used (Rz. 95) → for captcha/chat keep the gap but at Prio 2.
- **Default priority:** 1 (analytics, ads, tag manager, social, video, maps); 2 (captcha, chat).
- **Common reason for a warning letter:** uncertain.
- **Report:** Was fehlt: „[Dienst] wird geladen, bevor eine Einwilligung erteilt wurde.“ Vorschrift: „§ 25 Abs. 1 TDDDG“.
- **Fix steps:** Configure the consent tool so tags fire only after opt-in; remove hard-coded snippets; load the tag manager only after consent; two-click placeholders for video, maps, social embeds.
- **Help:** draft `datenschutz-bausteine.md`; mock-up `TDD-04` if the dialog also needs a fix; sources SRC-01, SRC-05, SRC-06, SRC-09.
- **Confidence:** detection high for listed hosts; legal basis verified.

### TDD-02 – Fonts and CDN files from third-party servers
- **Obligation:** Do not transmit the visitor's IP address to font or CDN providers without a legal basis; legitimate interest does not apply where self-hosting is possible.
- **Legal basis:** Art. 6 Abs. 1 DSGVO; LG München I, 3 O 17493/20 (Google Fonts; one regional court ruling).
- **Applies to:** All websites. Other font providers only by analogy (UNVERIFIED); CDNs lower severity.
- **Scanner observation:** `gap` per font service (e.g. Google Fonts, Adobe Fonts, Font Awesome CDN); `hint` per CDN service (jsDelivr, cdnjs …), each with up to 3 request URLs.
- **How Claude verifies:** Check host names in the requests; self-hosted copies on the own domain do not appear.
- **Default priority:** 1 for Google Fonts; 2 for other font services; 3 for CDNs.
- **Common reason for a warning letter:** yes for the Google Fonts sub-item only, with the caveat „Massenschreiben 2022 überwiegend rechtsmissbräuchlich“ (letters were mostly private-person GDPR claims, not UWG warnings; LG München I 4 O 13063/22 held the sender's claims abusive). Other fonts and CDNs: uncertain.
- **Report:** Was fehlt: „[Google Fonts] wird von Servern des Anbieters geladen; dabei wird die IP-Adresse übertragen.“ Vorschrift: „Art. 6 Abs. 1 DSGVO“.
- **Fix steps:** Download the font files (woff2), host them on the own domain, replace the CSS, remove `preconnect` to the provider; self-host libraries.
- **Help:** draft `datenschutz-bausteine.md`; no mock-up; sources SRC-11, SRC-04, SRC-05, SRC-83, SRC-84.
- **Confidence:** detection high; legal basis verified for Google Fonts, analogy UNVERIFIED.

### TDD-03 – Cookies and storage written before consent
- **Obligation:** Storage on the device before consent only if strictly necessary for a service the user explicitly requested; mislabelling as „essential“ does not make it exempt; same rule with or without personal data.
- **Legal basis:** § 25 Abs. 1, 2 TDDDG; CJEU C-673/17.
- **Applies to:** All websites.
- **Scanner observation:** `gap` for third-party cookies or names matching known tracker patterns (`_ga`, `_gid`, `_fbp`, `_hj`, `_clck`, `_uetsid`, `IDE`, `NID` …) with name, domain, expiry; `hint` for other first-party cookies; `hint` for localStorage keys (up to 40).
- **How Claude verifies:** Classify each name. Typical false positives: consent cookie of the consent tool (necessary if it holds no unique ID, DSK OH Rz. 84), session, load-balancer and cart cookies, consent-tool cookies on its own domain flagged as third party. Promote a first-party or localStorage entry to `gap` if it clearly holds an analytics or advertising ID.
- **Default priority:** 1 for tracker cookies; 3 for first-party cookies and localStorage hints.
- **Common reason for a warning letter:** uncertain.
- **Report:** Was fehlt: „Vor der Einwilligung werden die Cookies [Namen] gesetzt.“ Vorschrift: „§ 25 Abs. 1 TDDDG“.
- **Fix steps:** Set non-necessary cookies only after opt-in; store the consent state without a unique ID; shorten lifetimes; document a cookie table.
- **Help:** draft `datenschutz-bausteine.md` (cookie table); sources SRC-01, SRC-05, SRC-07, SRC-08.
- **Confidence:** detection high for listed names; necessity needs Claude's judgment.

### TDD-04 – Consent dialog: reject option on the first layer
- **Obligation:** Where the banner must be dealt with, reject must be offered on the first layer and be equivalent to accept (size, colour, contrast, level); no pre-ticked boxes; Impressum and privacy policy stay reachable.
- **Legal basis:** § 25 Abs. 1 TDDDG with Art. 4 Nr. 11, Art. 7 DSGVO.
- **Applies to:** Sites using consent or needing it.
- **Scanner observation:** First page with a detected banner: `gap` if an accept label (`akzeptieren`, `zustimmen`, `OK`, `verstanden` …) is found but no reject label (`ablehnen`, `nur notwendige`, `verweigern` …); `ok` otherwise (also when neither is recognised). No banner on any page while a TDD tracker or cookie `gap` exists → `gap` „no consent dialog“. Evidence: button labels, 300 characters of banner text, `-cookieabfrage` screenshot.
- **How Claude verifies:** Always open the `-cookieabfrage` / `-ansicht` screenshots. The scanner does not measure equivalence: reject as a text link while accept is a button, smaller or low-contrast reject, „Einstellungen oder Ablehnen“ leading to a second layer → `gap`. Banners in shadow DOM may be missed: if the screenshot shows a banner, replace „no consent dialog“ by the actual defect. An `ok` with unrecognised labels must be checked visually.
- **Default priority:** 1.
- **Common reason for a warning letter:** uncertain (consumer associations: BGH I ZR 7/16, OLG Köln 6 U 80/23).
- **Report:** Was fehlt: „Die Cookie-Abfrage bietet auf der ersten Ebene keine gleichwertige Möglichkeit zum Ablehnen.“ / „Es werden Dienste geladen, aber es erscheint keine Cookie-Abfrage.“ Vorschrift: „§ 25 Abs. 1 TDDDG; Art. 7 DSGVO“.
- **Fix steps:** Add „Alle ablehnen“ next to „Alle akzeptieren“ with identical styling; keep „Einstellungen“ as a third control; all optional categories off by default; footer link „Cookie-Einstellungen“ for withdrawal (Art. 7 Abs. 3 DSGVO).
- **Help:** draft `datenschutz-bausteine.md`; mock-up `TDD-04`; sources SRC-01, SRC-05, SRC-07, SRC-10, SRC-82.
- **Confidence:** label detection medium; equivalence only by visual check; legal basis verified.

### TDD-05 – Other third-party hosts contacted before consent
- **Obligation:** As TDD-01 for hosts of unknown purpose.
- **Legal basis:** § 25 Abs. 1 TDDDG; Art. 6 Abs. 1 DSGVO.
- **Applies to:** All websites.
- **Scanner observation:** One `hint` listing up to 30 third-party host names not in `data/third-parties.json`.
- **How Claude verifies:** Classify by host name. Typical false positives: own CDN or asset domains of the same operator, the consent tool. Payment-provider scripts on checkout: necessity UNVERIFIED → keep as „Bitte prüfen“. A host that is clearly a tracker becomes a TDD-01 finding.
- **Default priority:** 3; reclassified trackers take TDD-01 priority.
- **Common reason for a warning letter:** uncertain.
- **Report:** Was fehlt: „Vor der Einwilligung werden Verbindungen zu [Hosts] aufgebaut; Zweck unbekannt.“ Vorschrift: „§ 25 Abs. 1 TDDDG“.
- **Fix steps:** Identify each host; self-host or load after consent; name remaining services in the privacy policy.
- **Help:** draft `datenschutz-bausteine.md`; sources SRC-01, SRC-06.
- **Confidence:** detection high; purpose unknown by design.

### SEC-01 – HTTPS and redirect
- **Obligation:** State-of-the-art technical measures, with recognised encryption named as an example; appropriate security of processing.
- **Legal basis:** § 19 Abs. 4 TDDDG; Art. 32 Abs. 1 lit. a, Art. 25 DSGVO.
- **Applies to:** § 19 Abs. 4 for commercially offered digital services (A-2); Art. 32 for every controller.
- **Scanner observation:** `gap` if the start page ends on `http:` or http:// does not redirect to https://.
- **How Claude verifies:** Read `transport` in `scan.json`; a timeout on port 80 is not proof of a missing redirect → „Bitte prüfen“.
- **Default priority:** 1.
- **Common reason for a warning letter:** no.
- **Report:** Was fehlt: „Die Website ist ohne Verschlüsselung erreichbar bzw. leitet nicht auf https:// um.“ Vorschrift: „§ 19 Abs. 4 TDDDG; Art. 32 DSGVO“.
- **Fix steps:** Install a certificate, 301 redirect from http to https, add HSTS (best practice).
- **Help:** no draft, no mock-up; sources SRC-02, SRC-04.
- **Confidence:** detection high; legal basis verified, TLS version thresholds UNVERIFIED.

### SEC-02 – Mixed content
- **Obligation / basis / applies to:** As SEC-01.
- **Scanner observation:** `gap` if pages loaded over https request resources over `http:` (up to 5 URLs).
- **How Claude verifies:** Check the URLs; requests the browser upgraded or that redirect to https are false positives.
- **Default priority:** 2.
- **Common reason for a warning letter:** no.
- **Report:** Was fehlt: „Verschlüsselte Seiten laden Dateien unverschlüsselt über http nach.“ Vorschrift: „Art. 32 DSGVO“.
- **Fix steps:** Change resource URLs to https or relative paths.
- **Help:** sources SRC-02, SRC-04.
- **Confidence:** detection high.

### SEC-03 – Form sends data over http
- **Obligation / basis / applies to:** As SEC-01.
- **Scanner observation:** `gap` for pages with a form whose `action` starts with `http:`.
- **How Claude verifies:** Look at the form (contact, login, newsletter); a redirect does not cure the unencrypted first transmission.
- **Default priority:** 1.
- **Common reason for a warning letter:** no.
- **Report:** Was fehlt: „Das Formular auf [Seite] überträgt Eingaben unverschlüsselt.“ Vorschrift: „Art. 32 DSGVO; § 19 Abs. 4 TDDDG“.
- **Fix steps:** Set the form `action` to an https URL.
- **Help:** sources SRC-02, SRC-04.
- **Confidence:** detection high.

### WID-01 – Withdrawal information (Widerrufsbelehrung) – shop only
- **Obligation:** Inform about conditions, period (14 days) and procedure of the withdrawal right, the model withdrawal form, return costs; or about exceptions. The period does not start before correct information and expires at the latest 12 months + 14 days.
- **Legal basis:** § 312g, § 355, § 356, § 357 BGB; Art. 246a § 1 Abs. 2, 3 EGBGB; Anlage 1 and 2.
- **Applies to:** B2C distance contracts (A-1, A-3); exceptions § 312g Abs. 2 (custom-made goods, perishables, sealed hygiene goods …).
- **Scanner observation:** With shop signals: `gap` if no page links to `widerruf` and no page is classified as withdrawal.
- **How Claude verifies:** Search the AGB text for a withdrawal section; check the label („Rückgaberecht“ instead of Widerruf is itself a finding). If the page exists, note visible defects: missing model form, unfilled placeholders, missing sentence on the online withdrawal function (Anlage 1 design note).
- **Default priority:** 1 with clear B2C evidence; 2 if B2C is only assumed.
- **Common reason for a warning letter:** yes.
- **Report:** Was fehlt: „Es wurde keine Widerrufsbelehrung gefunden, obwohl online an Verbraucher verkauft wird.“ Vorschrift: „§ 312g, § 355 BGB; Art. 246a § 1 Abs. 2 EGBGB“.
- **Fix steps:** Publish the Muster-Widerrufsbelehrung (Anlage 1) with the right variant blocks and trader data, append the Muster-Widerrufsformular (Anlage 2), add the online-function sentence, link it in footer and checkout.
- **Help:** draft `widerruf.md`; mock-up `IMP-01 / DSE-01 / WID-01 / BF-02`; sources SRC-19, SRC-21, SRC-22, SRC-23, SRC-24, SRC-26, SRC-27, SRC-90.
- **Confidence:** detection medium (link-based); legal basis verified.

### WID-02 – Online withdrawal function („Vertrag widerrufen“) – shop only
- **Obligation:** For distance contracts concluded via an online interface: a legible, permanently available, prominent function labelled „Vertrag widerrufen“ (or equally unambiguous), asking for name, contract identification and an electronic address, then a confirmation function „Widerruf bestätigen“; acknowledgment on a durable medium with content, date and time. In force since 19.06.2026.
- **Legal basis:** § 356a BGB (BGBl. 2026 I Nr. 28); Art. 11a Directive 2011/83/EU as inserted by Directive (EU) 2023/2673; information duty Art. 246a § 1 Abs. 2 S. 1 Nr. 1 EGBGB.
- **Applies to:** B2C distance contracts concluded online where a withdrawal right exists (A-1, A-3); no financial-services exclusion in the text.
- **Scanner observation:** With shop signals: `hint` if no page text contains `vertrag widerrufen`, `widerruf hier` or `widerruf erklären`.
- **How Claude verifies:** Search links in `scan.json` for variants the pattern misses („Vertrag hier widerrufen“, „Bestellung widerrufen“). Only after login: placement may be acceptable (UNVERIFIED) → „Bitte prüfen“. A returns portal („Retoure anmelden“) is likely not a withdrawal declaration (UNVERIFIED). No withdrawal right at all (all goods excepted) → drop.
- **Default priority:** 1 with clear evidence of online contracts with consumers; 2 if assumed.
- **Common reason for a warning letter:** uncertain (new duty, no data).
- **Report:** Was fehlt: „Es wurde keine Online-Widerrufsfunktion „Vertrag widerrufen“ gefunden.“ Vorschrift: „§ 356a BGB“.
- **Fix steps:** Permanent link „Vertrag widerrufen“ (footer/account) → page with name, order number, e-mail → button „Widerruf bestätigen“ → immediate acknowledgment with content, date, time; add the sentence to the Widerrufsbelehrung.
- **Help:** draft `widerrufsfunktion.md`; mock-up `WID-02`; sources SRC-25, SRC-28, SRC-29, SRC-19, SRC-26.
- **Confidence:** detection low–medium (text match); legal basis verified.

### AGB-01 – Terms (AGB) linked – shop only
- **Obligation:** Let the customer retrieve and store the contract terms including AGB at contract conclusion in reproducible form.
- **Legal basis:** § 312i Abs. 1 S. 1 Nr. 4 BGB.
- **Applies to:** Electronic commerce, B2C and B2B, where AGB are used (not observable).
- **Scanner observation:** With shop signals: `hint` if no page links to `agb|geschäftsbedingungen|terms`.
- **How Claude verifies:** Look for other labels („Nutzungsbedingungen“, „Vertragsbedingungen“, „Liefer- und Zahlungsbedingungen“). AGB only in a modal without URL, as image or not printable → finding.
- **Default priority:** 3; 2 if the checkout refers to AGB that are not retrievable.
- **Common reason for a warning letter:** yes.
- **Report:** Was fehlt: „Es wurden keine abrufbaren AGB gefunden.“ Vorschrift: „§ 312i Abs. 1 S. 1 Nr. 4 BGB“.
- **Fix steps:** Own AGB page with stable URL linked in footer and on the final order page; offer a PDF; the skill does not draft AGB.
- **Help:** no draft; mock-up `IMP-01 / DSE-01 / WID-01 / BF-02`; sources SRC-30.
- **Confidence:** detection medium; Art. 246c EGBGB content UNVERIFIED.

### BTN-01 – Order button („zahlungspflichtig bestellen“) – shop only
- **Obligation:** The button must be easily legible and labelled with nothing but „zahlungspflichtig bestellen“ or an equally unambiguous wording; otherwise no contract comes into existence.
- **Legal basis:** § 312j Abs. 3, 4 BGB.
- **Applies to:** B2C contracts obliging payment (A-1, A-3); not individual communication, not financial services.
- **Scanner observation:** No page classified as checkout → `hint` „not reachable, check manually“. Otherwise visible checkout buttons matching `bestell|kaufen|buy|order|zahlen|abschließen|absenden|submit` whose label does not match the accepted set (whole label exactly `zahlungspflichtig bestellen`, `kostenpflichtig bestellen`, `zahlungspflichtigen Vertrag abschließen`, `kaufen` or `jetzt kaufen`) → `gap` with labels; all accepted → no finding.
- **How Claude verifies:** Confirm the button is the final one; „Weiter zur Bestellübersicht“ or „Bestellung prüfen“ on an intermediate step are false positives. Labels with extra text such as „Jetzt kaufen und weiter zur Zahlung“ are reported as gap (such a label was enjoined: LG Hildesheim 11 O 5/25, date UNVERIFIED); check the exact label. Equivalence of alternatives beyond the statutory wording is case law (UNVERIFIED).
- **Default priority:** 1 for a confirmed gap; 3 for the unreachable hint (manual check, see MAN-08).
- **Common reason for a warning letter:** yes.
- **Report:** Was fehlt: „Der Bestellbutton ist mit „[Text]“ beschriftet statt eindeutig mit „zahlungspflichtig bestellen“.“ Vorschrift: „§ 312j Abs. 3 BGB“.
- **Fix steps:** Label exactly „zahlungspflichtig bestellen“, no further text in the button; legible size and contrast.
- **Help:** draft `bestellseite.md`; mock-up `BTN-01`; sources SRC-31, SRC-90.
- **Confidence:** detection medium; legal basis verified.

### KUE-01 – Cancellation button („Verträge hier kündigen“) – shop only
- **Obligation:** For continuing paid contracts concluded via a website: a permanently available, directly accessible button „Verträge hier kündigen“ leading to a confirmation page (type of termination, identification, contract, date, e-mail) with button „jetzt kündigen“; confirmation in text form. The confirmation page may not contain alternatives to cancellation (BGH I ZR 200/25). Sanction: termination at any time.
- **Legal basis:** § 312k BGB.
- **Applies to:** B2C subscriptions concluded online (A-1, A-6); not financial services.
- **Scanner observation:** With shop signals: `hint` if page text contains subscription wording (`Abo`, `Abonnement`, `Mitgliedschaft`, `/Monat`, `Mindestlaufzeit` …) and nowhere `verträge hier kündigen|vertrag hier kündigen|kündigungsbutton`.
- **How Claude verifies:** Search links for „kündig“. False positives: instalment prices „/Monat“, subscriptions only offline. A login gate before the button is a strong signal (case law UNVERIFIED). Labels like „Kündigung“ in an FAQ do not meet the wording.
- **Default priority:** 1 when an online-concluded subscription is evident and no button exists; 3 while unclear.
- **Common reason for a warning letter:** yes.
- **Report:** Was fehlt: „Für online abschließbare Abonnements fehlt der Button „Verträge hier kündigen“.“ Vorschrift: „§ 312k BGB“.
- **Fix steps:** Footer button „Verträge hier kündigen“ → public form without login → button „jetzt kündigen“ → on-screen and e-mail confirmation; no retention offers on the confirmation page.
- **Help:** draft `kuendigungsbutton.md`; mock-up `KUE-01`; sources SRC-32, SRC-89.
- **Confidence:** detection low–medium; legal basis verified.

### PRC-01 – Prices without VAT note – shop only
- **Obligation:** State total prices; in distance selling state that prices include VAT and other components.
- **Legal basis:** § 3 Abs. 1, § 6 Abs. 1 PAngV.
- **Applies to:** B2C offers and price advertising (A-1).
- **Scanner observation:** `gap` for pages with prices whose whole text has neither a VAT note („inkl. MwSt.“ …) nor a net note; `hint` for pages with only net notes („zzgl. MwSt.“, „netto“) – allowed only for B2B-only sites.
- **How Claude verifies:** Check the screenshot near the price; a note elsewhere on the page may not be close enough. False positives: small-business note „gemäß § 19 UStG keine MwSt“ (acceptable variant), salaries in job ads, „Preis auf Anfrage“. Net-only with an explicit B2B-only statement → drop.
- **Default priority:** 1 (gap); 2 (net-only hint, depends on A-1).
- **Common reason for a warning letter:** yes.
- **Report:** Was fehlt: „Preise auf [Seiten] stehen ohne Hinweis „inkl. MwSt.“.“ Vorschrift: „§ 6 Abs. 1 PAngV“.
- **Fix steps:** Under every price „inkl. MwSt., zzgl. Versandkosten“ with a link to the cost table; highlight the total price.
- **Help:** draft `preisangaben.md`; mock-up `PRC-01 / PRC-02`; sources SRC-34, SRC-36.
- **Confidence:** detection medium (page-level text); legal basis verified.

### PRC-02 – Prices without shipping-cost note – shop only
- **Obligation:** State whether shipping or delivery costs apply and their amount where calculable.
- **Legal basis:** § 6 Abs. 1, 2 PAngV.
- **Applies to:** B2C distance selling of goods (A-1).
- **Scanner observation:** `hint` for pages with prices whose text lacks `versand|lieferkosten|shipping`.
- **How Claude verifies:** Services and downloads without shipping are false positives; check whether the linked shipping page names amounts.
- **Default priority:** 2; 1 if goods are shipped and no shipping information exists anywhere.
- **Common reason for a warning letter:** yes.
- **Report:** Was fehlt: „Bei Preisen auf [Seiten] fehlt ein Hinweis auf Versandkosten.“ Vorschrift: „§ 6 Abs. 2 PAngV“.
- **Fix steps:** „zzgl. Versandkosten“ linked to a page with the amounts, or „versandkostenfrei“.
- **Help:** draft `preisangaben.md`; mock-up `PRC-01 / PRC-02`; sources SRC-36.
- **Confidence:** detection medium.

### ODR-01 – Outdated link to the EU ODR platform – shop only
- **Obligation:** The former ODR link duty ended: Regulation 524/2013 was repealed with effect from 20.07.2025; the platform is discontinued. A remaining reference „kann als irreführend gewertet werden“ (IHK Osnabrück, secondary).
- **Legal basis:** Regulation (EU) 2024/3228; § 5 UWG for possible misleading effect (risk UNVERIFIED).
- **Applies to:** Sites still linking the platform.
- **Scanner observation:** `gap` for links to `ec.europa.eu/consumers/odr` (up to 3).
- **How Claude verifies:** Confirm the link in the footer, imprint or AGB; make sure the separate VSBG statement stays.
- **Default priority:** 2.
- **Common reason for a warning letter:** uncertain.
- **Report:** Was fehlt: „Die Seite verweist noch auf die eingestellte EU-Streitschlichtungsplattform.“ Vorschrift: „VO (EU) 2024/3228“.
- **Fix steps:** Delete the ODR paragraph and link; keep or add the § 36 VSBG statement.
- **Help:** draft `streitbeilegung.md`; sources SRC-40, SRC-41, SRC-38, SRC-91.
- **Confidence:** detection high; repeal verified, legal risk UNVERIFIED.

### VSB-01 – Consumer dispute resolution statement – shop only
- **Obligation:** Inform whether the trader is willing or obliged to take part in proceedings before a consumer arbitration body; if so, name the body with address and website; on the website and with the AGB. Exemption from Nr. 1 for traders with ≤ 10 employees.
- **Legal basis:** § 36 Abs. 1–3 VSBG.
- **Applies to:** B2C traders with a website or AGB (A-1, A-4).
- **Scanner observation:** `hint` if no page text contains `streitbeilegung|schlichtungsstelle|verbraucherschlichtung`.
- **How Claude verifies:** The statement may sit in an AGB PDF or a page outside the sample.
- **Default priority:** 2 (depends on A-4).
- **Common reason for a warning letter:** uncertain.
- **Report:** Was fehlt: „Es fehlt eine Angabe zur Teilnahme an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle.“ Vorschrift: „§ 36 VSBG“.
- **Fix steps:** Add the standard sentence (willing / not willing) to imprint and AGB; if willing, name the body with address and URL.
- **Help:** draft `streitbeilegung.md`; sources SRC-38.
- **Confidence:** detection medium; legal basis verified.

### GPSR-01 – Manufacturer information on product pages – shop only
- **Obligation:** Online offers must show manufacturer name and postal and electronic address (non-EU manufacturer: EU responsible person), product identification incl. picture and type, warnings and safety information.
- **Legal basis:** Art. 19 VO (EU) 2023/988 (GPSR), applicable since 13.12.2024.
- **Applies to:** Online offers of consumer products; not services; sector rules may take precedence (not analysed).
- **Scanner observation:** `hint` for product pages whose text lacks `hersteller|manufacturer|marke|brand`.
- **How Claude verifies:** Information in a tab loaded on click, other words („Inverkehrbringer“). „Marke“ alone is not an address → still a gap.
- **Default priority:** 2.
- **Common reason for a warning letter:** uncertain (reports of warnings, no official data).
- **Report:** Was fehlt: „Auf Produktseiten fehlen Herstellerangaben mit Anschrift.“ Vorschrift: „Art. 19 GPSR“.
- **Fix steps:** Add a block „Herstellerangaben / Produktsicherheit“ to every product page (manufacturer, EU responsible person, identifiers, warnings).
- **Help:** no draft; no mock-up; sources SRC-42, SRC-94. Details: MAN-18.
- **Confidence:** detection low; legal basis verified (end of lit. d UNVERIFIED).

### UWG-01 – Newsletter sign-up
- **Obligation:** E-mail advertising needs prior express consent; existing-customer exception only under all conditions of § 7 Abs. 3 UWG; consent must be demonstrable; no pre-ticked box.
- **Legal basis:** § 7 Abs. 2 Nr. 2, Abs. 3 UWG; Art. 7 DSGVO.
- **Applies to:** Sites with newsletter or marketing opt-ins.
- **Scanner observation:** `hint` for pages with a form containing an e-mail field and the word „newsletter“. The scan never submits forms.
- **How Claude verifies:** Look at the form screenshot: pre-ticked checkbox, missing withdrawal note or privacy link → `gap`. Double opt-in cannot be seen from outside (MAN-04); DOI case law UNVERIFIED.
- **Default priority:** 3; 1 if a pre-ticked marketing box is visible.
- **Common reason for a warning letter:** yes.
- **Report:** Was fehlt: „Newsletter-Anmeldung gefunden; ob die Einwilligung nachweisbar eingeholt wird (Double-Opt-in), ist von außen nicht prüfbar.“ Vorschrift: „§ 7 Abs. 2 Nr. 2 UWG; Art. 7 DSGVO“.
- **Fix steps:** Unticked checkbox or dedicated sign-up button; short consent text (content, frequency, provider, withdrawal, privacy link); double opt-in with logging.
- **Help:** draft `datenschutz-bausteine.md`; sources SRC-15, SRC-04.
- **Confidence:** detection medium.

### UWG-02 – Environmental claims
- **Obligation:** Since 27.09.2026: generic environmental claims without proof of recognised excellent environmental performance, claims based on GHG offsetting that a product is neutral/reduced/positive, self-made sustainability labels and claims about the whole product when only one aspect is meant are always unfair; future claims need a verifiable implementation plan; an ambiguous term must be explained in the advertisement itself (BGH I ZR 98/23).
- **Legal basis:** § 2 Abs. 2, § 5 Abs. 1–3 UWG; UWG Anhang Nr. 2a, 4a–4c, 10a, 23d; Directive (EU) 2024/825.
- **Applies to:** B2C commercial communication (A-1); runs without shop signals.
- **Scanner observation:** `hint` for pages whose text matches `klimaneutral`, `CO2-neutral`, `klimapositiv`, `umweltfreundlich`, `nachhaltig`, `ökologisch`, `grüne Energie/Produkt` (up to 5 claims).
- **How Claude verifies:** Read the context: „nachhaltig“ in a non-environmental sense is a false positive; a concrete specification on the same medium lowers the risk; offsetting-based „klimaneutral“ product claim → `gap`.
- **Default priority:** 2; 1 for offsetting-based neutrality claims or self-made labels; 3 for specified claims.
- **Common reason for a warning letter:** yes.
- **Report:** Was fehlt: „Die Aussage „[Claim]“ wird auf der Seite nicht konkret belegt.“ Vorschrift: „§ 5 UWG; Anhang Nr. [4a] UWG“.
- **Fix steps:** Replace generic claims by specific, substantiated statements (what, how much, scope, period, source); remove offsetting-based neutrality claims and self-made labels.
- **Help:** draft `umweltaussagen.md`; no mock-up; sources SRC-43, SRC-44, SRC-45, SRC-48, SRC-49, SRC-88.
- **Confidence:** detection low (keywords); legal basis verified.

### BF-01 – Accessibility (axe-core)
- **Obligation:** E-commerce services for consumers must be accessible (perceivable, operable, understandable, robust), including identification, payment and product information; the whole website is in scope.
- **Legal basis:** § 1 Abs. 3 Nr. 5, § 3 Abs. 1, § 14 Abs. 1 Nr. 1 BFSG; § 12, § 19 BFSGV; benchmark EN 301 549 V3.2.1 / WCAG 2.1 AA (no presumption of conformity claimed; M/587 standards not yet published).
- **Applies to:** B2C e-commerce services (A-1, A-3); exempt: micro-enterprises providing services (A-4); third-party content not under the provider's control (§ 1 Abs. 4 BFSG). Information-only sites UNVERIFIED.
- **Scanner observation:** One finding per axe rule across scanned pages: `gap` if impact critical or serious, `hint` otherwise; evidence rule ID, WCAG tags, help URL, targets, element count.
- **How Claude verifies:** Check targets; violations inside third-party widgets, duplicates of one template. Automated tests find only part of the issues (axe README: 57 %, secondary); never write „barrierefrei“ or „BFSG-konform“.
- **Default priority:** 2 (gap; depends on A-1/A-4); 3 (hint).
- **Common reason for a warning letter:** uncertain (status of BFSG as market conduct rule open; authority route § 32 BFSG).
- **Report:** Was fehlt: „[Regel, z. B. Formularfelder ohne Beschriftung] auf [n] Seiten ([k] Elemente).“ Vorschrift: „§ 3 BFSG; § 12 BFSGV“.
- **Fix steps:** Fix blockers in the purchase path first (labels, error messages, keyboard access, visible focus, contrast, button names); then a manual audit against WCAG 2.1 AA.
- **Help:** draft `barrierefreiheit.md`; no mock-up; sources SRC-50, SRC-51, SRC-52, SRC-53, SRC-55, SRC-56, SRC-58, SRC-59, SRC-60, SRC-92.
- **Confidence:** detection high for axe rules, coverage partial; scope verified, information-only sites UNVERIFIED.

### BF-02 – Accessibility information (Anlage 3 BFSG) – shop only
- **Obligation:** Publish, in the AGB or otherwise clearly perceivable: description of the service, explanations of how it works, how it meets the requirements, and the competent market surveillance authority (MLBF).
- **Legal basis:** § 14 Abs. 1 Nr. 2 BFSG, Anlage 3; formal non-conformity § 30 Abs. 2 BFSG.
- **Applies to:** As BF-01 (A-1, A-3, A-4).
- **Scanner observation:** With shop signals: `hint` if no page links to `barrierefreiheit|accessibility`.
- **How Claude verifies:** Search the AGB text (Anlage 3 allows the AGB); check whether the authority is named.
- **Default priority:** 2.
- **Common reason for a warning letter:** uncertain.
- **Report:** Was fehlt: „Es wurden keine Informationen zur Barrierefreiheit nach Anlage 3 BFSG gefunden.“ Vorschrift: „§ 14 Abs. 1 Nr. 2 BFSG, Anlage 3“.
- **Fix steps:** Page „Barrierefreiheit“ with the four parts (a–d), linked in the footer and referenced in the AGB; verify the MLBF contact on the official page before publishing.
- **Help:** draft `barrierefreiheit.md`; mock-up `IMP-01 / DSE-01 / WID-01 / BF-02`; sources SRC-50, SRC-54, SRC-57.
- **Confidence:** detection medium; legal basis verified.

### AI-01 – Notice that users talk to an AI
- **Obligation:** Persons interacting with an AI system must be informed, at the latest at the first interaction, clearly and accessibly, unless obvious. Applies from 02.08.2026; not postponed by Regulation (EU) 2026/1744.
- **Legal basis:** Art. 50 Abs. 1, 5 VO (EU) 2024/1689 (KI-VO).
- **Applies to:** Formally the provider; the site operator embedding a chatbot is typically deployer, liability split UNVERIFIED → recommend the notice anyway (A-7).
- **Scanner observation:** `hint` if requests go to a known chat service or page text matches `chatbot|ki-assistent|ai assistant|virtuelle Assistentin|chat with us|chatten sie`. The scanner does not open the widget.
- **How Claude verifies:** Identify vendor and wording; human live chat is a false positive. The first message is not visible → usually „Bitte prüfen“.
- **Default priority:** 3; 2 if an AI chatbot is evident and no notice is visible.
- **Common reason for a warning letter:** no.
- **Report:** Was fehlt: „Chat gefunden; ein Hinweis, dass Nutzer mit einer KI kommunizieren, wurde nicht erkannt.“ Vorschrift: „Art. 50 Abs. 1 KI-VO“.
- **Fix steps:** Notice in the widget header and first message, e.g. „Sie chatten mit einem KI-System, nicht mit einem Menschen.“; readable and screen-reader accessible.
- **Help:** draft `ki-hinweis.md`; mock-up `AI-01`; sources SRC-66, SRC-67, SRC-68 (cross-check only).
- **Confidence:** detection low–medium; legal basis verified, role split UNVERIFIED.

### DSA-01 – Notice-and-action mechanism for user content
- **Obligation:** Hosting services need an easy, electronic mechanism to report allegedly illegal content (reasons, exact URL, name and e-mail, good-faith statement), confirmation of receipt, diligent decisions; no micro/small exemption.
- **Legal basis:** Art. 16 DSA (VO (EU) 2022/2065); hosting definition Art. 3 lit. g iii; authority Bundesnetzagentur (§ 12 DDG).
- **Applies to:** Hosting services (A-5).
- **Scanner observation:** `hint` for pages with a form containing a file upload, or a textarea plus `kommentar|comment|bewertung schreiben|beitrag verfassen|antworten`.
- **How Claude verifies:** Contact forms whose text says „wir antworten …“ and non-public application uploads are typical false positives. For real public UGC, look for „Inhalt melden“ near items.
- **Default priority:** 2 (depends on A-5); 3 if the UGC character stays unclear.
- **Common reason for a warning letter:** no.
- **Report:** Was fehlt: „Nutzer können Inhalte veröffentlichen, aber es wurde kein Meldeweg für rechtswidrige Inhalte gefunden.“ Vorschrift: „Art. 16 DSA“.
- **Fix steps:** „Inhalt melden“ link at every user item → form with the Art. 16 elements → receipt confirmation; also check MAN-13…MAN-15.
- **Help:** draft `dsa-meldeweg.md`; mock-up `DSA-01`; sources SRC-63, SRC-64, SRC-65 (fine amounts UNVERIFIED-detail).
- **Confidence:** detection low; legal basis verified, hosting status of small comment sections UNVERIFIED.

## Manual checks

Duties the scanner cannot observe. They go into `manualChecks` of `report.json` (question + law). If the evidence on the site shows a gap (e.g. a product sold by volume without Grundpreis), Claude reports it as a finding with that MAN ID, `kind: gap`, priority as listed. ⚠ only where noted.

| ID | Duty | Basis | Question to the site owner (German) | Prio if found | Sources |
|---|---|---|---|---|---|
| MAN-01 | Processor contracts and joint-controller arrangements for embedded services | Art. 26, 28 DSGVO; CJEU C-40/17 | „Bestehen Auftragsverarbeitungsverträge bzw. Vereinbarungen zur gemeinsamen Verantwortlichkeit mit allen eingebundenen Dienstleistern?“ | 2 | SRC-04, SRC-09 |
| MAN-02 | Third-country transfers: adequacy (DPF only for listed US organisations), SCC or Art. 49; stated in the policy; DPF appeal C-703/25 P pending | Art. 44–49 DSGVO; Decision (EU) 2023/1795 | „Sind die US-Anbieter unter dem Data Privacy Framework zertifiziert oder gibt es Standardvertragsklauseln?“ | 2 | SRC-04, SRC-12, SRC-13 |
| MAN-03 | Records of processing activities | Art. 30 DSGVO | „Gibt es ein Verzeichnis von Verarbeitungstätigkeiten?“ | 3 | SRC-04 |
| MAN-04 | Demonstrable newsletter consent (double opt-in as proof practice, UNVERIFIED as legal standard); existing-customer exception § 7 Abs. 3 UWG; ⚠ yes (as UWG-01) | § 7 Abs. 2 Nr. 2, Abs. 3 UWG; Art. 7 Abs. 1 DSGVO | „Wird jede Newsletter-Anmeldung per Bestätigungs-E-Mail bestätigt und protokolliert?“ | 2 | SRC-15, SRC-04 |
| MAN-05 | Grundpreis next to the total price for goods sold by weight, volume, length or area; exceptions § 4 Abs. 3 (units in § 5 PAngV UNVERIFIED); ⚠ yes | § 4 PAngV | „Werden Waren nach Gewicht, Volumen, Länge oder Fläche verkauft, und steht der Grundpreis neben dem Preis?“ | 1 | SRC-35 |
| MAN-06 | Price reductions: lowest price of the last 30 days (CJEU C-330/23); RRP comparison UNVERIFIED; ⚠ yes | § 11 PAngV | „Wird bei jeder Preisermäßigung der niedrigste Preis der letzten 30 Tage angegeben?“ | 1 | SRC-37, SRC-86, SRC-87 |
| MAN-07 | Pre-contractual information incl. items from 27.09.2026 (eco delivery options, harmonised legal-guarantee notice – content of (EU) 2025/1960 UNVERIFIED, durability guarantee, repairability) | § 312d BGB; Art. 246a § 1, § 4 EGBGB | „Enthalten Produkt- und Bestellseiten alle Pflichtinformationen, einschließlich des Gewährleistungshinweises seit 27.09.2026?“ | 2 | SRC-18, SRC-19, SRC-20, SRC-28 |
| MAN-08 | Final order page: characteristics, total price, costs, term, minimum term, durability guarantee directly before the button | § 312j Abs. 2 BGB | „Zeigt die letzte Bestellseite direkt über dem Button alle wesentlichen Angaben?“ | 1 | SRC-31, SRC-19, SRC-28, SRC-90 |
| MAN-09 | Electronic order confirmation; contract terms retrievable and storable; acknowledgment of withdrawal on a durable medium (§ 356a); cancellation confirmation in text form (§ 312k). The provision on contract confirmation on a durable medium was not fetched (UNVERIFIED) | § 312i Abs. 1 S. 1 Nr. 3, 4 BGB; § 356a, § 312k BGB | „Erhalten Kunden nach Bestellung, Widerruf und Kündigung jeweils eine Bestätigung per E-Mail mit Inhalt, Datum und Uhrzeit?“ | 2 | SRC-30, SRC-25, SRC-32 |
| MAN-10 | Delivery restrictions and payment methods at the start of ordering | § 312j Abs. 1 BGB | „Sind Liefergebiete und Zahlungsarten spätestens zu Beginn der Bestellung angegeben?“ | 2 | SRC-31 |
| MAN-11 | Dispute resolution information after a dispute arises (no employee exemption) | § 37 VSBG | „Wird bei ungelösten Beschwerden in Textform auf die zuständige Schlichtungsstelle hingewiesen?“ | 3 | SRC-39 |
| MAN-12 | Responsible person for journalistic-editorial content (A-8); further personal requirements UNVERIFIED | § 18 Abs. 2 MStV | „Ist für Blog- oder Nachrichteninhalte eine verantwortliche Person mit Anschrift genannt?“ | 2 | SRC-17 |
| MAN-13 | DSA points of contact for authorities and users (A-5) | Art. 11, 12 DSA | „Sind Kontaktstellen nach Art. 11 und 12 DSA mit Sprachen angegeben?“ | 2 | SRC-63, SRC-64 |
| MAN-14 | Terms on content restrictions and moderation (detail wording UNVERIFIED) | Art. 14 DSA | „Erklären die Nutzungsbedingungen, welche Inhalte unzulässig sind und wie moderiert wird?“ | 2 | SRC-63 |
| MAN-15 | Statement of reasons for content restrictions | Art. 17 DSA | „Erhalten Nutzer bei Löschung oder Sperrung eine Begründung mit Rechtsbehelfen?“ | 3 | SRC-63 |
| MAN-16 | Public bodies: accessibility statement with feedback mechanism (A-9); Länder law UNVERIFIED | § 12a BGG; § 7 BITV 2.0 | „Ist der Betreiber eine öffentliche Stelle des Bundes?“ | 2 | SRC-61, SRC-62 |
| MAN-17 | Machine-readable marking of AI output (providers; transition to 02.12.2026) and disclosure of deepfakes and AI text on public-interest matters (deployers) | Art. 50 Abs. 2, 4 KI-VO; VO (EU) 2026/1744 | „Werden KI-generierte Bilder, Videos oder Texte veröffentlicht, und sind sie gekennzeichnet?“ | 2 | SRC-66, SRC-67 |
| MAN-18 | GPSR details: EU responsible person for non-EU manufacturers, identifiers, warnings in an understandable language | Art. 19 GPSR | „Liegen für alle Produkte Hersteller-, Kennzeichnungs- und Sicherheitsangaben vor?“ | 2 | SRC-42 |
| MAN-19 | Online marketplaces: seller status, ranking parameters (Art. 246d EGBGB UNVERIFIED); DSA Section 3/4 unless micro/small (thresholds UNVERIFIED) | § 312l BGB; § 5b UWG; Art. 19, 29–32 DSA | „Bieten auf der Website mehrere Verkäufer an?“ | 2 | SRC-33, SRC-47, SRC-63 |
| MAN-20 | Disclosure of commercial purpose (advertising, affiliate links); how reviews are verified | § 5a Abs. 4, § 5b Abs. 3 UWG | „Sind Werbelinks gekennzeichnet, und ist erklärt, ob und wie Bewertungen geprüft werden?“ | 2 | SRC-46, SRC-47 |
| MAN-21 | Data Act for connected products or data processing services (SaaS, cloud); dates UNVERIFIED | VO (EU) 2023/2854 | „Verkauft der Betreiber vernetzte Geräte oder bietet Cloud-/SaaS-Dienste an?“ | 3 | SRC-69 |
| MAN-22 | Image rights and attribution; licence terms | § 13 UrhG | „Liegen für alle Bilder, Videos und Texte Nutzungsrechte vor, und sind erforderliche Urhebernennungen angegeben?“ | 3 | SRC-70 |

## Wording rules (RDG)

- Findings are technical observations plus generic legal context: „Kein Link mit der Bezeichnung „Impressum“ gefunden“, „für Websites mit [Merkmal] ist üblicherweise vorgeschrieben …“. Never an individual verdict: no „rechtswidrig“, „abmahnfähig“, „rechtskonform“, „BFSG-konform“, „DSGVO-konform“.
- Scope conclusions are labelled assumptions („unter der Annahme, dass …“), never findings of fact.
- The ⚠ marker is a fixed property of the duty, never an assessment of the site; always with „Erfahrungswert, keine Bewertung des Einzelfalls“.
- Text drafts are generic templates with placeholders, like a form book; only placeholders are filled from scan data; each carries „Entwurf – keine Rechtsberatung, vor Veröffentlichung prüfen lassen.“
- Disclaimer in every report: „Technische Prüfung anhand einer gepflegten Liste von Pflichten. Keine Rechtsberatung, keine Gewähr für Vollständigkeit oder Richtigkeit. Für eine verbindliche Bewertung eine Rechtsanwältin oder einen Rechtsanwalt hinzuziehen.“ No claims such as „in Anwaltsqualität“.
- Background: a legal service is an activity in a concrete third-party matter requiring legal examination of the individual case (§ 2 Abs. 1 RDG); out-of-court legal services need a permission (§ 3 RDG) or may be an ancillary service (§ 5 RDG); a document generator with pre-built text modules for typical cases was not a legal service (BGH I ZR 113/20 „Smartlaw“, press release). Applying this to the skill, especially to reports on third parties' websites, is an UNVERIFIED assessment; whoever offers paid audits to third parties should clarify RDG compliance themselves. Sources SRC-71, SRC-72, SRC-73, SRC-74.
