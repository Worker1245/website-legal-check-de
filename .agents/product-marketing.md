# Product Marketing Context

**Document version:** v16
**Last updated:** 2026-11-08

Entwurf aus README, SKILL.md, Prüfliste und Quellenliste abgeleitet. Mit „(Annahme)“ markierte Punkte sind nicht durch Nutzerbefragungen belegt.

## Product Overview
**One-liner:** Claude-Code-Skill, der deutsche Websites auf DSGVO-, Cookie-, Impressum- und Shop-Pflichten prüft und zu jeder Lücke die Behebung gleich mitliefert.
**What it does:** Lädt eine Website wie ein Erstbesucher ohne Einwilligung, findet technische Lücken bei zentralen Pflichten nach deutschem und EU-Recht und belegt sie mit Anfragen, Cookies und Bildschirmfotos. Priorisiert die Lücken, markiert häufige Abmahngründe und liefert Textentwürfe, Mock-ups, amtliche Quellen und auf Wunsch einen KI-Prompt, der die Lücken im Code behebt.
**Product category:** Website-Compliance-Check / Datenschutz- und Impressum-Prüfung für Websites (Regal: „Website DSGVO Check“, „Cookie-Banner prüfen“, „Abmahnung vermeiden“).
**Product type:** Open-Source-Skill für Claude Code (lokal ausgeführt, Node.js + Playwright).
**Business model:** Kostenlos, GPL-3.0-or-later. Kein Bezahlangebot.

## Target Audience
**Target companies:** Kleine und mittlere Unternehmen, Online-Shops, Selbstständige und Agenturen mit Websites für den deutschen Markt (Annahme).
**Decision-makers:** Inhaber, Webentwickler und Agenturen, die Websites bauen oder betreuen; Menschen, die Websites mit KI-Werkzeugen erstellen („Vibe-Coding“) (Annahme).
**Primary use case:** Vor dem Livegang oder nach Änderungen schnell sehen, welche gesetzlichen Pflichten eine Website technisch verfehlt, und die Lücken ohne lange Recherche schließen.
**Jobs to be done:**
- „Zeig mir, was an meiner Website rechtlich fehlt – mit Beleg, nicht mit Bauchgefühl.“
- „Gib mir den Text, das Mock-up oder den Prompt, mit dem ich es sofort behebe.“
- „Gib mir etwas, das ich dem Kunden bzw. Seitenbetreiber weiterleiten kann.“
**Use cases:**
- Agentur prüft eine Kundenseite vor der Abnahme und leitet den Kurzbericht weiter.
- Shop-Betreiber prüft Preisangaben, Widerruf und Bestellknopf.
- Mit Claude Code oder Codex gebaute Website: KI-Prompt aus der Langfassung direkt ins Projekt geben.
- Agentur prüft mehrere Kundenseiten in einem Durchgang.
- Englischsprachige Betreiber oder Teams, die deutsche Websites betreuen, erhalten den Bericht auf Englisch (Annahme).

## Personas
| Persona | Cares about | Challenge | Value we promise |
|---------|-------------|-----------|------------------|
| Agentur / Freelancer | Schnelle, belastbare Abnahme | Rechtsthemen kosten Zeit, Kunden fragen nach | Belegte Lückenliste und weiterleitbares PDF in einem Lauf |
| Website- oder Shop-Inhaber | Keine Abmahnung, kein Bußgeld | Weiß nicht, was fehlt | Priorisierte Liste: zuerst das Wichtige |
| Vibe-Coder | Website schnell fertig und sauber | KI-generierter Code bindet oft Tracker und Fonts ungefragt ein | Fertiger Prompt, der die Lücken im Code behebt |

## Problems & Pain Points
**Core problem:** Viele Websites laden Tracker, Schriften oder Videos vor der Einwilligung, haben lückenhafte Pflichtangaben oder falsche Preisangaben – und die Betreiber merken es nicht.
**Why alternatives fall short:**
- Rechtstext-Generatoren schreiben Texte, prüfen aber nicht, was die Website tatsächlich lädt.
- Reine Cookie- oder Barrierefreiheits-Scanner decken nur einen Ausschnitt ab und helfen nicht bei der Behebung (Annahme).
- Anwaltliche Prüfung ist gründlich, aber teuer und nicht bei jeder Änderung machbar.
**What it costs them:** Abmahnkosten, Bußgeldrisiko, Zeit für Recherche in Gesetzestexten.
**Emotional tension:** Unsicherheit („Bin ich abmahnbar?“), Überforderung durch viele Einzelvorschriften.

## Competitive Landscape
**Direct:** Kommerzielle Website-Compliance-Scanner — prüfen oft nur Cookies/Tracker, liefern selten Textentwürfe und Code-Prompt (Annahme).
**Secondary:** Rechtstext-Generatoren — erzeugen Texte ohne Abgleich mit der echten Website.
**Indirect:** Anwaltliche Prüfung, eigene Checklisten — gründlich bzw. günstig, aber langsam und nicht belegt.

## Differentiation
**Key differentiators:**
- Prüft, was die Website wirklich lädt (Anfragen, Cookies, Speicher) – vor jeder Einwilligung.
- Jede Lücke mit Beleg, Vorschrift, Priorität und ⚠ bei häufigen Abmahngründen.
- Behebung inklusive: Textentwürfe, Mock-ups, amtliche Quellen, KI-Prompt für Claude Code oder Codex.
- Nur tatsächlich abgerufene, amtliche Quellen; monatliche Aktualitätsprüfung; Kapitel zu kommenden Regeln.
- Erkennt das System der Website (z. B. WordPress, Shopify, Wix) und schreibt Anleitungen für Laien; jeder Befund ist zusätzlich in einfachen Worten erklärt.
- Berichte auf Deutsch oder Englisch; mehrere Websites in einem Aufruf; wiederholte Prüfungen übernehmen unveränderte Seiten aus dem letzten Scan.
- Lokal, Open Source, kostenlos.
**How we do it differently:** Technische Messung plus gepflegte Prüfliste mit 29 automatischen und 22 manuellen Prüfpunkten, 94 Quellen und 14 beobachteten kommenden Regeln.
**Why that's better:** Belegte Befunde statt Vermutungen und direkt umsetzbare Hilfe.
**Why customers choose us:** Schnell, gratis, nachvollziehbar, und das Ergebnis lässt sich direkt weitergeben (Annahme).

## Objections
| Objection | Response |
|-----------|----------|
| „Ersetzt das eine anwaltliche Prüfung?“ | Nein. Technische Prüfung mit allgemeinem rechtlichen Zusammenhang; Annahmen und Grenzen stehen in jedem Bericht. |
| „Gibt es Fehlalarme?“ | Jeder automatische Treffer wird anhand der Belege kontrolliert; verworfene Treffer werden mit Grund aufgeführt. |
| „Wo bleibt die Nutzererfahrung? Wenn der Nutzer direkt mit einem „Akzeptieren“ konfrontiert wird, bleibt der Mehrwert oft unklar.“ (LinkedIn-Kommentar) | Recht und Nutzererfahrung ziehen hier in dieselbe Richtung: Der Skill meldet Abfragen ohne gleichwertiges „Ablehnen“ als Lücke, und das Mock-up zeigt Ablehnen und Akzeptieren gleichwertig, einen kurzen Text zum Zweck und den Weg zum Widerruf. Farben, Ton und Platzierung bleiben beim Betreiber. |
| „Darf ich damit fremde Websites prüfen?“ | Technisch ja; wer das gegen Bezahlung tut, sollte das Rechtsdienstleistungsgesetz (RDG) selbst klären. |

**Anti-persona:** Wer eine rechtsverbindliche Freigabe braucht; Websites, die sich nicht an deutsche Verbraucher richten; Bereiche hinter einer Anmeldung.

## Switching Dynamics
**Push:** Abmahnwelle-Erfahrungen, unklare Cookie-Banner, Zeitdruck vor dem Livegang (Annahme).
**Pull:** Ein Befehl, belegte Ergebnisse, fertige Behebungshilfe, kostenlos.
**Habit:** Rechtstext-Generator einbinden und hoffen; manuelle Checklisten.
**Anxiety:** Ist das Ergebnis verlässlich? Wie aufwendig ist die Installation (Node.js, Chromium)?

## Customer Language
**How they describe the problem:**
- „Ist meine Website DSGVO-konform?“ (Annahme)
- „Brauche ich einen Cookie-Banner?“ (Annahme)
- „Wie vermeide ich eine Abmahnung?“ (Annahme)
**How they describe us:**
- „Klingt super, aber wo bleibt die Nutzererfahrung?“ (LinkedIn-Kommentar, 2026-11-08)
- „Klare Infos und Transparenz sind entscheidend.“ (LinkedIn-Kommentar, 2026-11-08)
**Words to use:** prüfen, Lücke, Beleg, Priorität, Behebung, Textentwurf, häufiger Abmahngrund, technische Prüfung
**Words to avoid:** „rechtssicher“, „abmahnsicher“, „rechtskonform“, „garantiert“ – das wären Einzelfall-Urteile bzw. Versprechen, die eine technische Prüfung nicht geben kann (RDG-Leitplanke des Skills).
**Glossary:**
| Term | Meaning |
|------|---------|
| Rechtsstand | Datum, bis zu dem Gesetze, Urteile und Leitlinien für die Prüfung ausgewertet wurden |
| Kurzfassung / Kurzbericht | Weiterleitbares PDF mit allen Befunden je eine Zeile |
| Langfassung | Ausführliches PDF mit Belegen, Anleitungen, Textentwürfen und Verzeichnissen |
| ⚠ häufiger Abmahngrund | Erfahrungswert für die Pflicht, keine Bewertung des Einzelfalls |
| KI-Prompt | Auftrag für Claude Code oder Codex, der die Lücken im Code behebt |

## Brand Voice
| Attribute | Means | Doesn't mean | Example line |
|-----------|-------|--------------|--------------|
| Sachlich | Beobachtung, Vorschrift, Beleg | Panikmache | „Google Analytics wird ohne Einwilligung geladen und setzt das Cookie _ga.“ |
| Ehrlich | Grenzen und Annahmen offen nennen | Kleinreden von Risiken | „Technische Prüfung, keine Rechtsberatung.“ |
| Hilfreich | Zu jeder Lücke der nächste Schritt | Belehren | „Schriften lokal auf dem eigenen Server einbinden.“ |

**Tone by context:**
- Support: knapp, konkret, mit Beleg
- Launch: Nutzen und Grenzen gleichermaßen
- Errors: was passiert ist und was als Nächstes zu tun ist
- Sales: — (kein Vertrieb)
- Social: sachlich, keine Angstbotschaften
**Terms we own:** Kurzfassung, Langfassung, häufiger Abmahngrund, KI-Prompt zur Behebung
**Never use (and why):** „rechtssicher“, „abmahnsicher“ – nicht einlösbar und RDG-heikel.

## Proof Points
**Metrics:** 29 automatische und 22 manuelle Prüfpunkte, Klickwege für 8 Website-Systeme aus deren offizieller Hilfe, 94 Quellen (abgerufen), 14 kommende Regeln, 12 Textentwürfe, automatische Tests auf lokalen Testseiten.
**Customers:** —
**Testimonials:** —
**Value themes:**
| Theme | Proof |
|-------|-------|
| Belegt | Anfragen, Cookies und Bildschirmfotos je Befund |
| Umsetzbar | Textentwürfe, Mock-ups, KI-Prompt |
| Aktuell | Monatliche Aktualitätsprüfung, Kapitel zu kommenden Regeln |

## Goals
**Business goal:** Verbreitung und Rückmeldungen aus der Praxis (Annahme).
**Conversion action:** Repository installieren und eine erste Website prüfen; Fehler und Wünsche als Issue melden.
**Current metrics:** —

## Learnings
*Decisions and tested lessons. Newest first. Keep it to about 20 active entries.*
| Date | Learning | Evidence | Applies to | Status |
|------|----------|----------|------------|--------|
| 2026-11-08 | Leser lesen „Cookie-Abfrage prüfen“ als rein rechtlich; Texte sollen zeigen, dass die Behebung auch für Besucher klarer ist (gleichwertiges Ablehnen, Zweck, Widerruf) | ein LinkedIn-Kommentar zur Nutzererfahrung | README, Beschreibung, Social | watch |
| 2026-11-08 | GitHub-Texte auf Deutsch, weil der Skill deutsche Websites prüft | Entscheidung des Betreibers | README, Beschreibung | active |

## Changelog
*Newest first. One line per revision: what changed and why.*
- v16 (2026-11-08) — v1.9.6: separate document language (German, English or any other language translated by AI with a note); description says "PDF-Berichte in jeder Sprache".
- v15 (2026-11-08) — Older versions removed from GitHub (history squashed); licence note on earlier Apache-2.0 versions dropped.
- v14 (2026-11-08) — No positioning change; v1.9.5 asks at the end whether the files should also be sent to the chat (download on a smartphone).
- v13 (2026-11-08) — Objection „Wo bleibt die Nutzererfahrung?“ from the first LinkedIn comment added (Objections, Customer Language, Learnings); README and description now say that the cookie fix is also clearer for visitors.
- v12 (2026-11-08) — No positioning change; v1.9.4 adds the answer U (unknown) to the AI question; README and repository description use no dashes as sentence separators.
- v11 (2026-11-08) — No positioning change; v1.9.3 puts the revision at the end of folder names (…_Ref2).
- v10 (2026-11-08) — Customer language: the PDFs say "Rechtsstand" (legal status) instead of "Stand der Prüfliste" and explain it on page 1.
- v9 (2026-11-08) — No positioning change; v1.9.1 fixes folder names for .app domains and clarifies the prompt question.
- v8 (2026-11-08) — Business model: licence changed to GPL-3.0-or-later from version 1.9.0 (copyright Worker1245).
- v7 (2026-11-08) — Proof points: PDFs follow researched formatting rules (captions, DIN 5008 typography, legibility) and open with a fixed explanation of their contents.
- v6 (2026-11-08) — Repeated checks: revisions named Ref2, Ref3; evidence photos and verified findings of unchanged pages are taken over without copying or re-reading.
- v5 (2026-11-08) — Differentiation: repeated checks reuse an earlier scan and only re-scan changed pages; prompt text file optional.
- v4 (2026-11-08) — Differentiation: every finding explained in plain words (summary and explanation per fact-sheet row); questions for many websites at once; optional mock-ups.
- v3 (2026-11-08) — Proof points: layperson steps now use verified click paths from the official help of eight systems.
- v2 (2026-11-08) — Differentiation and use cases: platform detection with layperson steps, German/English reports, several websites per run.
- v1 (2026-11-08) — Initial context, drafted from README, SKILL.md, checklist and sources.
