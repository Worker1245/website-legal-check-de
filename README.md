# website-legal-check-de

**Website-Check für deutsches Recht als Skill für [Claude Code](https://claude.com/claude-code):** findet Lücken bei Datenschutz, Cookies, Impressum, Preisangaben, Widerruf und Barrierefreiheit. Zu jeder Lücke gibt es Beleg, Priorität und die Behebung gleich dazu.

- **Belegt statt vermutet:** Der Skill lädt die Website wie ein Erstbesucher, der in der Cookie-Abfrage noch nichts angeklickt hat, und hält fest, was wirklich geladen wird: Tracker, Schriften, Cookies, Speicher.
- **Klare Wahl für Besucher:** Bei der Cookie-Abfrage zählt nicht nur, dass es sie gibt. Der Skill meldet, wenn „Ablehnen“ fehlt oder schwerer erreichbar ist als „Akzeptieren“. Er klickt außerdem selbst auf „Ablehnen“ und prüft, ob danach trotzdem Tracker laden, etwa weil im Tag Manager eine Einwilligungsbedingung fehlt. Das Mock-up zeigt eine Abfrage mit gleichwertigen Knöpfen, kurzem Text zum Zweck und dem Weg zum Widerruf. Farben, Ton und Platzierung bestimmt der Betreiber.
- **Priorisiert:** Priorität 1 heißt sofort erledigen. ⚠ markiert Pflichten, die häufig abgemahnt werden.
- **Direkt umsetzbar:** Schritt-für-Schritt-Anleitungen für Laien, zugeschnitten auf das erkannte System (z. B. WordPress, Shopify, Wix), dazu Textentwürfe, Mock-ups der korrigierten Stelle, amtliche Quellen und auf Wunsch ein Prompt, mit dem Claude Code oder Codex die Lücken im Code behebt.
- **Berichte in jeder Sprache, eine oder mehrere Websites:** Deutsch und Englisch sind fest eingebaut. Andere Sprachen übersetzt Claude bei der Prüfung, mit einem Hinweis im Bericht. Mehrere Websites lassen sich in einem Aufruf prüfen.
- **Kostenlos und lokal:** Open Source (GPL-3.0). Die Prüfung läuft auf dem eigenen Rechner.

**Technische Prüfung, keine Rechtsberatung.**

## Schnellstart

Voraussetzungen: Claude Code und Node.js 22 oder neuer.

```bash
git clone https://github.com/Worker1245/website-legal-check-de.git
cd website-legal-check-de
npm ci
npx playwright install chromium
ln -s "$PWD" ~/.claude/skills/website-legal-check-de
```

Dann in Claude Code:

```
/website-legal-check-de www.beispiel.de
```

Vor der Prüfung fragt der Skill je Website kurz nach, was entstehen soll:

1. `Fragen und Antworten auf Deutsch oder Englisch? / Questions and answers in German or English? (G/E)`: Sprache der weiteren Fragen und der Antwort.
   Danach: `In welcher Sprache sollen die Dokumente erstellt werden? (G = Deutsch, E = Englisch oder Sprache eingeben, z. B. Französisch)`: Sprache der PDFs und des Prompts. Bei einer anderen Sprache übersetzt Claude die festen Texte aus der englischen Fassung; die PDFs tragen dann einen Hinweis, dass die Übersetzung von einer KI stammt und nicht von einem Menschen geprüft wurde. Die Dateinamen bleiben englisch. Textentwürfe für die Website bleiben immer deutsch.
2. `PDF Kurzfassung gewünscht? (Y/N)`
3. `PDF Langfassung gewünscht? (Y/N)`
   Danach: `Uhrzeit der Prüfung im Dokument angeben? (Y/N)`: Bei Y steht hinter dem Datum die Uhrzeit (HH:MM).
4. Nur bei Langfassung: `Wurde die Website mit KI (Vibe-Coding) erstellt? (U = unbekannt)`, Antwort Y, N oder U: Bei Y enthält die Langfassung einen Prompt zur Behebung. Bei U entscheidet das erkannte System: Bei einem Baukasten oder CMS gibt es keinen Prompt, sonst schon; die Langfassung nennt das als Annahme.
5. Nur bei KI = Y oder U: `Den Prompt zur Behebung mit KI (Auftrag für Claude Code, Codex o. Ä., steht in der Langfassung) zusätzlich als Textdatei (.txt) speichern? (Y/N)`
6. Nur bei Langfassung, als letzte Frage: `Mock-ups mit erstellen? (Mock-ups sind Bilder, die zeigen, wie eine korrigierte Stelle aussehen kann …) (Y/N)`

Gibt es im Arbeitsordner einen höchstens 30 Tage alten früheren Scan derselben Website, fragt der Skill, ob er ihn wiederverwenden soll: Dann prüft er jede Seite kurz auf Änderungen, übernimmt unveränderte Seiten samt Belegfotos und bereits geprüften Befunden, ohne die Fotos zu kopieren oder erneut anzusehen, und scannt nur geänderte Seiten neu. Ist für eine Website keine PDF gewünscht, wird sie übersprungen. Bei mehreren Websites stellt der Skill zuerst alle Fragen und prüft danach eine Website nach der anderen; ist eine nicht erreichbar, macht er mit der nächsten weiter. Bei mehr als fünf Websites fragt er beide Sprachen einmal für alle und dann, ob alle gleich untersucht werden sollen. Bei Ja gelten die übrigen Antworten für alle Websites. Nach der Prüfung fragt er nur noch, ob die Dateien (PDF, Textdatei) auch in den Chat sollen; dann lassen sie sich z. B. direkt auf dem Smartphone herunterladen. Weitere Fragen stellt er nicht: Ob eine Website an Verbraucher verkauft oder wie groß das Unternehmen ist, leitet er aus der Website ab und nennt seine Annahmen im Bericht.

| Eingabe | Wirkung |
|---|---|
| `/website-legal-check-de www.beispiel.de` | Startseite und Unterseiten |
| `/website-legal-check-de https://shop.beispiel.de` | Ebenso für einen Shop oder eine Subdomain |
| `/website-legal-check-de www.beispiel.de mit 40 Unterseiten` | Größere Stichprobe (bis zu 200 zusätzliche Seiten) |
| `/website-legal-check-de www.beispiel.de ohne Tiefenprüfung` | Nur die Stichprobe, ohne Auswertung der Sitemap |
| `/website-legal-check-de seite-a.de; seite-b.de` | Mehrere Websites nacheinander |
| `/website-legal-check-de` | Hilfe und Beispiele |

## Was Sie bekommen

Jede Prüfung erhält einen eigenen Ordner im aktuellen Verzeichnis, `JJJJMMTT_<website>_<SPRACHE>/`, mit Bindestrichen statt Punkten und dem Kürzel der Dokumentsprache, z. B. `20261108_beispiel-de_DE/`. Sonst zeigt macOS Ordner wie `…_beispiel.app` als Programm an. Weitere Prüfungen derselben Website am selben Tag sind Revisionen, auch in einer anderen Sprache: `20261108_beispiel-de_FR_Ref2/`. Die Dateinamen folgen derselben Reihenfolge, z. B. `20261108_beispiel_Kurzbericht_DE.pdf` oder `20261108_beispiel_ShortReport_FR_Ref2.pdf`.

| Datei | Inhalt |
|---|---|
| `JJJJMMTT_<projekt>_Kurzbericht_<SPRACHE>.pdf` | Zum Weiterleiten an die Betreiber der Website: alle Befunde je eine Zeile, nach Priorität gegliedert, mit ⚠-Markierung, Annahmen und kommenden Regeln |
| `JJJJMMTT_<projekt>_Langfassung_<SPRACHE>.pdf` | Klickbares Inhaltsverzeichnis, je Befund eine Seite mit Steckbrief (Priorität, Fundstelle, Kurzbeschreibung, Vorschrift, Beleg, jeweils mit einer Erklärung in einfachen Worten), Beleg, Schritt-für-Schritt-Anleitung, Textentwurf und Mock-up, Prüfumfang, kommende und diskutierte Regeln, Abbildungs-, Tabellen- und Quellenverzeichnis, Rechtshinweis |
| `JJJJMMTT_<projekt>_KI-Prompt_<SPRACHE>.txt` | Nur auf Wunsch bei KI-erstellten Websites: Auftrag für Claude Code oder Codex, der alle Befunde ohne Rückfragen im Code behebt; Unbekanntes wird als sichtbarer Platzhalter gesetzt |
| `daten/` | Rohdaten und Belege (Bildschirmfotos, Messwerte), damit sich Befunde nachvollziehen lassen |

Auf Englisch heißen die Dateien `…_ShortReport.pdf`, `…_LongReport.pdf` und `…_AI-Prompt.txt`. Beide PDFs beginnen mit einer festen Kurzerklärung, was im Dokument steht (Sätze zu abgewählten Teilen wie Mock-ups, Prompt oder Langfassung entfallen), und folgen recherchierten Formatierungsregeln (Tabellenüberschrift oben, Abbildungsunterschrift unten, 11 pt mit 1,5-fachem Zeilenabstand, Flattersatz, Schreibweisen nach DIN 5008). Sie nennen das erkannte System, Skill, Version und dieses Repository, nutzen nur die frei lizenzierte Schrift Source Sans 3 und betten Bildschirmfotos verkleinert ein.

## Wie er arbeitet

1. **Aktualität:** Sind die Rechtsquellen älter als einen Monat, ruft der Skill sie neu ab und sucht nach Änderungen bei Gesetzen, Rechtsprechung und Leitlinien. Relevantes fließt in den Bericht ein.
2. **Scan:** Ein Browser ohne Fenster (Playwright/Chromium) lädt die Startseite, alle Seiten aus Kopf, Fuß und Navigation, die Rechtsseiten und bis zu 20 weitere Seiten. Danach ergänzt er aus der Sitemap Seitentypen, die noch fehlen (Produkt, Warenkorb, Kasse, Konto, Kontakt, Blog). Die Barrierefreiheit prüft er mit axe-core. Zum Schluss öffnet er die Startseite zweimal in einem frischen Browser, klickt einmal auf „Ablehnen“ und einmal auf „Akzeptieren“ und zeichnet auf, was danach auf der Startseite und zwei Unterseiten geladen wird, bevorzugt Inhaltsseiten statt Impressum oder Datenschutz.
3. **Automatische Prüfung und System-Erkennung:** 31 Prüfpunkte aus einer gepflegten Prüfliste liefern Kandidaten für Befunde. Zusätzlich erkennt der Skill, womit die Website gebaut ist (WordPress mit WooCommerce, Divi oder Elementor, Shopify, Wix, Jimdo, Squarespace, Webflow, TYPO3, Shopware).
4. **Kontrolle:** Claude prüft jeden Kandidaten anhand der Belege, verwirft Fehlalarme, vergibt Priorität und ⚠-Markierung, trifft Annahmen zum Geltungsbereich und schreibt die Anleitungen so, dass Laien sie umsetzen können, für das erkannte System mit Klickwegen aus dessen offizieller Hilfe (Stand und Quelle je System in `references/platforms.md`); wo die Hilfe nichts belegt, bleiben die Schritte allgemein.
5. **Quellen:** Jede zitierte amtliche Quelle wird während der Prüfung erneut abgerufen; nicht erreichbare werden nicht zitiert.
6. **Berichte:** Ein Skript erzeugt aus einer Datendatei die gewünschten PDFs und den Prompt, alle in derselben Reihenfolge.

## Was er prüft

- Impressum und Datenschutzerklärung auf jeder Seite erreichbar (§ 5 DDG, Art. 13 DSGVO)
- Tracker, Schriften, Videos, Cookies und Speicher vor der Einwilligung; Cookie-Banner ohne gleichwertiges „Ablehnen“ (§ 25 TDDDG)
- Tracker und Cookies nach dem Klick auf „Ablehnen“ (§ 25 TDDDG); Pings von Google Consent Mode nach dem Ablehnen (`gcs=G100`) als Hinweis zum Prüfen, weil ihre Bewertung nicht abschließend geklärt ist
- Dienste, die nach dem Klick auf „Akzeptieren“ laden, aber in der Datenschutzerklärung fehlen (Art. 13 DSGVO)
- HTTPS, gemischte Inhalte, Formulare über http
- Preisangaben mit Mehrwertsteuer und Versand (PAngV), Bestellknopf (§ 312j BGB), Kündigungsknopf (§ 312k BGB), Online-Widerrufsfunktion (§ 356a BGB), Verbraucherstreitbeilegung (VSBG), veraltete Links zur EU-OS-Plattform, Herstellerangaben (GPSR)
- Barrierefreiheit (WCAG 2.1 A/AA) und Erklärung zur Barrierefreiheit (BFSG)
- Hinweise zu Chatbots (KI-Verordnung), Inhalten von Nutzern (DSA), Newslettern und Umweltaussagen (UWG)
- Kommende und diskutierte Regeln in einem eigenen Kapitel

Dazu kommen 22 Punkte, die sich von außen nicht prüfen lassen (z. B. Verträge zur Auftragsverarbeitung); sie stehen als Fragen an die Betreiber im Bericht.

## Grenzen

- **Keine Rechtsberatung.** Der Skill beschreibt technische Beobachtungen und den allgemeinen rechtlichen Zusammenhang, er bewertet nicht den Einzelfall. Textentwürfe sind allgemeine Vorlagen und müssen vor der Veröffentlichung geprüft werden.
- Nicht geprüft werden Seiten hinter einer Anmeldung, der letzte Schritt einer Bestellung, interne Abläufe und Verträge.
- Wer fremde Websites gegen Bezahlung prüft, sollte selbst klären, ob das Rechtsdienstleistungsgesetz (RDG) berührt ist.

## Mitmachen

Fehlalarme, übersehene Lücken oder geänderte Rechtslage bitte als [Issue](https://github.com/Worker1245/website-legal-check-de/issues) melden, am besten mit Prüf-ID, betroffener Seite und Quelle.

## Entwicklung

```bash
npm test
```

Die Tests prüfen lokale Testseiten (eine mit eingebauten Lücken, eine ohne) und greifen nie auf das Internet zu. Die Prüfliste (`references/checklist.md`), die Quellen (`references/sources.md`) und die kommenden Regeln (`references/upcoming.md`) tragen ein Stand-Datum; Änderungen werden nach `references/update.md` eingepflegt. Die Dateien des Skills selbst sind auf Englisch, alle Ausgaben für Nutzer auf Deutsch.

## Lizenz

Copyright (C) 2026 Worker1245

Dieses Programm ist freie Software: Sie können es unter den Bedingungen der GNU General Public License, wie von der Free Software Foundation veröffentlicht, weitergeben und/oder verändern, entweder gemäß Version 3 der Lizenz oder (nach Ihrer Wahl) jeder späteren Version (GPL-3.0-or-later). Es wird ohne jede Gewährleistung bereitgestellt. Den vollständigen Lizenztext enthält [LICENSE](LICENSE).

Die erzeugten Berichte und PDFs sind keine Bearbeitung des Programms; für sie gilt die GPL nicht. Mitgenutzte Bausteine behalten ihre eigenen Lizenzen (u. a. Playwright: Apache-2.0, axe-core: MPL-2.0, Paged.js und pdf-lib: MIT, Schrift Source Sans 3: SIL Open Font License 1.1).
