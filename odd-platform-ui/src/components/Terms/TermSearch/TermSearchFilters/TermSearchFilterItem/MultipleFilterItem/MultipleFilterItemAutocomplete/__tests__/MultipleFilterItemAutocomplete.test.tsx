import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from 'theme/mui.theme';
import { render } from 'lib/tests/testHelpers';
import { termApi } from 'lib/api';
import MultipleFilterItemAutocomplete from '../MultipleFilterItemAutocomplete';

/**
 * Term search facet autocomplete (Tag / Owner / Namespace). The server returns only the top 30 options, so each
 * typed query is fetched; with a debounce in front, a slow answer to an older query can land after the newer one
 * and must not replace its options.
 *
 * The real thunk runs; only `termApi.getTermFiltersForFacet` is stubbed, so each call's query and resolution
 * order are under the test's control.
 */

type Option = { id: number; name: string; count: number };

const fetchMock = vi.fn<(p: { query: string }) => Promise<Option[]>>();

const option = (id: number, name: string): Option => ({ id, name, count: 1 });
const popular = Array.from({ length: 30 }, (_, i) => option(i + 1, `popular_${i}`));

const deferred = <T,>() => {
  let resolve!: (v: T) => void;
  const promise = new Promise<T>(r => {
    resolve = r;
  });
  return { promise, resolve };
};

const renderAutocomplete = () =>
  render(
    <MuiThemeProvider theme={theme}>
      <MultipleFilterItemAutocomplete name='Tag' facetName='tags' />
    </MuiThemeProvider>
  );

const queries = () => fetchMock.mock.calls.map(([p]) => p.query);

describe('Terms MultipleFilterItemAutocomplete', () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.spyOn(termApi, 'getTermFiltersForFacet').mockImplementation(
      params => fetchMock(params as { query: string }) as never
    );
  });

  it('fetches with the typed text while the popup is open', async () => {
    fetchMock.mockImplementation(({ query }) =>
      Promise.resolve(query ? [option(99, 'finance')] : popular)
    );
    renderAutocomplete();
    const input = screen.getByRole('combobox');

    await userEvent.click(input);
    await screen.findByText('popular_0', undefined, { timeout: 2000 });

    await userEvent.type(input, 'fin', { skipClick: true });

    await waitFor(() => expect(queries()).toContain('fin'), { timeout: 2000 });
    expect(
      await screen.findByText('fin', undefined, { timeout: 2000 })
    ).toBeInTheDocument();
    expect(screen.getByText('ance')).toBeInTheDocument();
  });

  it('typing into a closed popup fetches with the typed text, not the text it had before', async () => {
    fetchMock.mockImplementation(({ query }) =>
      Promise.resolve(query ? [option(99, 'finance')] : popular)
    );
    renderAutocomplete();
    const input = screen.getByRole('combobox');

    input.focus();
    await userEvent.type(input, 'fin', { skipClick: true });

    await screen.findByText('ance', undefined, { timeout: 2000 });
    expect(queries()).toEqual(['fin']);
  });

  it('ignores a response that arrives after a newer query has been answered', async () => {
    const slow = deferred<Option[]>();
    fetchMock.mockImplementation(({ query }) => {
      if (query === 'fi') return slow.promise;
      if (query === 'fin') return Promise.resolve([option(99, 'finance')]);
      return Promise.resolve(popular);
    });
    renderAutocomplete();
    const input = screen.getByRole('combobox');

    await userEvent.click(input);
    await screen.findByText('popular_0', undefined, { timeout: 2000 });

    await userEvent.type(input, 'fi', { skipClick: true });
    await waitFor(() => expect(queries()).toContain('fi'), { timeout: 2000 });
    await userEvent.type(input, 'n', { skipClick: true });
    await waitFor(() => expect(queries()).toContain('fin'), { timeout: 2000 });
    await screen.findByText('ance', undefined, { timeout: 2000 });

    // still matches 'fin' client-side, so only the ordering guard can keep it out
    slow.resolve([option(98, 'stale_fin')]);
    await slow.promise;
    await new Promise(r => {
      setTimeout(r, 50);
    });

    expect(screen.queryByText('stale_')).not.toBeInTheDocument();
    expect(screen.getByText('ance')).toBeInTheDocument();
  });
});
