import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import theme from 'theme/mui.theme';
import { render } from 'lib/tests/testHelpers';
import { HIGHLIGHT_MARK_END, HIGHLIGHT_MARK_START } from 'lib/search/highlightMarkers';
import { AssetKind, type Asset, type AssetSearchHighlight } from 'generated-sources';
import type { RootState } from 'redux/interfaces';
import SearchHighlights from '../SearchHighlights';

/**
 * ST-12 (#1846) — the body of the (?) tooltip, per kind. The per-row highlight is fetched ON MOUNT through the
 * polymorphic endpoint with the (kind, id, query) triple; the sections render only what the highlight carries;
 * the two terminal sentences replace what used to be an empty popper.
 *
 * The generated client is replaced at the module boundary so no request is made; the thunk still runs, so the
 * slice, the selectors and the mount effect are the real ones.
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

const mark = (word: string) => `${HIGHLIGHT_MARK_START}${word}${HIGHLIGHT_MARK_END}`;

beforeAll(() => {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: {
        translation: {
          Term: 'Term',
          Name: 'Name',
          Definition: 'Definition',
          Namespace: 'Namespace',
          Tag: 'Tag',
          Owner: 'Owner',
          'Query Example': 'Query Example',
          Query: 'Query',
          'Linked entities': 'Linked entities',
          'External name': 'External name',
          'Business name': 'Business name',
          'Data Entity': 'Data Entity',
          'No field matches to show': 'No field matches to show',
          "Couldn't load match details": "Couldn't load match details",
        },
      },
    },
    interpolation: { escapeValue: false },
  });
});

const termAsset: Asset = {
  assetKind: AssetKind.TERM,
  term: {
    id: 3,
    name: 'Revenue',
    definition: 'def',
    namespace: { id: 1, name: 'finance' },
  },
};
const queryExampleAsset: Asset = {
  assetKind: AssetKind.QUERY_EXAMPLE,
  queryExample: { id: 5, definition: 'daily totals', query: 'select 1' },
};

const renderTip = (asset: Asset, query = 'rev', preloaded?: Partial<RootState>) =>
  render(
    <MuiThemeProvider theme={theme}>
      <SearchHighlights asset={asset} query={query} />
    </MuiThemeProvider>,
    { preloadedState: preloaded }
  );

describe('SearchHighlights (ST-12 / #1846)', () => {
  it('fetches the row highlight on mount with the (kind, id, query) triple', async () => {
    highlightAsset.mockResolvedValueOnce({
      assetKind: AssetKind.TERM,
      term: { name: mark('Revenue') },
    });
    renderTip(termAsset, 'rev -test');
    await waitFor(() =>
      expect(highlightAsset).toHaveBeenCalledWith({
        assetKind: AssetKind.TERM,
        assetId: 3,
        query: 'rev -test',
      })
    );
  });

  it('a Term renders its Term / Namespace / Tag / Owner sections, only the marked ones', async () => {
    const highlight: AssetSearchHighlight = {
      assetKind: AssetKind.TERM,
      term: {
        name: mark('Revenue'),
        namespace: { name: mark('finance') },
        tags: [{ id: 9, name: mark('pii'), important: false }],
        owners: [{ owner: 'bob', title: mark('steward') }],
      },
    };
    highlightAsset.mockResolvedValueOnce(highlight);
    const { container } = renderTip(termAsset);
    await screen.findByText('Term');
    expect(screen.getByText('Namespace')).toBeInTheDocument();
    expect(screen.getByText('Tag')).toBeInTheDocument();
    expect(screen.getByText('Owner')).toBeInTheDocument();
    expect(screen.queryByText('Definition')).toBeNull();
    const bolds = Array.from(container.querySelectorAll('b')).map(b => b.textContent);
    expect(bolds).toEqual(
      expect.arrayContaining(['Revenue', 'finance', 'pii', 'steward'])
    );
    expect(container.textContent).not.toContain(HIGHLIGHT_MARK_START);
  });

  it('a Query Example renders Definition / Query and its Linked entities', async () => {
    highlightAsset.mockResolvedValueOnce({
      assetKind: AssetKind.QUERY_EXAMPLE,
      queryExample: {
        query: `select * from ${mark('orders')} where a<b`,
        linkedEntities: [{ externalName: mark('orders') }],
      },
    });
    const { container } = renderTip(queryExampleAsset, 'orders');
    await screen.findByText('Query Example');
    expect(screen.getByText('Query')).toBeInTheDocument();
    expect(screen.getByText('Linked entities')).toBeInTheDocument();
    expect(screen.getByText('External name')).toBeInTheDocument();
    expect(container.textContent).toContain('where a<b');
    expect(container.querySelector('img')).toBeNull();
  });

  it('a highlight with nothing marked says so instead of an empty popper', async () => {
    highlightAsset.mockResolvedValueOnce({ assetKind: AssetKind.TERM, term: {} });
    renderTip(termAsset);
    expect(await screen.findByText('No field matches to show')).toBeInTheDocument();
    expect(screen.queryByText('Term')).toBeNull();
  });

  it('a rejected fetch says so instead of an empty popper', async () => {
    highlightAsset.mockRejectedValueOnce(new Response(null, { status: 404 }));
    renderTip(termAsset);
    expect(await screen.findByText("Couldn't load match details")).toBeInTheDocument();
  });
});
