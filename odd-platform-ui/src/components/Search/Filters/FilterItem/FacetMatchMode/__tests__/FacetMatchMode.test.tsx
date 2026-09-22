import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from 'theme/mui.theme';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { render } from 'lib/tests/testHelpers';
import en from 'locales/translations/en.json';
import FacetMatchMode from '../FacetMatchMode';

/** ST-11 (#1845) — the `Match any | Match all` control: two real buttons, the active one pressed, each committing its mode. */
beforeAll(() => {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false },
  });
});

describe('FacetMatchMode (ST-11 / #1845)', () => {
  it('shows the active mode as pressed and commits the other on click (and by keyboard)', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <MuiThemeProvider theme={theme}>
        <FacetMatchMode filterId='tags' value='any' onChange={onChange} />
      </MuiThemeProvider>
    );
    expect(screen.getByRole('button', { name: 'any' }).getAttribute('aria-pressed')).toBe(
      'true'
    );
    expect(screen.getByRole('button', { name: 'all' }).getAttribute('aria-pressed')).toBe(
      'false'
    );
    await user.click(screen.getByRole('button', { name: 'all' }));
    expect(onChange).toHaveBeenCalledWith('all');
    await user.tab();
    await user.tab();
    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledTimes(2);
  });
});
