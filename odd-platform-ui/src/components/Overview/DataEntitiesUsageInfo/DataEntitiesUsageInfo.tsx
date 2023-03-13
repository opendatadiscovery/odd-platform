import React from 'react';
import { useDataEntitiesUsage } from 'lib/hooks/api';
import { useCreateSearch } from 'lib/hooks';
import DataEntityUsageInfoView from './DataEntityUsageInfoView/DataEntityUsageInfoView';

export interface HandleEntityClassClickParams {
  entityId: number;
  entityName: string;
}

export interface HandleEntityClassAndTypeClickParams {
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
      const searchFormData = {
        filters: { entityClasses: [{ entityId, entityName, selected: true }] },
      };
      createSearch(searchFormData);
    },
    []
  );

  const handleEntityClassAndTypeClick = React.useCallback(
    ({
      entityClassId,
      entityClassName,
      entityClassTypeName,
      entityClassTypeId,
    }: HandleEntityClassAndTypeClickParams) => {
      const selected = true;
      const entityClasses = [
        { entityId: entityClassId, entityName: entityClassName, selected },
      ];
      const types = [
        { entityId: entityClassTypeId, entityName: entityClassTypeName, selected },
      ];
      const searchFormData = { filters: { entityClasses, types } };
      createSearch(searchFormData);
    },
    []
  );

  if (isError || !usageInfo) return null;

  return (
    <DataEntityUsageInfoView
      totalCount={usageInfo.totalCount}
      unfilledCount={usageInfo.unfilledCount}
      classesUsageInfo={usageInfo.dataEntityClassesInfo}
      handleEntityClassClick={handleEntityClassClick}
      handleEntityClassAndTypeClick={handleEntityClassAndTypeClick}
    />
  );
};

export default DataEntitiesUsageInfo;
