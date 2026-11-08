# Mock-up components

Insert exactly one component into `{{KORREKTUR_HTML}}` of `templates/mockup.html`. Each component shows only the corrected spot. Do not add features, colours, icons or wording beyond what the finding needs; ask the user first if something else seems useful. Replace `[…]` placeholders with real values from the scan where known; otherwise keep the placeholder. Escape any text taken from the website.

All components share this neutral style block; include it once inside `{{KORREKTUR_HTML}}`:

```html
<style>
  .m-btn { font: inherit; padding: 10px 18px; border: 1px solid #1a1a1a; background: #fff; color: #1a1a1a; cursor: pointer; }
  .m-btn.primary { background: #1a1a1a; color: #fff; }
  .m-row { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 12px; }
  .m-small { font-size: 13px; color: #555; }
  .m-box { border: 1px solid #c8c8c8; padding: 16px; background: #fff; }
</style>
```

## TDD-04 – Consent dialog with equal reject option (first layer)

Accept and reject have the same size, colour and level; links to privacy policy and imprint stay usable.

```html
<div class="m-box" role="dialog" aria-labelledby="m-consent-title">
  <strong id="m-consent-title">Ihre Einwilligung</strong>
  <p>Wir möchten mit Ihrer Einwilligung [Zwecke, z. B. Reichweitenmessung mit Anbieter X] einsetzen. Dabei werden Informationen auf Ihrem Gerät gespeichert oder ausgelesen. Sie können Ihre Einwilligung jederzeit über „Cookie-Einstellungen“ am Ende jeder Seite widerrufen.</p>
  <div class="m-row">
    <button class="m-btn primary">Alle ablehnen</button>
    <button class="m-btn primary">Alle akzeptieren</button>
    <button class="m-btn">Einstellungen</button>
  </div>
  <p class="m-small"><a href="#">Datenschutzerklärung</a> · <a href="#">Impressum</a></p>
</div>
```

## IMP-01 / DSE-01 / WID-01 / BF-02 – Footer with mandatory links on every page

Show only the links that the finding requires plus the ones the site already has. "Cookie-Einstellungen" only if the site uses a consent dialog (withdrawal of consent).

```html
<footer class="m-box">
  <nav aria-label="Rechtliches" class="m-row">
    <a href="#">Impressum</a>
    <a href="#">Datenschutz</a>
    <!-- only if required by the finding: -->
    <a href="#">Widerrufsbelehrung</a>
    <a href="#">AGB</a>
    <a href="#">Barrierefreiheit</a>
    <a href="#">Cookie-Einstellungen</a>
  </nav>
</footer>
```

## BTN-01 – Order button on the last checkout step

```html
<div class="m-box">
  <p>[Zusammenfassung: Artikel, Gesamtpreis inkl. MwSt., Versandkosten, ggf. Laufzeit]</p>
  <button class="m-btn primary">zahlungspflichtig bestellen</button>
</div>
```

## PRC-01 / PRC-02 – Price with VAT and shipping note

```html
<div class="m-box">
  <p><strong>[Produktname]</strong></p>
  <p style="font-size: 22px; margin: 4px 0;">[Preis] €</p>
  <p class="m-small">inkl. MwSt., zzgl. <a href="#">Versandkosten</a></p>
  <!-- only if a base price is required (goods sold by weight, volume, length, area): -->
  <p class="m-small">[Grundpreis] € / [1 kg | 1 l | 1 m | 1 m²]</p>
</div>
```

## KUE-01 – Cancellation button for subscriptions (§ 312k BGB)

Two steps: a permanently available button leads to a confirmation page.

```html
<div class="m-box">
  <a href="#" class="m-btn">Verträge hier kündigen</a>
  <hr>
  <p><strong>Kündigung</strong></p>
  <p class="m-small">[Felder: Name, Angaben zur Identifikation des Vertrags, Art der Kündigung (ordentlich / außerordentlich, ggf. Grund), Zeitpunkt, E-Mail für die Bestätigung]</p>
  <button class="m-btn primary">jetzt kündigen</button>
</div>
```

## WID-02 – Online withdrawal function (§ 356a BGB, since 19.06.2026)

A prominently placed, permanently available withdrawal function leads to a confirmation step.

```html
<div class="m-box">
  <a href="#" class="m-btn">Vertrag widerrufen</a>
  <hr>
  <p><strong>Widerruf</strong></p>
  <label>Name <input type="text"></label><br>
  <label>Vertrag / Bestellnummer <input type="text"></label><br>
  <label>E-Mail für die Eingangsbestätigung <input type="email"></label>
  <div class="m-row"><button class="m-btn primary">Widerruf bestätigen</button></div>
</div>
```

## AI-01 – Notice that users talk to an AI

```html
<div class="m-box" style="max-width: 340px;">
  <p><strong>[Name des Chats]</strong></p>
  <p class="m-small">Sie chatten mit einem KI-System, nicht mit einem Menschen.</p>
  <p>[Erste Nachricht des Chats]</p>
</div>
```

## DSA-01 – Report content

```html
<div class="m-box">
  <p>[Kommentar / Beitrag]</p>
  <a href="#" class="m-small">Inhalt melden</a>
  <hr>
  <p><strong>Inhalt melden</strong></p>
  <p class="m-small">[Felder: Begründung, warum der Inhalt rechtswidrig ist; genaue Fundstelle (URL); Name und E-Mail der meldenden Person; Bestätigung, dass die Angaben in gutem Glauben richtig und vollständig sind]</p>
  <button class="m-btn primary">Meldung absenden</button>
</div>
```
