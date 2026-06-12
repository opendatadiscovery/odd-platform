import { useQuery } from '@tanstack/react-query';
import { datasetApiClient } from 'lib/api';
import type { DataSetApiGetDataSetRelationshipsRequest } from 'generated-sources';
import { makeCompareFieldsTree } from './helpers';

interface UseDatasetStructureCompareProps {
  dataEntityId: number;
  firstVersionId: number;
  secondVersionId: number;
  showChangesOnly?: boolean;
}

export function useDatasetStructureCompare({
  dataEntityId,
  firstVersionId,
  secondVersionId,
  showChangesOnly,
}: UseDatasetStructureCompareProps) {
  return useQuery({
    queryKey: ['datasetStructureCompare', dataEntityId, firstVersionId, secondVersionId],
    queryFn: () =>
      datasetApiClient.getDataSetStructureDiff({
        dataEntityId,
        firstVersionId,
        secondVersionId,
      }),
    select: ({ fieldList: data }) => {
      const args = { data, firstVersionId, secondVersionId, showChangesOnly };
      const structureDiffList = makeCompareFieldsTree(args);
      const isNested = structureDiffList.some(diff => diff.childFields?.length);
      return { isNested, structureDiffList };
    },
  });
}

export function useGetDatasetRelationships({
  dataEntityId,
  type,
}: DataSetApiGetDataSetRelationshipsRequest) {
  return useQuery({
    queryKey: ['getDatasetRelationships', dataEntityId, type],
    queryFn: () => datasetApiClient.getDataSetRelationships({ dataEntityId, type }),
  });
}
