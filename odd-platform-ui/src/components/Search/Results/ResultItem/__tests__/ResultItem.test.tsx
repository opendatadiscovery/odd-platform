import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import theme from 'theme/mui.theme';
import en from 'locales/translations/en.json';
import { render } from 'lib/tests/testHelpers';
import { AssetKind, type Asset } from 'generated-sources';
import type { RootState } from 'redux/interfaces';
import { DEFAULT_RESULT_COLUMNS } from 'lib/search/resultColumns';
import ResultItem from '../ResultItem';

/**
 * ST-12 (#1846) — the (?) "why it matched" badge is on EVERY kind of result row with a ref whenever a text query
 * is active, and on none when there is no query; it is a keyboard stop that opens the tooltip on focus. The
 * per-row fetch is proven to fire from the keyboard path (the tooltip body mounts → the thunk dispatches).
 */
const { highlightAsset, getTermDetails } = vi.hoisted(() => ({
  highlightAsset: vi.fn(),
  getTermDetails: vi.fn(),
}));
vi.mock('lib/api', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, assetSearchApi: { highlightAsset }, termApi: { getTermDetails } };
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
      en: {
        // ST-13a: the cell tests render catalog labels + the two empty-state texts, so the real en catalog is loaded.
        translation: en,
      },
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
      <ResultItem asset={asset} columns={[...DEFAULT_RESULT_COLUMNS]} />
    </MuiThemeProvider>,
    { preloadedState: withQuery(query), initialEntries: ['/search?q=' + query] }
  );

const badge = () => screen.queryByTestId('search-result-why-matched');
const preview = () => screen.queryByTestId('asset-details-preview');

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

/**
 * #1899 — the (i) details preview is on EVERY kind of row with a ref (it used to be Data-Entity-only), and a Term
 * row shows its NAME only: the inline definition that crushed the name is gone (it lives in the card).
 */
describe('ResultItem (i) details preview (#1899)', () => {
  it('a Term row carries the (i) — with or without a query', () => {
    renderRow(term, '');
    expect(preview()).not.toBeNull();
    expect(preview()).toHaveAttribute('aria-label', 'Show details');
  });

  it('a Query Example row carries the (i)', () => {
    renderRow(queryExample, 'orders');
    expect(preview()).not.toBeNull();
  });

  it('a Term row does not print its definition inline any more — the name is the row', () => {
    renderRow(term, 'rev');
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.queryByText('def')).toBeNull();
  });

  it('no (i) on a row whose ref is absent (PLT-147 guard — the same gate as the star)', () => {
    renderRow(nullRef, 'x');
    expect(preview()).toBeNull();
  });
});

/**
 * ST-13a (#1847) — the row is rendered FROM THE LAYOUT, and every optional cell has exactly one of three states:
 * the value, "Not applicable" (the row's kind / class does not carry the column) or "No value" (it does, but
 * nothing is set) — each empty state an em dash with visually-hidden text (CTRIB-073 R4).
 */
describe('ResultItem cells (ST-13a / #1847)', () => {
  const dataset: Asset = {
    assetKind: AssetKind.DATA_ENTITY,
    dataEntity: {
      id: 7,
      externalName: 'orders',
      status: { status: 'STABLE' as never },
      isStale: false,
      entityClasses: [{ id: 1, name: 'DATA_SET' as never, types: [] }],
    },
    fields: {
      namespace: { id: 1, name: 'finance' },
      owners: [
        { id: 1, owner: { id: 1, name: 'alice' }, title: { id: 1, name: 'steward' } },
      ],
      rowsCount: 123456,
      description: 'the orders table',
      suiteUrl: undefined,
    },
  };
  const group: Asset = {
    assetKind: AssetKind.DATA_ENTITY,
    dataEntity: {
      id: 8,
      externalName: 'dag',
      status: { status: 'DRAFT' as never },
      isStale: false,
      entityClasses: [{ id: 8, name: 'DATA_ENTITY_GROUP' as never, types: [] }],
    },
    fields: { entitiesCount: 2 },
  };
  const termWithFields: Asset = {
    ...term,
    fields: { namespace: { id: 1, name: 'finance' } },
  };

  const cell = (id: string) => screen.getByTestId(`search-cell-${id}`);

  it('renders the layout in order and reads each value through the catalog', () => {
    render(
      <MuiThemeProvider theme={theme}>
        <ResultItem
          asset={dataset}
          columns={['namespace', 'owners', 'rows_count', 'description', 'status']}
        />
      </MuiThemeProvider>,
      { preloadedState: withQuery(''), initialEntries: ['/search'] }
    );
    const cells = screen.getAllByTestId(/^search-cell-/).map(el => el.dataset.testid);
    expect(
      cells.filter(id => !id?.includes('not-applicable') && !id?.includes('no-value'))
    ).toEqual([
      'search-cell-namespace',
      'search-cell-owners',
      'search-cell-rows_count',
      'search-cell-description',
      'search-cell-status',
    ]);
    expect(cell('namespace')).toHaveTextContent('finance');
    expect(cell('owners')).toHaveTextContent('alice');
    expect(cell('rows_count')).toHaveTextContent('123');
    expect(cell('description')).toHaveTextContent('the orders table');
    expect(cell('status')).toHaveTextContent('STABLE');
  });

  it('a column the kind does not carry says "Not applicable"; a carried-but-unset one says "No value" / "No owner"', () => {
    render(
      <MuiThemeProvider theme={theme}>
        <ResultItem
          asset={termWithFields}
          columns={['status', 'namespace', 'owners', 'rows_count']}
        />
      </MuiThemeProvider>,
      { preloadedState: withQuery(''), initialEntries: ['/search'] }
    );
    expect(cell('status')).toHaveTextContent('—');
    expect(
      cell('status').querySelector('[data-testid="search-cell-not-applicable"]')
    ).not.toBeNull();
    expect(cell('status')).toHaveTextContent('Not applicable');
    expect(cell('namespace')).toHaveTextContent('finance');
    expect(
      cell('owners').querySelector('[data-testid="search-cell-no-value"]')
    ).not.toBeNull();
    expect(cell('owners')).toHaveTextContent('No owner');
    expect(cell('rows_count')).toHaveTextContent('Not applicable');
  });

  it('a class-specific column is "Not applicable" on a data entity of another class, and a real 0 is a value', () => {
    render(
      <MuiThemeProvider theme={theme}>
        <ResultItem
          asset={group}
          columns={['rows_count', 'entities_count', 'suite_url']}
        />
      </MuiThemeProvider>,
      { preloadedState: withQuery(''), initialEntries: ['/search'] }
    );
    expect(cell('rows_count')).toHaveTextContent('Not applicable');
    expect(cell('entities_count')).toHaveTextContent('2');
    expect(cell('suite_url')).toHaveTextContent('Not applicable');
    const noValueDataset: Asset = { ...dataset, fields: {} };
    render(
      <MuiThemeProvider theme={theme}>
        <ResultItem asset={noValueDataset} columns={['rows_count']} />
      </MuiThemeProvider>,
      { preloadedState: withQuery(''), initialEntries: ['/search'] }
    );
    expect(screen.getAllByTestId('search-cell-rows_count')[1]).toHaveTextContent(
      'No value'
    );
  });

  const qualityTest = (suiteUrl: string): Asset => ({
    assetKind: AssetKind.DATA_ENTITY,
    dataEntity: {
      id: 9,
      externalName: 'dq_test',
      status: { status: 'UNASSIGNED' as never },
      isStale: false,
      entityClasses: [{ id: 4, name: 'DATA_QUALITY_TEST' as never, types: [] }],
    },
    fields: { suiteUrl },
  });

  it('the Suite URL cell is a new-tab link for an http(s) URL', () => {
    render(
      <MuiThemeProvider theme={theme}>
        <ResultItem
          asset={qualityTest('https://example.invalid/suite')}
          columns={['suite_url']}
        />
      </MuiThemeProvider>,
      { preloadedState: withQuery(''), initialEntries: ['/search'] }
    );
    const link = cell('suite_url').querySelector('a');
    expect(link).not.toBeNull();
    expect(link).toHaveAttribute('href', 'https://example.invalid/suite');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('the Suite URL cell never renders an unsafe scheme as an anchor — the value shows as inert text (CTRIB-073 B2)', () => {
    // The value is collector-ingested. React 18 only warns on a `javascript:` href and renders it; the platform's
    // render guard for anchors from untrusted content is `sanitizeUrl` (the attachment-link posture), so an unsafe
    // scheme must reach the DOM as text, never as an `href`.
    for (const unsafe of [
      'javascript:alert(1)',
      'data:text/html,<b>x</b>',
      'vbscript:msgbox(1)',
    ]) {
      const { unmount } = render(
        <MuiThemeProvider theme={theme}>
          <ResultItem asset={qualityTest(unsafe)} columns={['suite_url']} />
        </MuiThemeProvider>,
        { preloadedState: withQuery(''), initialEntries: ['/search'] }
      );
      const suiteCell = cell('suite_url');
      expect(
        suiteCell.querySelector('a'),
        `${unsafe} must not become an anchor`
      ).toBeNull();
      expect(
        suiteCell.querySelector('[data-testid="search-cell-unsafe-link"]')
      ).not.toBeNull();
      expect(suiteCell).toHaveTextContent(unsafe);
      expect(document.querySelector(`a[href="${unsafe}"]`)).toBeNull();
      unmount();
    }
  });
});
