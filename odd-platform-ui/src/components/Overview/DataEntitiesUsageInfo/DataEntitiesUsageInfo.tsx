import React from 'react';
import { useDataEntitiesUsage } from 'lib/hooks/api';
import { useCreateSearch } from 'lib/hooks';
import type { SearchFormData } from 'generated-sources';
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
  const createSearch = useCreateSearch();
  const { data: usageInfo, isError } = useDataEntitiesUsage();

  const handleEntityClassClick = React.useCallback(
    ({ entityId, entityName }: HandleEntityClassClickParams) => {
      const searchFormData: SearchFormData = {
        query: '',
        filters: { entityClasses: [{ entityId, entityName, selected: true }] },
      };
      createSearch(searchFormData);
    },
    []
  );

  const handleEntityClassTypeClick = React.useCallback(
    ({
      entityClassId,
      entityClassName,
      entityClassTypeName,
      entityClassTypeId,
    }: HandleEntityClassTypeClickParams) => {
      const selected = true;
      const entityClasses = [
        { entityId: entityClassId, entityName: entityClassName, selected },
      ];
      const types = [
        { entityId: entityClassTypeId, entityName: entityClassTypeName, selected },
      ];
      const searchFormData: SearchFormData = {
        filters: { entityClasses, types },
      };
      createSearch(searchFormData);
    },
    []
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
