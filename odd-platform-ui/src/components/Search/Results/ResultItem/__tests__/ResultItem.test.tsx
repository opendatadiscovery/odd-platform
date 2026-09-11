import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import theme from 'theme/mui.theme';
import { render } from 'lib/tests/testHelpers';
import { AssetKind, type Asset } from 'generated-sources';
import type { RootState } from 'redux/interfaces';
import ResultItem from '../ResultItem';

/**
 * ST-12 (#1846) — the (?) "why it matched" badge is on EVERY kind of result row with a ref whenever a text query
 * is active, and on none when there is no query; it is a keyboard stop that opens the tooltip on focus. The
 * per-row fetch is proven to fire from the keyboard path (the tooltip body mounts → the thunk dispatches).
 */
const { highlightAsset } = vi.hoisted(() => ({ highlightAsset: vi.fn() }));
vi.mock('lib/api', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, assetSearchApi: { highlightAsset } };
});
vi.mock('lib/errorHandling', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, showSuccessToast: vi.fn(), showServerErrorToast: vi.fn() };
});

beforeAll(() => {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: { translation: { 'Why it matched': 'Why it matched', Term: 'Term' } },
    },
    interpolation: { escapeValue: false },
  });
});

const term: Asset = {
  assetKind: AssetKind.TERM,
  term: {
    id: 3,
    name: 'Revenue',
    definition: 'def',
    namespace: { id: 1, name: 'finance' },
  },
};
const queryExample: Asset = {
  assetKind: AssetKind.QUERY_EXAMPLE,
  queryExample: { id: 5, definition: 'daily totals', query: 'select 1' },
};
const nullRef: Asset = { assetKind: AssetKind.DATA_ENTITY };

const withQuery = (query: string): Partial<RootState> =>
  ({ dataEntitySearch: { query } }) as unknown as Partial<RootState>;

const renderRow = (asset: Asset, query: string) =>
  render(
    <MuiThemeProvider theme={theme}>
      <ResultItem asset={asset} />
    </MuiThemeProvider>,
    { preloadedState: withQuery(query), initialEntries: ['/search?q=' + query] }
  );

const badge = () => screen.queryByTestId('search-result-why-matched');

describe('ResultItem (?) badge (ST-12 / #1846)', () => {
  it('a Term row carries the badge when a query is active', () => {
    renderRow(term, 'rev');
    expect(badge()).not.toBeNull();
    expect(badge()).toHaveAttribute('aria-label', 'Why it matched');
    expect(badge()).toHaveAttribute('role', 'img');
  });

  it('a Query Example row carries the badge when a query is active', () => {
    renderRow(queryExample, 'orders');
    expect(badge()).not.toBeNull();
  });

  it('no badge without a query (browse / filters only)', () => {
    renderRow(term, '');
    expect(badge()).toBeNull();
  });

  it('no badge on a row whose ref is absent (PLT-147 guard)', () => {
    renderRow(nullRef, 'x');
    expect(badge()).toBeNull();
  });

  it('the badge is a keyboard stop and opening it from the keyboard fetches the row highlight', async () => {
    // MUI opens a tooltip on focus only when the focus is VISIBLE (`target.matches(':focus-visible')`), which
    // jsdom cannot decide (it has no input-modality tracking). Shim the pseudo-class to "is the focused element"
    // for this case — a real Tab in a real browser is focus-visible by definition; IT-158 case 13 proves it there.
    const nativeMatches = Element.prototype.matches;
    Element.prototype.matches = function matches(this: Element, selector: string) {
      if (selector === ':focus-visible') return document.activeElement === this;
      return nativeMatches.call(this, selector);
    };
    try {
      highlightAsset.mockResolvedValue({ assetKind: AssetKind.TERM, term: {} });
      renderRow(term, 'rev');
      const icon = badge() as HTMLElement;
      expect(icon).toHaveAttribute('tabindex', '0');
      const user = userEvent.setup();
      await user.tab();
      expect(document.activeElement).toBe(icon);
      await waitFor(() =>
        expect(highlightAsset).toHaveBeenCalledWith({
          assetKind: AssetKind.TERM,
          assetId: 3,
          query: 'rev',
        })
      );
    } finally {
      Element.prototype.matches = nativeMatches;
    }
  });
});
