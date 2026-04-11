import type { DataEntityUsageInfo } from 'generated-sources';
import { DataEntityClassNameEnum, DataEntityTypeNameEnum } from 'generated-sources';

export const dataEntityUsageInfoPayload: DataEntityUsageInfo = {
  totalCount: 1,
  unfilledCount: 5,
  dataEntityClassesInfo: [
    {
      entityClass: { id: 1, name: DataEntityClassNameEnum.SET, types: [] },
      totalCount: 200,
      dataEntityTypesInfo: [
        { entityType: { id: 1, name: DataEntityTypeNameEnum.DAG }, totalCount: 300 },
      ],
    },
  ],
};
