import React from 'react';
import { vi } from 'vitest';
import type * as SharedElements from 'components/shared/elements';
import type { SearchFilter } from 'generated-sources';
import { getByText, queryByText, render } from 'lib/tests/testHelpers';
import SelectedFilterOption from '../SelectedFilterOption';

// The chip renders an MUI-styled icon Button whose styles need the MUI theme, which
// the shared test harness doesn't provide; stub it so the test focuses on the label
// rendering (the subject of #1835).
vi.mock('components/shared/elements', async importOriginal => ({
  ...(await importOriginal<typeof SharedElements>()),
  Button: () => null,
}));

// #1835 — a selected facet chip must render the RAW facet value, matching the sidebar
// dropdown option (which never applied `capitalize`). Before the fix the chip ran the
// value through TextFormatted -> capitalize, so `DRAFT` showed as "Draft" and `DATA_SET`
// as "Data set" while the dropdown showed `DRAFT` / "DATA SET".
describe('SelectedFilterOption', () => {
  it('renders a status value verbatim (DRAFT, not the capitalized Draft)', () => {
    render(
      <SelectedFilterOption
        facetName='statuses'
        filter={{ id: 3, name: 'DRAFT' } as SearchFilter}
      />
    );
    expect(getByText('DRAFT')).toBeTruthy();
    expect(queryByText('Draft')).toBeNull();
  });

  it('renders a type value with underscore -> space, uppercase preserved (DATA SET, not Data set)', () => {
    render(
      <SelectedFilterOption
        facetName='types'
        filter={{ id: 1, name: 'DATA_SET' } as SearchFilter}
      />
    );
    expect(getByText('DATA SET')).toBeTruthy();
    expect(queryByText('Data set')).toBeNull();
  });
});
