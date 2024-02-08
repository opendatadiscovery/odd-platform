import React from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';
import { useGetTitleList } from 'lib/hooks/api/title';
import MultipleFilterItem from './MultipleFilterItem/MultipleFilterItem';

interface TitleFilterProps {
  filterKey: keyof DataQualityRunsApiGetDataQualityTestsRunsRequest;
}

export const TitleFilter: FC<TitleFilterProps> = ({ filterKey }) => {
  const { t } = useTranslation();
  return (
    <MultipleFilterItem
      name={t('Title')}
      useHook={useGetTitleList}
      filterKey={filterKey}
    />
  );
};
