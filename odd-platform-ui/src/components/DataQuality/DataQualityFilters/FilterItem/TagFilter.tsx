import React from 'react';
import { useFilter } from 'components/DataQuality/DataQualityFilters/hooks';
import { useTranslation } from 'react-i18next';
import { useGetTagList } from 'lib/hooks/api/tag';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';
import MultipleFilterItem from './MultipleFilterItem/MultipleFilterItem';
import MultipleFilterItemAutocomplete from './MultipleFilterItem/MultipleFilterItemAutocomplete/MultipleFilterItemAutocomplete';
import SelectedFilterOption from './MultipleFilterItem/SelectedFilterOption/SelectedFilterOption';

interface TagFilterProps {
  filterKey: keyof DataQualityRunsApiGetDataQualityTestsRunsRequest;
}

export const TagFilter: React.FC<TagFilterProps> = ({ filterKey }) => {
  const { t } = useTranslation();
  const {
    searchText,
    setSearchText,
    selectedOptions,
    onSelectOption,
    onDeselectOption,
    hookResult,
  } = useFilter(useGetTagList, filterKey);

  return (
    <MultipleFilterItem
      autocomplete={
        <MultipleFilterItemAutocomplete
          name={t('Tag')}
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
