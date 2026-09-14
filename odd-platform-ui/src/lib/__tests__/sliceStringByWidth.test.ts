import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { HIGHLIGHT_MARK_END, HIGHLIGHT_MARK_START } from 'lib/search/highlightMarkers';
import { sliceStringByWidth } from 'lib/helpers';

/**
 * ST-12 (#1846) — `sliceStringByWidth` windows a long highlight string around its FIRST marked span. The probe
 * it looks for is the server's private-use mark pair (`lib/search/highlightMarkers`), not `<b>`: on a
 * `<b>`-marked string it finds no span at all, which is the RED half of the marker change (the old probe).
 *
 * jsdom has no layout (every offsetWidth is 0, so the window would always grow to the whole string); the
 * measurement is stubbed to 8 px per character so the window is deterministic.
 */
const descriptor = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'offsetWidth');

beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
    configurable: true,
    get(this: HTMLElement) {
      return (this.textContent ?? '').length * 8;
    },
  });
});

afterAll(() => {
  if (descriptor) Object.defineProperty(HTMLElement.prototype, 'offsetWidth', descriptor);
});

const words = () => Array.from({ length: 200 }, (_, i) => `w${i}`);

describe('sliceStringByWidth (ST-12 / #1846)', () => {
  it('centres a bounded window on the first sentinel-marked word', () => {
    const list = words();
    list[150] = `${HIGHLIGHT_MARK_START}target${HIGHLIGHT_MARK_END}`;
    const out = sliceStringByWidth(list.join(' '), 200);
    expect(out).toContain(`${HIGHLIGHT_MARK_START}target${HIGHLIGHT_MARK_END}`);
    expect(out.startsWith('...')).toBe(true);
    expect(out.endsWith('...')).toBe(true);
    expect(out).toContain('w149');
    expect(out).toContain('w151');
    expect(out).not.toContain('w100 ');
  });

  it('does NOT recognise the old <b> dialect as a mark', () => {
    const list = words();
    list[150] = '<b>target</b>';
    const out = sliceStringByWidth(list.join(' '), 200);
    // no marked word is found, so the window is built from index -1 and never reaches word 150
    expect(out).not.toContain('<b>target</b>');
  });

  it('returns an empty string for empty input', () => {
    expect(sliceStringByWidth('', 100)).toBe('');
  });
});
