// Content signals on the imprint (§ 5 Abs. 1 DDG, SRC-16) and the privacy policy
// (Art. 13 DSGVO, SRC-04). Keyword checks only: every result is a hint for Claude to verify.

import { matchService, policyMentions } from '../third-parties.mjs';
import { finding, pageOfType, policyPage } from './helpers.mjs';

const url = (p) => p.finalUrl ?? p.url;

/** "AG" after a register court is the court (Amtsgericht), not a legal form. */
const COURT_AG = /(registergericht|amtsgericht|gericht)\s*:?\s*AG\b/gi;
/** Juristische Personen: § 5 Abs. 1 Nr. 1 DDG requires legal form and representative. */
const LEGAL_PERSON = /\b(g?GmbH|UG|AG|SE|KGaA|eG)\b|\be\.\s?V\./;
/** Forms that are entered in a register by law (§ 5 Abs. 1 Nr. 4 DDG). GbR is optional, left out. */
const REGISTERED_FORM = /\b(g?GmbH|UG|AG|SE|KGaA|eG|KG|OHG|PartG(\s?mbB)?)\b|\be\.\s?(V|K|Kfm|Kfr)\./;
const REPRESENTATIVE = /geschäftsführ|vertreten durch|vertretungsberechtigt|vorstand|managing director|represented by|\bceo\b/i;
const REGISTER = /handelsregister|registergericht|registernummer|vereinsregister|partnerschaftsregister|genossenschaftsregister|\b(HR[AB]|VR|PR|GnR)\s*\d|commercial register|register court/i;
/** Professions organised in chambers (§ 5 Abs. 1 Nr. 5 DDG). */
const CHAMBER_PROFESSION = /rechtsanw[aä]lt|steuerberater|wirtschaftspr[üu]fer|notar(in)?\b|patentanw[aä]lt|zahn[aä]rzt|tier[aä]rzt|\b[aä]rzt(in)?\b|apotheker|architekt|psychotherapeut|beratende[rn]? ingenieur/i;
const CHAMBER = /kammer|chamber/i;
const OUTDATED_TMG = /§\s*5\s*TMG|telemediengesetz/i;

/** IMP-04: legal form, representative, register, chamber, outdated § 5 TMG (decision 59a). */
export function checkImprintDetails(scan) {
  const page = pageOfType(scan, 'imprint');
  if (!page) return [];
  const text = page.facts.bodyText ?? '';
  const forms = text.replace(COURT_AG, ' ');
  const hint = (title, evidence) => finding('IMP-04', 'hint', title, [url(page)], evidence);
  const results = [];
  if (LEGAL_PERSON.test(forms) && !REPRESENTATIVE.test(text)) {
    results.push(hint('Imprint: legal person without a recognised representative', { missing: 'representative' }));
  }
  if (REGISTERED_FORM.test(forms) && !REGISTER.test(text)) {
    results.push(hint('Imprint: registered legal form without register and register number', { missing: 'register' }));
  }
  if (CHAMBER_PROFESSION.test(text) && !CHAMBER.test(text)) {
    results.push(hint('Imprint: chamber profession named, but no chamber', { missing: 'chamber' }));
  }
  if (OUTDATED_TMG.test(text)) results.push(hint('Imprint refers to the outdated § 5 TMG', { outdated: '§ 5 TMG' }));
  return results;
}

/** Art. 13 DSGVO elements, recognised by German or English keywords. */
const POLICY_ELEMENTS = [
  ['controller', /verantwortlich|controller/i],
  ['legalBasis', /rechtsgrundlage|art\.?\s*6|legal basis/i],
  ['storagePeriod', /speicherdauer|dauer der speicherung|löschfrist|aufbewahrungsfrist|gelöscht|löschung|storage period|retention|retain/i],
  ['rights', /auskunft|right of access|right to access/i],
  ['complaint', /beschwerde|aufsichtsbehörde|supervisory authority|complaint/i],
  ['withdrawal', /widerruf|withdraw/i],
];

/** DSE-03: missing Art. 13 elements; consent tool not named (decision 60a). */
export function checkPolicyContent(scan) {
  const page = policyPage(scan);
  if (!page) return [];
  const text = page.facts.bodyText ?? '';
  const results = [];
  const missing = POLICY_ELEMENTS.filter(([, pattern]) => !pattern.test(text)).map(([key]) => key);
  if (missing.length > 0) {
    results.push(finding('DSE-03', 'hint', 'Privacy policy: Art. 13 elements not recognised', [url(page)], { missing }));
  }
  const tools = new Set();
  for (const request of scan.requests ?? []) {
    const service = request.thirdParty ? matchService(request.url) : null;
    if (service?.category === 'consent' && !policyMentions(service, text)) tools.add(service.name);
  }
  if (tools.size > 0) {
    results.push(finding('DSE-03', 'hint', 'Privacy policy does not name the consent tool', [url(page)], { consentTools: [...tools] }));
  }
  return results;
}
