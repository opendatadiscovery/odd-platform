import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from 'theme/mui.theme';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import type { PopularityFacet } from 'generated-sources';
import { render } from 'lib/tests/testHelpers';
import en from 'locales/translations/en.json';
import ua from 'locales/translations/ua.json';
import PopularityFilter from '../PopularityFilter';
import { POPULARITY_BANDS_FALLBACK } from '../popularityBands';

/**
 * ST-9 (#1843) — the Popularity range facet's own contract: it reflects `?popularity_min/max` from the URL as a
 * chip naming exact view bands; a commit writes the CANONICAL URL (asserted through a real MemoryRouter + location
 * probe, never a navigate spy — a byte-divergent URL is exactly the failure the mirror would then rewrite); the rail
 * spans only the occupied bands; it is disabled WITH ITS REASON when there is nothing to slide over, but stays usable
 * (bar-less, full rail) when the facet request failed; a one-stop rail renders no slider; and every string renders
 * from the real catalogs, including a non-English one. The click→re-query→narrowed-list loop is odd-team IT-156.
 *
 * The facet hook is mocked per case (the component never fetches here); the popularity bands come from the same
 * fallback table the component uses, with per-case counts.
 */

const facetRef = vi.hoisted(() => ({
  current: { data: undefined as PopularityFacet | undefined, isError: false },
}));
vi.mock('lib/hooks/api', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  usePopularityFacet: () => facetRef.current,
}));

beforeAll(() => {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en: { translation: en }, ua: { translation: ua } },
    interpolation: { escapeValue: false },
  });
});

const facet = (counts: Record<number, number>): PopularityFacet => ({
  buckets: POPULARITY_BANDS_FALLBACK.map(band => ({
    ...band,
    count: counts[band.score] ?? 0,
  })),
});

const LocationProbe: React.FC = () => {
  const loc = useLocation();
  return <div data-testid='loc'>{`${loc.pathname}${loc.search}`}</div>;
};

/** This project does NOT set testIdAttribute, so data-qa hooks are queried with a DOM selector. */
const qa = (container: HTMLElement, hook: string) =>
  container.querySelector(`[data-qa="filter-popularity-${hook}"]`);

const renderAt = (path: string, data: PopularityFacet | undefined, isError = false) => {
  facetRef.current = { data, isError };
  // The platform Button reads `palette.button` through MUI's theme context, which the shared render helper does not
  // supply (it wraps the styled-components theme only) — so, like ConfirmationDialog.test, add the MUI provider.
  return render(
    <MuiThemeProvider theme={theme}>
      <PopularityFilter />
      <LocationProbe />
    </MuiThemeProvider>,
    { initialEntries: [path] }
  );
};

describe('PopularityFilter (ST-9 / #1843)', () => {
  it('reflects the URL range as a chip naming the exact view bands, with the slider over the occupied bands only', () => {
    // bands 0..6 occupied → 7 stops; the selection [4,5] = 15–30 ∪ 31–62 views
    const { container } = renderAt(
      '/search?q=orders&popularity_min=4&popularity_max=5',
      facet({ 0: 10, 1: 5, 2: 4, 3: 3, 4: 2, 5: 2, 6: 1 })
    );
    expect(qa(container, 'chip')).toHaveTextContent('Popularity: 15 – 62 views');
    expect(screen.getAllByRole('slider')).toHaveLength(2); // the two thumbs
    // the rail = the seven occupied bands, not the theoretical 21
    expect(container.querySelectorAll('.MuiSlider-mark')).toHaveLength(7);
    expect(qa(container, 'bars')).not.toBeNull();
    expect(screen.getByText('Data entities only')).toBeVisible();
  });

  it('names an open-ended range and the never-viewed band honestly', () => {
    const counts = { 0: 10, 4: 2, 9: 1, 20: 1 };
    const { container: a } = renderAt('/search?popularity_min=9', facet(counts));
    expect(qa(a, 'chip')).toHaveTextContent('Popularity: 511+ views');
    const { container: b } = renderAt('/search?popularity_max=4', facet(counts));
    expect(qa(b, 'chip')).toHaveTextContent('Popularity: up to 30 views');
    const { container: c } = renderAt(
      '/search?popularity_min=0&popularity_max=0',
      facet(counts)
    );
    expect(qa(c, 'chip')).toHaveTextContent('Popularity: never viewed');
  });

  it('a committed thumb move writes the canonical URL, preserving the rest of the search and leaving an untouched end open', () => {
    renderAt('/search?q=orders&sort=name', facet({ 0: 10, 1: 5, 2: 4, 3: 3 }));
    // MUI's thumbs are hidden range inputs: a change event is what the keyboard produces (←/→) and it fires
    // onChangeCommitted. In marks-only mode (`step={null}`) MUI moves the thumb ONE mark per change whatever value
    // the event carries — the keyboard semantics — so two steps land on stop index 2 of the rail [0,1,2,3], which
    // is band 2 (3–6 views). Each step commits, navigates, and re-renders the control from the new URL.
    fireEvent.change(screen.getAllByRole('slider')[0], { target: { value: '1' } });
    expect(screen.getByTestId('loc')).toHaveTextContent(
      '/search?popularity_min=1&q=orders&sort=name'
    );
    fireEvent.change(screen.getAllByRole('slider')[0], { target: { value: '2' } });
    expect(screen.getByTestId('loc')).toHaveTextContent(
      '/search?popularity_min=2&q=orders&sort=name'
    );
  });

  it('the "Never viewed" preset writes [0,0]; the chip × clears the range', async () => {
    const user = userEvent.setup();
    const { container } = renderAt('/search?q=orders', facet({ 0: 10, 3: 3 }));
    await user.click(screen.getByRole('button', { name: 'Never viewed' }));
    expect(screen.getByTestId('loc')).toHaveTextContent(
      '/search?popularity_max=0&popularity_min=0&q=orders'
    );
    // a chip's × (the icon button inside the chip) clears the range
    const { container: withRange } = renderAt(
      '/search?q=orders&popularity_min=3&popularity_max=3',
      facet({ 0: 10, 3: 3 })
    );
    expect(qa(withRange, 'chip')).not.toBeNull();
    await user.click(qa(withRange, 'chip')!.querySelector('button')!);
    expect(screen.getAllByTestId('loc').at(-1)).toHaveTextContent('/search?q=orders');
    expect(container).toBeDefined();
  });

  it('is disabled with the reason when nothing can be narrowed: no match / all unviewed / one band', () => {
    const { container: none } = renderAt('/search?asset_kinds[]=TERM', facet({}));
    expect(qa(none, 'disabled')).toHaveTextContent(
      'No data entities match your other filters'
    );
    expect(screen.queryAllByRole('slider')).toHaveLength(0);

    const { container: unviewed } = renderAt('/search', facet({ 0: 42 }));
    expect(qa(unviewed, 'disabled')).toHaveTextContent('No views recorded yet');

    const { container: oneBand } = renderAt('/search', facet({ 5: 42 }));
    expect(qa(oneBand, 'disabled')).toHaveTextContent(
      'All 42 data entities have 31 – 62 views'
    );
  });

  it('a FAILED facet request leaves the control usable over the full 21-band rail, without bars (the range does not depend on it)', () => {
    const { container } = renderAt('/search?q=orders', undefined, true);
    expect(qa(container, 'disabled')).toBeNull();
    expect(screen.getAllByRole('slider')).toHaveLength(2);
    expect(container.querySelectorAll('.MuiSlider-mark')).toHaveLength(21);
    expect(qa(container, 'bars')).toBeNull();
  });

  it('a one-stop rail with a selection renders the chip but no slider (never a NaN-positioned control)', () => {
    // the selection [5,5] survives a re-filter that leaves only band 5 occupied → one stop
    const { container } = renderAt(
      '/search?popularity_min=5&popularity_max=5&asset_kinds[]=DATA_ENTITY',
      facet({ 5: 3 })
    );
    expect(qa(container, 'chip')).toHaveTextContent('Popularity: 31 – 62 views');
    expect(screen.queryAllByRole('slider')).toHaveLength(0);
    expect(container.innerHTML).not.toContain('NaN');
    // ST-10 (#1844) — the preset must be ABSENT too. In the shipped component the presets lived INSIDE the
    // `canSlide` branch, so extracting the chrome into RangeFacetShell could have started rendering them here:
    // a clickable "Never viewed" under a rail that has no usable slider. Nothing else in this file would notice.
    expect(screen.queryByRole('button', { name: 'Never viewed' })).toBeNull();
  });

  it('renders from the real catalog under a non-English locale (the parity test proves the keys exist; this proves they render)', async () => {
    await i18n.changeLanguage('ua');
    try {
      renderAt('/search', facet({ 0: 10, 2: 3 }));
      expect(screen.getByText('Популярність')).toBeVisible();
      expect(screen.getByText('Лише сутності даних')).toBeVisible();
      expect(
        screen.getByRole('button', { name: 'Ніколи не переглядалось' })
      ).toBeVisible();
    } finally {
      await i18n.changeLanguage('en');
    }
  });
});
