import { atom } from 'jotai';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';
import type { FilterOption } from '../interfaces';

type FormFiltersAtom = {
  [Property in keyof DataQualityRunsApiGetDataQualityTestsRunsRequest]-?: Array<FilterOption>;
};

type FormFiltersKeys = keyof FormFiltersAtom;

export const formFiltersAtom = atom<FormFiltersAtom>({
  namespaceIds: [],
  datasourceIds: [],
  ownerIds: [],
  titleIds: [],
  tagIds: [],
  deNamespaceIds: [],
  deDatasourceIds: [],
  deOwnerIds: [],
  deTitleIds: [],
  deTagIds: [],
});

export const getFieldFilterAtom = (key: FormFiltersKeys) =>
  atom<FilterOption[], [value: FilterOption[]], void>(
    get => get(formFiltersAtom)[key],
    (get, set, value) => {
      set(formFiltersAtom, { ...get(formFiltersAtom), [key]: value });
    }
  );

export const filtersAtom = atom(get => {
  const formFilters = get(formFiltersAtom);
  const filters = Object.keys(formFilters).reduce((acc, key) => {
    const tKey = key as FormFiltersKeys;
    if (formFilters[tKey].length === 0) return acc;
    acc[tKey] = formFilters[tKey].map(({ id }) => id);
    return acc;
  }, {} as DataQualityRunsApiGetDataQualityTestsRunsRequest);

  return filters;
});

export const clearTableFiltersAtom = atom(null, (get, set) => {
  const currentFilters = get(formFiltersAtom);
  set(formFiltersAtom, {
    ...currentFilters,
    deNamespaceIds: [],
    deDatasourceIds: [],
    deOwnerIds: [],
    deTitleIds: [],
    deTagIds: [],
  });
});

export const clearTestFiltersAtom = atom(null, (get, set) => {
  const currentFilters = get(formFiltersAtom);
  set(formFiltersAtom, {
    ...currentFilters,
    namespaceIds: [],
    datasourceIds: [],
    ownerIds: [],
    titleIds: [],
    tagIds: [],
  });
});
