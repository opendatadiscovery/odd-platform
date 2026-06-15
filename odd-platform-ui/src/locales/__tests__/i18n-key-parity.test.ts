import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import en from '../translations/en.json';

/**
 * i18n key-parity guard (odd-platform#1751).
 *
 * THE INVARIANT: every key referenced by a `t('...')` call in src MUST exist in `en.json`.
 *
 * WHY IT EXISTS: when a key is missing from en.json, i18next walks `fallbackLng`. If that chain
 * routes through another locale that DOES have the key (e.g. `br`), the string renders in THAT
 * language for every user -- the #1564 regression that put Brazilian Portuguese ("Buscar por nome")
 * on the English DQ dashboard. `fallbackLng: 'en'` (i18n.ts) is the structural floor; THIS test is
 * the deterministic prevention -- it fails the moment a `t('literal')` key is added without its
 * en.json entry, so the gap can never reach a release again.
 *
 * Extraction note: the repo's `i18next-scanner` (`npm run i18n:scan`) is the codegen-time extractor;
 * this test is the assertion complement -- a self-contained completeness check that runs with the
 * normal `vitest` suite, no scanner config needed. The regex matches a STANDALONE `t('...')` call
 * (word boundary before `t`) so it does not match `import('...')`, `format('...')`, `get('...')` etc.
 *
 * Dynamic calls (`t(variable)`) are out of scope -- only string literals are checkable.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const SRC_ROOT = path.resolve(here, '../..'); // src/locales/__tests__ -> src
const TRANSLATIONS_DIR = path.resolve(here, '../translations'); // src/locales/translations
// Matches a standalone `t('literal')` AND an interpolation call `t('literal {{x}}', { x })`
// (the trailing `[,)]` allows the optional second argument), so interpolation keys are guarded too.
const T_LITERAL = /(?<![\w$.])t\(\s*'([^'\n]+)'\s*[,)]/g;

// Every non-en locale catalog, discovered from disk so a future locale (e.g. the way `br`
// arrived as the seventh) is covered automatically — no import to add.
function localeCatalogs(): Record<string, Record<string, string>> {
  const out: Record<string, Record<string, string>> = {};
  for (const file of fs.readdirSync(TRANSLATIONS_DIR)) {
    const m = /^([a-z]{2})\.json$/.exec(file);
    if (m && m[1] !== 'en') {
      out[m[1]] = JSON.parse(fs.readFileSync(path.join(TRANSLATIONS_DIR, file), 'utf-8'));
    }
  }
  return out;
}

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip generated code, deps, and TEST files — the latter contain illustrative / mock
      // `t('...')` calls (including this guard's own examples) that are not production key
      // references; scanning them self-matches and false-fails the en-completeness check.
      if (
        entry.name === 'generated-sources' ||
        entry.name === 'node_modules' ||
        entry.name === '__tests__'
      ) {
        continue;
      }
      walk(full, acc);
    } else if (/\.tsx?$/.test(entry.name)) {
      acc.push(full);
    }
  }
  return acc;
}

function referencedKeys(): Set<string> {
  const keys = new Set<string>();
  for (const file of walk(SRC_ROOT)) {
    const text = fs.readFileSync(file, 'utf-8');
    for (const m of text.matchAll(T_LITERAL)) keys.add(m[1]);
  }
  return keys;
}

describe('i18n key parity (#1751 — no foreign-language leak)', () => {
  it("every t('literal') key referenced in src exists in en.json", () => {
    const enKeys = new Set(Object.keys(en as Record<string, string>));
    const missing = [...referencedKeys()].filter(k => !enKeys.has(k)).sort();
    // A non-empty list means a key would fall back to a non-en locale (or render the raw key);
    // add it to en.json (natural-keys: value === key) before merging.
    expect(missing, `t() keys missing from en.json: ${JSON.stringify(missing)}`).toEqual(
      []
    );
  });
});

describe('i18n catalog parity (#1751 — every locale carries en.json, no orphans)', () => {
  // THE INVARIANT: every non-en catalog has EXACTLY en.json's key set.
  //
  // WHY IT EXISTS: en.json is complete (the en-completeness test above), and `fallbackLng: 'en'`
  // (i18n.ts) renders the English label for any key a locale is missing. So a missing key is not a
  // crash or a foreign-language leak — it is a silently-untranslated English fragment in an
  // otherwise-localised UI (the #1751 catch-up: each non-en catalog trailed en by 84 keys). An
  // ORPHAN key (present in a locale, absent from en) is dead weight — no `t()` call reaches it, and
  // it diverges the catalogs. This test fails the build if either gap reappears, so "complete the
  // catalogs" stays true instead of regrowing a third time (the catalogs drifted, #1748, then this).
  const enKeys = new Set(Object.keys(en as Record<string, string>));
  const catalogs = localeCatalogs();

  it('there is at least one non-en catalog to check (guard is wired to real files)', () => {
    expect(Object.keys(catalogs).length).toBeGreaterThan(0);
  });

  for (const [code, catalog] of Object.entries(catalogs)) {
    it(`${code}.json has exactly en.json's keys (no missing, no orphan)`, () => {
      const keys = new Set(Object.keys(catalog));
      const missing = [...enKeys].filter(k => !keys.has(k)).sort();
      const orphan = [...keys].filter(k => !enKeys.has(k)).sort();
      expect(
        missing,
        `${code}.json is MISSING ${missing.length} key(s) present in en.json (they render the English fallback under ${code}): ${JSON.stringify(missing)}`
      ).toEqual([]);
      expect(
        orphan,
        `${code}.json has ${orphan.length} ORPHAN key(s) absent from en.json (dead / stale — no t() call reaches them): ${JSON.stringify(orphan)}`
      ).toEqual([]);
    });
  }
});
