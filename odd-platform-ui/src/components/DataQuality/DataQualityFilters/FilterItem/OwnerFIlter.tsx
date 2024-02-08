import React from 'react';
import type { FC } from 'react';
import { useTranslation } from 'react-i18next';
import type { DataQualityRunsApiGetDataQualityTestsRunsRequest } from 'generated-sources/apis/DataQualityRunsApi';
import { useGetOwnerList } from 'lib/hooks/api/owner';
import MultipleFilterItem from './MultipleFilterItem/MultipleFilterItem';
// import { useQueryParams } from 'lib/hooks';
// import { useGetNamespaceList } from 'lib/hooks/api/namespace';
// import { useGetTitleList } from 'lib/hooks/api/title';
// import { useGetTagList } from 'lib/hooks/api/tag';

interface OwnerFilterProps {
  filterKey: keyof DataQualityRunsApiGetDataQualityTestsRunsRequest;
}

export const OwnerFilter: FC<OwnerFilterProps> = ({ filterKey }) => {
  const { t } = useTranslation();
  return (
    <MultipleFilterItem
      name={t('Owner')}
      useHook={useGetOwnerList}
      filterKey={filterKey}
    />
  );
};
