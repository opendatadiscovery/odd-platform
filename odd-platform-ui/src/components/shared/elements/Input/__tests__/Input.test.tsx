import React from 'react';
import { describe, expect, it } from 'vitest';
import { screen } from '@testing-library/react';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from 'theme/mui.theme';
import { render } from 'lib/tests/testHelpers';
import Input from '../Input';

/**
 * The shared Input's label must NAME the input for assistive technology whenever the input has an id — the way
 * every facet autocomplete on the Search page hands its id through `inputProps` (ST-11 / #1845: the Datasource
 * and Namespace filters moved from the AppSelect, whose label is associated, onto this control, and a shipped
 * e2e case that reaches the Datasource combobox by its accessible name found nothing).
 */
describe('Input — the label names the input', () => {
  it("a label with an id (own or via inputProps) is the input's accessible name", () => {
    render(
      <MuiThemeProvider theme={theme}>
        <Input
          variant='main-m'
          label='Datasource'
          inputProps={{ id: 'filter-datasources', role: 'combobox' }}
        />
        <Input variant='main-m' label='Search by name' id='plain-input' />
      </MuiThemeProvider>
    );
    expect(screen.getByRole('combobox', { name: 'Datasource' }).id).toBe(
      'filter-datasources'
    );
    expect(screen.getByLabelText('Search by name').id).toBe('plain-input');
  });

  it('a label without any id stays a caption (no association to invent)', () => {
    render(
      <MuiThemeProvider theme={theme}>
        <Input variant='main-m' label='Caption only' />
      </MuiThemeProvider>
    );
    expect(screen.getByText('Caption only').getAttribute('for')).toBeNull();
    expect(screen.queryByLabelText('Caption only')).toBeNull();
  });
});
