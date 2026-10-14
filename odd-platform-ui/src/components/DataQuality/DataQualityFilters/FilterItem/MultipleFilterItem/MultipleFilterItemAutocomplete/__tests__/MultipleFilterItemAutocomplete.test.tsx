import React, { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from 'theme/mui.theme';
import { render } from 'lib/tests/testHelpers';
import type { FilterOption, HookResult } from 'components/DataQuality/interfaces';
import MultipleFilterItemAutocomplete from '../MultipleFilterItemAutocomplete';

/**
 * Data Quality filter autocomplete (Tag / Owner / Datasource …). `useFilter` re-queries React Query with the typed
 * text; the options shown must follow that query's result when it ARRIVES, not only when the text changes —
 * otherwise each keystroke shows the previous query's answer ("the tag doesn't show up, then appears when I try
 * again").
 *
 * The harness plays `useFilter`'s part: it owns `searchText` and hands down the result for that text, absent
 * (fetching) until the test supplies it, like React Query on a fresh key.
 */

const option = (id: number, name: string): FilterOption => ({ id, name });
const popular = Array.from({ length: 30 }, (_, i) => option(i + 1, `popular_${i}`));

const Harness: React.FC<{ results: Record<string, FilterOption[]> }> = ({ results }) => {
  const [searchText, setSearchText] = useState('');
  const items = results[searchText];
  const hookResult = {
    isSuccess: !!items,
    isFetching: !items,
    data: items ? { items } : undefined,
  } as HookResult;
  return (
    <MuiThemeProvider theme={theme}>
      <MultipleFilterItemAutocomplete
        name='Tag'
        hookResult={hookResult}
        searchText={searchText}
        setSearchText={setSearchText}
        selectedOptions={[]}
        onSelectOption={vi.fn()}
      />
    </MuiThemeProvider>
  );
};

describe('DataQuality MultipleFilterItemAutocomplete', () => {
  it('shows the typed query’s options once they arrive, not the previous query’s', async () => {
    const { rerender } = render(<Harness results={{ '': popular }} />);
    const input = screen.getByRole('combobox');

    await userEvent.click(input);
    await screen.findByText('popular_0');

    await userEvent.type(input, 'fin', { skipClick: true });
    rerender(<Harness results={{ '': popular, fin: [option(99, 'finance')] }} />);

    expect(await screen.findByText('ance')).toBeInTheDocument();
  });
});
