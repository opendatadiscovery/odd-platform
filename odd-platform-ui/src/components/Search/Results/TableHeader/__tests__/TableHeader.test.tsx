import React from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import theme from 'theme/mui.theme';
import en from 'locales/translations/en.json';
import { render } from 'lib/tests/testHelpers';
import TableHeader from '../TableHeader';

/**
 * ST-13a (#1847) — the header renders the layout (left anchor · the columns in order · right anchor) and each
 * optional header carries the "Applies to" tooltip, opening on hover AND on keyboard focus, with the column's note
 * where it has one (the two clocks behind "Updated"; the class list of a class-specific column).
 */
beforeAll(() => {
  i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    resources: { en: { translation: en } },
    interpolation: { escapeValue: false },
  });
});

describe('TableHeader', () => {
  it('renders the anchors around the layout, in order', () => {
    render(
      <MuiThemeProvider theme={theme}>
        <TableHeader columns={['status', 'rows_count', 'type']} />
      </MuiThemeProvider>
    );
    const cells = screen
      .getAllByTestId(/^search-header-/)
      .filter(el => !el.dataset.testid?.includes('label'));
    expect(cells.map(el => el.dataset.testid)).toEqual([
      'search-header-name',
      'search-header-status',
      'search-header-rows_count',
      'search-header-type',
      'search-header-recently_viewed',
    ]);
    expect(cells[0]).toHaveTextContent('Name');
    expect(cells[2]).toHaveTextContent('Rows');
  });

  it('an optional header names what it applies to on hover, and the Updated note; a class-specific one names its class', async () => {
    render(
      <MuiThemeProvider theme={theme}>
        <TableHeader columns={['status', 'updated_at', 'rows_count']} />
      </MuiThemeProvider>
    );
    await userEvent.hover(screen.getByTestId('search-header-label-status'));
    await waitFor(() =>
      expect(screen.getByText('Applies to: Data Entities')).toBeInTheDocument()
    );
    await userEvent.unhover(screen.getByTestId('search-header-label-status'));

    await userEvent.hover(screen.getByTestId('search-header-label-updated_at'));
    await waitFor(() =>
      expect(
        screen.getByText('Applies to: Data Entities, Terms, Query Examples')
      ).toBeInTheDocument()
    );
    expect(
      screen.getByText(
        'Last update in the source system for data entities; in the platform for terms and query examples'
      )
    ).toBeInTheDocument();
    await userEvent.unhover(screen.getByTestId('search-header-label-updated_at'));

    await userEvent.hover(screen.getByTestId('search-header-label-rows_count'));
    await waitFor(() =>
      expect(screen.getByText('Applies to: Datasets')).toBeInTheDocument()
    );
  });

  it('the tooltip also opens from the keyboard (the label is a focusable control)', async () => {
    render(
      <MuiThemeProvider theme={theme}>
        <TableHeader columns={['namespace']} />
      </MuiThemeProvider>
    );
    await userEvent.tab();
    expect(screen.getByTestId('search-header-label-namespace')).toHaveFocus();
    await waitFor(() =>
      expect(screen.getByText('Applies to: Data Entities, Terms')).toBeInTheDocument()
    );
  });
});
