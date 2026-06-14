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
const T_LITERAL = /(?<![\w$.])t\(\s*'([^'\n]+)'\s*\)/g;

function walk(dir: string, acc: string[] = []): string[] {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'generated-sources' || entry.name === 'node_modules') continue;
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
  it('every t(\'literal\') key referenced in src exists in en.json', () => {
    const enKeys = new Set(Object.keys(en as Record<string, string>));
    const missing = [...referencedKeys()].filter(k => !enKeys.has(k)).sort();
    // A non-empty list means a key would fall back to a non-en locale (or render the raw key);
    // add it to en.json (natural-keys: value === key) before merging.
    expect(missing, `t() keys missing from en.json: ${JSON.stringify(missing)}`).toEqual([]);
  });
});
