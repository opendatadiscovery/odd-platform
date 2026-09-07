import React from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from 'theme/mui.theme';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { render } from 'lib/tests/testHelpers';
import en from 'locales/translations/en.json';
import ua from 'locales/translations/ua.json';
import CalendarFilter from '../CalendarFilter';

/**
 * The BEHAVIOUR-DIFF guard for `AppDateRangePicker`'s two SHIPPED consumers — the Activity and Alerts Period
 * filters. ST-10 (#1844) changes that shared control (an optional range, a placeholder, a positionable calendar,
 * and translated month / weekday names), and until now it had no test of its own: a shared control altered by one
 * slice, with two other surfaces silently riding on it, is the LSN-036 shape.
 *
 * The two surfaces differ in exactly one way, and it is the whole point of the file:
 *   - **Activity** always carries `beginDate`/`endDate` in its query, so the box shows that period. Unchanged.
 *   - **Alerts** leaves the period unset ("all time"), and the box used to show a plausible last-week range it was
 *     not filtering by. It now shows nothing behind a placeholder. A control must not display a filter it does not
 *     hold — the reader has no way to tell the two apart.
 */

beforeAll(() => {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en: { translation: en }, ua: { translation: ua } },
    interpolation: { escapeValue: false },
  });
});

const renderAt = (path: string, defaultQuery: { beginDate?: number; endDate?: number }) =>
  render(
    <MuiThemeProvider theme={theme}>
      <CalendarFilter defaultQuery={defaultQuery} />
    </MuiThemeProvider>,
    { initialEntries: [path] }
  );

const input = (container: HTMLElement) =>
  container.querySelector('input') as HTMLInputElement;

/** the Activity shape: the query always carries a period */
const ACTIVITY = {
  beginDate: Date.UTC(2026, 8, 1, 12),
  endDate: Date.UTC(2026, 8, 8, 12),
};
/** the Alerts shape: no period at all */
const ALERTS = {};

describe('CalendarFilter — the shared Period control, both shipped surfaces (ST-10 / #1844)', () => {
  it('Activity: shows the period the query carries', () => {
    const { container } = renderAt('/activity', ACTIVITY);
    expect(screen.getByText('Period')).toBeVisible();
    expect(input(container).value).not.toBe('');
    expect(input(container).value).toMatch(/Sep/);
  });

  it('Alerts: shows NOTHING while the period is unset — never a window it is not filtering by', () => {
    const { container } = renderAt('/alerts', ALERTS);
    expect(input(container).value).toBe('');
    expect(input(container).placeholder).toBe('Pick two dates');
  });

  it('a URL period wins over the surface default on either surface', () => {
    const { container } = renderAt(
      `/alerts?beginDate=${Date.UTC(2026, 0, 3)}&endDate=${Date.UTC(2026, 0, 9)}`,
      ALERTS
    );
    expect(input(container).value).toMatch(/Jan/);
  });

  it('opens a calendar whose months and weekdays read in the active language', async () => {
    const user = userEvent.setup();
    await i18n.changeLanguage('ua');
    try {
      const { container } = renderAt('/activity', ACTIVITY);
      expect(screen.getByText(ua.Period)).toBeVisible();
      await user.click(input(container));
      // The calendar renders through react-multi-date-picker's own locale object, which ODD's catalog KEY cannot
      // be handed to directly (see calendarLocale) — before ST-10 every locale got English month names here.
      const monthNames = new Intl.DateTimeFormat('uk', {
        month: 'long',
        timeZone: 'UTC',
      });
      const september = monthNames.format(new Date(Date.UTC(2026, 8, 1)));
      expect(document.body.textContent).toContain(september);
      expect(document.body.textContent).not.toContain('September');
    } finally {
      await i18n.changeLanguage('en');
    }
  });

  it('and in English when English is active — the same control, no hardcoding either way', async () => {
    const user = userEvent.setup();
    const { container } = renderAt('/activity', ACTIVITY);
    await user.click(input(container));
    expect(document.body.textContent).toContain('September');
  });
});
