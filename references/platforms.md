# Platforms

Platforms status: 2026-11-08. Used by workflow step 4 to tailor layperson fix steps to the system a site is built with (decision 22a). Click paths may only come from the platform's official help, fetched and dated (decision 23a).

**How to use:** for the detected system, take the click paths for the task below and turn them into layperson steps (one action per step, explain terms, say what to see afterwards). Phrase them as following the official help („laut Hilfe-Center, Stand 2026-11“) and add that labels can differ by language, edition, theme or version; if a label is missing, the user should search the help centre for the task. Where a task is marked **ND** (not documented), give generic steps and never invent a menu path. **UNVERIFIED** and **OBS** items are hints for detection only, never for instructions. The monthly update check re-fetches the sources listed per platform.

## Detection signals (observed conventions)

| System | Signals the scanner uses | Add-ons named |
|---|---|---|
| WordPress | meta generator „WordPress …“; requests to `/wp-content/` or `/wp-includes/` | WooCommerce (class `woocommerce`, `/plugins/woocommerce/`), Divi (classes `et_divi_theme`/`et_pb_…`, `/themes/Divi/`), Elementor (class `elementor`, `/plugins/elementor/`) |
| Shopify | requests to `cdn.shopify.com` or `*.myshopify.com` | – |
| Wix | meta generator containing „Wix.com“; requests to `static.wixstatic.com` or `static.parastorage.com` | – |
| Jimdo | requests to `jimstatic.com`, `jimdo.com`, `jimdosite.com` | – |
| Squarespace | requests to `squarespace.com` / `squarespace-cdn.com` | – |
| Webflow | meta generator „Webflow“; HTML attribute `data-wf-site`; requests to `website-files.com` | – |
| TYPO3 | meta generator containing „TYPO3“; paths `/typo3conf/`, `/typo3temp/` | – |
| Shopware | meta generator containing „Shopware“; path `/bundles/storefront/` | – |

Two or more signals = confidence „high“, one = „medium“. Signals can be wrong (e.g. a WordPress site that loads Shopify buttons); the report names the evidence.

## Click paths per task (from official help, retrieved 2026-11-08)

Tasks: (a) add/edit a legal page and link it in the footer, (b) consent banner, (c) self-hosted fonts, (d) when tracking scripts load, (e) price, tax and shipping display, (f) order button label, (g) embeds, (h) image alt texts and contrast.

General caveats for the skill:
- Hosted builders change menu names often; always phrase as "laut Hilfe-Center (Stand 2026-11)" and tell the user to search the help center if a label is missing.
- Several help centers (help.jimdo.com, help.jimdo-dolphin.com, help.webflow.com) intermittently returned HTTP 403 (bot protection). Failed pages are listed under each platform and were NOT used as sources.

---

## 1. WordPress (self-hosted, wordpress.org) incl. WooCommerce

Doc versions: Navigation block doc "Overhauled for WordPress 7.1" (updated 2026-10-08); Font Library doc "Updated font menu location for 7.0"; Pages/Privacy screen docs last updated 2024-06-08 (classic screens). Block themes vs classic themes differ (see a).

### Detection signals
- HTML `<meta name="generator" content="WordPress x.y">` — produced by core function `get_the_generator()` (source shows `meta name="generator" content="WordPress ' . get_bloginfo('version')`). Can be removed by plugins/themes. [developer.wordpress.org get_the_generator]
- REST API discovery: HTTP header `Link: <https://example.com/wp-json/>; rel="https://api.w.org/"` on all front-end pages, plus `<link rel='https://api.w.org/' href='…/wp-json/'>` in `<head>`; without pretty permalinks `?rest_route=/`. [developer.wordpress.org REST discovery]
- Asset paths `/wp-content/` (themes, plugins, uploads) and `/wp-includes/`: UNVERIFIED as a detection signal; docs confirm wp-content holds themes/plugins/uploads and that it can be moved to another location. [developer.wordpress.org wp-config]
- WooCommerce: cookies `woocommerce_cart_hash`, `woocommerce_items_in_cart`, `wp_woocommerce_session_*`, `woocommerce_recently_viewed` (documented). [woocommerce.com cookies]. OBS: woocommerce.com itself emits `<meta name="generator" content="WooCommerce …">` in addition to the WordPress generator.

### a. Add/edit page (Impressum, Datenschutz, Widerruf) and link in footer/menu
1. Admin: **Pages > Add New** (classic doc "Pages Add New screen"); enter title, content, click **Publish** (existing pages: **Pages > All Pages**, click title, button is **Update**). [pages-screen, pages-add-new-screen]
2. Privacy policy page specifically: **Settings > Privacy** → **Create New Page** or pick existing page → **Use This Page**; edit and **Publish**. Docs: "It is your responsibility to create a link to the Privacy Policy page to every page" — the theme may or may not add it. [settings-privacy-screen]
3. Link in menu/footer — block themes (WP 6.0+): open the Navigation block (in the header/footer template part in the Site Editor) → if it shows a Page List, select it and click **Edit** (toolbar) → **Edit** (dialog) → click **+ (Add page)** → type page title, select it. Custom URL: **+ (Add page)** → **Add block** → **Custom Link**. [navigation-block]
4. Link in menu/footer — classic themes: **Appearance > Menus** → add pages to menu → under **Menu Settings → Display location** tick the location → **Save Menu**. If the theme has no menu locations, use the Custom Menu widget (Appearance > Widgets). Doc notes WP 5.9 was the last version showing Appearance > Menus for all sites by default; block themes use the Navigation block. [appearance-menus-screen]
- WooCommerce legal pages: **WooCommerce > Settings > Advanced > Page setup** → select **Terms and conditions** page (create it first via Pages > Add New). Block checkout shows "By proceeding with your purchase you agree to our Terms and Conditions and Privacy Policy" (editable in block editor); Checkout block's **Terms and Conditions** block has **Require Checkbox**. [wc advanced settings, checkout-block]
- Privacy notices for accounts/checkout: **WooCommerce > Settings > Accounts & Privacy**. [wc configuring settings]

### b. Cookie consent banner
- Core has no built-in consent banner: ND in core docs.
- Officially documented way to add one: plugin installer **Plugins > Add New** → search box top right (keyword) → **Install Now** → **Activate**. Suggest search term e.g. "cookie consent"; do not name vendors. [manage-plugins]

### c. Google Fonts self-hosted
- Font Library: **Appearance > Fonts** (since 7.0 for block and classic themes). Tabs **Library**, **Upload** (.ttf, .otf, .woff, .woff2), **Install Fonts**. Doc: "WordPress downloads the selected font files and hosts them on your site rather than loading them from Google." First you must grant the site access to Google Fonts. [the-font-library]
- Apply font: **Appearance > Editor > Styles** (Typography). [the-font-library, styles-overview]
- Fonts loaded by a theme/plugin from fonts.googleapis.com: removal ND (theme/plugin specific).

### d. Tracking scripts / custom code
- Core has no tracking setting: ND. Developer method: themes enqueue scripts via `wp_enqueue_script()` (theme code). [developer.wordpress.org including-css-javascript]
- Custom HTML block: since WP 7.0 has HTML/CSS/JS panels; JS/CSS panels only for users with `unfiltered_html`; otherwise `<script>`/`<iframe>` are stripped on save. [custom-html]
- Consent-gated loading: ND in core (depends on consent plugin).

### e. Price/tax display, shipping (WooCommerce)
1. Enable taxes: **WooCommerce > Settings > General** → **Taxes and coupons** → **Enable tax rates and calculations**. [wc taxes]
2. **WooCommerce > Settings > Tax**: **Prices entered with tax**; **Display prices in the shop** (Including/Excluding tax); **Display prices during cart and checkout**; **Use recommended settings** button. [wc taxes]
3. VAT note: **Price display suffix**, placeholders `{price_including_tax}`, `{price_excluding_tax}` (e.g. "inkl. MwSt."). [wc taxes]
4. Shipping: **WooCommerce > Settings > Shipping > Shipping zones** → **Add zone** (check **Shipping location(s)** under General first). [wc shipping zones]
- Shipping-cost note next to price ("zzgl. Versand"): ND (could be put in price display suffix text, but that is my inference).

### f. Order button label
- Block checkout: "Place order" text is editable directly in the Checkout block in the editor; legacy PHP hook `woocommerce_order_button_text` is "Not supported" in blocks ("edit it using the editor"). Developer filter `placeOrderButtonLabel` (default "Place order"). [developer.woocommerce.com hook-alternatives, checkout-and-place-order-button]
- Exact editor click path to the button text field: ND on woocommerce.com user docs (checkout-block doc lists Actions block settings only: "Show a Return to Cart link"). Classic shortcode checkout: hook-based (developer).

### g. Embeds
- Block editor: **Embed** block or service blocks (YouTube Embed, Vimeo Embed, …): paste URL. Embeds are links to third-party content (content loads from the third party). [embeds]
- Change embed: edit the page, select the embed block. Privacy-friendly/2-click embedding: ND in core.

### h. Accessibility basics
- Alt text: Image block sidebar **Alternative text** ("leave empty if decorative"); also in Media Library (Title, Caption, Alt Text, Description). [image-block]
- Colors: **Appearance > Editor** → Styles (half-shaded circle icon) → **Colors** (block themes). Contrast checker: ND in fetched pages.

German labels: not fetched (WordPress admin German translation not verified).

Sources (fetched 2026-11-08):
- https://wordpress.org/documentation/article/pages-screen/
- https://wordpress.org/documentation/article/pages-add-new-screen/
- https://wordpress.org/documentation/article/settings-privacy-screen/
- https://wordpress.org/documentation/article/navigation-block/
- https://wordpress.org/documentation/article/appearance-menus-screen/
- https://wordpress.org/documentation/article/manage-plugins/
- https://wordpress.org/documentation/article/the-font-library/
- https://wordpress.org/documentation/article/styles-overview/
- https://wordpress.org/documentation/article/colors-settings-overview/
- https://wordpress.org/documentation/article/custom-html/
- https://wordpress.org/documentation/article/embeds/
- https://wordpress.org/documentation/article/embed-block/
- https://wordpress.org/documentation/article/image-block/
- https://developer.wordpress.org/reference/functions/get_the_generator/
- https://developer.wordpress.org/rest-api/using-the-rest-api/discovery/
- https://developer.wordpress.org/advanced-administration/wordpress/wp-config/
- https://developer.wordpress.org/themes/classic-themes/basics/including-css-javascript/
- https://woocommerce.com/document/setting-up-taxes-in-woocommerce/
- https://woocommerce.com/document/setting-up-shipping-zones/
- https://woocommerce.com/document/configuring-woocommerce-settings/
- https://woocommerce.com/document/configuring-woocommerce-settings/advanced/
- https://woocommerce.com/document/woocommerce-store-editing/customizing-cart-and-checkout/checkout-block/
- https://woocommerce.com/document/woocommerce-cookies/
- https://developer.woocommerce.com/docs/block-development/reference/hooks/hook-alternatives/ (official Woo developer docs; outside the listed domains)
- https://developer.woocommerce.com/docs/block-development/extensible-blocks/cart-and-checkout-blocks/filters-in-cart-and-checkout/checkout-and-place-order-button/
- 404: https://wordpress.org/documentation/article/font-library/ (replaced by the-font-library)

---

## 2. Shopify

Doc version: current Help Center (2026-11); desktop admin paths, the Shopify app has equivalent "tap" paths.

### Detection signals
- ND in help.shopify.com. UNVERIFIED conventions: assets from `cdn.shopify.com`, JS global `window.Shopify`, `myshopify.com` domains. (shopify.dev not fetched.)
- Documented: Shopify cookie banner / Customer Privacy API exist; pixels run sandboxed (see d).

### a. Pages and menu/footer
1. **Online Store > Pages** → **Add page** → title + content → **Visibility: Visible** → **Save**. DE: **Onlineshop > Seiten** → **Seite hinzufügen** → **Sichtbarkeit** → **Speichern**. [add-edit-pages]
2. Legal policies are separate: **Settings > Policies** → **Written policies** → click policy (Return policy, Privacy policy, Terms of service, Shipping policy, **Legal notice**, Contact information, Subscription policy) → edit or automate → **Save**. Legal notice = Impressum candidate (my mapping). [refund-privacy-tos]
3. Footer/menu: **Content > Menus** → click menu (e.g. footer menu) → **Add menu item** → name → search/select page or policy → **Add** → **Save** / **Save menu**. DE: **Inhalt > Menüs** → **Menüpunkt hinzufügen**. Policy links appear by default only in the checkout footer; add them to store menus this way. [editing-menus, refund-privacy-tos]

### b. Cookie consent
1. Built-in: **Settings > Customer privacy** → **Cookie banner** → **Use automated settings** (on by default for UK/EEA if markets active) or **Edit** Regions/Content manually → appearance → **Position** → **Save**. Requires a published privacy policy first. DE: **Einstellungen > Datenschutz für die Kundschaft** → **Cookie-Banner** → **Automatisierte Einstellungen verwenden**. [privacy-settings EN/DE]
2. Limitation (doc): Shopify banner governs Shopify tools and Shopify Pixels; manually installed third-party cookies/pixels may need a third-party banner or custom logic.
3. Third-party: Shopify App Store category "Cookie Consent"; then remove Shopify banner via **Settings > Customer privacy > Cookie banner > Remove cookie banner** (if shown).

### c. Google Fonts
- Fonts: **Online Store** → **Edit theme** (Customize) → **Theme settings** icon → **Typography** → **Change** (Headings/Body). Free Shopify themes use Shopify's font library; system fonts recommended. Whether library fonts load from Google: ND. [theme-settings]

### d. Tracking
- **Settings > Customer events** → **Add pixel** (custom pixel) → **Save** → **Connect**. In consent markets (EEA/UK) pixels run only when visitors granted the permissions configured; new pixels require Marketing + Analytics by default; set under the pixel's **Customer privacy > Permission**. [pixels overview, custom-pixels/manage, custom-pixels/code]
- Theme code: **Online Store > Edit code** (developer; not consent-managed). [edit-theme-code]

### e. Price/tax/shipping
1. **Settings > Taxes and duties** → **Include sales tax in product price and shipping rate** → **Save**. DE: **Einstellungen > Steuern und Zollgebühren** → **Umsatzsteuer in Produktpreis und Versandtarif einbeziehen**. Included tax shown next to total at checkout. [include-exclude-taxes EN/DE]
2. Shipping: **Settings > Shipping and delivery** → **Shipping profiles** → profile → **Add zone** / **Add shipping option** → **Save**. DE: **Einstellungen > Versand und Zustellung**. [setting-up-shipping-rates EN/DE]
3. "inkl. MwSt./zzgl. Versand" text on product page: theme-dependent; ND (unit pricing exists: products/details/product-pricing/unit-pricing).

### f. Checkout button label
- **Settings > Checkout** → **Checkout language** → **Edit checkout content** → change field texts → **Save**. DE: **Einstellungen > Checkout** → **Checkout-Sprache** → **Checkout-Inhalte bearbeiten**. Doc does not name the pay button key explicitly (check button text there). [checkout-language EN/DE]

### g. Embeds
- Map/video on a page: **Online Store > Pages** → page → **Show HTML** button in content toolbar → paste embed code → **Save** (doc example: Google Maps "Embed map"). Theme sections/blocks also offer video blocks. [add-edit-pages, sections-and-blocks]

### h. Accessibility
- Theme image alt text: **Online Store** → **Edit theme** → section with image → **Edit** on image → enter alt text → **Save**. Product images: from admin media editor. [adding-alt-text]
- Colors: Theme settings → **Colors** / color schemes (**Add scheme**). Contrast guidance: body/button text ≥ 4.5:1, large text ≥ 3:1. [accessibility, theme-settings]

Sources (fetched 2026-11-08), base https://help.shopify.com/en/manual/ (DE: /de/manual/):
- online-store/add-edit-pages (+DE) ; online-store/menus-and-links/editing-menus (+DE) ; checkout-settings/refund-privacy-tos
- privacy-and-security/privacy/customer-privacy-settings/privacy-settings (+DE)
- promoting-marketing/pixels/overview ; promoting-marketing/pixels/custom-pixels/code ; promoting-marketing/pixels/custom-pixels/manage
- taxes/include-exclude-taxes (+DE) ; fulfillment/setup/shipping-rates/setting-up-shipping-rates (+DE) ; checkout-settings/checkout-language (+DE)
- online-store/themes/customizing-themes/theme-editor/theme-settings ; online-store/themes/customizing-themes/accessibility ; online-store/themes/customizing-themes/accessibility/adding-alt-text ; online-store/themes/customizing-themes/edit-code/edit-theme-code ; online-store/themes/theme-structure/sections-and-blocks ; products/details/product-pricing/unit-pricing

---

## 3. Wix

Doc version: Wix Editor articles (Studio Editor / Harmony Editor have separate articles and may differ).

### Detection signals
- ND in help docs. OBS on www.wix.com: `<meta name="generator" content="Wix.com Website Builder">`, header `x-wix-request-id`, `server: Pepyaka`, assets from `static.wixstatic.com`.

### a. Pages and menu
1. Editor → **Pages & Menu** (left) → **Site Menu** → **Add Menu Item** → **New page** → blank or template → name → **Done**. New pages are added to the site menu automatically. [adding-a-page]
2. Link item: **Pages & Menu** → **Add Menu Item** → **Link** → link type/details → **Done**. [adding-a-new-item]
3. Footer-specific menu: ND in fetched pages.

### b. Cookie consent (Usercentrics for Wix)
1. Dashboard → **Privacy & Cookies** → **Add to Site** next to "Add a cookie consent banner" → **Agree & Add** (premium optional). DE: **Hinzufügen** next to "Cookie-Hinweisbanner hinzufügen" → **Zustimmen & Hinzufügen**.
2. **Cookie Consent Banner** → **Website Scan** → **Scan**.
3. Customize (layout, theme, privacy trigger, links e.g. privacy policy, language) and enable via **Show banner** toggle (DE: Schieberegler **Banner anzeigen**).
- Doc: without active banner all cookies/scripts load on first visit; with banner only essential ones load until consent; some third-party elements cannot be controlled. Banner not visible in Editor/Preview. [displaying-a-cookie-banner EN/DE]

### c. Fonts
- Upload own font: text element → **Edit Text** → **Fonts** drop-down → **Upload Fonts** → **Done**; use under **My Fonts**. Whether Wix's built-in fonts load from Google: ND. [uploading-and-using-your-own-fonts]

### d. Tracking / custom code
- GA: dashboard → **Marketing Integrations** → **Connect** under Google Tag → **Add Google Tag ID** → **Save**. [tracking-events-…-google-analytics]
- Custom code: dashboard → **Settings** → **Custom Code** (Development & integrations) → **+ Add Custom Code** → pages → **Place Code in:** Head / Body – start / Body – end → **Apply**. Doc: GA, GTM, Facebook & TikTok pixels "do not work through custom code"; categorize custom code for GDPR. [embedding-custom-code]

### e. Price/tax/shipping (Wix Stores)
1. Dashboard → **tax** → **Tax Settings** → **Include tax in item price** / **Add tax at checkout**. [including-tax-in-the-product-price]
2. Dashboard → **price and shipping settings** → **Show if tax is included or not** toggle; shipping message next to price (max 23 chars) + optional pop-up. [displaying-tax-and-shipping-info]

### f. Checkout button label
- Wix doc: "Currently, it is not possible to edit the text that appears on the Checkout Page." → label fixed by platform. Design only: **Checkout Settings** → **Edit** under Checkout design → General / Buttons and selections / Header / Footer → **Save & Publish**; site policies (incl. policy checkbox) in **Policies** section. [request-editing-the-checkout-page-text, customizing-the-checkout-page]

### g. Embeds
- Editor → **Add Elements** → **Embed Code** → **Popular Embeds** / Embed HTML → click embed → **Enter Code** or **Enter Website Address**. Wix-managed third-party components can be blocked by the banner (advanced option; per article). [embedding-a-site-or-a-widget]

### h. Accessibility
- Image alt text: click image → **Settings** icon → **What's in the image?** → Enter. Galleries: **Manage Media** / **Change Images**. **Settings → Accessibility Wizard**. Colors/contrast: ND (not fetched). [accessibility-preparing-your-images-and-galleries]

Sources (fetched 2026-11-08), base https://support.wix.com/en/article/:
- displaying-a-cookie-banner-on-your-site ; (DE) https://support.wix.com/de/article/ein-cookie-banner-auf-deiner-website-anzeigen
- wix-editor-embedding-custom-code-on-your-site (redirect from adding-a-custom-tracking-code-to-your-site)
- tracking-events-on-your-wix-site-with-a-google-analytics-property ; preparing-your-wix-site-for-the-gdpr
- including-tax-in-the-product-price ; wix-stores-displaying-tax-and-shipping-info-with-product-prices
- customizing-the-checkout-page ; request-editing-the-checkout-page-text
- wix-editor-adding-a-page-to-your-site ; wix-editor-adding-a-new-item-to-your-site-menu
- accessibility-preparing-your-images-and-galleries ; wix-editor-uploading-and-using-your-own-fonts ; wix-editor-embedding-a-site-or-a-widget
- 404: adding-and-setting-up-a-cookie-banner

---

## 4. Jimdo

Two products with separate help centers: **Jimdo Creator** (help.jimdo.com) and the current **Jimdo website builder ("Dolphin")** (help.jimdo-dolphin.com, linked from help.jimdo.com as "Jimdo Help Center"). Ask the user which one.

### Detection signals
- ND. www.jimdo.com behind Cloudflare; nothing observable. UNVERIFIED conventions: assets from jimcdn.com / jimstatic.com.

### a. Pages/legal pages
- Dolphin: **Edit Website** → left menu **Website Builder → Pages** → system pages section (Privacy policy, Legal notice/Imprint, Cookie policy, T&C) → edit. Pages created by the **Legal Text Generator** can only be changed in the generator. System pages are reachable only via the footer. [dolphin legal pages]
- Dolphin store pages: **Edit Website** → **Website Builder > Pages** → **Store Pages** (Return Policy, Terms and Conditions, Delivery Policy, Confirmation, Cart). [dolphin store system pages]
- Creator: click **About** link in footer to edit Imprint; footer links: **Menu > Settings > General > Footer** (paid plans choose links); legal pages for Bookings: **Menu > Settings > General > Legal pages**. [creator about page, creator footer]

### b. Cookie consent
- Creator: **Menu > Settings > Privacy & Security > Use of Cookies** (turn notice on/off; opt-in with categories). [creator cookies notice]
- Dolphin: banner details ND (fetch of related pages failed; search snippet only, not used).

### c. Google Fonts: ND.

### d. Tracking
- Creator: Premium plan; **Menu > SEO › Settings › Google Analytics** (doc says anonymizeIp applied and notice added to privacy policy). Own code: **Menu > Settings > Edit Head**. [creator GA, creator own code]
- Dolphin: Premium plan; **Statistics** (left) → tab **Google Analytics** → **Activate**. [dolphin GA]

### e. Price/tax/shipping (Dolphin store)
- VAT rates removed since 1 July 2021; products show "including tax" unless small-business scheme. Shipping: **Store** (left) → **Shipping** → regions Domestic/EU/Europe/World, costs, estimated delivery time; info auto-added to Delivery Policy page. [dolphin shipping]

### f. Checkout button label: ND.
### g. Embeds: ND (Creator video/maps pages FAILED 403).
### h. Accessibility: ND.

Sources (fetched 2026-11-08):
- https://help.jimdo.com/hc/en-us/articles/115005510226-How-do-I-activate-the-Cookies-notice
- https://help.jimdo.com/hc/en-us/articles/115005503803-How-do-I-create-an-About-page
- https://help.jimdo.com/hc/en-us/articles/115005503403-How-do-I-edit-the-footer
- https://help.jimdo.com/hc/en-us/articles/115005521363-How-do-I-connect-Google-Analytics
- https://help.jimdo.com/hc/en-us/articles/115005505763-How-do-I-insert-my-own-code
- https://help.jimdo-dolphin.com/hc/en-us/articles/360000897763-How-to-edit-your-legal-pages-e-g-privacy-policy-legal-notice
- https://help.jimdo-dolphin.com/hc/en-us/articles/360022895851-How-do-I-adjust-the-store-system-pages
- https://help.jimdo-dolphin.com/hc/en-us/articles/360022392672-How-do-I-connect-Google-Analytics-to-my-Jimdo-website
- https://help.jimdo-dolphin.com/hc/en-us/articles/360022678612-How-do-I-adjust-shipping-costs-in-my-Jimdo-store
- FAILED (403): help.jimdo.com …115005503823 (Privacy Policy), …115005522803 (T&C/Returns), …115005511246 (videos), …115005511666 (Google Maps), /hc/de/articles/115005510226; help.jimdo-dolphin.com …360034115612 (Legal Text Generator)

---

## 5. Squarespace

Doc version: version 7.1 unless noted (7.0 differs; articles show tabs for both). Cookie banner article "Last updated January 14, 2026".

### Detection signals
- ND in help docs. Squarespace documents its cookie names (article "The cookies Squarespace uses", fetched; e.g. `crumb`, `ss_*`). OBS on www.squarespace.com: header `server: Squarespace`, cookies `SS_MID`, `crumb`, header `x-contextid`, assets from `assets.squarespace.com` / `static1.squarespace.com`.

### a. Pages and navigation/footer
1. **Pages** panel → **+** next to Main Navigation → **+ Add Blank** (or layout) → title → Enter. Pages in **Not linked** are not shown in navigation. [adding-pages-to-your-navigation]
2. Footer (7.1): **Edit** on any page → hover footer → **Edit footer** → add blocks (e.g. text links to Impressum) → **Save**. [editing-footers]

### b. Cookie consent (built-in)
- **Cookies & Data Privacy** panel → toggle **Cookie banner** → choose **Decline all** / **Manage cookies** buttons → optional button labels/disclaimer → layout (Subfooter/Pill/Hidden) → **Save**; style via **Customize Banner Style**. With Manage cookies on, non-essential cookies stay restricted until accepted; settings under **Advanced Privacy Settings → Non-essential cookies**. Doc: banner restricts Squarespace and some (not all) third-party cookies; code injection may need adjusting. DE: "Aktiviere den Schalter neben dem Cookie-Banner". [cookie banner EN/DE, cookies-squarespace-uses]

### c. Fonts
- **Site styles** → **Fonts** (font packs). Doc: "Font packs use Google Fonts". Whether they are served from Google servers: ND. Custom upload: Site styles → font category → font dropdown → upload icon (.otf, .ttf, .woff, .woff2). [changing-fonts, uploading-custom-fonts]

### d. Tracking
- GA4: **Developer tools** panel → **External API keys** → **[Google Analytics account number]** field = measurement ID → **Save**. For consent: Cookies and Data Privacy → **Cookie banner** on + **Manage cookies button** on (non-essential cookies like GA not placed without consent). [connect-google-analytics]
- Code injection: **Code Injection** panel → Header/Footer → **Save** (Core, Plus, Advanced plans); per-page: page settings → **Advanced**. Don't add GA code there if using built-in GA. [code-injection]

### e. Price/tax/shipping
- **Taxes** panel → **Settings** → **How tax is added** → **Include in price** → **Save**. VAT number on receipts: **Checkout** panel → **Receipt details**. [collecting-vat-or-gst, set-up-and-collect-taxes]
- Shipping: ND (article not fetched).

### f. Checkout button label
- Fixed: "It's not possible to change the checkout page text at this time"; "button text can't change"; built-in field labels not editable. Only colors/header alignment. [styling-your-checkout-page]

### g. Embeds
- Section → **Add block** / **+** → **Embed** → pencil icon → URL (oEmbed) or **Code snippet** → **Embed Data**. [embed-blocks]

### h. Accessibility
- Alt text: **Pages** panel → page → **Edit** → block → pencil → **Content** tab → **Image alt text**. Contrast: ND in fetched pages. [add-alt-text]

Sources (fetched 2026-11-08), base https://support.squarespace.com/hc/en-us/articles/:
- 206545727 (Providing cookie consent options with a banner) ; DE: https://support.squarespace.com/hc/de/articles/206545727
- 360001264507 (The cookies Squarespace uses) ; 205815908 (code injection) ; 205815608 (Connect Google Analytics)
- 215074868 (Collecting VAT or GST) ; 36378332727949 (Set up and collect taxes) ; 205815328 (Styling your checkout page)
- 205814778 (Adding pages to navigation) ; 205816028 (Edit footer) ; 206543757 (blocks) ; 206543617 (Embed blocks)
- 206545327 (fonts) ; 40181698210701 (custom fonts) ; 206542357 (alt text) ; 205815928 (custom code overview)
- 404: 205812728, 205815338, 205811298, 206540737

---

## 6. Webflow

Doc version: current help center (2026-11). Custom code requires paid Workspace (Core/Growth/Agency/Freelancer) or active Site plan.

### Detection signals
- ND in fetched docs. OBS on webflow.com: attributes `data-wf-site`, `data-wf-page` on `<html>`, assets from `cdn.prod.website-files.com`.

### a. Pages and nav/footer
- **Pages** panel → **Create new page** icon → **New page** → name → **Create**. Links: link settings type **Page** (used for navbar links). [pages-panel-overview, link-settings]. Footer: ND.

### b. Cookie consent: no built-in banner documented in fetched pages. Article "Manage site tracking consent" FAILED (403) — not used. ND.

### c. Google Fonts
- Google fonts integration: **Site settings > Fonts tab > Google fonts** → **Add font**. Doc: uses Google Fonts API, "sends End User IP addresses to Google servers and may not be GDPR-compliant"; recommends download and upload in **Site settings > Fonts tab > Custom fonts**. Custom font with same name as a default Google font (e.g. Montserrat, Roboto) must be renamed or Webflow may keep loading it from Google. Default Designer Google fonts (e.g. Lato, Varela) don't appear in the Google fonts list. [add-google-fonts, upload-custom-fonts]

### d. Tracking / custom code
- **Site settings > Custom code tab** → **Head code** / **Footer code** → **Save changes**; page-level: **Page settings** → custom code; effective only after publishing. [custom-code-in-head-and-body-tags]
- GA integration article FAILED (403): ND here.

### e. Price/tax/shipping (Ecommerce)
- Tax-inclusive: **Settings panel > Ecommerce > Taxes** → switch inclusive option on; per country **Auto tax calculation** (EU supported via TaxJar). Countries come from shipping settings. [configure-taxes]
- Shipping details: ND (not fetched).

### f. Checkout button label: ND (cart/checkout article covers component styling, error messages; checkout components with required fields shouldn't be deleted). [customize-shopping-cart-checkout]

### g. Embeds
- **Add** panel → **Code Embed** → paste code → save; iframes preview on canvas, scripts only on live site. Paid plan required. [custom-code-embed]

### h. Accessibility: ND (alt text article not found/fetched).

Sources (fetched 2026-11-08), base https://help.webflow.com/hc/en-us/articles/:
- 33961360067987-Pages-panel-overview ; 33961408937747-Link-settings ; 33961332238611-Custom-code-embed
- 33961357265299-Custom-code-in-head-and-body-tags ; 33961287058451-Upload-custom-fonts ; 33961364593043-Add-Google-Fonts
- 33961409897747-Configure-taxes-on-Ecommerce-orders ; 33961364474643-Customize-the-shopping-cart-checkout-experience
- FAILED (403): 34272466616083-Manage-site-tracking-consent ; 33961293143059-Set-up-Google-Analytics

---

## 7. TYPO3

Doc version: "Tutorial for Editors" main (TYPO3 v14; e.g. "Changed in version 14.0: module renamed from Filelist to Media"). Much depends on the site package/integrator; editors often cannot change templates, fonts or scripts.

### Detection signals
- OBS on typo3.org: `<meta name="generator" content="TYPO3 CMS">`, HTML comment "This website is powered by TYPO3", asset path `/_assets/<hash>`. Documented source for generator tag: not found (ND). UNVERIFIED: `/typo3conf/`, `/typo3temp/` paths on older installs.

### a. Pages and menu
1. **Content > Layout** module → page tree → **+ Page** (or drag "Standard Page" icon) → choose position → **Insert subpage** → title; or right-click page → **New subpage**.
2. New pages are hidden: right-click → toggle **Enable**, or **Edit page properties** → **Access** tab → **Page visible**.
3. Menus are generated from the page tree by the template; footer pages "are usually stored in containers (for example, a footer menu container)" (Folder page type). **Alternative Navigation Title** sets menu label. Exact footer setup is integrator-specific. [creating-pages, page-types, page-properties]

### b. Cookie consent: not in core (ND). Officially documented way: extensions from **TYPO3 Extension Repository (TER)** or Packagist, installed via Composer (integrator task). Check TYPO3-version compatibility. [how-to-find-extensions, extensions]

### c. Google Fonts: ND (site package/integrator).
### d. Tracking: ND for editors (TypoScript/site package; integrator).
### e/f. Shop: not applicable (no core shop).

### g. Embeds
- Media content element: **Add media file**, or **Add media by URL** for YouTube/Vimeo. Doc warns external video sources can have data-privacy consequences; ask integrator to install an extension enabling privacy-safe YouTube use. [content-elements/media]

### h. Accessibility
- Images: content element **Images** tab → image metadata (description, **alt text**, link), override per usage; file metadata in **Media** module (formerly Filelist). Colors: ND (template). [content-elements/images, media-module]

German labels: not fetched (docs.typo3.org EN only).

Sources (fetched 2026-11-08), base https://docs.typo3.org/m/typo3/:
- tutorial-editors/main/en-us/Pages/CreatingPages/Index.html ; …/Pages/PageTypes/Index.html ; …/Pages/PageProperties/Index.html
- tutorial-editors/main/en-us/ContentElements/Index.html ; …/ContentElements/Images/Index.html ; …/ContentElements/Media/Index.html ; …/MediaModule/Index.html
- tutorial-getting-started/main/en-us/Extensions/Index.html ; …/Extensions/HowToFindExtensions.html
- https://typo3.org/ (markup observation only)
- 404: reference-typoscript/main/en-us/Setup/Config/Index.html ; …/TopLevelObjects/Config/Index.html ; tutorial-editors/main/en-us/ElementsVisibility/Index.html ; reference-coreapi/…/ExtensionManagement.html

---

## 8. Shopware 6

Doc version: current docs.shopware.com (self-hosted Shopware 6; SaaS docs label path "Settings > Shop > Basic information" — may differ). Note: same article uses two labels for the withdrawal button ("Show 'Revoke a contract' button in footer" / "Display 'Cancel contract' button in footer").

### Detection signals
- ND. UNVERIFIED conventions: `/bundles/storefront/`, `/theme/<hash>/` asset paths, `sw-*` cookies. (Cookie list exists in Cookie Consent Manager; not extracted.)

### a. Pages and footer
1. Create content page: **Content > Shopping Experiences** → layout of type **Shop page**. [shopping-experiences, footer tutorial]
2. Footer: **Catalogues > Categories** → category tree under the footer entry point (e.g. "Footernavigation") → **new subcategory** → assign Shopping Experiences layout (**Layout** tab) → activate (top category must be active too). Entry point: Sales channel → **Entry point footer navigation**. [basic-setup, categories, saleschannel]
3. Legal page assignment: **Settings > General > Basic information** (DE: **Einstellungen > Allgemein > Stammdaten**) → layouts for GTC, revocation notices (Widerrufsbelehrungen), payment & shipping info, privacy, imprint (Impressum), revocation request (Widerrufsantrag). [basic-information EN/DE]
4. Withdrawal button: same page → **Show "Revoke a contract" button in footer** (DE: **Button "Vertrag widerrufen" im Footer anzeigen**) → opens revocation-request layout. [basic-information EN/DE]

### b. Cookie consent (built-in)
- **Settings > General > Basic information** → **Use default cookie notification** (DE: **Standard-Cookie-Hinweis verwenden**); **Show "Accept all cookies" button** (DE: **„Alle Cookies akzeptieren"-Button anzeigen**). Global or per sales channel. Texts: **Settings > Shop > Snippets**, search "Cookie" (per FAQ). Re-open settings: category of type Link, external, target `/cookie/offcanvas` (deactivate "Use protocol"). [basic-information, cookie-consent-manager-faq]

### c. Fonts
- **Content > Themes** → theme configuration → fonts and colors. Google-hosted or not: ND. [themes]

### d. Tracking
- Sales channel → **Analytics** tab → Tracking/Measurement ID, **Activate Google Analytics**, **Anonymise IP**, **Track orders**, Enhanced Conversions. Consent coupling: ND in fetched pages. Extensions: **Extensions > My extensions**. [saleschannel, myextensions]

### e. Price/tax/shipping
- Gross/net display per customer group: **Settings** → Customer groups → tax display (gross/net). Sales channel **Tax calculation**. Shipping: **Settings > Commerce > Shipping** (DE: **Einstellungen > Handel > Versand**) → delivery time etc. [customergroups, saleschannel, shipping EN/DE]

### f. Order button label
- Storefront texts via **Settings > Shop > Snippets** (DE: **Einstellungen > Shop > Textbausteine**) → snippet set → search key → edit. Specific key for the order button: ND (doc example: `footer.serviceHotline`). [snippets EN/DE]

### g. Embeds
- Shopping Experiences elements **YouTube** (option "advanced privacy mode"), **Vimeo**, **HTML** (HTML sanitizer may strip tags). [shopping-experiences]

### h. Accessibility
- Alt text: **Content > Media** → select file → metadata (name, **alt-text**, meta-title). Colors: **Content > Themes** → theme colours. Contrast tool: ND. [media, themes]

Sources (fetched 2026-11-08):
- https://docs.shopware.com/en/shopware-en/settings/basic-information ; DE https://docs.shopware.com/de/shopware-de/einstellungen/stammdaten
- https://docs.shopware.com/en/shopware-6-en/tutorials-und-faq/howto/cookie-consent-manager-faq
- https://docs.shopware.com/en/shopware-6-en/tutorials-and-faq/gdpr
- https://docs.shopware.com/en/shopware-6-en/settings/snippets ; DE https://docs.shopware.com/de/shopware-6-de/einstellungen/Textbausteine
- https://docs.shopware.com/en/shopware-6-en/settings/saleschannel
- https://docs.shopware.com/en/shopware-6-en/tutorials-and-faq/basic-setup
- https://docs.shopware.com/en/shopware-6-en/catalogues/categories
- https://docs.shopware.com/en/shopware-6-en/settings/customergroups
- https://docs.shopware.com/en/shopware-6-en/settings/shipping ; DE https://docs.shopware.com/de/shopware-6-de/einstellungen/versand
- https://docs.shopware.com/en/shopware-6-en/content/Themes ; https://docs.shopware.com/en/shopware-6-en/content/media ; https://docs.shopware.com/en/shopware-6-en/content/ShoppingExperiences
- https://docs.shopware.com/en/shopware-6-en/extensions/myextensions
- 404: https://docs.shopware.com/en/shopware-6-en/settings/tax ; https://docs.shopware.com/de/shopware-6-de/einstellungen/grundeinstellungen

---

## Gap summary
- Webflow: consent and GA articles blocked (403) → b, d(GA) ND; alt text, shipping, checkout label ND.
- Jimdo: Dolphin cookie banner, embeds, accessibility, fonts, checkout label ND; several Creator pages blocked.
- Squarespace: shipping article not found; contrast ND.
- Wix: footer menu, colors/contrast ND; Studio/Harmony editors differ.
- Shopify/Shopware/Squarespace/Wix: whether built-in fonts load from Google ND (Squarespace says font packs "use Google Fonts").
- Shopware: order-button snippet key, GA-consent coupling ND. TYPO3: generator tag documented source ND; fonts/tracking integrator-only.
- Detection signals for Shopify, Jimdo, Shopware not verified (no official doc, no observation).
- German labels fetched only for Shopify, Wix (banner), Squarespace (banner), Shopware.
