import React from 'react';
import { FormControlLabel, Grid, Typography } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AssetKind, DataEntityClassNameEnum } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getSearchEntityClass, getSearchTotals } from 'redux/selectors';
import { changeDataEntitySearchFacet } from 'redux/slices/dataEntitySearch.slice';
import { Button, Checkbox } from 'components/shared/elements';
import { searchPath } from 'routes';
import { paramsToSearchState, searchStateToParams } from 'lib/search/searchUrlState';
import { ASSET_KIND_OPTIONS } from 'components/Favorites/lib';

/**
 * The Data-Entity class sub-values, revealed when Data Entity is selected. The label per class matches the
 * retired class tabs; the option id comes from the search-response totals (`getSearchTotals`). Selecting one
 * REUSES the existing `entityClasses` facet + the `?entityClasses=` URL param (ST-4 BLOCKER-1 — no new state
 * is invented for the DE-class dimension); the backend narrows DE rows to that class before paginating.
 */
const DE_CLASS_OPTIONS: ReadonlyArray<{
  className: DataEntityClassNameEnum;
  labelKey: string;
}> = [
  { className: DataEntityClassNameEnum.SET, labelKey: 'Datasets' },
  { className: DataEntityClassNameEnum.TRANSFORMER, labelKey: 'Transformers' },
  { className: DataEntityClassNameEnum.CONSUMER, labelKey: 'Data Consumers' },
  { className: DataEntityClassNameEnum.INPUT, labelKey: 'Data Inputs' },
  { className: DataEntityClassNameEnum.QUALITY_TEST, labelKey: 'Quality Tests' },
  { className: DataEntityClassNameEnum.ENTITY_GROUP, labelKey: 'Groups' },
  { className: DataEntityClassNameEnum.RELATIONSHIP, labelKey: 'Relationships' },
];

/**
 * ST-4 (#1838) — the Asset-type filter. Top-level kinds (Data Entity · Term · Query Example) narrow the
 * cross-kind results by kind; selecting Data Entity reveals the entity-class sub-values. The kinds ride the
 * new URL-only `asset_kinds` param (Term / Query Example have no facet today); the DE-class sub-values reuse
 * the redux `entityClasses` facet + `?entityClasses=`. Empty selection = all kinds.
 */
const AssetTypeFilter: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const searchClass = useAppSelector(getSearchEntityClass); // selected DE class id | 'all' | 'my'
  const totals = useAppSelector(getSearchTotals);

  const selectedKinds = React.useMemo(
    () => paramsToSearchState(location.search).assetKinds ?? [],
    [location.search]
  );

  const isKindSelected = (kind: AssetKind) => selectedKinds.includes(kind);
  const selectedDeClassId = typeof searchClass === 'number' ? searchClass : undefined;
  // Reveal the DE-class sub-values when Data Entity is picked OR a class is already active (so an active
  // class narrowing is never hidden — e.g. one restored from a shared URL or a re-applied saved search).
  const showDeClasses =
    isKindSelected(AssetKind.DATA_ENTITY) || selectedDeClassId !== undefined;

  // `asset_kinds` is a URL-only dimension (like `?sort=`): write it through the canonical serialiser so the
  // URL stays byte-identical to the mirror/reader and preserves the live query + facets + sort.
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

  const toggleKind = (kind: AssetKind) =>
    writeKinds(
      isKindSelected(kind)
        ? selectedKinds.filter(k => k !== kind)
        : [...selectedKinds, kind]
    );

  // Single-select DE class (matching the retired class tabs): pick one, or toggle the active one off (back to
  // all Data Entities). The dispatch is the exact `entityClasses` facet update the class tabs used.
  const setDeClass = (className: DataEntityClassNameEnum, select: boolean) => {
    const total = totals[className];
    if (!total?.id) return;
    dispatch(
      changeDataEntitySearchFacet({
        facetName: 'entityClasses',
        facetOptionId: total.id,
        facetOptionName: total.name,
        facetOptionState: select,
        facetSingle: select,
      })
    );
  };

  const toggleDeClass = (className: DataEntityClassNameEnum) => {
    const total = totals[className];
    setDeClass(className, selectedDeClassId !== total?.id);
  };

  const hasSelection = selectedKinds.length > 0 || selectedDeClassId !== undefined;

  const clearAll = () => {
    const active = DE_CLASS_OPTIONS.find(
      o => totals[o.className]?.id === selectedDeClassId
    );
    if (active) setDeClass(active.className, false);
    writeKinds([]);
  };

  return (
    <Grid container flexDirection='column' sx={{ mb: 2 }}>
      <Grid container justifyContent='space-between' alignItems='center' sx={{ mb: 0.5 }}>
        <Typography variant='h4'>{t('Asset type')}</Typography>
        {hasSelection && (
          <Button text={t('Clear All')} buttonType='tertiary-m' onClick={clearAll} />
        )}
      </Grid>
      {ASSET_KIND_OPTIONS.map(({ kind, labelKey }) => (
        <React.Fragment key={kind}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isKindSelected(kind)}
                onChange={() => toggleKind(kind)}
              />
            }
            label={<Typography variant='body1'>{t(labelKey)}</Typography>}
          />
          {kind === AssetKind.DATA_ENTITY && showDeClasses && (
            <Grid container flexDirection='column' sx={{ pl: 3 }}>
              {DE_CLASS_OPTIONS.map(({ className, labelKey: classLabelKey }) => {
                const total = totals[className];
                if (!total?.id) return null;
                return (
                  <FormControlLabel
                    key={className}
                    control={
                      <Checkbox
                        checked={selectedDeClassId === total.id}
                        onChange={() => toggleDeClass(className)}
                      />
                    }
                    label={<Typography variant='body1'>{t(classLabelKey)}</Typography>}
                  />
                );
              })}
            </Grid>
          )}
        </React.Fragment>
      ))}
    </Grid>
  );
};

export default AssetTypeFilter;
