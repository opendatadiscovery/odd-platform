import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { render } from 'lib/tests/testHelpers';
import FavoritesFilter from '../FavoritesFilter';

/**
 * ST-7 (#1841) — the Favorites scope control. Covers its OWN contract: it reflects `?favorites=` from the URL,
 * and CLICKING it writes the canonical URL (not a hand-built string) while preserving the rest of the search
 * state. The click→re-query→narrowed-list round-trip is exercised end-to-end by odd-team IT-148.
 *
 * The write path is asserted through a real MemoryRouter + a location probe rather than a navigate spy: a spy
 * would pass even if the component built a byte-divergent URL, and a divergent URL is precisely the failure
 * mode here (Search.tsx's mirror rewrites anything that does not match its own serialiser).
 *
 * DISABLED-mode labelling is driven by `useAppInfo().authType`, mocked per case.
 */

const { authTypeRef } = vi.hoisted(() => ({
  authTypeRef: { current: 'OAUTH2' as string },
}));
vi.mock('lib/hooks/api', async importOriginal => ({
  ...(await importOriginal<Record<string, unknown>>()),
  useAppInfo: () => ({ data: { authType: authTypeRef.current } }),
}));

beforeAll(() => {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: {
      en: {
        translation: {
          'Favorites only': 'Favorites only',
          'Favorites (shared) only': 'Favorites (shared) only',
          "Authentication is disabled, so favorites are shared by everyone on this instance. Don't use disabled auth in production.":
            "Authentication is disabled, so favorites are shared by everyone on this instance. Don't use disabled auth in production.",
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

/** This project does NOT set testIdAttribute, so data-qa hooks are queried with a DOM selector. */
const renderAt = (path: string, authType = 'OAUTH2') => {
  authTypeRef.current = authType;
  return render(
    <>
      <FavoritesFilter />
      <LocationProbe />
    </>,
    { initialEntries: [path] }
  );
};

describe('FavoritesFilter (ST-7 / #1841)', () => {
  it('is unchecked when the URL carries no favorites scope', () => {
    renderAt('/search?q=orders');
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('reflects ?favorites=yes from the URL', () => {
    renderAt('/search?favorites=yes');
    expect(screen.getByRole('checkbox')).toBeChecked();
  });

  it('fails closed on a garbage value — the control stays off', () => {
    renderAt('/search?favorites=maybe');
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('CLICKING it writes ?favorites=yes and preserves the rest of the search state', async () => {
    renderAt('/search?q=orders&sort=name');
    await userEvent.click(screen.getByRole('checkbox'));
    // The canonical serialiser sorts keys, so this is byte-identical to what Search.tsx's mirror writes —
    // a hand-built URL would diverge here and be rewritten away on the next facet toggle.
    expect(screen.getByTestId('loc')).toHaveTextContent(
      '/search?favorites=yes&q=orders&sort=name'
    );
  });

  it('CLICKING it off removes the param entirely (not favorites=no — that is a different filter)', async () => {
    renderAt('/search?favorites=yes&q=orders');
    await userEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByTestId('loc')).toHaveTextContent('/search?q=orders');
  });

  it('?favorites=no shows INDETERMINATE, never a plain unchecked box over a narrowed list', () => {
    // The inverted scope is expressible by URL and API but has no two-state representation. Rendering it
    // unchecked would claim "no filter" over a list narrowed to everything the caller has NOT starred —
    // the FE-contradicts-BE class. Indeterminate is the honest rendering.
    const { container } = renderAt('/search?favorites=no&q=orders');
    const box = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(box.checked, 'not checked — this is not the "only my favorites" state').toBe(
      false
    );
    expect(
      box.getAttribute('data-indeterminate'),
      'but flagged indeterminate, not plain off'
    ).toBe('true');
  });

  it('a click ESCAPES the inverted scope — it clears rather than flipping to yes', async () => {
    // An indeterminate box reports checked=true on click, so deriving from the event would send the user
    // from `no` to `yes` and never to "unfiltered". The handler derives from the URL scope instead.
    renderAt('/search?favorites=no&q=orders');
    await userEvent.click(screen.getByRole('checkbox'));
    expect(screen.getByTestId('loc')).toHaveTextContent('/search?q=orders');
  });

  it('labels the scope plainly when auth is enabled, with no shared-bucket warning', () => {
    const { container } = renderAt('/search', 'OAUTH2');
    expect(screen.getByText('Favorites only')).toBeInTheDocument();
    expect(screen.queryByText('Favorites (shared) only')).not.toBeInTheDocument();
    expect(container.querySelector('[data-qa="filter-favorites-info"]')).toBeNull();
  });

  it('under auth.type=DISABLED says (shared) AND carries the consequence as inline help', () => {
    // The label preserves the STATE (one instance-wide bucket); the info icon preserves the CONSEQUENCE that
    // the retired tab spelled out in a banner. Losing the second is how "(shared)" becomes decoration.
    const { container } = renderAt('/search', 'DISABLED');
    expect(screen.getByText('Favorites (shared) only')).toBeInTheDocument();
    expect(container.querySelector('[data-qa="filter-favorites-info"]')).not.toBeNull();
  });
});
