import { useQuery } from '@tanstack/react-query';
import { datasetApiClient } from 'lib/api';

interface UseDatasetStructureCompareProps {
  dataEntityId: number;
  firstVersionId: number;
  secondVersionId: number;
}

export function useDatasetStructureCompare({
  dataEntityId,
  firstVersionId,
  secondVersionId,
}: UseDatasetStructureCompareProps) {
  return useQuery(
    ['datasetStructureCompare', dataEntityId, firstVersionId, secondVersionId],
    () =>
      datasetApiClient.getDataSetStructureDiff({
        dataEntityId,
        firstVersionId,
        secondVersionId,
      }),
    { retry: false, refetchOnWindowFocus: false }
  );
}
