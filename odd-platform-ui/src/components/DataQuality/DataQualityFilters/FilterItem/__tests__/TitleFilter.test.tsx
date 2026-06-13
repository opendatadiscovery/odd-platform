import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { getByText, render } from 'lib/tests/testHelpers';
import { TitleFilter } from '../TitleFilter';

/**
 * CTRIB-011 / odd-platform#1767 — the Data Quality dashboard "Title" filter binds
 * OWNERSHIP.TITLE_ID (the role an owner holds, e.g. "Data Steward"), NOT the dataset
 * name. The bare label `t('Title')` reads as the dataset title and silently misleads
 * operators. The filter must be labelled "Owner title".
 *
 * Shallow render: `useFilter` (jotai store + the title API) and the MUI autocomplete
 * child are stubbed, so the test isolates the user-visible label `TitleFilter` sets.
 * i18n is not initialised in tests, so `t('Owner title')` returns the key — which is
 * identical to the en.json value "Owner title", making the assertion robust either way.
 */

vi.mock('components/DataQuality/DataQualityFilters/hooks', () => ({
  useFilter: () => ({
    searchText: '',
    setSearchText: vi.fn(),
    selectedOptions: [],
    onSelectOption: vi.fn(),
    onDeselectOption: vi.fn(),
    hookResult: { isSuccess: false },
  }),
}));

vi.mock(
  'components/DataQuality/DataQualityFilters/FilterItem/MultipleFilterItem/MultipleFilterItemAutocomplete/MultipleFilterItemAutocomplete',
  () => ({
    default: ({ name }: { name: string }) => (
      <span data-testid='dq-filter-label'>{name}</span>
    ),
  })
);

describe('TitleFilter — DQ dashboard ownership-Title filter (#1767)', () => {
  it('labels the filter "Owner title", not the ambiguous bare "Title"', () => {
    render(<TitleFilter filterKey='titleIds' />);

    // RED on the pre-fix code: TitleFilter rendered name={t('Title')} -> "Title".
    // GREEN after the relabel: name={t('Owner title')} -> "Owner title".
    expect(getByText('Owner title')).toBeInTheDocument();
  });
});
