import { useQuery } from '@tanstack/react-query';
import { datasetApiClient } from 'lib/api';
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
  return useQuery(
    ['datasetStructureCompare', dataEntityId, firstVersionId, secondVersionId],
    () =>
      datasetApiClient.getDataSetStructureDiff({
        dataEntityId,
        firstVersionId,
        secondVersionId,
      }),
    {
      select: ({ fieldList: data }) => {
        const args = { data, firstVersionId, secondVersionId, showChangesOnly };

        const structureDiffList = makeCompareFieldsTree(args);

        const isNested = structureDiffList.some(diff => diff.childFields?.length);

        return { isNested, structureDiffList };
      },
    }
  );
}
