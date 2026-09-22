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
import FacetChip from '../FacetChip';

/**
 * ST-11 (#1845) — the rail's ONE chip. The cases are the control's JOB, not its presence (LSN-043): the toggle
 * flips a value between a positive and an exclusion and the × removes it, each through its own callback and each
 * reachable by keyboard; an excluded chip states "not <value>" and is marked for the pixel / e2e oracle; a chip
 * with no toggle (the range chips) renders exactly one button.
 */
beforeAll(() => {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false },
  });
});

const renderChip = (props: Partial<React.ComponentProps<typeof FacetChip>> = {}) =>
  render(
    <MuiThemeProvider theme={theme}>
      <FacetChip
        label='pii'
        facetName='Tag'
        onRemove={() => {}}
        dataQa='filter-tags-chip'
        {...props}
      />
    </MuiThemeProvider>
  );

describe('FacetChip (ST-11 / #1845)', () => {
  it('a positive chip states the value and offers Exclude; clicking it fires the toggle', async () => {
    const user = userEvent.setup();
    const onToggleExclude = vi.fn();
    const { container } = renderChip({ onToggleExclude });
    expect(screen.getByText('pii')).toBeTruthy();
    expect(
      container
        .querySelector('[data-qa="filter-tags-chip"]')
        ?.getAttribute('data-excluded')
    ).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Exclude: Tag: pii' }));
    expect(onToggleExclude).toHaveBeenCalledTimes(1);
  });

  it('an excluded chip states "not <value>", is marked, and offers Include', async () => {
    const user = userEvent.setup();
    const onToggleExclude = vi.fn();
    const { container } = renderChip({ excluded: true, onToggleExclude });
    expect(screen.getByText('not pii')).toBeTruthy();
    expect(
      container
        .querySelector('[data-qa="filter-tags-chip"]')
        ?.getAttribute('data-excluded')
    ).toBe('true');
    await user.click(screen.getByRole('button', { name: 'Include: Tag: not pii' }));
    expect(onToggleExclude).toHaveBeenCalledTimes(1);
  });

  it('the × removes the value through its own callback and carries the chip statement as its name', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    const onToggleExclude = vi.fn();
    renderChip({ onRemove, onToggleExclude });
    await user.click(screen.getByRole('button', { name: 'Tag: pii' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
    expect(onToggleExclude).not.toHaveBeenCalled();
  });

  it('the toggle is reachable by keyboard: Tab to it, Enter operates it', async () => {
    const user = userEvent.setup();
    const onToggleExclude = vi.fn();
    renderChip({ onToggleExclude });
    await user.tab();
    expect(document.activeElement).toBe(
      screen.getByRole('button', { name: 'Exclude: Tag: pii' })
    );
    await user.keyboard('{Enter}');
    expect(onToggleExclude).toHaveBeenCalledTimes(1);
  });

  it('without a toggle callback the chip renders exactly one button — the × (the range chips)', () => {
    renderChip({ onToggleExclude: undefined });
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.queryByRole('button', { name: /Exclude/ })).toBeNull();
  });
});
