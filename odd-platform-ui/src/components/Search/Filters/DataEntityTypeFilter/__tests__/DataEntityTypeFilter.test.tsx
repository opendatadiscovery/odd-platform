import React from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from 'theme/mui.theme';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { render } from 'lib/tests/testHelpers';
import en from 'locales/translations/en.json';
import DataEntityTypeFilter from '../DataEntityTypeFilter';

/**
 * ST-11 (#1845) — the Data-entity-type filter's WRITERS. The filter rides the URL directly (ST-4), and since
 * ST-11 carries the excluded classes (`-id`) and the facet's mode (`match_all[]=entity_classes`) beside the
 * positives. Every write must EDIT the classes the browser's URL carries at the moment of the click, never the ids
 * the render was given: react-router 7 commits a navigation inside `React.startTransition`, the search page's
 * render takes 0.3-0.6 s, and a second click on this filter inside that window used to compute from the previous
 * selection — measured on the stand: remove one chip, exclude another, and the removed class came back.
 *
 * The write path is asserted through a real MemoryRouter + a location probe (the FavoritesFilter pattern): a
 * navigate spy would pass on a byte-divergent URL, and a divergent URL is the failure mode here.
 */
beforeAll(() => {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false },
  });
});

const LocationProbe: React.FC = () => {
  const loc = useLocation();
  return <div data-testid='loc'>{`${loc.pathname}${loc.search}`}</div>;
};

const renderAt = (path: string) =>
  render(
    <MuiThemeProvider theme={theme}>
      <DataEntityTypeFilter />
      <LocationProbe />
    </MuiThemeProvider>,
    { initialEntries: [path] }
  );

const chipButton = (label: string, hook: 'facet-chip-remove' | 'facet-chip-toggle') =>
  Array.from(document.querySelectorAll('[data-qa="filter-entityClasses-chip"]'))
    .find(chip => chip.textContent?.trim() === label)
    ?.querySelector(`[data-qa="${hook}"]`) as HTMLElement;

describe('DataEntityTypeFilter writers (ST-11 / #1845)', () => {
  it('a chip Exclude writes the class as an exclusion and keeps every other dimension', async () => {
    renderAt('/search?entityClasses[]=1,2&q=orders&sort=name');
    await userEvent.click(chipButton('Datasets', 'facet-chip-toggle'));
    expect(screen.getByTestId('loc')).toHaveTextContent(
      '/search?entityClasses[]=2,-1&q=orders&sort=name'
    );
  });

  it('Match all rides the URL beside the positives (the grammar keeps it while one positive is left; a facet with none drops it)', async () => {
    renderAt('/search?entityClasses[]=1,2&q=orders');
    await userEvent.click(
      document.querySelector('[data-qa="filter-entityClasses-match-all"]') as HTMLElement
    );
    expect(screen.getByTestId('loc')).toHaveTextContent(
      '/search?entityClasses[]=1,2&match_all[]=entity_classes&q=orders'
    );
    await userEvent.click(chipButton('Transformers', 'facet-chip-remove'));
    // one positive left: the control is hidden (nothing to choose) but the choice is kept for the next value
    expect(screen.getByTestId('loc')).toHaveTextContent(
      '/search?entityClasses[]=1&match_all[]=entity_classes&q=orders'
    );
    expect(document.querySelector('[data-qa="filter-entityClasses-match"]')).toBeNull();
    await userEvent.click(chipButton('Datasets', 'facet-chip-remove'));
    expect(screen.getByTestId('loc')).toHaveTextContent('/search?q=orders');
  });

  it('a click builds on the URL the BROWSER is on when the router still lags the previous write', async () => {
    // Modelled: the previous click removed Transformers (the browser's history has moved to `entityClasses[]=1`)
    // while the memory router still shows both classes. Excluding Datasets must NOT resurrect Transformers.
    renderAt('/search?entityClasses[]=1,2&q=orders');
    window.history.replaceState({}, '', '/search?entityClasses[]=1&q=orders');
    try {
      await userEvent.click(chipButton('Datasets', 'facet-chip-toggle'));
      expect(screen.getByTestId('loc')).toHaveTextContent(
        '/search?entityClasses[]=-1&q=orders'
      );
    } finally {
      window.history.replaceState({}, '', '/');
    }
  });
});
