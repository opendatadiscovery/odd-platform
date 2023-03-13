import React from 'react';
import { useDataEntitiesUsage } from 'lib/hooks/api';
import DataEntityUsageInfoView from './DataEntityUsageInfoView/DataEntityUsageInfoView';

const DataEntitiesUsageInfo: React.FC = () => {
  const { data: usageInfo, isError } = useDataEntitiesUsage();

  if (isError || !usageInfo) return null;

  return (
    <DataEntityUsageInfoView
      totalCount={usageInfo.totalCount}
      unfilledCount={usageInfo.unfilledCount}
      classesUsageInfo={usageInfo.dataEntityClassesInfo}
    />
  );
};

export default DataEntitiesUsageInfo;
