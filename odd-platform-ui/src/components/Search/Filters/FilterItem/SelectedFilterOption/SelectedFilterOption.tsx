import React from 'react';
import type { SearchFilter, SearchFilterState } from 'generated-sources';
import type { OptionalFacetNames } from 'redux/interfaces';
import formatFacetName from 'components/Search/Filters/formatFacetName';
import { useAppDispatch } from 'redux/lib/hooks';
import { changeDataEntitySearchFacet } from 'redux/slices/dataEntitySearch.slice';
import FacetChip from '../FacetChip/FacetChip';

interface FilterItemProps {
  filter: SearchFilter | SearchFilterState;
  facetName: OptionalFacetNames;
  /** the facet's visible label — the accessible name of the chip's controls ("Tag: not pii") */
  facetLabel?: string;
}

/**
 * A selected value of a server-aggregated facet, rendered as the rail's one chip. ST-11 (#1845): the value may be an
 * EXCLUSION (`exclude: true` on the redux facet item — set from the option row's Exclude action, from this chip's
 * own toggle, or echoed back by the session for a fresh `-id` deep link); the toggle flips it, the × removes it.
 * Both write the redux facet state, which the `Search.tsx` mirror turns into the URL (`-id` for an exclusion).
 */
const SelectedFilterOption: React.FC<FilterItemProps> = ({
  filter,
  facetName,
  facetLabel,
}) => {
  const dispatch = useAppDispatch();

  const filterId = 'id' in filter ? filter.id : filter.entityId;
  const filterName = 'name' in filter ? filter.name : filter.entityName;
  const excluded = filter.exclude === true;

  const onRemoveClick = () => {
    dispatch(
      changeDataEntitySearchFacet({
        facetName,
        facetOptionId: filterId,
        facetOptionName: filterName,
        facetOptionState: false,
      })
    );
  };

  const onToggleExclude = () => {
    dispatch(
      changeDataEntitySearchFacet({
        facetName,
        facetOptionId: filterId,
        facetOptionName: filterName,
        facetOptionState: true,
        facetOptionExclude: !excluded,
      })
    );
  };

  return (
    <FacetChip
      label={formatFacetName(facetName, filterName)}
      facetName={facetLabel}
      excluded={excluded}
      onToggleExclude={onToggleExclude}
      onRemove={onRemoveClick}
      dataQa={`filter-${facetName}-chip`}
    />
  );
};

export default SelectedFilterOption;
