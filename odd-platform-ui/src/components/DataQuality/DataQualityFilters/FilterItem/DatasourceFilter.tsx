import React from 'react';
import { useTranslation } from 'react-i18next';
import { useGetDataSourceList } from 'lib/hooks/api/datasource';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';
import { useFilter } from 'components/DataQuality/DataQualityFilters/hooks';
import MultipleFilterItem from './MultipleFilterItem/MultipleFilterItem';
import MultipleFilterItemAutocomplete from './MultipleFilterItem/MultipleFilterItemAutocomplete/MultipleFilterItemAutocomplete';
import SelectedFilterOption from './MultipleFilterItem/SelectedFilterOption/SelectedFilterOption';

interface DatasourceFilterProps {
  filterKey: keyof DataQualityRunsApiGetDataQualityTestsRunsRequest;
}

export const DatasourceFilter: React.FC<DatasourceFilterProps> = ({ filterKey }) => {
  const { t } = useTranslation();
  const {
    searchText,
    setSearchText,
    selectedOptions,
    onSelectOption,
    onDeselectOption,
    hookResult,
  } = useFilter(useGetDataSourceList, filterKey);

  return (
    <MultipleFilterItem
      autocomplete={
        <MultipleFilterItemAutocomplete
          name={t('Datasource')}
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
