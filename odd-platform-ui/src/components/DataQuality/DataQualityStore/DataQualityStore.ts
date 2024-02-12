import { atom } from 'jotai';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';
import type { FilterOption } from '../interfaces';

type FormFiltersAtom = {
  [Property in keyof DataQualityRunsApiGetDataQualityTestsRunsRequest]-?: Array<FilterOption>;
};

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

export const getFieldFilterAtom = (
  key: keyof DataQualityRunsApiGetDataQualityTestsRunsRequest
) =>
  atom<FilterOption[], [value: FilterOption[]], void>(
    get => get(formFiltersAtom)[key],
    (get, set, value) => {
      set(formFiltersAtom, { ...get(formFiltersAtom), [key]: value });
    }
  );

export const filtersAtom = atom(get => {
  const formFilters = get(formFiltersAtom);
  const filters: DataQualityRunsApiGetDataQualityTestsRunsRequest = Object.keys(
    formFilters
  ).reduce((acc, key) => {
    if (
      formFilters[key as keyof DataQualityRunsApiGetDataQualityTestsRunsRequest]
        .length === 0
    )
      return acc;
    acc[key as keyof DataQualityRunsApiGetDataQualityTestsRunsRequest] = formFilters[
      key as keyof DataQualityRunsApiGetDataQualityTestsRunsRequest
    ].map(({ id }) => id);
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
