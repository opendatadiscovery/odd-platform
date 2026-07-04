import React from 'react';
import { useDataEntitiesUsage } from 'lib/hooks/api';
import { useNavigateToSearch } from 'lib/hooks';
import DataEntitiesUsageInfoView from './DataEntityUsageInfoView/DataEntitiesUsageInfoView';

export interface HandleEntityClassClickParams {
  entityId: number;
  entityName: string;
}

export interface HandleEntityClassTypeClickParams {
  entityClassId: number;
  entityClassTypeId: number;
  entityClassName: string;
  entityClassTypeName: string;
}

const DataEntitiesUsageInfo: React.FC = () => {
  const navigateToSearch = useNavigateToSearch();
  const { data: usageInfo, isError } = useDataEntitiesUsage();

  const handleEntityClassClick = React.useCallback(
    ({ entityId }: HandleEntityClassClickParams) => {
      navigateToSearch({ facets: { entityClasses: [entityId] } });
    },
    [navigateToSearch]
  );

  const handleEntityClassTypeClick = React.useCallback(
    ({ entityClassId, entityClassTypeId }: HandleEntityClassTypeClickParams) => {
      navigateToSearch({
        facets: { entityClasses: [entityClassId], types: [entityClassTypeId] },
      });
    },
    [navigateToSearch]
  );

  if (isError || !usageInfo) return null;

  return (
    <DataEntitiesUsageInfoView
      totalCount={usageInfo.totalCount}
      unfilledCount={usageInfo.unfilledCount}
      classesUsageInfo={usageInfo.dataEntityClassesInfo}
      handleEntityClassClick={handleEntityClassClick}
      handleEntityClassTypeClick={handleEntityClassTypeClick}
    />
  );
};

export default DataEntitiesUsageInfo;
