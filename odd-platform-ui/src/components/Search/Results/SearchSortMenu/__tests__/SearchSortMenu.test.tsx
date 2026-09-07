import React from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { render } from 'lib/tests/testHelpers';
import SearchSortMenu from '../SearchSortMenu';

// ST-2b (#1836) — the global sort dropdown. Covers R1 (the four options render), R2 (selecting writes ?sort= and
// preserves the query), R3/R4 (the control reflects the URL sort, else the per-context default) and R6 (fail-closed on
// garbage). The click→re-query round-trip is exercised end-to-end by odd-team IT-153; here we assert the control's own
// contract. The shared `render` supplies the MUI/styled-components theme + a MemoryRouter (via `initialEntries`).

beforeAll(() => {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: {
        translation: {
          'Sort by': 'Sort by',
          Relevance: 'Relevance',
          'Status priority': 'Status priority',
          'Recently updated': 'Recently updated',
          Name: 'Name',
          'Most popular': 'Most popular',
        },
      },
    },
    interpolation: { escapeValue: false },
  });
});

const LocationProbe: React.FC = () => {
  const loc = useLocation();
  return <div data-testid='loc'>{`${loc.pathname}${loc.search}`}</div>;
};

const renderAt = (path: string) =>
  render(
    <>
      <SearchSortMenu />
      <LocationProbe />
    </>,
    { initialEntries: [path] }
  );

describe('SearchSortMenu (ST-2b / #1836)', () => {
  it('shows the query-context default (Relevance) when the URL carries no sort', () => {
    renderAt('/search?q=orders');
    expect(screen.getByRole('combobox')).toHaveTextContent('Relevance');
  });

  it('shows the browse-context default (Status priority) when browsing with no sort', () => {
    renderAt('/search');
    expect(screen.getByRole('combobox')).toHaveTextContent('Status priority');
  });

  it('reflects a valid ?sort= from the URL', () => {
    renderAt('/search?sort=name');
    expect(screen.getByRole('combobox')).toHaveTextContent('Name');
  });

  it('fails closed: a garbage ?sort= shows the context default, not a blank control', () => {
    renderAt('/search?q=orders&sort=garbage');
    expect(screen.getByRole('combobox')).toHaveTextContent('Relevance');
  });

  // Regression (review BLOCKER B1): useQueryParams parses with parseNumbers/parseBooleans, so ?q=123 arrives as a
  // NUMBER and ?q=true as a BOOLEAN. Before the fix, defaultSortForContext(123).trim() threw an uncaught TypeError —
  // and there is no error boundary in odd-platform-ui, so the throw white-screened the whole app. A numeric/boolean
  // query must render normally (it is still a text query → Relevance default), never crash.
  it('does not crash on a numeric query (?q=123 parsed as a number) — shows the Relevance default', () => {
    renderAt('/search?q=123');
    expect(screen.getByRole('combobox')).toHaveTextContent('Relevance');
  });

  it('offers "Recently viewed" ONLY while the recency scope is on, and shows it as the active default there (ST-10)', async () => {
    const user = userEvent.setup();
    // WITH the scope: the sixth option appears, and with no ?sort= and no query it is the active default —
    // mirroring SearchSortDto.resolveEffective server-side, so the control never claims an ordering the list
    // does not have.
    const { unmount } = renderAt('/search?recently_viewed=yes');
    expect(screen.getByRole('combobox')).toHaveTextContent('Recently viewed');
    await user.click(screen.getByRole('combobox'));
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual([
      'Relevance',
      'Status priority',
      'Recently updated',
      'Name',
      'Most popular',
      'Recently viewed',
    ]);
    unmount();

    // WITHOUT the scope a stale ?sort=last_viewed must not be displayed as active — the server would drop it,
    // so showing it would be a lie about the list's order.
    renderAt('/search?sort=last_viewed');
    expect(screen.getByRole('combobox')).toHaveTextContent('Status priority');
  });

  it('does not crash on a boolean-looking query (?q=true parsed as a boolean)', () => {
    renderAt('/search?q=true');
    expect(screen.getByRole('combobox')).toHaveTextContent('Relevance');
  });

  it('offers the five canonical orderings and, on select, writes ?sort= preserving the query', async () => {
    const user = userEvent.setup();
    renderAt('/search?q=orders');

    await user.click(screen.getByRole('combobox'));
    // four at ST-2b; "Most popular" joined with ST-9 (#1843) on the ST-5c popularity snapshot. "Recently viewed"
    // is NOT here: ST-10 (#1844) offers it only while the recency scope is on, because without the scope the
    // server drops the token — see the case below.
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual([
      'Relevance',
      'Status priority',
      'Recently updated',
      'Name',
      'Most popular',
    ]);

    await user.click(screen.getByRole('option', { name: 'Name' }));
    expect(screen.getByTestId('loc')).toHaveTextContent('/search?q=orders&sort=name');
  });
});
