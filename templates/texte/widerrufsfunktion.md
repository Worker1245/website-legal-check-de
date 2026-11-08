<!-- Use for check WID-02 (electronic withdrawal function "Vertrag widerrufen" / "Widerruf bestätigen" under § 356a BGB missing or incomplete). -->

# Textentwurf: Elektronische Widerrufsfunktion

**Entwurf – keine Rechtsberatung, vor Veröffentlichung prüfen lassen.**

So verwenden Sie diesen Entwurf:
- Die Texte gehören zu einer Funktion auf Ihrer Website (Schaltfläche, Formularseite, Eingangsbestätigung). Platzhalter in eckigen Klammern durch Ihre Angaben ersetzen.
- Blöcke mit „[Nur wenn …:]“ nur übernehmen, wenn die Bedingung auf Sie zutrifft; sonst ganz löschen.
- Die Pflicht gilt seit 19.06.2026 für Fernabsatzverträge, die über eine Online-Benutzeroberfläche geschlossen werden (§ 356a BGB).

---

## 1. Schaltfläche (Widerrufsfunktion)

Beschriftung der Schaltfläche bzw. des Links:

**Vertrag widerrufen**

---

## 2. Seite zur Widerrufserklärung

### Vertrag widerrufen

Hier können Sie den Widerruf Ihres Vertrags erklären. Bitte geben Sie die folgenden Daten an bzw. bestätigen Sie sie:

- Name: [Eingabefeld – bei angemeldeten Kunden vorausgefüllt]
- Vertrag, den Sie widerrufen möchten: [Eingabefeld, z. B. Bestellnummer oder Vertragsbezeichnung – bei angemeldeten Kunden vorausgefüllt]
  [Nur wenn ein Widerruf einzelner Teile des Vertrags möglich ist:] Teil des Vertrags, den Sie widerrufen möchten: [Auswahl, z. B. einzelne Artikel der Bestellung]
- E-Mail-Adresse für die Eingangsbestätigung: [Eingabefeld]

Beschriftung der Bestätigungsschaltfläche:

**Widerruf bestätigen**

---

## 3. Eingangsbestätigung (E-Mail bzw. anderer dauerhafter Datenträger)

Betreff: Eingangsbestätigung Ihres Widerrufs – [Bestellnummer/Vertragsbezeichnung]

Guten Tag [Name],

wir haben Ihre Widerrufserklärung erhalten.

Inhalt Ihrer Widerrufserklärung:
- Name: [Name]
- Widerrufener Vertrag: [Bestellnummer/Vertragsbezeichnung]
  [Nur wenn nur ein Teil widerrufen wurde:] Widerrufener Teil: [Bezeichnung]
- E-Mail-Adresse für die Bestätigung: [E-Mail-Adresse]

Eingang Ihrer Erklärung: [Datum] um [Uhrzeit] Uhr

Mit freundlichen Grüßen
[Name des Unternehmens]
[Kontaktangaben]

---

## 4. Satz für die Widerrufsbelehrung

Den amtlichen Satz zur Online-Widerrufsfunktion („Sie können Ihr Widerrufsrecht auch online unter … ausüben. …“) finden Sie in der Vorlage `widerruf.md`. Dort die Internetadresse dieser Funktion eintragen.

---

## Hinweise zur Umsetzung (nicht übernehmen)

1. **Beschriftung:** Das Gesetz nennt „Vertrag widerrufen“ und „Widerruf bestätigen“ oder eine entsprechend eindeutige Formulierung. Am sichersten ist der gesetzliche Wortlaut; die Beschriftung muss gut lesbar sein.
2. **Erreichbarkeit:** Die Widerrufsfunktion muss während der gesamten Widerrufsfrist ständig verfügbar, hervorgehoben platziert und leicht zugänglich sein (z. B. Fußzeile und Kundenkonto). Ob eine Platzierung nur nach Anmeldung genügt, ist rechtlich nicht abschließend geklärt – rechtlich prüfen lassen.
3. **Abgefragte Daten:** Nur Name, Vertrag bzw. Vertragsteil und elektronischer Weg für die Eingangsbestätigung sind vorgesehen. Keine Begründung und keine zusätzlichen Hürden verlangen.
4. **Eingangsbestätigung:** Unverzüglich auf einem dauerhaften Datenträger mit dem Inhalt der Widerrufserklärung sowie Datum und Uhrzeit des Eingangs übermitteln.
5. **Fristwahrung:** Ein über die Funktion vor Ablauf der Frist abgesendeter Widerruf gilt als rechtzeitig. Zeitstempel daher serverseitig protokollieren.
6. **Kein Ersatz:** Ein bloßer `mailto:`-Link, ein PDF-Formular oder ein Retourenportal („Retoure anmelden“, „Rücksendung“) ist voraussichtlich keine Widerrufsfunktion im Sinne von § 356a BGB – rechtlich prüfen lassen.
7. **Gleicher Kanal:** Wird der Vertrag auf der Website geschlossen, die Funktion nicht nur in einer App anbieten.
8. **Kein Ausschluss für Finanzdienstleistungen:** § 356a BGB enthält – anders als § 312k BGB – keine Ausnahme für Finanzdienstleistungen.
9. **Nicht durch den Scan prüfbar:** Versand und Inhalt der Eingangsbestätigung, Verfügbarkeit je Bestellung über die ganze Frist, Teilwiderruf – bitte selbst testen.

---

## Quellen
- § 356a BGB – https://www.gesetze-im-internet.de/bgb/__356a.html (abgerufen am 07.11.2026)
- BGBl. 2026 I Nr. 28 (Inkrafttreten 19.06.2026) – https://www.recht.bund.de/bgbl/1/2026/28/VO.html (abgerufen am 07.11.2026)
- Richtlinie (EU) 2023/2673 (Art. 11a Richtlinie 2011/83/EU) – https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32023L2673 (abgerufen am 07.11.2026)
- Anlage 1 zu Art. 246a EGBGB (Satz zur Online-Funktion) – https://www.gesetze-im-internet.de/bgbeg/art_253anlage_1.html (abgerufen am 07.11.2026)
- Art. 246a § 1 EGBGB – https://www.gesetze-im-internet.de/bgbeg/art_246a__1.html (abgerufen am 07.11.2026)
