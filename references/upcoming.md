# Upcoming and discussed rules

Upcoming status: 2026-11-07. Maintained by the monthly update (references/update.md). During a run, check the site against every entry whose "Affects" fits the site and report the relevant ones in the chapter "Kommende und diskutierte Regeln" (report.json "upcoming"). Re-fetch every source you cite. Entries that start to apply move into references/checklist.md.

Status legend: **PROPOSAL** (in legislative procedure) · **PLANNED** (Commission initiative, no proposal yet) · **ADOPTED-NYA** (adopted, not yet applicable) · **PARTLY** (partly applicable, further dates pending) · **WITHDRAWN/DROPPED**.

---

## Summary table

| ID | Rule | Status (2026-11-07) | Next key date | Affects | Scanner-observable? |
|---|---|---|---|---|---|
| UP-01 | Digital Omnibus COM(2025) 837 (GDPR Art. 88a/88b, cookies) | PROPOSAL — Council mandate 21.10.2026; EP committee stage | none fixed (88a: +6 months after entry into force; 88b: +24 months; browsers +48 months) | all sites with cookies/tracking | yes (banner, reject button, GPC/signal handling) |
| UP-02 | AI Act (EU) 2024/1689 as amended by (EU) 2026/1744 | PARTLY | 02.12.2026 (Art. 50(2) legacy systems; new Art. 5 bans); 02.12.2027 (Annex III high-risk); 02.08.2028 (Annex I) | sites using AI chatbots / generated content | partly (chatbot disclosure, AI labels) |
| UP-03 | Digital Fairness Act | PLANNED — proposal expected mid-Nov 2026 / Q4 2026 | proposal date | B2C shops, subscriptions, influencers, platforms | partly (dark patterns, cancellation path) |
| UP-04 | EU KIDS Act COM(2026) 681 | PROPOSAL (17.09.2026) | none | social media, VSPs, games, AI chatbots used by minors | partly (age gate, AI chatbot default) |
| UP-05 | Consumer Credit Directive (EU) 2023/2225 + DE implementing law | ADOPTED-NYA | **20.11.2026** | shops offering instalments / BNPL / credit ads | yes (credit ads, BNPL widgets) |
| UP-06 | Product Liability Directive (EU) 2024/2853 + DE ProdHaftG reform | ADOPTED-NYA | **09.12.2026** | sellers/makers of products incl. software, platforms, fulfilment | not observable (liability) — info only |
| UP-07 | Cyber Resilience Act (EU) 2024/2847 | PARTLY (Art. 14 reporting since 11.09.2026) | **11.12.2027** full application | sellers of software / connected products online | partly (CE / support-period info, vuln contact) |
| UP-08 | EAA / BFSG — EN 301 549 V4.1.1 citation; transition 2030 | PARTLY (BFSG applies since 28.06.2025) | OJ citation expected 16.12.2026 (UNVERIFIED-official); 28.06.2030 transition end | B2C e-commerce, services under BFSG | yes (accessibility tests) |
| UP-09 | Right to repair (EU) 2024/1799 / DE BGB §§ 479a ff. | PARTLY (DE in force since 23.07.2026) | 31.07.2027 EU repair platform; 31.12.2027 (B2B repairability as quality feature) | manufacturers of Annex II goods; repairers | yes (repair price page for manufacturers) |
| UP-10 | PPWR (EU) 2025/40 | PARTLY (applies since 12.08.2026) | 12.08.2028 harmonised labels (incl. e-commerce packaging) | online sellers shipping packaged goods | partly (EPR reg. no. on marketplaces; not on own site) |
| UP-11 | Batteries Regulation (EU) 2023/1542 | PARTLY | 18.02.2027 (removability Art. 11; QR code Art. 13(6); battery passport) | sellers of battery-containing products | mostly not observable |
| UP-12 | Omnibus VIII — suspension of EPR authorised-representative rules (packaging, batteries, WEEE) | PROPOSAL | none | cross-border online sellers | not observable |
| UP-13 | Data Act (EU) 2023/2854 remaining dates | PARTLY | 12.01.2027 (no switching charges, cloud); 12.09.2027 (Ch. IV old contracts) | SaaS/cloud providers, connected products | partly (switching info in cloud T&Cs) |
| UP-14 | DE Preisangabengesetz amendment (fines up to EUR 100,000; EV charging) | PROPOSAL/ADOPTED by Bundestag — promulgation UNVERIFIED | UNVERIFIED | EV charging operators; marginal for websites | no |
| — | Green Claims Directive | WITHDRAWAL announced (CWP 2027 Annex III, 04.11.2026) | — | — | drop as upcoming; EmpCo (EU) 2024/825 applies instead |
| — | ePrivacy Regulation COM(2017) 10 | WITHDRAWN (end of validity 06.10.2025) | — | — | drop |

---

## UP-01 Digital Omnibus (data / GDPR / cookies)

- **Act:** Proposal for a Regulation amending (EU) 2016/679, 2018/1724, 2018/1725, 2023/2854, Directives 2002/58/EC, 2022/2555, 2022/2557 … ("Digital Omnibus"), **COM(2025) 837 final**, procedure **2025/0360(COD)**, 19.11.2025.
- **Status:** PROPOSAL.
  - EP: lead ITRE, rapporteurs appointed Feb/Mar 2026; draft report PE786.818 (22.06.2026); amendments tabled 27.07.2026; OEIL status "Awaiting committee decision". No plenary position.
  - Council: negotiating mandate agreed **21.10.2026** (text added 22.10.2026). Trilogues start once EP adopts its position.
  - Listed as priority pending proposal in Commission Work Programme 2027 (Annex II, 04.11.2026). Interinstitutional target: conclude all simplification packages by end of 2027 (per Council press release).
- **What it would require of websites (Commission text):**
  - New **GDPR Art. 88a**: storing/accessing personal data in terminal equipment only with consent, with consent-free purposes: transmission, service explicitly requested, **aggregated first-party audience measurement for own use**, security. Where consent is used: **refusal must be possible with a single-click button or equivalent**; no new request for the same purpose while consent valid; **after refusal no new request for at least 6 months**. Applies 6 months after entry into force (placeholder date).
  - New **GDPR Art. 88b**: controllers' online interfaces must accept consent/refusal/objection through **automated machine-readable signals** (browser signals) and respect them; harmonised standards to follow; applies **24 months** after entry into force. Media service providers exempt. **Web browsers (non-SME)** must provide the technical means after **48 months**.
  - ePrivacy Directive Art. 5(3) amended (personal data part moves to GDPR); Art. 4 repealed. P2B Regulation (EU) 2019/1150 repealed.
  - **Council mandate deviates:** keeps cookie rules **in the ePrivacy Directive** (not moved into GDPR), but adds further consent-free purposes (service provision, audience measurement, device security) "thus reducing the number of cookie banners". Council text on 88b-type signals not checked (UNVERIFIED).
- **Scanner heuristics:** cookie banner present? one-click "Ablehnen" on first layer? banner re-appears after refusal within session/days (re-prompt)? audience measurement first-party vs third-party; does site honour `Sec-GPC`/`navigator.globalPrivacyControl` (only indicative—no legal standard yet).
- **Affects:** all websites using cookies/local storage/tracking.
- **Sources:**
  - EUR-Lex COM(2025) 837: https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A52025PC0837 and full text https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:52025PC0837 (Art. 88a, 88b quoted)
  - OEIL 2025/0360(COD): https://oeil.europarl.europa.eu/oeil/en/procedure-file?reference=2025/0360(COD)
  - Council press release 21.10.2026: https://www.consilium.europa.eu/en/press/press-releases/2026/10/21/digital-rulebook-council-agrees-position-to-simplify-data-protection-privacy-and-cyber-reporting-rules/ (read via browser; site blocks scripted fetch)
  - CWP 2027 Annexes COM(2026) 710: https://commission.europa.eu/document/download/9ad0afe2-f9a8-46e9-bd3b-74c2de496c48_en?filename=COM_2026_710_1_annexe_EN.pdf

## UP-02 AI Act — remaining dates after Digital Omnibus on AI

- **Acts:** Regulation (EU) 2024/1689; amended by **Regulation (EU) 2026/1744** ("Digital Omnibus on AI", done at Strasbourg 08.07.2026; enters into force 3rd day after OJ publication; publication 24.07.2026 per secondary sources → 27.07.2026, UNVERIFIED exact OJ date). Council press release says the AI act was "adopted on 29 June 2026" (Council adoption) — signature date per EUR-Lex 08.07.2026.
- **Status:** PARTLY. General application incl. **Art. 50 transparency since 02.08.2026** (Art. 113 original text).
- **Upcoming dates (Art. 111/113 as amended):**
  - **02.12.2026:** generative AI systems placed on market **before 02.08.2026** must comply with **Art. 50(2)** (machine-readable marking of synthetic audio/image/video/text) — new Art. 111(4).
  - **02.12.2026:** new prohibitions Art. 5(1)(ba)/(bb): AI systems generating non-consensual intimate imagery of identifiable persons and CSAM.
  - **02.12.2027:** high-risk Annex III systems (Chapter III Sections 1–3).
  - **02.08.2028:** high-risk Annex I systems (product legislation).
  - **02.08.2030:** high-risk systems used by public authorities (Art. 111(2)).
  - Art. 4 AI literacy reworded to "take measures to support" AI literacy (no specific level guaranteed).
- **Website relevance:** operators (deployers) of chatbots must ensure users know they interact with AI (Art. 50(1) is a provider duty; deployer duties Art. 50(3)/(4) for emotion recognition and deepfakes/AI-generated public-interest text) — applicable now; 02.12.2026 concerns providers of legacy generators.
- **Scanner heuristics:** detect chatbot widgets (e.g., known vendor scripts) and check for visible "KI"/AI disclosure; detect AI-generated images labelled; C2PA/metadata presence on images (indicative only).
- **Affects:** sites using AI chat, AI-generated content; providers of generative tools.
- **Sources:** https://eur-lex.europa.eu/eli/reg/2026/1744/oj/eng · https://eur-lex.europa.eu/eli/reg/2024/1689/oj/eng (Art. 113) · Council press release above.

## UP-03 Digital Fairness Act (DFA)

- **Act:** none yet — Commission initiative under Art. 114 TFEU.
- **Status:** PLANNED. Commission page: "a Commission initiative, currently under preparation". EPRS briefing (last updated 05.10.2026): expected Q4 2026, "current information has it scheduled for mid-November"; legal form (regulation/directive/omnibus) not yet known.
- **Expected content (not legal text):** dark patterns; addictive design; unfair personalisation incl. personalised/dynamic pricing; misleading influencer marketing; unfair price marketing; digital contracts — notably **subscription cancellation as easy as sign-up** and renewal reminders; protection of minors.
- **Scanner heuristics (for "discussed" warnings only):** pre-ticked boxes, countdown timers/fake scarcity, confirm-shaming wording, cancellation path depth for subscriptions, "Kündigungsbutton" presence (already DE law § 312k BGB), influencer/affiliate labelling.
- **Affects:** B2C shops, subscription services, platforms, influencer marketing.
- **Sources:** https://commission.europa.eu/law/law-topic/consumer-protection-law/review-eu-consumer-law_en · https://eprs.europarl.europa.eu/contents/publications/EPRS/2026/10/EPRS_BRI(2026)791529.html
- **UNVERIFIED:** exact adoption date; whether proposal was published after 07.11.2026.

## UP-04 EU KIDS Act

- **Act:** Proposal COM(2026) 681 final, 17.09.2026, procedure 2026/0286(COD) (procedure number from OEIL summary link in search result; not opened → UNVERIFIED).
- **Status:** PROPOSAL.
- **Content (Commission news):** online services used by minors (social media, video-sharing, online games, AI companions/chatbots); privacy-preserving age verification incl. at account opening for social media/VSPs; under-13 no social media; 13–<15 parent-managed accounts; limits on infinite scroll, reward mechanics, night-time push; AI chatbots/companions **off by default** for minors; private-by-default profiles; burden of proof on VLOPs.
- **Scanner heuristics:** age gate / age verification on sign-up; chatbot default state; infinite scroll on community features. Relevant only for sites with user accounts/community/games/AI chat.
- **Affects:** platforms, games, AI chatbot operators; ordinary shops mostly not.
- **Sources:** https://commission.europa.eu/news-and-media/news/eu-kids-act-helping-children-navigate-safer-online-world-2026-09-17_en

## UP-05 Consumer Credit Directive (CCD2) and German implementation

- **Acts:** Directive (EU) 2023/2225; DE: "Gesetz zur Umsetzung der Richtlinie (EU) 2023/2225 über Verbraucherkreditverträge und zur Regelung der Förderung klimaneutraler Mobilität", **BGBl. 2026 I Nr. 139 (18.05.2026)**.
- **Status:** ADOPTED-NYA. Directive Art. 48(1): adopt by 20.11.2025, **apply from 20.11.2026**. BMJV FAQ (April 2026): new rules "müssen ab dem 20. November 2026 angewendet werden". Exact Inkrafttreten article of the DE law not read (PDF not text-extractable) → UNVERIFIED for individual provisions.
- **What changes for websites:**
  - Scope extended to **interest-free and short-term credit, loans < EUR 200, "Buy now, pay later"**. **Rechnungskauf (invoice purchase) stays excluded**, also when large online retailers assign the claim (factoring); interest-free deferred-payment debit/charge cards excluded.
  - **Credit advertising:** mandatory notice that borrowing costs money; ban on ads suggesting credit improves financial situation (FAQ; Directive Art. 8 per recital 33). Fast-credit advertising remains allowed.
  - Pre-contractual info via SECCI; for new free credits a one-page info sheet. Pre-ticked boxes not consent (recital 49).
  - Marketplace merchants offering instalments: registration bundled via marketplace; merchants offering only interest-free deferral exempt from registration.
  - Amendments also to UWG, PAngV and GewO (BGBl. bookmarks: Art. 8 PAngV) — content UNVERIFIED.
- **Scanner heuristics:** detect BNPL/instalment widgets (Klarna, PayPal Ratenzahlung, etc.) and "0 % Finanzierung"/"ab X €/Monat" claims; check for the cost warning and representative example near credit ads.
- **Affects:** B2C shops offering financing, BNPL, credit intermediaries.
- **Sources:** https://eur-lex.europa.eu/eli/dir/2023/2225/oj/eng · https://www.bmjv.de/SharedDocs/Gesetzgebungsverfahren/DE/2025_VerbraucherkreditRL.html · https://www.bmjv.de/SharedDocs/Downloads/DE/Gesetzgebung/FAQ/FAQ_Verbraucherkreditrichtlinie.pdf?__blob=publicationFile&v=2 · BGBl: https://www.recht.bund.de/bgbl/1/2026/139/regelungstext.pdf?__blob=publicationFile (fetched, text not extractable)

## UP-06 Product Liability Directive (EU) 2024/2853 and German reform

- **Acts:** Directive (EU) 2024/2853; DE "Gesetz zur Modernisierung des Produkthaftungsrechts und zur Änderung weiterer Vorschriften", **BGBl. 2026 I Nr. 321 (27.10.2026)** (BMJV page). Bundestag adoption 08.10.2026 (Drs. 21/4297).
- **Status:** ADOPTED-NYA. Directive Art. 22: transpose by **09.12.2026**; Art. 2(1): applies to products placed on market/put into service **after 09.12.2026**. DE entry into force 09.12.2026 per government draft (secondary/search summary) → UNVERIFIED in final BGBl text.
- **Content:** software (incl. AI systems, SaaS/cloud-supplied) is a product; non-commercial FOSS excluded; online platforms liable like distributors under Art. 8(4) if they present the product so that an average consumer believes the platform/trader under its control supplies it (DSA Art. 6(3)) and fail to name an EU operator within one month; fulfilment service providers liable when no EU manufacturer/importer.
- **Website relevance:** liability rule, not a website duty. Indirect: marketplaces should clearly identify the actual trader; shops should show manufacturer/importer identity (overlaps GPSR, already applicable).
- **Scanner heuristics:** "not observable"; at most: marketplace listings show seller identity and EU responsible person.
- **Affects:** manufacturers incl. software/app vendors, importers, marketplaces, fulfilment providers.
- **Sources:** https://eur-lex.europa.eu/eli/dir/2024/2853/oj/eng · https://www.bmjv.de/SharedDocs/Gesetzgebungsverfahren/DE/2025_Produkthaftung.html · https://www.bundestag.de/dokumente/textarchiv/2026/kw41-de-produkthaftungsrecht-1222456

## UP-07 Cyber Resilience Act (EU) 2024/2847

- **Status:** PARTLY. Art. 71: applies from **11.12.2027**; Art. 14 (reporting of actively exploited vulnerabilities/incidents) from **11.09.2026**; Chapter IV (notified bodies) from 11.06.2026.
- **Content relevant to online sales:** products with digital elements (incl. software sold or monetised in the course of commercial activity) need CE marking, support period, vulnerability handling, user information; non-monetised FOSS out of scope (recitals 15, 18).
- **Scanner heuristics:** for software/IoT sellers: published vulnerability-reporting contact (security.txt, CVD policy), stated support period, CE/DoC link on product pages (from 11.12.2027).
- **Affects:** manufacturers/distributors of software and connected products sold online.
- **Source:** https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng (Art. 71 quoted)

## UP-08 Accessibility — EAA / BFSG follow-ups

- **Acts:** Directive (EU) 2019/882 (EAA); DE BFSG (applies since 28.06.2025 — current law, checked elsewhere).
- **Upcoming:**
  - **EN 301 549 V4.1.1** published 02.09.2026 (ETSI/CEN/CENELEC); presumption of conformity only after citation in OJ, "currently expected on 16 December 2026"; until then V3.2.1 (WCAG 2.1-based) remains the cited version (National Disability Authority Ireland). OJ citation date UNVERIFIED (no EUR-Lex confirmation).
  - EAA Art. 32: transition until **28.06.2030** for services using products already used before 28.06.2025; old service contracts max. until 28.06.2030.
  - EAA Art. 33: Commission report/review by **28.06.2030**.
- **German BFSG amendments:** no draft found (searched) → none listed; UNVERIFIED absence.
- **Scanner heuristics:** existing accessibility checks; flag WCAG 2.2 criteria (likely basis of V4.1.1 — UNVERIFIED) as "kommend".
- **Affects:** B2C e-commerce and other BFSG services (micro-enterprise services exempt).
- **Sources:** https://eur-lex.europa.eu/eli/dir/2019/882/oj/eng (Art. 32, 33) · https://nda.ie/news/en301549-published

## UP-09 Right to repair — Directive (EU) 2024/1799 / German implementation

- **Status:** PARTLY. DE law "Gesetz zur Umsetzung der Richtlinie (EU) 2024/1799 … sowie zur Verbesserung der Verfügbarkeit von Vorsorgeverfügungen" of 16.07.2026, **BGBl. 2026 I Nr. 212 (22.07.2026)**; in force day after promulgation (23.07.2026); applies to sales contracts concluded from 31.07.2026 (EGBGB Art. 229 § 72). → largely **already applicable**.
- **Remaining dates:** EU online repair platform / national sections operational by **31.07.2027** (Directive Art. 7); § 434(3) BGB repairability as usual quality applies to **B2B** contracts concluded after **31.12.2027**.
- **Website duties (now):** manufacturers of Annex II goods (e.g., washing machines, dishwashers, fridges, displays, vacuum cleaners, phones/tablets, servers, welding equipment, LMT batteries per Directive Annex II) must publish **indicative prices for typical repairs on a freely accessible website** (§ 479d(2) BGB) and info on the repair obligation (§ 479d(1)); applies to EU representative/importer/distributor if manufacturer outside EU (§ 479f). Sellers must inform about choice repair vs replacement and +12 months limitation extension before cure (§ 475(4) BGB) — not website-visible. European Repair Information Form voluntary (Art. 245 EGBGB).
- **Scanner heuristics:** for manufacturer/brand sites of Annex II product groups: page with "Reparatur", "Richtpreise", repair prices; for repair shops offering the form: content of Anlage 19.
- **Sources:** https://eur-lex.europa.eu/eli/dir/2024/1799/oj/eng · https://www.recht.bund.de/bgbl/1/2026/212/regelungstext.pdf?__blob=publicationFile&v=1 (read in full) · https://www.bmjv.de/SharedDocs/Gesetzgebungsverfahren/DE/2026_Foerderung_Reparatur_von_Waren.html
- Note: Annex II product list taken from general knowledge of the Directive, not re-read → UNVERIFIED in detail.

## UP-10 Packaging and Packaging Waste Regulation (EU) 2025/40

- **Status:** PARTLY — applies since **12.08.2026** (Art. 71); Art. 67(5) from 12.02.2029.
- **Upcoming:** harmonised material-composition labels on packaging from **12.08.2028** (or 24 months after implementing acts, whichever later), including **e-commerce packaging** (Art. 12(1)); empty-space ratio max. 50 % for e-commerce packaging (recital 84; article date not extracted → UNVERIFIED, reportedly 2030); recyclability grades from 01.01.2030.
- **Online-platform/distance-sales duties:** marketplaces must obtain producer's EPR registration number per Member State and self-certification before allowing producers to sell (Art. 44-related text quoted); platform must make best efforts to check completeness. National registers within 18 months of implementing act.
- **Scanner heuristics:** not observable on own shop; on marketplaces possibly EPR number display (DE: LUCID number already required under VerpackG).
- **Affects:** online sellers shipping packaged goods, marketplaces.
- **Source:** https://eur-lex.europa.eu/eli/reg/2025/40/oj/eng

## UP-11 Batteries Regulation (EU) 2023/1542

- **Status:** PARTLY. Art. 96: Art. 11 (portable batteries **readily removable and replaceable by end-user**) applies from **18.02.2027**; from **18.02.2027 QR code** on all batteries (Art. 13(6)); battery passport for LMT/industrial > 2 kWh/EV batteries from 18.02.2027 (Art. 77).
- **Pending change:** Omnibus VIII proposal COM(2025) 981 amends (EU) 2023/1542 (content not read → UNVERIFIED whether these dates change).
- **Scanner heuristics:** not observable (product design); possibly product pages of electronics.
- **Affects:** sellers/manufacturers of devices with batteries.
- **Source:** https://eur-lex.europa.eu/eli/reg/2023/1542/oj/eng · CWP 2027 Annex II (above)

## UP-12 Omnibus VIII — EPR authorised representatives

- **Acts:** COM(2025) 982 (Regulation suspending authorised-representative rules for EPR for batteries and packaging) and COM(2025) 983 (Directive, waste/WEEE/single-use plastics), 10.12.2025.
- **Status:** PROPOSAL, priority pending (CWP 2027 Annex II).
- **Relevance:** cross-border distance sellers would (if adopted) not need an authorised representative for EPR in other Member States. Not observable.
- **Source:** CWP 2027 Annexes (above). Content details UNVERIFIED (proposal text not opened).

## UP-13 Data Act (EU) 2023/2854 — remaining dates

- **Status:** PARTLY — applies since 12.09.2025; Art. 3(1) design duty for connected products placed after 12.09.2026 (now applicable).
- **Upcoming:** **12.01.2027** no switching charges for data processing services (Art. 29(1)); **12.09.2027** Chapter IV (unfair B2B terms) for old contracts of indefinite duration or expiring ≥ 10 years from 11.01.2024. Digital Omnibus (UP-01) would ease switching rules for custom services/SMEs.
- **Scanner heuristics:** SaaS/cloud sites: price list/T&Cs mentioning switching/egress fees after 12.01.2027.
- **Source:** https://eur-lex.europa.eu/eli/reg/2023/2854/oj/eng (Art. 50, Art. 29 quoted)

## UP-14 DE Preisangabengesetz amendment (sanctions)

- **Act:** Government draft BT-Drs. 21/5873 (11.05.2026): fines up to EUR 100,000 for price-indication breaches; enables Länder price authorities to fine AFIR EV-charging price violations; consequential change § 20 PAngV. Separate later PAngV amendment on charging points announced.
- **Status:** first reading 21.05.2026; committee recommendation dated 08.07.2026 and adoption reported in search results → final adoption/promulgation UNVERIFIED.
- **Relevance:** low for ordinary websites (EV charging); note only that fine ceilings may rise.
- **Source:** https://www.bundestag.de/dokumente/textarchiv/2026/kw21-de-preisangabenrecht-1174766
- **Note:** CCD2 law (UP-05) also amends PAngV (Art. 8 of BGBl. 2026 I Nr. 139) — content UNVERIFIED.

---

## Dropped / not upcoming (for the skill's internal reference)

- **Green Claims Directive** COM(2023) 166, 2023/0085(COD): OEIL "Awaiting Council's 1st reading position"; **Commission Work Programme 2027 (04.11.2026) Annex III No. 4 lists it for withdrawal** ("intends to withdraw within six months"; Council failed to agree mandate in June 2024). Not yet formally withdrawn in OJ → report as "voraussichtlich zurückgezogen". Applicable instead: Empowering Consumers Directive (EU) 2024/825 (applies 27.09.2026; per secondary source — date not re-verified here → UNVERIFIED) / UWG. Sources: https://oeil.europarl.europa.eu/oeil/en/procedure-file?reference=2023/0085(COD) · CWP 2027 Annexes (above).
- **ePrivacy Regulation** COM(2017) 10: withdrawn, end of validity **06.10.2025** (notice 52025XC05423). ePrivacy Directive 2002/58/EC + TDDDG remain. Source: https://eur-lex.europa.eu/legal-content/EN/ALL/?uri=CELEX%3A52017PC0010
- **NIS2 Germany (NIS2UmsuCG):** in force since 06.12.2025 per secondary sources (BGBl. 2025 I Nr. 301 — UNVERIFIED, not fetched). Current law, not upcoming; mostly not website-observable.
- **Directive (EU) 2023/2673 (withdrawal function)**, **GPSR**: already applicable (skipped as instructed).
- **Instant Payments Regulation**: not website-relevant for ordinary sites — dropped.
- **DDG/Impressum changes:** no German draft found (searched BMJV/Bundestag) — none listed.
- **Digital Networks Act** COM(2026) 16 (amends Directive 2002/58/EC): pending; effect on cookie rules not checked → UNVERIFIED, not listed.
- **CWP 2027 Annex I No. 6** "Digital transformation package, simplification and copyright" (Q2 2027) — content unknown; watch item.
- **Financial Data Access (FiDA)** COM(2023) 360: listed for withdrawal (CWP 2027 Annex III No. 5) — not website-relevant.

## UNVERIFIED list

1. Exact OJ publication/entry-into-force date of Reg. (EU) 2026/1744 (24.07./27.07.2026 from secondary sources).
2. Council mandate details on automated browser signals (Art. 88b) — only press release read.
3. DFA adoption date (expected mid-Nov 2026).
4. KIDS Act procedure number 2026/0286(COD).
5. Inkrafttreten provisions of DE CCD law (BGBl. 2026 I Nr. 139) and its PAngV/UWG changes.
6. DE ProdHaftG reform entry into force 09.12.2026 (from draft, not BGBl text).
7. OJ citation of EN 301 549 V4.1.1 (expected 16.12.2026) and its WCAG 2.2 basis.
8. PPWR empty-space ratio application date; Annex II product list of R2R Directive.
9. Whether Omnibus VIII changes Batteries Reg. dates.
10. Final adoption/promulgation of Preisangabengesetz amendment (Drs. 21/5873).
11. EmpCo (EU) 2024/825 application date 27.09.2026 (not re-fetched).
12. NIS2UmsuCG BGBl reference.
