import React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import theme from 'theme/mui.theme';
import en from 'locales/translations/en.json';
import { render } from 'lib/tests/testHelpers';
import { DEFAULT_RESULT_COLUMNS, type ResultColumnId } from 'lib/search/resultColumns';
import ColumnsPicker from '../ColumnsPicker';

/**
 * ST-13a (#1847) — the column constructor, driven through its controls (G-C20: a goal completed THROUGH the
 * control, asserting what it hands back — the three actions the hook exposes): the trigger opens the grouped
 * checklist with the count badge; a checkbox row toggles; the up / down buttons move and name their column for
 * assistive tech; the two anchors are locked rows; Reset restores the default and is disabled while on it.
 */
beforeAll(() => {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false },
  });
});

const renderPicker = (columns: ResultColumnId[]) => {
  const toggle = vi.fn();
  const move = vi.fn();
  const reset = vi.fn();
  render(
    <MuiThemeProvider theme={theme}>
      <ColumnsPicker columns={columns} toggle={toggle} move={move} reset={reset} />
    </MuiThemeProvider>,
    { initialEntries: ['/search?q=x'] }
  );
  return { toggle, move, reset };
};

describe('ColumnsPicker', () => {
  it('the trigger shows the shown/total badge and opens the grouped checklist', async () => {
    renderPicker([...DEFAULT_RESULT_COLUMNS]);
    const trigger = screen.getByTestId('search-columns-trigger');
    expect(trigger).toHaveTextContent('Columns 7/24');
    expect(trigger).toHaveAttribute('aria-label', 'Result columns');
    await userEvent.click(trigger);
    const picker = screen.getByTestId('search-columns-picker');
    expect(within(picker).getByText('Common')).toBeInTheDocument();
    expect(within(picker).getByText('Data Entities')).toBeInTheDocument();
    expect(within(picker).getByText('Query Examples')).toBeInTheDocument();
    // the two anchors are locked rows: checked, disabled, labelled
    const nameRow = within(picker).getByTestId('search-columns-row-name');
    expect(within(nameRow).getByRole('checkbox')).toBeChecked();
    expect(within(nameRow).getByRole('checkbox')).toBeDisabled();
    expect(within(nameRow).getByText('Fixed column')).toBeInTheDocument();
    expect(within(nameRow).queryByTestId('search-columns-up-name')).toBeNull();
    // the count reads the optional set: 22 optional rows + 2 locked = 24 checkboxes
    expect(within(picker).getAllByRole('checkbox')).toHaveLength(24);
  });

  it('ticking a row hands its id to toggle; the up / down buttons hand the column and direction to move', async () => {
    const { toggle, move } = renderPicker(['type', 'namespace', 'status']);
    await userEvent.click(screen.getByTestId('search-columns-trigger'));
    const picker = screen.getByTestId('search-columns-picker');
    await userEvent.click(
      within(within(picker).getByTestId('search-columns-row-datasource')).getByRole(
        'checkbox'
      )
    );
    expect(toggle).toHaveBeenCalledWith('datasource');

    const up = within(picker).getByTestId('search-columns-up-status');
    expect(up).toHaveAttribute('aria-label', 'Move Status up');
    await userEvent.click(up);
    expect(move).toHaveBeenCalledWith('status', 'up');
    // the first active column cannot move up; the last cannot move down; an inactive one cannot move at all
    expect(within(picker).getByTestId('search-columns-up-type')).toBeDisabled();
    expect(within(picker).getByTestId('search-columns-down-status')).toBeDisabled();
    expect(within(picker).getByTestId('search-columns-up-datasource')).toBeDisabled();
    expect(within(picker).getByTestId('search-columns-down-namespace')).toBeEnabled();
    expect(within(picker).getByTestId('search-columns-down-namespace')).toHaveAttribute(
      'aria-label',
      'Move Namespace down'
    );
  });

  it('Reset to default calls reset, and is disabled while the layout IS the default', async () => {
    const { reset } = renderPicker(['status']);
    await userEvent.click(screen.getByTestId('search-columns-trigger'));
    await userEvent.click(screen.getByTestId('search-columns-reset'));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it('is disabled on the default layout', async () => {
    renderPicker([...DEFAULT_RESULT_COLUMNS]);
    await userEvent.click(screen.getByTestId('search-columns-trigger'));
    expect(screen.getByTestId('search-columns-reset')).toBeDisabled();
  });

  it('is keyboard-operable: Tab to the trigger, Enter opens, Space on a row toggles', async () => {
    const { toggle } = renderPicker(['type']);
    await userEvent.tab();
    expect(screen.getByTestId('search-columns-trigger')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    const picker = screen.getByTestId('search-columns-picker');
    const box = within(within(picker).getByTestId('search-columns-row-owners')).getByRole(
      'checkbox'
    );
    box.focus();
    await userEvent.keyboard(' ');
    expect(toggle).toHaveBeenCalledWith('owners');
  });
});
