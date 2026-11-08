#!/usr/bin/env node
// Document languages other than German and English (decision 41a): Claude translates the
// English text set at run time. This module writes the translation template and turns a
// translated file back into a text set, after checking that nothing is missing.
//
// Usage: node scripts/translation.mjs --template <out.json>
//        node scripts/translation.mjs --check <translated.json>
//
// Template format: the English texts; every function becomes a string with {name}
// placeholders, and [[…]] marks a part that is left out when its placeholders are empty.

import { readFile, writeFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { texts } from './lib/report/i18n.mjs';

const ABBREVIATIONS = JSON.parse(readFileSync(new URL('../data/abbreviations.json', import.meta.url), 'utf8')).entries;
const LANG_CODE = /^[a-z]{2,3}(-[A-Za-z0-9]{2,8})?$/;
const PLACEHOLDER = /\{(\w+)\}/g;
const OPTIONAL = /\[\[([\s\S]*?)\]\]/g;
const TAG = /<[^>]+>/g;

const paramNames = (fn) => {
  const match = fn.toString().match(/^\(?([^)=]*)\)?\s*=>/);
  return match ? match[1].split(',').map((p) => p.trim()).filter(Boolean) : [];
};

/** Range of `full` that disappears when one argument is empty, or null if only the placeholder goes. */
function optionalRange(full, without, token) {
  if (without === full.replace(token, '')) return null;
  let start = 0;
  while (start < without.length && full[start] === without[start]) start += 1;
  let end = 0;
  while (end < without.length - start && full[full.length - 1 - end] === without[without.length - 1 - end]) end += 1;
  return [start, full.length - end];
}

/** Template of one text function: a string (or list of strings) with {name} placeholders. */
export function templateOf(fn) {
  const names = paramNames(fn);
  const tokens = names.map((n) => `{${n}}`);
  const full = fn(...tokens);
  if (Array.isArray(full)) return full;
  const ranges = names.map((_, i) => optionalRange(full, fn(...tokens.map((t, j) => (j === i ? '' : t))), tokens[i])).filter(Boolean);
  return ranges.sort((x, y) => y[0] - x[0]).reduce((tpl, [from, to]) => `${tpl.slice(0, from)}[[${tpl.slice(from, to)}]]${tpl.slice(to)}`, full);
}

function toTemplate(value) {
  if (typeof value === 'function') return templateOf(value);
  if (Array.isArray(value)) return value.map(toTemplate);
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toTemplate(v)]));
  return value;
}

/** Everything Claude translates: the English texts plus the long forms of the abbreviations. */
export function translationTemplate() {
  const { files, ...rest } = texts('en');
  return {
    _comment: 'Translate every string into the document language. Keep {placeholders}, [[ ]] markers, HTML tags, Markdown and the German legal terms in quotes unchanged. Set "lang" to the ISO 639-1 code and "languageName" to the name of the language in that language.',
    ...toTemplate(rest),
    lang: '',
    languageName: '',
    abbreviations: Object.fromEntries(ABBREVIATIONS.map((a) => [a.short, a.longEn ?? a.long])),
  };
}

const sorted = (items) => [...items].sort().join('|');
const tokensOf = (text, pattern) => sorted([...text.matchAll(pattern)].map((m) => m[0]));

function fill(template, names, args) {
  const value = (name) => String(args[names.indexOf(name)] ?? '');
  return template
    .replace(OPTIONAL, (_, inner) => ([...inner.matchAll(PLACEHOLDER)].every((m) => value(m[1]) === '') ? '' : inner))
    .replace(PLACEHOLDER, (m, name) => (names.includes(name) ? value(name) : m));
}

/**
 * Text set for a translated file. Throws with a list of every problem (missing or empty
 * text, changed placeholders, [[ ]] markers or HTML tags, wrong list length).
 * @param {object} translated parsed translation file
 */
export function customTexts(translated) {
  const en = texts('en');
  const errors = [];
  const sameTokens = (ref, val, path) => {
    for (const [pattern, what] of [[PLACEHOLDER, 'placeholders'], [/\[\[|\]\]/g, '[[ ]] markers'], [TAG, 'HTML tags']]) {
      if (tokensOf(ref, pattern) !== tokensOf(val, pattern)) errors.push(`${path}: ${what} differ from the template`);
    }
  };
  const build = (ref, val, path) => {
    if (typeof ref === 'function') {
      const tpl = templateOf(ref);
      const names = paramNames(ref);
      if (Array.isArray(tpl)) {
        if (!Array.isArray(val) || val.length !== tpl.length) { errors.push(`${path}: expected a list of ${tpl.length} texts`); return ref; }
        val.forEach((v, i) => (typeof v === 'string' && v.trim() ? sameTokens(tpl[i], v, `${path}[${i}]`) : errors.push(`${path}[${i}]: missing`)));
        return (...args) => val.map((v) => fill(v, names, args));
      }
      if (typeof val !== 'string' || !val.trim()) { errors.push(`${path}: missing`); return ref; }
      sameTokens(tpl, val, path);
      return (...args) => fill(val, names, args);
    }
    if (Array.isArray(ref)) {
      if (!Array.isArray(val) || val.length !== ref.length) { errors.push(`${path}: expected a list of ${ref.length} texts`); return ref; }
      return ref.map((r, i) => build(r, val[i], `${path}[${i}]`));
    }
    if (ref && typeof ref === 'object') {
      if (!val || typeof val !== 'object') { errors.push(`${path}: missing`); return ref; }
      return Object.fromEntries(Object.keys(ref).map((k) => [k, build(ref[k], val[k], path ? `${path}.${k}` : k)]));
    }
    if (typeof val !== 'string' || !val.trim()) { errors.push(`${path}: missing`); return ref; }
    sameTokens(ref, val, path);
    return val;
  };
  const { files, lang, ...rest } = en;
  const result = build(rest, translated, '');
  if (!LANG_CODE.test(translated.lang ?? '')) errors.push('lang: expected an ISO 639-1 code such as "fr"');
  if (typeof translated.languageName !== 'string' || !translated.languageName.trim()) errors.push('languageName: missing');
  const abbreviations = translated.abbreviations ?? {};
  for (const a of ABBREVIATIONS) if (typeof abbreviations[a.short] !== 'string' || !abbreviations[a.short].trim()) errors.push(`abbreviations.${a.short}: missing`);
  if (errors.length) throw new Error(`Translation incomplete:\n- ${errors.join('\n- ')}`);
  // File names stay English for every other language (decision 43a).
  return { ...result, files, lang: translated.lang, languageName: translated.languageName, abbreviations, translated: true };
}

/** Read and check a translation file. */
export async function loadCustomTexts(file) {
  return customTexts(JSON.parse(await readFile(file, 'utf8')));
}

async function main() {
  const { values } = parseArgs({ options: { template: { type: 'string' }, check: { type: 'string' } } });
  if (values.template) {
    await writeFile(values.template, `${JSON.stringify(translationTemplate(), null, 1)}\n`);
    console.log(JSON.stringify({ template: values.template }));
  } else if (values.check) {
    const t = await loadCustomTexts(values.check);
    console.log(JSON.stringify({ ok: true, lang: t.lang, languageName: t.languageName }));
  } else {
    console.log('Usage: node scripts/translation.mjs --template <out.json> | --check <translated.json>');
    process.exit(2);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).toString()) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
