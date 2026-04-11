import React from 'react';
import { useFilter } from 'components/DataQuality/DataQualityFilters/hooks';
import { useTranslation } from 'react-i18next';
import { useGetNamespaceList } from 'lib/hooks/api/namespace';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';
import MultipleFilterItem from './MultipleFilterItem/MultipleFilterItem';
import MultipleFilterItemAutocomplete from './MultipleFilterItem/MultipleFilterItemAutocomplete/MultipleFilterItemAutocomplete';
import SelectedFilterOption from './MultipleFilterItem/SelectedFilterOption/SelectedFilterOption';

interface NamespaceFilterProps {
  filterKey: keyof DataQualityRunsApiGetDataQualityTestsRunsRequest;
}

export const NamespaceFilter: React.FC<NamespaceFilterProps> = ({ filterKey }) => {
  const { t } = useTranslation();
  const {
    searchText,
    setSearchText,
    selectedOptions,
    onSelectOption,
    onDeselectOption,
    hookResult,
  } = useFilter(useGetNamespaceList, filterKey);

  return (
    <MultipleFilterItem
      autocomplete={
        <MultipleFilterItemAutocomplete
          name={t('Namespace')}
          hookResult={hookResult}
          searchText={searchText}
          setSearchText={setSearchText}
          selectedOptions={selectedOptions}
          onSelectOption={onSelectOption}
        />
      }
      options={selectedOptions?.map(option => (
        <SelectedFilterOption
          key={option.id}
          selectedOption={option}
          onDeselectOption={onDeselectOption}
        />
      ))}
    />
  );
};
