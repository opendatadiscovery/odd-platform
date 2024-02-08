import React from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';
import { useGetDataSourceList } from 'lib/hooks/api/datasource';
import MultipleFilterItem from './MultipleFilterItem/MultipleFilterItem';

interface DatasourceFilterProps {
  filterKey: keyof DataQualityRunsApiGetDataQualityTestsRunsRequest;
}

export const DatasourceFilter: FC<DatasourceFilterProps> = ({ filterKey }) => {
  const { t } = useTranslation();
  return (
    <MultipleFilterItem
      name={t('Datasource')}
      useHook={useGetDataSourceList}
      filterKey={filterKey}
    />
  );
};
