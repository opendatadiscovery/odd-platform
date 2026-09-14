import React from 'react';
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import theme from 'theme/mui.theme';
import { render } from 'lib/tests/testHelpers';
import {
  AssetKind,
  type DataEntityDetails,
  type QueryExampleDetails,
  type TermDetails,
} from 'generated-sources';
import en from 'locales/translations/en.json';
import AssetDetailsPreview from '../AssetDetailsPreview';

/**
 * #1899 — the polymorphic (i) details preview: one badge for every kind, a card read from the kind's own detail
 * endpoint when it opens (never on render), the three terminal states, the keyboard path, the delays, the sanitised
 * sink, the visible cut. Fixtures are shaped from the wire (contributor/CTRIB-072.md §3a B7), camelCased as the
 * generated client hands them over.
 */
const { getTermDetails, getQueryExampleDetails, getDataEntityDetails } = vi.hoisted(
  () => ({
    getTermDetails: vi.fn(),
    getQueryExampleDetails: vi.fn(),
    getDataEntityDetails: vi.fn(),
  })
);
vi.mock('lib/api', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return {
    ...actual,
    termApi: { getTermDetails },
    queryExampleApi: { getQueryExampleDetails },
    dataEntityApi: { getDataEntityDetails },
  };
});
vi.mock('lib/errorHandling', async importOriginal => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, showSuccessToast: vi.fn(), showServerErrorToast: vi.fn() };
});

beforeAll(() => {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false },
  });
});

const term: TermDetails = {
  id: 1,
  name: 'ctrib072alpha',
  definition: 'The **ctrib072alpha** term definition mentions ctrib072beta as well.',
  updatedAt: new Date('2026-09-14T09:05:45Z'),
  createdAt: new Date('2026-09-14T09:05:45Z'),
  namespace: { id: 1, name: 'ctrib072ns' },
  ownership: [
    {
      id: 1,
      owner: { id: 1, name: 'ctrib072owner' },
      title: { id: 1, name: 'ctrib072steward' },
    },
  ],
  entitiesUsingCount: 1,
  columnsUsingCount: 0,
  linkedTermsUsingCount: 0,
  queryExampleUsingCount: 1,
  tags: [
    { id: 1, name: 'ctrib072tag2', important: false },
    { id: 2, name: 'ctrib072tag', important: false },
  ],
  terms: [],
};

const linkedEntity = (
  id: number,
  name: string
): QueryExampleDetails['linkedEntities']['items'][number] =>
  ({
    id,
    oddrn: `//e2e-source-ctrib072/db/tables/${id}`,
    externalName: name,
    internalName: undefined,
    dataSource: { id: 2072, oddrn: '//e2e-source-ctrib072/db', name: 'ctrib072-source' },
    entityClasses: [],
    type: { id: 1, name: 'TABLE' },
    status: { status: 'UNASSIGNED' },
    isStale: false,
    viewCount: 0,
  }) as unknown as QueryExampleDetails['linkedEntities']['items'][number];

const queryExample: QueryExampleDetails = {
  id: 1,
  definition: 'ctrib072alpha query example definition',
  query: 'select * from ctrib072_linked_table where a<b <script>x</script>',
  linkedEntities: {
    items: [linkedEntity(21721, 'ctrib072_linked_table')],
    pageInfo: { total: 1, hasNext: false },
  },
  linkedTerms: {
    items: [
      {
        term: {
          id: 1,
          name: 'ctrib072alpha',
          definition: 'd',
          namespace: { id: 1, name: 'ctrib072ns' },
        },
        isDescriptionLink: false,
      },
    ],
    pageInfo: { total: 1, hasNext: false },
  },
  createdAt: new Date('2026-09-14T09:05:47Z'),
  updatedAt: new Date('2026-09-14T09:05:47Z'),
};

const dataEntity = {
  id: 21720,
  oddrn: '//e2e-source-ctrib072/db/tables/21720',
  externalName: 'ctrib072alpha_entity',
  entityClasses: [],
  type: { id: 1, name: 'TABLE' },
  status: { status: 'UNASSIGNED' },
  isStale: false,
  viewCount: 1,
  metadataFieldValues: [],
  tags: [],
  terms: [],
  versionList: [],
} as unknown as DataEntityDetails;

const renderBadge = (assetKind: AssetKind, assetId: number) =>
  render(
    <MuiThemeProvider theme={theme}>
      <AssetDetailsPreview assetKind={assetKind} assetId={assetId} />
    </MuiThemeProvider>
  );

const badge = () => screen.getByTestId('asset-details-preview');
const card = () => screen.findByTestId('asset-details-preview-card');

// MUI opens a tooltip on focus only when the focus is VISIBLE (`:focus-visible`), which jsdom cannot decide; shim it
// to "is the focused element" — a real Tab in a real browser is focus-visible by definition (IT-159 case 5).
const nativeMatches = Element.prototype.matches;
const shimFocusVisible = () => {
  Element.prototype.matches = function matches(this: Element, selector: string) {
    if (selector === ':focus-visible') return document.activeElement === this;
    return nativeMatches.call(this, selector);
  };
};

/** Opens the card from the keyboard: Tab to the badge; MUI's focus listener opens the tooltip after the delay. */
const openByKeyboard = async () => {
  const user = userEvent.setup();
  await user.tab();
  expect(document.activeElement).toBe(badge());
  return card();
};

describe('AssetDetailsPreview — one (i) for every kind (#1899)', () => {
  beforeEach(() => {
    shimFocusVisible();
    getTermDetails.mockReset();
    getQueryExampleDetails.mockReset();
    getDataEntityDetails.mockReset();
  });
  afterEach(() => {
    Element.prototype.matches = nativeMatches;
  });

  it('every kind renders the badge as a self-labelled keyboard stop and reads nothing before it opens', () => {
    for (const kind of [AssetKind.TERM, AssetKind.QUERY_EXAMPLE, AssetKind.DATA_ENTITY]) {
      const { unmount } = renderBadge(kind, 1);
      expect(badge()).toHaveAttribute('role', 'img');
      expect(badge()).toHaveAttribute('aria-label', 'Show details');
      expect(badge()).toHaveAttribute('tabindex', '0');
      unmount();
    }
    expect(getTermDetails).not.toHaveBeenCalled();
    expect(getQueryExampleDetails).not.toHaveBeenCalled();
    expect(getDataEntityDetails).not.toHaveBeenCalled();
  });

  it('a Term: opening from the keyboard reads the term once and renders definition, namespace, owners, tags and the four linked counts', async () => {
    getTermDetails.mockResolvedValue(term);
    renderBadge(AssetKind.TERM, 1);
    const c = await openByKeyboard();
    await waitFor(() => expect(getTermDetails).toHaveBeenCalledWith({ termId: 1 }));
    expect(getTermDetails).toHaveBeenCalledTimes(1);
    expect(
      await within(c).findByText('ctrib072alpha', { exact: false })
    ).toBeInTheDocument();
    expect(within(c).getByText('ctrib072ns')).toBeInTheDocument();
    expect(within(c).getByText('ctrib072owner')).toBeInTheDocument();
    expect(within(c).getByText('ctrib072steward')).toBeInTheDocument();
    // react-truncate-markup measures widths, which jsdom cannot; it keeps the first tag here — IT-159 case 1 sees both
    expect(within(c).getByText('ctrib072tag2')).toBeInTheDocument();
    const counts = within(c).getByTestId('asset-details-preview-counts');
    for (const [label, value] of [
      ['Linked entities', '1'],
      ['Linked columns', '0'],
      ['Linked terms', '0'],
      ['Query examples', '1'],
    ]) {
      const row = within(counts).getByText(label).parentElement as HTMLElement;
      expect(within(row).getByText(value)).toBeInTheDocument();
    }
    // the definition is rendered as markdown (the term page's own sink): the **bold** became an element
    expect(c.querySelector('strong')).toHaveTextContent('ctrib072alpha');
  });

  it('a Term with no owners, no tags and zero counts renders the empty lines and zeros', async () => {
    getTermDetails.mockResolvedValue({
      ...term,
      ownership: [],
      tags: [],
      entitiesUsingCount: 0,
      columnsUsingCount: 0,
      linkedTermsUsingCount: 0,
      queryExampleUsingCount: 0,
    });
    renderBadge(AssetKind.TERM, 1);
    const c = await openByKeyboard();
    expect(await within(c).findByText('No owners')).toBeInTheDocument();
    expect(within(c).getByText('No tags')).toBeInTheDocument();
    expect(
      within(within(c).getByTestId('asset-details-preview-counts')).getAllByText('0')
    ).toHaveLength(4);
  });

  it('a Query Example: reads the example once; definition → linked entities (name · datasource) → linked terms → query, the query through the sanitised sink', async () => {
    getQueryExampleDetails.mockResolvedValue(queryExample);
    renderBadge(AssetKind.QUERY_EXAMPLE, 1);
    const c = await openByKeyboard();
    await waitFor(() =>
      expect(getQueryExampleDetails).toHaveBeenCalledWith({ exampleId: 1 })
    );
    expect(getQueryExampleDetails).toHaveBeenCalledTimes(1);
    expect(
      await within(c).findByText('ctrib072alpha query example definition')
    ).toBeInTheDocument();
    const entities = within(c).getByTestId('asset-details-preview-linked-entities');
    expect(entities).toHaveTextContent('ctrib072_linked_table');
    expect(entities).toHaveTextContent('ctrib072-source');
    expect(within(c).getByTestId('asset-details-preview-linked-terms')).toHaveTextContent(
      'ctrib072alpha'
    );
    const query = within(c).getByTestId('asset-details-preview-query');
    expect(query).toHaveTextContent('a<b');
    expect(query.querySelector('script')).toBeNull();
    // the order: definition, linked entities, linked terms, query
    const order = [
      c.querySelector('[data-clamp-block="definition"]'),
      entities,
      within(c).getByTestId('asset-details-preview-linked-terms'),
      query,
    ].map(el => (el ? Array.from(c.querySelectorAll('*')).indexOf(el) : -1));
    expect(order).toEqual([...order].sort((a, b) => a - b));
  });

  it('a Query Example with seven linked entities shows five and a "+2 more" line; one with no links shows the empty lines', async () => {
    getQueryExampleDetails.mockResolvedValue({
      ...queryExample,
      linkedEntities: {
        items: [1, 2, 3, 4, 5, 6, 7].map(n =>
          linkedEntity(30000 + n, `ctrib072_lnk${n}`)
        ),
        pageInfo: { total: 7, hasNext: false },
      },
    });
    const first = renderBadge(AssetKind.QUERY_EXAMPLE, 1);
    let c = await openByKeyboard();
    const entities = await within(c).findByTestId(
      'asset-details-preview-linked-entities'
    );
    expect(await within(entities).findByText('+2 more')).toBeInTheDocument();
    expect(entities).toHaveTextContent('ctrib072_lnk5');
    expect(entities).not.toHaveTextContent('ctrib072_lnk6');
    first.unmount();

    getQueryExampleDetails.mockResolvedValue({
      ...queryExample,
      linkedEntities: { items: [], pageInfo: { total: 0, hasNext: false } },
      linkedTerms: { items: [], pageInfo: { total: 0, hasNext: false } },
    });
    renderBadge(AssetKind.QUERY_EXAMPLE, 2);
    c = await openByKeyboard();
    expect(await within(c).findByText('No linked entities')).toBeInTheDocument();
    expect(within(c).getByText('No linked terms')).toBeInTheDocument();
  });

  it('a Data Entity: reads the entity once and renders the four DE sections (the moved body)', async () => {
    getDataEntityDetails.mockResolvedValue(dataEntity);
    renderBadge(AssetKind.DATA_ENTITY, 21720);
    const c = await openByKeyboard();
    await waitFor(() =>
      expect(getDataEntityDetails).toHaveBeenCalledWith({ dataEntityId: 21720 })
    );
    expect(getDataEntityDetails).toHaveBeenCalledTimes(1);
    for (const title of ['Tags', 'Custom metadata', 'Predefined metadata', 'About']) {
      expect(await within(c).findByText(title)).toBeInTheDocument();
    }
    expect(within(c).getByText('No tags')).toBeInTheDocument();
    expect(within(c).getByText('Not created')).toBeInTheDocument();
  });

  it('a rejected read, or a resolved payload without an id (the term endpoint\'s 200-empty), says "Couldn\'t load details" — never an empty item', async () => {
    getTermDetails.mockRejectedValue(new Error('boom'));
    const first = renderBadge(AssetKind.TERM, 1);
    let c = await openByKeyboard();
    expect(
      await within(c).findByTestId('asset-details-preview-failed')
    ).toHaveTextContent("Couldn't load details");
    expect(within(c).queryByText('No tags')).toBeNull();
    first.unmount();

    getDataEntityDetails.mockResolvedValue(undefined);
    renderBadge(AssetKind.DATA_ENTITY, 21720);
    c = await openByKeyboard();
    expect(
      await within(c).findByTestId('asset-details-preview-failed')
    ).toBeInTheDocument();
    expect(within(c).queryByText('No tags')).toBeNull();
  });

  it('the cut marker of a bounded block appears only when the block overflows (the grow-after-mount sequence)', async () => {
    let scrollHeight = 10;
    Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
      configurable: true,
      get: () => scrollHeight,
    });
    getTermDetails.mockResolvedValue(term);
    renderBadge(AssetKind.TERM, 1);
    const c = await openByKeyboard();
    await within(c).findByTestId('asset-details-preview-counts');
    expect(within(c).queryByTestId('asset-details-preview-cut')).toBeNull();
    const definitionBlock = c.querySelector(
      '[data-clamp-block="definition"]'
    ) as HTMLElement;
    expect(definitionBlock.style.maxHeight).toBe('120px');

    // the definition grows past its bound after mount (a late image): the mutation observer re-measures
    scrollHeight = 500;
    await act(async () => {
      definitionBlock.appendChild(document.createElement('span'));
    });
    const markers = await within(c).findAllByTestId('asset-details-preview-cut');
    expect(markers.length).toBeGreaterThanOrEqual(1);
    expect(definitionBlock.style.maxHeight, 'the bound sticks').toBe('120px');
  });

  it('the delays: a hover does not read before 300 ms and reads once after it', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    try {
      getTermDetails.mockResolvedValue(term);
      renderBadge(AssetKind.TERM, 1);
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      await user.hover(badge());
      await act(async () => {
        vi.advanceTimersByTime(150);
      });
      expect(getTermDetails).not.toHaveBeenCalled();
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      await waitFor(() => expect(getTermDetails).toHaveBeenCalledTimes(1));
    } finally {
      vi.useRealTimers();
    }
  });
});
