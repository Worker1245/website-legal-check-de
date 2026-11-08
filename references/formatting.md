# Formatting rules for the PDFs

Status: 2026-11-08. Researched rules for German reports, with sources (all fetched on 2026-11-08). The section "Applied in this skill" lists what the report builder implements; deliberate deviations are named.

## Applied in this skill

- Table captions above the table, figure captions below; numbered "Tabelle n: …" / "Abbildung n: …" (English: Table/Figure); caption kept with its table.
- Body text 11 pt (Source Sans 3), line spacing 1.5, left-aligned (ragged right), paragraphs at most about 150 mm wide (about 80 characters); table text 11 pt; captions, footers and notes 9–10 pt.
- Page margins 20 mm, left 25 mm; "Seite x von y" centred at the bottom; running header in the long report.
- Dates TT.MM.JJJJ; protected space after § and before %; narrow protected space in abbreviations such as „z. B.“; quotation marks „…“.
- Deviations: lists of figures and tables stay at the end of the long report (user decision), although German academic guides put them after the table of contents; findings keep the numbering of the short report instead of decimal chapter numbers (DIN 1421), so both PDFs share one order; no Roman page numbers for front matter; 11 pt instead of the 12 pt that accessibility guides recommend, to keep the reports compact.

## Sources fetched
- S1 DIN 5008:2020-03 table of contents (din.de): https://www.din.de/de/mitwirken/normenausschuesse/nia/veroeffentlichungen/wdc-beuth:din21:318422674/toc-3134524/download
- S2 DIN Media entry for DIN 5008:2011-04, marked "withdrawn, replaced by DIN 5008:2020-03": https://www.dinmedia.de/en/standard/din-5008/137578108
- S3 DIN Media entry for DIN 1421:1983-01, marked "current", title "Gliederung und Benummerung in Texten": https://www.dinmedia.de/en/standard/din-1421/1011496
- S4 Uni Passau, "DIN 5008" handout (2018): https://www.uni-passau.de/fileadmin/dokumente/beschaeftigte/kommunikation_marketing/webredaktion/DIN_5008.pdf
- S5 Uni Gießen, AG Ernährungsökologie, "Leitfaden … Bachelor- & Masterarbeiten" (as of 09.10.2017): https://uni-giessen.de/resolveuid/29e3fa37697347f2a65cba3de2ec04e7
- S6 BHT Berlin, "Leitfaden Abschlussarbeiten – Sprache und Layout" (taken from the TU Berlin FZA guide, March 2023): https://prof.bht-berlin.de/fileadmin/prof/iholfelder/Leitfaden_Abschlussarbeiten_Sprache_und_Layout.pdf
- S7 Uni Heidelberg, MoBi4all "Abbildungen und Tabellen" (2014): https://backend.ingwiss.uni-heidelberg.de/de/dokumente/leitfadenabbildungenundtabellen/download
- S8 Duden, rules on quotation marks: https://www.duden.de/sprachwissen/rechtschreibregeln/anfuehrungszeichen
- S9 Duden, rules on numbers and digits: https://www.duden.de/sprachwissen/rechtschreibregeln/zahlen-und-ziffern
- S10 Duden, rules on abbreviations: https://www.duden.de/sprachwissen/rechtschreibregeln/abkuerzungen
- S11 Wikipedia (de), "Prozentzeichen" (secondary): https://de.wikipedia.org/wiki/Prozentzeichen
- S12 Wikipedia (de), "Paragraphzeichen" (secondary): https://de.wikipedia.org/wiki/Paragraphzeichen
- S13 Purdue OWL, APA 7 tables and figures (apastyle.apa.org refused automated access): https://owl.purdue.edu/owl/research_and_citation/apa_style/apa_formatting_and_style_guide/apa_tables_and_figures.html
- S14 BFIT-Bund, "Leitfaden für barrierefreie Textgestaltung in User-Interface-Elementen" v6.0: https://handreichungen.bfit-bund.de/bfit-leitfaeden/6.0/pdf/bfmb_barrierefreie-textgestaltung-uie.pdf
- S15 BAR e. V., Factsheet "Barrierefreie Dokumente – Word" (2022): https://www.bar-frankfurt.de/fileadmin/dateiliste/_publikationen/reha_grundlagen/pdfs/FactsheetBFdocppt.web.pdf
- S16 VNR/experto "Spezialreport DIN 5008", page numbering in letters (undated, secondary): https://moodle.ruhr-uni-bochum.de/pluginfile.php/2731775/mod_resource/content/1/Spezialreport_DIN_5008.pdf

## Status of the standards
- DIN 5008:2020-03 ("Schreib- und Gestaltungsregeln für die Text- und Informationsverarbeitung") is the current edition (S1, S2). Its table of contents includes sections on: 7.2 protected space, 8.3/8.4 quotation marks, 9.1 paragraph sign, 10.7 percent and per-mille signs, 11.4 dates, units, 16.3.3 figure captions ("Bildunterschrift"), 17.6 and 18.7 tables of contents, 18.5 headers and footers, 18.8 further lists and appendices, 20.17 page numbering, and F.3 narrow space (S1). **What these sections say is UNVERIFIED here.**
- DIN 1421:1983-01 is still current (S3). Its content is UNVERIFIED (see section 3).

## 1. Caption placement
| Rule | Type | Source |
|---|---|---|
| **Table:** caption **above** the table ("Überschrift") | Conv. (consistent across all German guides found) | S5, S6, S7 |
| **Figure:** caption **below** the figure ("Unterschrift") | Conv. | S5, S6, S7 |
| DIN 5008:2020 has a section called "Bildunterschrift" (16.3.3), which suggests figure captions go below; its content is UNVERIFIED | Norm (title only) | S1 |
| Captions are left-aligned (S6); the caption stays on the same page as its table or figure (S6) | Conv. | S6 |
| Source line goes after the caption or legend, e.g. "eigene Darstellung" (S5), or in brackets below the object (S6) | Conv. | S5, S6 |
| **APA 7 (English) differs:** the number and title go **above** both tables **and** figures, notes go below; the number is bold, the title italic in title case | Conv. (APA 7) | S13 |

Recommendation for German reports: put table captions above and figure captions below. Use APA placement only for an English report that has to follow APA.

## 2. Caption wording and numbering
- Number tables and figures **separately**, each in its own consecutive sequence (S5, S6). There are two variants:
  - continuous numbering across the whole document, appendix included: "Tab. 3", "Abb. 8" (S5)
  - per chapter: "Tab. 2.2", "Abb. 3.1", where the first number is the chapter and the second counts within it (S6).
- Short forms "Abb." and "Tab." are used in captions and in references in the text (S5, S6). The long forms "Abbildung 1:" and "Tabelle 1:" are also common, but no fetched source prescribes them: treat as Conv., UNVERIFIED as a rule. Separator: a colon (S5, S6 examples). S7 uses a bold number and title followed by a full stop.
- Every table and figure must be referenced in the text by its number at least once (S6, S7; APA: S13).
- Captions should be understandable without the text (S5, S7). Charts should have no title of their own; the caption carries it (S6).
- Diagrams count as figures (S6). Tables longer than one page continue with "(Fortsetzung Tab. X)" and a repeated table header (S5).
- APA: number in Arabic numerals in the order of first mention, no "3a"; appendix items are numbered "A1" (S13).

## 3. Table of contents
- Use decimal numbering "1, 1.1, 1.1.1" (S5 recommends the decimal system; S6 uses it). Go **at most 3 levels deep** (S5).
- Never a single subsection: if there is an X.1, there must be an X.2 (S5, S6).
- The TOC lists number, title and page number. S5's example shows dot leaders and page numbers aligned right; front-matter lists carry Roman page numbers (III, IV, V) (S5). Convention.
- DIN 1421: a secondary search snippet said there is no full stop after the last digit ("1.2", not "1.2."). The underlying page was not fetched, so this is **UNVERIFIED**. The DIN 1421 standard itself is current (S3).
- DIN 5008 sections 17.6 and 18.7 cover tables of contents; their content is UNVERIFIED (S1).

## 4. Numbers, dates, units, abbreviations, quotation marks
| Rule | Type | Source |
|---|---|---|
| Numeric date "17.07.2018", 2-digit year "17.07.18", or ISO "2018-09-04", with no spaces | Norm DIN 5008 (secondary summary) | S4 |
| Date with the month written out: "3. August 2018", "3. Aug. 2018" | Norm DIN 5008 (secondary) | S4 |
| Times: "05:30 Uhr", "8 Uhr" | Norm DIN 5008 (secondary) | S4 |
| "bis" written as an en dash with spaces: "2010 – 2018", "7 – 10 Euro"; writing out "bis" is preferred | Norm DIN 5008 (secondary) | S4 |
| Group digits in threes with a space: "103 500", "46 647 468,25" | Norm DIN 5008 (secondary) | S4 |
| Duden: group whole numbers from **5 digits** upward; do not group years and postcodes | Conv. (Duden) | S9 |
| Money amounts may be grouped with a full stop: "1.234.450 Euro", "1.365,35 Euro" | Norm DIN 5008 (secondary) | S4 |
| Decimal comma (German) | Norm/Duden | S4, S9 examples |
| Space between number and unit: "12 km", "–5 °C", "3 – 4 kg" | Duden + DIN 5008 (secondary) | S9, S4 |
| Space between number and %: "19 %", using a protected (non-breaking) space; Duden suggests a smaller fixed space. In compounds there is no space: "5-%-Klausel" | Norm DIN 5008 per secondary source; DIN wording UNVERIFIED | S11; S1 lists §10.7 |
| Space after §: "§ 433 BGB", preferably non-breaking; the plural is "§§ 433 ff." | Norm DIN 5008 per secondary source; DIN wording UNVERIFIED | S12; S1 lists §9.1 |
| Multi-word abbreviations are separated by spaces: "z. B.", "u. a. m.", "i. A."; but "usw.", "usf." take no space | Norm DIN 5008 (secondary); Duden examples "a. D." | S4, S10 |
| Use a narrow or non-breaking space inside "z. B." | Practice; DIN 5008 Annex F.3 "Schmal-Leerzeichen" exists, but its content is UNVERIFIED | S1 |
| Quotation marks „…“; nested quotes ‚…‘ | Conv. (Duden D 12); DIN 5008 §8.3/8.4 exist, content UNVERIFIED | S8, S1 |
| Ellipsis with spaces on both sides: "die Sache … hat" | Norm DIN 5008 (secondary) | S4 |
| Slash without spaces: "2016/2017", "km/h" | Norm DIN 5008 (secondary) | S4 |

## 5. Page numbering, headers and footers, order of lists
- **Long report (convention for academic work):** the title page carries no number. The front matter (table of contents, lists of figures, tables and abbreviations) is numbered in Roman numerals, and the TOC is page II. The main text, bibliography and appendix are numbered 1, 2, 3 … in Arabic numerals (S5; S6 is similar). For a business report, plain Arabic numbering throughout is acceptable; that is a design choice, not a rule.
- **"Seite x von y":** DIN 5008 allows "Seite 2 von 3", preferably at the right margin. If the numbering starts at "Seite 1 von 2", the first page gets a number as well. This is stated for **letters** in a secondary report (S16). The general page-numbering rule (DIN 5008 §20.17) and the header/footer rule (§18.5) are UNVERIFIED (S1).
- **Order of the lists:** the lists of figures, tables and abbreviations come **directly after the TOC**, each on a new page (S5). The lists of figures and tables give number, title and page, without units or sources (S5, S6). Appendix items are left out of these lists in S6 but counted in S5, so check before choosing. Abbreviations are sorted alphabetically and spelled out at first use (S5). The bibliography or source list goes after the main text (S5).
- Every main chapter starts on a new page (S6); this is a convention.

## 6. Legibility
| Rule | Type | Source |
|---|---|---|
| Body text 11 pt (Arial) or 12 pt (Times); headings 16/14 pt; line spacing 1.5 | Conv. (academic) | S6, S5 (12 pt) |
| Accessible documents: sans-serif font, **at least 12 pt**, line spacing ≥ 1.5 × font size, no italic or underlined text | Conv. (BAR factsheet) | S15 |
| Line spacing ≥ 1.5 ×; line length **at most about 80 characters** including spaces | Conv. (BFIT-Bund) | S14 |
| **Left-aligned text (ragged right) is more legible than justified text** | Conv. (BFIT-Bund) | S14 |
| Contrast ≥ 4.5:1 (large or bold text ≥ 3:1) | Conv., in line with WCAG | S14 |
| Academic guides often require justified text (S5, S6). This conflicts with the accessibility guidance (S14). Recommendation for the generator: left-aligned | — | S5, S6 vs S14 |
| Text inside figures and tables at least body-text size (S5); captions may be set in a different (smaller) size from the body text (S7) | Conv. | S5, S7 |
| Minimum caption size in pt: no source found, **UNVERIFIED**. Suggested 9–10 pt; this is an assumption | — | — |
| DIN 1450 (legibility) is cited by S14 for screen sizes in px (body text 22 px desktop); this is not a print rule, and DIN 1450 was not fetched | Norm (secondary) | S14 |

## Implementation summary for the generator
1. Captions: table caption above, figure caption below, left-aligned, "Tabelle n: …" / "Abbildung n: …" (or "Tab./Abb."). Keep one style throughout and use separate continuous numbering; references in the text read "(siehe Abbildung 3)".
2. TOC (long report only): decimal numbering to at most 3 levels, no trailing full stop (UNVERIFIED DIN 1421), dot leaders, page numbers aligned right.
3. Order of the long report: title page, legal notice (placement is a design choice), TOC, lists of abbreviations, figures and tables, main text, source list, appendix.
4. Typography: „…“; narrow no-break space (U+202F) in "z. B."; no-break space (U+00A0) in "19 %", "§ 25", "12 km"; dates as TT.MM.JJJJ; digit groups with a space from 5 digits; decimal comma.
5. Footer: "Seite x von y" aligned right (adapted from the DIN 5008 letter rule, S16).
6. Layout: body text 11–12 pt sans-serif, left-aligned, line spacing 1.5 × (S14, S15), at most about 80 characters per line, contrast ≥ 4.5:1.
