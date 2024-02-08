import React from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';
import { useGetTagList } from 'lib/hooks/api/tag';
import MultipleFilterItem from './MultipleFilterItem/MultipleFilterItem';

interface TagFilterProps {
  filterKey: keyof DataQualityRunsApiGetDataQualityTestsRunsRequest;
}

export const TagFilter: FC<TagFilterProps> = ({ filterKey }) => {
  const { t } = useTranslation();
  return (
    <MultipleFilterItem name={t('Tag')} useHook={useGetTagList} filterKey={filterKey} />
  );
};
