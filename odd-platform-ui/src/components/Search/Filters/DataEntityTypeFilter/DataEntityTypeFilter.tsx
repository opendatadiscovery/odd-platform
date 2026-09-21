import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { SearchFacetNames } from 'redux/interfaces';
import { searchPath } from 'routes';
import {
  liveSearch,
  paramsToSearchState,
  searchStateToParams,
} from 'lib/search/searchUrlState';
import FixedOptionsMultiFilter, {
  type FixedFilterOption,
} from '../FilterItem/FixedOptionsMultiFilter/FixedOptionsMultiFilter';

// The entity classes as a FIXED reference taxonomy — id + label, in the order the retired class tabs used.
// The ids are the immutable DataEntityClassDto ids (odd-platform-api dto/DataEntityClassDto.java): DATA_SET(1),
// DATA_TRANSFORMER(2), DATA_QUALITY_TEST(4), DATA_CONSUMER(6), DATA_INPUT(7), DATA_ENTITY_GROUP(8),
// DATA_RELATIONSHIP(9). Hardcoded (exactly as ASSET_KIND_OPTIONS lists the asset kinds) so the option list and
// the selected chips are RELIABLE — never dependent on the single-class DE-session facet totals, which collapse
// to one class under a multi-class selection (they carried the old class tabs, which were single-select).
const DE_CLASS_OPTIONS: ReadonlyArray<{ id: number; labelKey: string }> = [
  { id: 1, labelKey: 'Datasets' },
  { id: 2, labelKey: 'Transformers' },
  { id: 6, labelKey: 'Data Consumers' },
  { id: 7, labelKey: 'Data Inputs' },
  { id: 4, labelKey: 'Quality Tests' },
  { id: 8, labelKey: 'Groups' },
  { id: 9, labelKey: 'Relationships' },
];

/**
 * ST-4 (#1838) — the **Data entity type** filter: a STANDARD, SEPARATE search-filter multiselect (identical
 * control to Statuses / Tag / the Asset-type filter) over the entity classes. It narrows the Data-Entity rows of
 * the cross-kind result to ANY of the selected classes (an OR — `entity_class_ids && [ids]`) — or, since ST-11
 * (#1845), to ALL of them (`Match all`, `@>`) — minus the excluded ones; other kinds pass through (this facet
 * refines the Data-Entity rows; which KINDS appear is the Asset-type filter's decision). Like the Asset-type filter, the selection rides the URL (`?entityClasses[]=`) DIRECTLY — never the
 * redux DE-session facet, whose single-class collapse dropped the second chip on reload and could not carry a
 * multi-class selection. NOT a nested reveal, NOT single-select, no per-filter Clear All (the single
 * Filters-panel "Clear All" clears it, like every other filter).
 */
const DataEntityTypeFilter: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const urlState = React.useMemo(
    () => paramsToSearchState(location.search),
    [location.search]
  );
  const selectedIds = urlState.facets.entityClasses ?? [];
  // ST-11 (#1845) — the excluded classes and the facet's `Match all` mode ride the URL beside the positives
  // (`entityClasses[]=1,-4`, `match_all[]=entity_classes`), read and written through the same canonical grammar.
  const excludedIds = urlState.excluded?.entityClasses ?? [];
  const matchMode = urlState.matchAll?.includes('entityClasses') ? 'all' : 'any';

  const options: FixedFilterOption[] = React.useMemo(
    () => DE_CLASS_OPTIONS.map(({ id, labelKey }) => ({ id, name: t(labelKey) })),
    [t]
  );

  const write = React.useCallback(
    (ids: number[], excluded: number[], mode: 'any' | 'all') => {
      // the browser's URL (`liveSearch`), never the router's lagging copy — every other dimension is preserved
      const current = paramsToSearchState(liveSearch(location));
      const matchAll: SearchFacetNames[] = (current.matchAll ?? []).filter(
        f => f !== 'entityClasses'
      );
      if (mode === 'all' && ids.length > 0) matchAll.push('entityClasses');
      const next = {
        ...current,
        facets: { ...current.facets, entityClasses: ids.length ? ids : undefined },
        excluded: {
          ...current.excluded,
          entityClasses: excluded.length ? excluded : undefined,
        },
        matchAll: matchAll.length ? matchAll : undefined,
      };
      const params = searchStateToParams(next);
      navigate(`${searchPath()}${params ? `?${params}` : ''}`);
    },
    [location, navigate]
  );

  const without = (ids: readonly number[], id: string | number) =>
    ids.filter(x => x !== id);

  return (
    <FixedOptionsMultiFilter
      name={t('Data entity type')}
      filterId='entityClasses'
      options={options}
      selectedIds={selectedIds}
      excludedIds={excludedIds}
      onSelect={option =>
        write(
          [...selectedIds, option.id as number],
          without(excludedIds, option.id),
          matchMode
        )
      }
      onRemove={option =>
        write(without(selectedIds, option.id), without(excludedIds, option.id), matchMode)
      }
      onExclude={option =>
        write(
          without(selectedIds, option.id),
          [...without(excludedIds, option.id), option.id as number],
          matchMode
        )
      }
      onInclude={option =>
        write(
          [...without(selectedIds, option.id), option.id as number],
          without(excludedIds, option.id),
          matchMode
        )
      }
      matchMode={matchMode}
      onMatchModeChange={mode => write([...selectedIds], [...excludedIds], mode)}
    />
  );
};

export default DataEntityTypeFilter;
