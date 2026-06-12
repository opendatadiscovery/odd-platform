import React from 'react';
import { useFilter } from 'components/DataQuality/DataQualityFilters/hooks';
import { useTranslation } from 'react-i18next';
import { useGetTitleList } from 'lib/hooks/api/title';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';
import MultipleFilterItem from './MultipleFilterItem/MultipleFilterItem';
import MultipleFilterItemAutocomplete from './MultipleFilterItem/MultipleFilterItemAutocomplete/MultipleFilterItemAutocomplete';
import SelectedFilterOption from './MultipleFilterItem/SelectedFilterOption/SelectedFilterOption';

interface TitleFilterProps {
  filterKey: keyof DataQualityRunsApiGetDataQualityTestsRunsRequest;
}

export const TitleFilter: React.FC<TitleFilterProps> = ({ filterKey }) => {
  const { t } = useTranslation();
  const {
    searchText,
    setSearchText,
    selectedOptions,
    onSelectOption,
    onDeselectOption,
    hookResult,
  } = useFilter(useGetTitleList, filterKey);

  return (
    <MultipleFilterItem
      autocomplete={
        <MultipleFilterItemAutocomplete
          name={t('Title')}
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
