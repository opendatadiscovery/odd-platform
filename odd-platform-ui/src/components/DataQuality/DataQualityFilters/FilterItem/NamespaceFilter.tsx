import React from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { useGetNamespaceList } from 'lib/hooks/api/namespace';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';
import MultipleFilterItem from './MultipleFilterItem/MultipleFilterItem';

interface NamespaceFilterProps {
  filterKey: keyof DataQualityRunsApiGetDataQualityTestsRunsRequest;
}

export const NamespaceFilter: FC<NamespaceFilterProps> = ({ filterKey }) => {
  const { t } = useTranslation();
  return (
    <MultipleFilterItem
      name={t('Namespace')}
      useHook={useGetNamespaceList}
      filterKey={filterKey}
    />
  );
};
