import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from 'theme/mui.theme';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { render } from 'lib/tests/testHelpers';
import en from 'locales/translations/en.json';
import ua from 'locales/translations/ua.json';
import type { RecentlyViewedHistoryState } from 'lib/hooks/useRecentlyViewedHistoryEmpty';
import RecentlyViewedFilter from '../RecentlyViewedFilter';

/**
 * ST-10 (#1844) — the **Last viewed** facet's own contract, the half a browser test cannot reach cheaply: the three
 * history states (a shipped deployment always has history, so `empty` and `loading` are only reachable here), the
 * DISABLED posture's label + qualifier + information icon, the chip's four shapes, and — the one that would ship a
 * visible defect — that turning the scope OFF also drops the `last_viewed` ordering it turned on, because the
 * dropdown would otherwise display an ordering the list does not have.
 *
 * WHY the empty-history case lives here and NOT in IT-157: under `auth.type=DISABLED` the platform keeps ONE shared
 * history bucket, and IT-149 drives the same one. Proving "no history yet" in the browser would mean emptying that
 * bucket — a global mutation that breaks a sibling spec. Mocked here, driven there: the split is deliberate.
 *
 * The URL is asserted through a real MemoryRouter + a location probe rather than a navigate spy, so a
 * byte-divergent URL fails here instead of being rewritten forever by the facet -> URL mirror.
 */

const historyRef = vi.hoisted(() => ({
  current: 'has-history' as RecentlyViewedHistoryState,
}));
vi.mock('lib/hooks/useRecentlyViewedHistoryEmpty', () => ({
  default: () => historyRef.current,
}));

const authRef = vi.hoisted(() => ({ current: 'LOGIN_FORM' as string }));
vi.mock('lib/hooks/api', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useAppInfo: () => ({ data: { authType: authRef.current } }),
}));

beforeAll(() => {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en: { translation: en }, ua: { translation: ua } },
    interpolation: { escapeValue: false },
  });
});

const LocationProbe: React.FC = () => {
  const loc = useLocation();
  return <div data-testid='loc'>{`${loc.pathname}${loc.search}`}</div>;
};

/** This project does NOT set testIdAttribute, so data-qa hooks are queried with a DOM selector. */
const qa = (container: HTMLElement, hook: string) =>
  container.querySelector(`[data-qa="filter-recently_viewed-${hook}"]`);

const renderAt = (
  path: string,
  history: RecentlyViewedHistoryState = 'has-history',
  authType = 'LOGIN_FORM'
) => {
  historyRef.current = history;
  authRef.current = authType;
  // The platform Button reads `palette.button` through MUI's theme context, which the shared render helper does
  // not supply (it wraps the styled-components theme only) — the PopularityFilter suite does the same.
  return render(
    <MuiThemeProvider theme={theme}>
      <RecentlyViewedFilter />
      <LocationProbe />
    </MuiThemeProvider>,
    { initialEntries: [path] }
  );
};

describe('RecentlyViewedFilter (ST-10 / #1844)', () => {
  it('names the dimension, says whose views these are, and reads "any time" with the scope on and no bounds', () => {
    const { container } = renderAt('/search?q=orders&recently_viewed=yes');
    expect(screen.getByText('Last viewed')).toBeVisible();
    expect(screen.getByText('Assets you have opened')).toBeVisible();
    expect(qa(container, 'chip')).toHaveTextContent('Last viewed: any time');
    expect(qa(container, 'disabled')).toBeNull();
  });

  it('renders NO chip when the scope is off — the facet never claims a filter that is not applied', () => {
    const { container } = renderAt('/search?q=orders');
    expect(qa(container, 'chip')).toBeNull();
    expect(screen.getByText('Last viewed')).toBeVisible(); // still offered
  });

  it('names the resolved window, not the preset, in each of its three bounded shapes', () => {
    const after = renderAt('/search?viewed_after=2026-09-01T00:00:00.000Z').container;
    expect(qa(after, 'chip')?.textContent).toMatch(/^Last viewed: since \S/);
    const before = renderAt('/search?viewed_before=2026-09-08T00:00:00.000Z').container;
    expect(qa(before, 'chip')?.textContent).toMatch(/^Last viewed: before \S/);
    const window = renderAt(
      '/search?viewed_after=2026-09-01T00:00:00.000Z&viewed_before=2026-09-08T00:00:00.000Z'
    ).container;
    expect(qa(window, 'chip')?.textContent).toMatch(/^Last viewed: .+ - .+/);
  });

  it('a junk bound leaves NO chip and no filter — the fail-closed reading reaches the pixels', () => {
    const { container } = renderAt('/search?q=orders&viewed_after=2026-09-01');
    expect(qa(container, 'chip')).toBeNull();
  });

  /**
   * CTRIB-070 — a preset writes the WORD. It used to write the instant it resolved to at click time, which is
   * what made a saved "Today" mean the day it was saved; the resolve now happens where the query is built, so the
   * URL a user saves or shares still says "today" tomorrow.
   */
  it('a preset writes the canonical URL: the declared window, and no instant or ON token beside it', async () => {
    const user = userEvent.setup();
    renderAt('/search?q=orders&recently_viewed=yes');
    await user.click(screen.getByText('Today'));
    const url = screen.getByTestId('loc').textContent ?? '';
    expect(url).toContain('viewed_within=TODAY');
    // ONE spelling per state: no frozen bound, and not the bounds-free ON token either.
    expect(url).not.toContain('viewed_after');
    expect(url).not.toContain('recently_viewed=yes');
    expect(url).toContain('q=orders'); // the rest of the search survives
  });

  /**
   * The chip states WHAT WAS ASKED FOR. Naming the resolved date for a preset is what hid the freeze: the chip
   * read "since 10 Sep" whether that window was moving or nailed down, and the user had no way to tell which.
   */
  it('names a declared window by its word, and a hand-picked one by its dates', () => {
    const living = renderAt('/search?viewed_within=LAST_7_DAYS').container;
    expect(qa(living, 'chip')?.textContent).toBe('Last viewed: last 7 days');
    expect(renderAt('/search?viewed_within=TODAY').container).toBeTruthy();

    const picked = renderAt(
      '/search?viewed_after=2026-09-01T00:00:00.000Z&viewed_before=2026-09-08T00:00:00.000Z'
    ).container;
    expect(qa(picked, 'chip')?.textContent).toMatch(/^Last viewed: \S+.* - /);
  });

  /**
   * The calendar below the chip must show what the living window CURRENTLY means. An empty box under a chip that
   * says "last 7 days" is the same "the control and the filter disagree" defect the empty-box rule already fixed,
   * one level up — the box would be inviting a selection while a window is in force.
   */
  it('seeds the calendar with the resolved window when the scope is a declared one', () => {
    const { container } = renderAt('/search?viewed_within=TODAY');
    const input = container.querySelector('input');
    expect(input).not.toBeNull();
    expect(input?.value ?? '').not.toBe('');
  });

  it('"Any time" widens an existing window instead of clearing the scope', async () => {
    const user = userEvent.setup();
    renderAt('/search?viewed_after=2026-09-01T00:00:00.000Z');
    await user.click(screen.getByText('Any time'));
    const url = screen.getByTestId('loc').textContent ?? '';
    expect(url).toContain('recently_viewed=yes');
    expect(url).not.toContain('viewed_after');
  });

  it('clearing the scope ALSO drops the ordering it turned on (never a sort the list does not have)', async () => {
    const user = userEvent.setup();
    const { container } = renderAt('/search?recently_viewed=yes&sort=last_viewed');
    await user.click(qa(container, 'chip')?.querySelector('svg') as Element);
    const url = screen.getByTestId('loc').textContent ?? '';
    expect(url).not.toContain('recently_viewed');
    expect(url).not.toContain('last_viewed');
  });

  it('clearing the scope KEEPS an ordering the user chose for another reason', async () => {
    const user = userEvent.setup();
    const { container } = renderAt('/search?recently_viewed=yes&sort=name');
    await user.click(qa(container, 'chip')?.querySelector('svg') as Element);
    const url = screen.getByTestId('loc').textContent ?? '';
    expect(url).not.toContain('recently_viewed');
    expect(url).toContain('sort=name');
  });

  // Found by reading the rendered pixels rather than by a failing assertion: the date box used to show a
  // plausible last-week range while the chip said "any time", i.e. a control displaying a filter the search was
  // not applying, with no way for the reader to tell which one was true.
  it('shows NO dates while the window is unset — the box never states a filter that is not applied', () => {
    const { container } = renderAt('/search?recently_viewed=yes');
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input).not.toBeNull();
    expect(input.value).toBe('');
    expect(input.placeholder).toBe('Pick two dates');
  });

  it('and shows exactly the window that IS applied once bounds are set', () => {
    const { container } = renderAt(
      '/search?viewed_after=2026-09-01T00:00:00.000Z&viewed_before=2026-09-08T00:00:00.000Z'
    );
    const input = container.querySelector('input') as HTMLInputElement;
    expect(input.value).not.toBe('');
    expect(input.value).toMatch(/Sep/);
  });

  it('with NO history yet: disabled WITH its reason, and no way to pick a window', () => {
    const { container } = renderAt('/search', 'empty');
    expect(qa(container, 'disabled')).toHaveTextContent(
      "You haven't opened any assets yet."
    );
    expect(screen.queryByText('Today')).toBeNull();
    expect(screen.queryByPlaceholderText('Pick two dates')).toBeNull();
  });

  it('while the history is still loading it is USABLE, never announced as empty', () => {
    const { container } = renderAt('/search', 'loading');
    expect(qa(container, 'disabled')).toBeNull();
    expect(screen.getByText('Today')).toBeVisible();
  });

  it('under DISABLED auth it says the history is shared, and explains the consequence', () => {
    const { container } = renderAt('/search', 'has-history', 'DISABLED');
    expect(screen.getByText('Last viewed (shared)')).toBeVisible();
    expect(screen.getByText('Assets anyone has opened')).toBeVisible();
    expect(qa(container, 'info')).not.toBeNull();
    expect(screen.queryByText('Last viewed')).toBeNull(); // the unqualified label is never shown there
  });

  // The i18n miss this guards is not a MISSING key — the parity sweep catches those. It is a HARDCODED string
  // that renders English under every locale and is invisible to a t() grep (memory:
  // feedback_i18n_done_is_rendered_page_not_catalog_parity). So this asserts the rendered pixels under `ua`.
  it('renders its labels from the real catalog under a non-English locale (no hardcoded English)', async () => {
    await i18n.changeLanguage('ua');
    try {
      renderAt('/search?recently_viewed=yes');
      expect(screen.getByText(ua['Last viewed'])).toBeVisible();
      expect(screen.getByText(ua['Assets you have opened'])).toBeVisible();
      expect(screen.getByText(ua.Today)).toBeVisible();
      expect(screen.getByText(ua['Any time'])).toBeVisible();
      expect(screen.queryByText(en['Last viewed'])).toBeNull();
      expect(screen.queryByText(en['Assets you have opened'])).toBeNull();
    } finally {
      await i18n.changeLanguage('en');
    }
  });

  // The chip renders a DATE, and a date is not a catalog key — a key-parity sweep is blind to it. Seen in a `ua`
  // screenshot as "Останній перегляд: від 1 Sep 2026" beside a calendar that read "1 вер.".
  it('names the window in the reader language too — a date is not exempt from i18n', async () => {
    await i18n.changeLanguage('ua');
    try {
      const { container } = renderAt('/search?viewed_after=2026-09-15T12:00:00.000Z');
      const chipText = qa(container, 'chip')?.textContent ?? '';
      const ukrainianSep = new Intl.DateTimeFormat('uk', { month: 'short' }).format(
        new Date('2026-09-15T12:00:00.000Z')
      );
      expect(chipText).toContain(ua['Last viewed: since {{from}}'].split('{{')[0].trim());
      expect(chipText).toContain(ukrainianSep);
      expect(chipText).not.toContain('Sep');
    } finally {
      await i18n.changeLanguage('en');
    }
  });
});
