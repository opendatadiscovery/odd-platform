import React from 'react';
import { Grid } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import type { SearchFilter } from 'generated-sources';
import type { OptionalFacetNames, SearchFacetNames } from 'redux/interfaces';
import { useAppSelector } from 'redux/lib/hooks';
import { getSelectedSearchFacetOptions } from 'redux/selectors';
import { buildSearchLink } from 'lib/hooks';
import {
  liveSearch,
  MULTI_VALUED_FACETS,
  paramsToSearchState,
} from 'lib/search/searchUrlState';
import SelectedFilterOption from '../SelectedFilterOption/SelectedFilterOption';
import FacetMatchMode, {
  type FacetMatchModeValue,
} from '../FacetMatchMode/FacetMatchMode';
import MultipleFilterItemAutocomplete from './MultipleFilterItemAutocomplete/MultipleFilterItemAutocomplete';

interface FilterItemProps {
  name: string;
  facetName: OptionalFacetNames;
  /** ST-11: a static option list (Datasource / Namespace) instead of the legacy session's aggregation */
  options?: ReadonlyArray<SearchFilter>;
}

/**
 * A server-aggregated (or, since ST-11, a static-list) multi-select facet: the autocomplete above, the chips of the
 * selected AND excluded values below. ST-11 (#1845) adds the `Match any | Match all` control under the chips of a
 * MULTI-VALUED facet (Tag / Owner / Groups) once two or more positive values are selected — the only moment the
 * question exists. The mode is a URL-only dimension (`match_all[]`, ADR D10): it is read from the browser's URL and
 * written through the canonical serialiser with every other dimension preserved, exactly as the sibling URL-only
 * filters do; the `Search.tsx` mirror carries it across facet toggles.
 */
const MultipleFilterItem: React.FC<FilterItemProps> = ({ name, facetName, options }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedOptions = useAppSelector(getSelectedSearchFacetOptions(facetName));

  const positives = React.useMemo(
    () => (selectedOptions ?? []).filter(option => option.exclude !== true),
    [selectedOptions]
  );
  const multiValued = MULTI_VALUED_FACETS.includes(facetName);
  const mode: FacetMatchModeValue = React.useMemo(
    () =>
      paramsToSearchState(location.search).matchAll?.includes(facetName) ? 'all' : 'any',
    [location.search, facetName]
  );

  const writeMode = React.useCallback(
    (next: FacetMatchModeValue) => {
      // the browser's URL (`liveSearch`), never the router's lagging copy — every other dimension is preserved
      const live = paramsToSearchState(liveSearch(location));
      const current: SearchFacetNames[] = live.matchAll ?? [];
      const rest: SearchFacetNames[] = current.filter(f => f !== facetName);
      const matchAll: SearchFacetNames[] = next === 'all' ? [...rest, facetName] : rest;
      navigate(
        buildSearchLink({ ...live, matchAll: matchAll.length > 0 ? matchAll : undefined })
      );
    },
    [location, navigate, facetName]
  );

  return (
    <Grid container>
      <Grid item xs={12}>
        <MultipleFilterItemAutocomplete
          name={name}
          facetName={facetName}
          options={options}
        />
      </Grid>
      <Grid display='inline-flex' item xs={12} sx={{ my: 0.25, mx: -0.25 }} container>
        {selectedOptions?.map(option => (
          <SelectedFilterOption
            key={option.entityId}
            facetName={facetName}
            facetLabel={name}
            filter={option}
          />
        ))}
      </Grid>
      {multiValued && positives.length >= 2 && (
        <FacetMatchMode filterId={facetName} value={mode} onChange={writeMode} />
      )}
    </Grid>
  );
};

export default MultipleFilterItem;
