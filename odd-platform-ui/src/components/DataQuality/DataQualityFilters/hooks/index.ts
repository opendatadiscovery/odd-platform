import { useState, useCallback } from 'react';
import { useAtom } from 'jotai';
import type { FilterOption, Hook } from 'components/DataQuality/interfaces';
import { formFiltersAtom } from 'components/DataQuality/DataQualityStore/DataQualityStore';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';

export const useFilter = (
  useHook: Hook,
  filterKey: keyof DataQualityRunsApiGetDataQualityTestsRunsRequest
) => {
  const [searchText, setSearchText] = useState('');
  const [selectedOptions, setSelectedOptions] = useAtom(formFiltersAtom);
  const hookResult = useHook({
    page: 1,
    size: 30,
    query: searchText,
  });

  const onDeselectOption = useCallback(
    (option: FilterOption) => {
      const newOptions = selectedOptions[filterKey].filter(
        prevOption => prevOption.id !== option.id
      );
      setSelectedOptions({ ...selectedOptions, [filterKey]: newOptions });
    },
    [selectedOptions, filterKey, setSelectedOptions]
  );

  const onSelectOption = useCallback(
    (option: FilterOption) => {
      setSelectedOptions({
        ...selectedOptions,
        [filterKey]: [...selectedOptions[filterKey], option],
      });
    },
    [selectedOptions, filterKey, setSelectedOptions]
  );

  return {
    searchText,
    setSearchText,
    selectedOptions: selectedOptions[filterKey],
    onSelectOption,
    onDeselectOption,
    hookResult,
  };
};
