import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { AssetKind } from 'generated-sources';
import { searchPath } from 'routes';
import { paramsToSearchState, searchStateToParams } from 'lib/search/searchUrlState';
import { ASSET_KIND_OPTIONS } from 'components/Favorites/lib';
import FixedOptionsMultiFilter, {
  type FixedFilterOption,
} from '../FilterItem/FixedOptionsMultiFilter/FixedOptionsMultiFilter';

/**
 * ST-4 (#1838) — the cross-kind **Asset type** filter: a STANDARD search-filter multiselect (identical control
 * to Statuses / Tag / Owner) over the asset kinds (Data Entities · Terms · Query Examples). Selecting kinds
 * narrows the cross-kind results to those kinds; empty = all kinds. The selection rides the URL-only
 * `?asset_kinds=` param (Term / Query Example have no server facet), written through the canonical serialiser so
 * the URL stays byte-identical to the mirror/reader. Cleared by the single Filters-panel "Clear All".
 */
const AssetTypeFilter: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKinds = React.useMemo(
    () => paramsToSearchState(location.search).assetKinds ?? [],
    [location.search]
  );

  const options: FixedFilterOption[] = React.useMemo(
    () =>
      ASSET_KIND_OPTIONS.map(({ kind, labelKey }) => ({ id: kind, name: t(labelKey) })),
    [t]
  );

  const writeKinds = React.useCallback(
    (kinds: AssetKind[]) => {
      const next = {
        ...paramsToSearchState(location.search),
        assetKinds: kinds.length ? kinds : undefined,
      };
      const params = searchStateToParams(next);
      navigate(`${searchPath()}${params ? `?${params}` : ''}`);
    },
    [location.search, navigate]
  );

  return (
    <FixedOptionsMultiFilter
      name={t('Asset type')}
      filterId='asset_kinds'
      options={options}
      selectedIds={selectedKinds}
      onSelect={option => writeKinds([...selectedKinds, option.id as AssetKind])}
      onRemove={option => writeKinds(selectedKinds.filter(kind => kind !== option.id))}
    />
  );
};

export default AssetTypeFilter;
