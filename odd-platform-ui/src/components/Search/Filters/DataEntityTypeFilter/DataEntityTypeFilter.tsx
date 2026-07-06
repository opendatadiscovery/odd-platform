import React from 'react';
import { useTranslation } from 'react-i18next';
import { DataEntityClassNameEnum } from 'generated-sources';
import { useAppDispatch, useAppSelector } from 'redux/lib/hooks';
import { getSearchTotals, getSelectedEntityClassIds } from 'redux/selectors';
import { changeDataEntitySearchFacet } from 'redux/slices/dataEntitySearch.slice';
import FixedOptionsMultiFilter, {
  type FixedFilterOption,
} from '../FilterItem/FixedOptionsMultiFilter/FixedOptionsMultiFilter';

// The entity classes, in the same order + labels the retired class tabs used. The class id is resolved from
// the search-response totals (the retired tabs sourced it the same way).
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
 * ST-4 (#1838) — the **Data entity type** filter: a STANDARD, SEPARATE search-filter multiselect (identical
 * control to Statuses / Tag) over the entity classes (Datasets / Transformers / Data Consumers / …). It narrows
 * the Data-Entity rows of the cross-kind result to the selected classes; other kinds are unaffected. It writes
 * the existing `entityClasses` facet as a MULTISELECT (no `facetSingle`), so the class ids ride
 * `?entityClasses[]=` and the ranked query applies them. NOT a nested reveal, NOT single-select, no per-filter
 * Clear All — the single Filters-panel "Clear All" clears it (like every other filter).
 */
const DataEntityTypeFilter: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const totals = useAppSelector(getSearchTotals);
  const selectedIds = useAppSelector(getSelectedEntityClassIds);

  const options: FixedFilterOption[] = React.useMemo(
    () =>
      DE_CLASS_OPTIONS.reduce<FixedFilterOption[]>((acc, { className, labelKey }) => {
        const total = totals[className];
        if (total?.id) acc.push({ id: total.id, name: t(labelKey) });
        return acc;
      }, []),
    [totals, t]
  );

  const setClass = React.useCallback(
    (id: string | number, selected: boolean) => {
      const entry = DE_CLASS_OPTIONS.find(
        ({ className }) => totals[className]?.id === id
      );
      const total = entry ? totals[entry.className] : undefined;
      dispatch(
        changeDataEntitySearchFacet({
          facetName: 'entityClasses',
          facetOptionId: id,
          facetOptionName: total?.name ?? String(id),
          facetOptionState: selected,
        })
      );
    },
    [dispatch, totals]
  );

  // Hide until the (DE-session) class totals resolve, so the control is never empty. The class ids arrive with
  // the first search response, exactly as the retired class tabs sourced them.
  if (options.length === 0) return null;

  return (
    <FixedOptionsMultiFilter
      name={t('Data entity type')}
      filterId='entityClasses'
      options={options}
      selectedIds={selectedIds}
      onSelect={option => setClass(option.id, true)}
      onRemove={option => setClass(option.id, false)}
    />
  );
};

export default DataEntityTypeFilter;
